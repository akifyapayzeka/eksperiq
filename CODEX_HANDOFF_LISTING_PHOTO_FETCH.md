# Codex Devir Görevi — İlan Fotoğrafı İndirme (WKWebView) Swift Değişikliğinin Xcode Doğrulaması

> Bu dosya `akifyapayzeka/aiajans` reposundaki AI ajans sisteminin **Codex Bağlantı Sorumlusu** ajanı tarafından oluşturuldu. Format: `aiajans/docs/playbooks/codex-handoff.md`. Kaynak desen: `akifyapayzeka/afg-ai-os/CLAUDE_CODEX_BRIDGE.md`. Örnek alınan mevcut devir: `CODEX_HANDOFF.md` (StoreKit derlemesi) — o dosyaya dokunulmadı, bu ayrı bir görev.

## Bağlam

EksperIQ, kullanıcının "ilan linkini yapıştır" dediği bir akışta sahibinden.com/arabam.com ilanlarını analiz ediyor. PDF raporunda ilan fotoğraflarının hiç görünmediği fark edildi. Kök neden canlı olarak doğrulandı: sahibinden.com ve arabam.com, veri merkezi IP'lerinden (Vercel'in sunucuları dahil) gelen istekleri toptan reddediyor (curl ile denendi — gerçek tarayıcı User-Agent'ı eklense bile 403 dönüyor, IP itibarına dayalı bot koruması). Bu yüzden `api/report/pdf.js`'nin sunucu tarafından fotoğrafları indirmeye çalışması hiç işe yaramıyor.

`ios/App/App/Plugins/EksperIQListingFetchPlugin.swift` dosyasının kendi başındaki mimari yorumu bu tespiti zaten doğruluyor: ilan SAYFASININ kendisi de sunucudan değil, cihazdaki gerçek bir WKWebView oturumuyla (gerçek cihaz ağı, Cloudflare kontrolünü geçmiş durumda) okunuyor — "This deliberately avoids server-side fetching: sahibinden.com and arabam.com both reset the TCP connection outright for automated requests coming from datacenter IP ranges". Çözüm: aynı, zaten başarılı olan WKWebView oturumunu fotoğrafları da indirmek için kullanmak — yeni bir stealth/evasion tekniği DEĞİL, sayfayı okuyan aynı meşru tarayıcı oturumunu bir adım daha kullanmak.

Bu değişiklik `bee0791` commit'iyle (Build 62'nin bir parçası) `master`'a push edildi ama **hiçbir zaman Xcode'da derlenmedi, hiçbir cihazda/simülatörde test edilmedi** — geliştirme Linux sandbox'ta yapıldı, macOS/Xcode erişimi yoktu. TestFlight'a henüz gönderilmedi.

## Yapılan Değişiklik (doğrulanması gereken kısım)

`ios/App/App/Plugins/EksperIQListingFetchPlugin.swift` dosyasında `ListingPageFetcher` sınıfına (`extract()` fonksiyonunun hemen altına, satır ~400-546 arası) şunlar eklendi:

1. `extract()` güncellendi: mevcut senkron JS metin/görsel-URL çıkarımı (`Self.extractionScript`, HİÇ değiştirilmedi) başarılı olduktan sonra, artık `Task { @MainActor [weak self] in ... }` içinde `attachImageData(to:jsonObject:urls:)` çağrılıyor, sonra `self.finish(.success(withImages))` ile devam ediyor.
2. Yeni `private func attachImageData(to:jsonObject:urls:) async -> ExtractedPageData` — en fazla 6 (`maxImageFetchCount`) görsel URL'sini `Self.fetchImageData(webView:urls:)`'e gönderiyor, sonucu `pageData.rawJson`'a `imageData` anahtarı olarak ekleyip yeni bir `ExtractedPageData` döndürüyor. Herhangi bir hata/timeout/boş sonuçta orijinal `pageData`'yı (fotoğrafsız) aynen döndürüyor — asla text extraction'ı bozmuyor.
3. Yeni `private static let imageFetchScript` — sayfanın kendi JS content world'ünde (`.page`, Capacitor'ün izole dünyası değil) çalışan, her görsel için 6 saniyelik `AbortController` timeout'u olan, `Promise.all` ile paralel çalışan bir `fetch()` + `FileReader.readAsDataURL()` scripti. Başarısız olan her görsel sessizce atlanıyor.
4. Yeni `private static func fetchImageData(webView:urls:) async -> [[String: String]]` — `webView.callAsyncJavaScript(imageFetchScript, arguments: ["urls": urls], in: nil, contentWorld: .page)` çağırıyor (iOS 15+ API, proje deployment target'ı zaten 15.0), sonucu `[["url": ..., "dataUrl": ...]]` şekline çeviriyor. `do/catch` ile best-effort — hata olursa boş dizi döner.

TypeScript/API tarafı (bu Swift değişikliğinin JS karşılığı — `pageDataJson`'daki yeni `imageData` alanını `ExtractedPageData`/`ListingImportResult`/`AnalysisResult` tiplerine taşıyıp `api/report/pdf.js`'nin base64'ten doğrudan gömmesini sağlayan kısım) TAMAMEN test edildi (457/457 vitest testi, tsc/eslint/next build temiz) — buna dokunmaya gerek yok, sadece Swift tarafı doğrulanmalı.

## Kesin Görev Tanımı

1. `akifyapayzeka/eksperiq` reposunun `master` dalını (commit `bee0791` ve sonrası) gerçek bir macOS ortamında, Xcode ile derle (`ios/App/App.xcworkspace`).
2. Derleme hatası varsa düzelt — özellikle şunlara dikkat et (Linux sandbox'ta derlenemediği için emin olunamayan noktalar):
   - `webView.callAsyncJavaScript(_:arguments:in:contentWorld:)` async/await imzasının doğru kullanılıp kullanılmadığı (iOS 15+ API).
   - `Task { @MainActor [weak self] in ... }` içindeki actor izolasyonu / Sendable uyarıları (proje Swift concurrency strict mode kullanıyorsa `WKWebView` gibi Sendable olmayan bir tipin closure'lar arasında taşınmasıyla ilgili sorun çıkabilir — ama tasarım gereği `webView` sadece MainActor-izole çağrılarda kullanılıyor, ayrı bir Task/TaskGroup'a taşınmıyor).
   - `JSONSerialization.data(withJSONObject:)` çağrısının `updatedObject` (orijinal `[String: Any]` + yeni `imageData` anahtarı) üzerinde hatasız çalışıp çalışmadığı.
3. Gerçek bir sahibinden.com veya arabam.com ilan linkiyle uygulamayı Simülatör veya gerçek cihazda çalıştır, "İlan linkini yapıştır" akışını dene, ve:
   - İlan analizi hâlâ normal şekilde tamamlanıyor mu (metin/alan çıkarımı bu değişiklikten ETKİLENMEMİŞ olmalı — regresyon varsa bu ciddi bir sorun).
   - Analiz sonucunda "PDF raporu" oluşturulduğunda, PDF'in "İlan fotoğrafları" bölümünde gerçek fotoğraflar görünüyor mu (önceden hiç görünmüyordu).
4. Sonucu (derleme logu, varsa ekran görüntüsü, gerçek bir PDF örneği) bu dosyanın altına "Codex Notu" bölümü olarak ekle.

## Kabul Kriterleri

- [ ] Proje Xcode'da hatasız derleniyor.
- [ ] İlan linkinden analiz akışı regresyon olmadan çalışıyor (metin/alan çıkarımı bozulmamış).
- [ ] En az bir gerçek ilanla PDF raporunda gerçek fotoğraf(lar) göründüğü doğrulandı (ekran görüntüsü/örnek dosya ile).
- [ ] Eğer fotoğraflar hâlâ gelmiyorsa (ör. Cloudflare/CORS engeli JS `fetch()` seviyesinde de varsa), bu açıkça not edilmeli — "derlendi ama fotoğraf gelmiyor, sebep X" da kabul edilebilir bir sonuç, sessizce "çalışıyor" denmemeli.

## Sınırlar — Asla Yapılmayacaklar

- `master`'a doğrudan büyük bir refactor/yeniden yazım yapma — sadece derleme hatalarını düzelt, mimariyi değiştirme (mevcut best-effort/asla-ana-akışı-bozma felsefesini koru).
- Build numarasını (`CURRENT_PROJECT_VERSION`) değiştirme veya TestFlight'a gönderme — bu build kapatma kararı tamamen sahibe ait, sadece derleme + cihaz doğrulaması yapılacak.
- Stealth/anti-detection/CAPTCHA bypass gibi ek "evasion" teknikleri ekleme — dosyanın kendi başındaki yorum bunu açıkça kapsam dışı bırakıyor, sadece zaten var olan meşru WKWebView oturumu kullanılacak.
- Düzeltmeleri doğrudan `master`'a push etme — ayrı bir branch'e (`fix/listing-photo-fetch-build-verification` gibi) push edip PR aç, sahip veya ana Claude oturumu merge etsin.

## Geri Bildirim Yeri

Bu dosyanın altına "Codex Notu" ekle (derleme sonucu, varsa düzeltmeler, cihaz test sonucu, PR linki). Bu dosyayı ve varsa düzeltmeleri `fix/listing-photo-fetch-build-verification` branch'ine push edip PR aç. `akifyapayzeka/aiajans` reposundaki `TASK_QUEUE.md`'ye yazma yetkin yoksa, bu dosyadaki not CEO Orkestratör ajanının bir sonraki turunda okunup oraya yansıtılacak.

---

## Codex Notu

_(Codex bu görevi aldığında buraya yazacak.)_
