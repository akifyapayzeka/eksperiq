# EksperIQ — Proje Durumu (Codex/Claude için ortak referans)

Bu dosya EksperIQ projesinin güncel durumunu tutar. Claude Code bu dosyayı her
tamamlanmış işten sonra günceller; amaç, ChatGPT Codex veya başka bir asistanla
devam edilirse bağlamın kaybolmamasıdır. Yeni bir oturuma başlarken önce bu
dosyayı okuyun.

Son güncelleme: 2026-08-02 (Claude Code)

## Ürün özeti

EksperIQ, Türkiye pazarı için ikinci el araç alım/satım ve araç sahipliği
sürecinde karar desteği veren mobil öncelikli web/PWA uygulamasıdır (Capacitor
ile iOS native paketleme de var). Uygulama **kesin ekspertiz sonucu vermez**;
risk skoru, kontrol listesi, satıcıya sorulacak sorular, bakım/hasar/evrak
uyarıları üretir. Bu ilke tüm modüllerde korunmalıdır: hiçbir yerde "kesin",
"garanti", "hasarsızdır" gibi kesin hüküm ifadesi kullanılmaz.

- Canlı site: https://eksperiq.vercel.app
- Repo: https://github.com/akifyapayzeka/eksperiq
- Geliştirme dalı: `claude/eksperiq-app-development-mr9eed`

## Teknoloji yığını

Next.js App Router, TypeScript strict, Tailwind CSS, React Hook Form, Zod,
Lucide Icons, Vitest, Playwright, Capacitor iOS, Vercel deploy.
`/api/*.js` klasöründeki dosyalar plain CommonJS Vercel serverless
fonksiyonlarıdır (Next.js route handler değil).

## Aktif modüller (13) — `src/lib/modules/registry.ts`

1. **İlan Analizi** (`/analiz`, `/sonuc`) — kural tabanlı risk skoru, satıcı
   soruları, ekspertiz kontrol listesi. Veriler sessionStorage'da (oturum
   bazlı, kalıcı değil).
2. **Fotoğraftan Hasar Analizi** (`/fotograf-hasar`) — manuel bulgu ekleme +
   opsiyonel AI destekli kontrol (`NEXT_PUBLIC_AI_PHOTO_DAMAGE_ENABLED` flag'i
   ile açılır, `api/ai/photo-damage.js`). AI hiçbir zaman kesin hasar iddiası
   üretmez; kesin dil otomatik yumuşatılır (`hedgeCertainLanguage`).
   **2026-08-02 itibarıyla production'da AKTİF** (bkz. aşağıdaki "AI servisleri
   canlıya alındı" bölümü).
3. **Tahmini Onarım Maliyeti** (`/onarim-maliyeti`)
4. **Ekspertiz Raporu Analizi** (`/ekspertiz-raporu`)
5. **Bakım Takibi** (`/bakim-takibi`) — km/tarih bazlı genel hatırlatma
   hesaplayıcı (kayıt tutmaz, yalnızca hesaplama).
6. **Bakım ve Ödeme Takvimi** (`/bakim-odeme-takvimi`) — MTV, trafik
   sigortası, kasko, muayene, bakım gibi tarihleri tek ekranda takip eder.
   localStorage'da saklanır. **Gerçek push bildirimi** altyapısı var (bkz.
   aşağıdaki "Push bildirim altyapısı" bölümü).
7. **Test Sürüşü Kontrol Listesi** (`/test-surusu-kontrol`) — adım adım,
   sessionStorage tabanlı checklist.
8. **Resmi Sorgu Rehberi** (`/resmi-sorgu-rehberi`) — TRAMER, muayene, MTV
   borcu, rehin/haciz, ruhsat, sigorta bilgisini nereden doğrulayacağını
   anlatır. Hiçbir sorguyu kendisi yapmaz/scrape etmez. Yalnızca
   `turkiye.gov.tr` (e-Devlet) gibi tek, güvenilir/bilinen kök alan adına
   referans verir; başka hiçbir spesifik URL uydurulmaz (bkz. "URL
   politikası").
9. **Gider Defteri** (`/gider-defteri`) — yakıt/bakım/sigorta/vergi/diğer
   giderleri kaydeder, aylık grafik (dataviz skill kurallarına göre: tek
   seri, ince çubuk, tablo görünümü fallback) + yaklaşık km başı maliyet
   gösterir. localStorage.
10. **Araç Sağlık Karnesi** (`/arac-saglik-karnesi`) — zaman çizelgesi +
    "Yaklaşan tarihler" widget'ı (Bakım ve Ödeme Takvimi'nden) + isteğe bağlı
    0-100 skor alanı ile **sağlık skoru trend grafiği** (SVG line chart).
    localStorage (önceden yalnızca component state'teydi ve reload'da
    siliniyordu — bu bir bug'dı, düzeltildi).
11. **Araç Değer Takibi** (`/arac-deger-takibi`)
12. **Akıllı Satış Hazırlığı** (`/satis-hazirligi`)
13. **Karşılaştırmalı İlan Analizi** (`/karsilastirma`) — `/sonuc` sayfasından
    "Karşılaştırmaya ekle" ile en fazla 3 analiz sonucu yan yana
    (risk skoru, fiyat, km, bulgu sayısı) karşılaştırılır. localStorage.

Hiçbir modül "planned"/"yakında" durumunda değil — hepsi aktif ve gerçek
sayfalara bağlı.

## AI servisleri canlıya alındı (2026-08-02)

Kullanıcı (Codex üzerinden) Vercel production ortamına şunları ekledi ve
yeni bir production deploy tetikledi:

- `OPENROUTER_API_KEY` (gerçek anahtar; repoya hiçbir zaman yazılmadı)
- `NEXT_PUBLIC_AI_ANALYSIS_NOTE_ENABLED=true`
- `NEXT_PUBLIC_AI_PHOTO_DAMAGE_ENABLED=true`

**Sonradan bulunan ve düzeltilen gerçek bug:** Varsayılan model `"openrouter/free"`
ilk bakışta OpenRouter'ın resmi "Free Models Router"ı olduğu için doğru
görünüyordu (openrouter.ai `/api/v1/models` ile doğrulandı, metin+görsel
destekliyor, $0/$0). Ama gerçek bir canlı AI notu denemesinde router'ın
rastgele seçtiği model **"User Safety: safe"** gibi anlamsız bir çıktı
döndürdü — sebebi, bu router'ın ücretsiz modeller arasına
`nvidia/nemotron-3.5-content-safety:free` gibi sohbet modeli OLMAYAN,
moderasyon/içerik-güvenliği sınıflandırıcılarını da rastgele dahil etmesi.
3 denemeden sadece 1'i bozuktu (tutarsız/aralıklı bir hata), bu yüzden ilk
testlerde fark edilmemişti. Düzeltme: rastgele router yerine, gerçekten
$0 olan, güvenilir ve isimli iki model sabitlendi:

- Metin (AI karar destek notu): `openai/gpt-oss-20b:free`
- Görsel (fotoğraf hasar analizi, strict JSON şema gerektiriyor):
  `google/gemma-4-26b-a4b-it:free`

(Kullanıcı Gemini ve DeepSeek'i de önerdi; ikisi de OpenRouter'da tamamen
ücretsiz değil — Gemini hiç `:free` seçeneği sunmuyor, DeepSeek'in en ucuzu
bile token başına küçük de olsa gerçek ücret alıyor. "Herşey ücretsiz olsun"
ilkesine göre elendiler.) `api/ai/analysis-note.js` ve `api/ai/photo-damage.js`
artık `DEFAULT_OPENROUTER_MODEL`/`DEFAULT_VISION_MODEL`'i test edilebilir
olsun diye export ediyor; `tests/unit/analysis-note-endpoint.test.ts` ve
`tests/unit/photo-damage-endpoint.test.ts`'e bu varsayılanın asla
`"openrouter/free"` olmadığını doğrulayan regresyon testleri eklendi.

Doğrulama (kullanıcı tarafında ve benim tarafımda, ayrı ayrı, quota harcamadan):

- `npm run deploy:check` → geçti.
- `npm run ai:photo-prod-check` → geçti, production'da fotoğraf AI flag'i açık
  (quota harcamaz, yalnızca geçersiz input gönderip 400 dönüşünü kontrol eder).
- `AI_STAGING_BASE_URL=https://eksperiq.vercel.app npm run ai:staging-check`
  → geçti, AI karar destek notu endpoint'i de production'da aktif (bu da
  quota harcamaz).
- `npm run ai:live-check` (kullanıcı tarafında, gerçek bir AI notu üreterek)
  → geçti; bu komut günlük OpenRouter limitinden düştüğü için ben tekrar
  çalıştırmadım.

Artık `/sonuc` sayfasındaki "AI notu oluştur" butonu ve `/fotograf-hasar`
sayfasındaki AI destekli fotoğraf kontrolü gerçek kullanıcılar için canlı ve
çalışır durumda. Günlük limitler `OPENROUTER_DAILY_REQUEST_LIMIT` (varsayılan 20) ve `OPENROUTER_PHOTO_DAILY_REQUEST_LIMIT` (varsayılan 10) ile korunuyor.

## Veri saklama ilkeleri

- **sessionStorage**: İlan Analizi sonucu, kontrol listesi işaretleri, test
  sürüşü checklist'i, resmi sorgu checklist'i — sekme kapanınca/oturum
  bitince silinir. Kasıtlı: "hesap yok, kalıcı kayıt yok" MVP ilkesi.
- **localStorage**: Bakım ve Ödeme Takvimi, Gider Defteri, Araç Sağlık
  Karnesi kayıtları, Karşılaştırma listesi — cihazda kalıcı, hesaba veya
  sunucuya bağlı değil. Bunlar aylar süren takip gerektirdiği için bilinçli
  olarak sessionStorage yerine localStorage kullanır.
- **Sunucu (Upstash Redis, opsiyonel)**: Yalnızca AI günlük kullanım
  sayaçları ve (bildirim açılırsa) push abonelikleri + ilgili hatırlatma
  kopyası. Upstash ayarlı değilse in-memory fallback kullanılır (yalnızca
  local/dev için yeterli; production'da push bildirimlerinin gerçekten
  çalışması için Upstash ZORUNLU, çünkü serverless instance'lar arası
  memory paylaşılmaz).

## Push bildirim altyapısı (Bakım ve Ödeme Takvimi)

Gerçek Web Push ile çalışır (uygulama kapalıyken de bildirim gelir):

- `public/sw.js` — service worker (push + notificationclick handler).
- `src/lib/push/client.ts`, `src/lib/push/vapid.ts` — client-side subscribe/
  unsubscribe/sync.
- `api/push/subscribe.js`, `api/push/unsubscribe.js` — abonelik kaydı.
- `api/_lib/push-store.js` — Upstash/memory fallback storage.
- `api/cron/check-reminders.js` — günlük çalışan Vercel Cron job
  (`vercel.json`), her hatırlatma için 30 gün ve 15 gün kala bildirim
  gönderir, eşik başına tekrar göndermez (dedup).
- `scripts/generate-vapid-keys.mjs` (`npm run push:generate-vapid-keys`).

**Production'da devreye almak için gerekli env değişkenleri** (henüz
ayarlanmadı, kod hazır):

- `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
  (yukarıdaki script ile üretilir)
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` (zorunlu, yoksa cron
  hiçbir aboneliği hatırlamaz)
- `CRON_SECRET` (opsiyonel ama production'da önerilir)

**Native iOS (Capacitor) sınırlaması**: Bu Web Push altyapısı web/PWA
sürümünde çalışır. Capacitor ile paketlenen native iOS uygulamasında aynı
bildirim davranışı için ayrıca `@capacitor/push-notifications` eklentisi ve
Apple Push Notification servisi (APNs) sertifika/anahtar kurulumu gerekir —
bu bir **Apple Developer hesabı** gerektirir ve bu ortamda yapılamaz, henüz
yapılmadı.

## URL politikası (önemli, tekrar tekrar dikkat edilmeli)

Resmi Sorgu Rehberi gibi ekranlarda **asla tahmini/uydurma URL yazılmaz**.
Yalnızca `turkiye.gov.tr` gibi kesin bilinen, stabil kök alan adları
kullanılır; TÜVTÜRK, SBM gibi diğer kurumlar yalnızca isimle anılır, spesifik
sayfa linki verilmez (linkler zamanla değişebilir ve doğrulanamaz).

## iOS App Store hazırlığı — durum

- Capacitor iOS projesi var (`ios/` klasörü).
- `Info.plist`'e `NSCameraUsageDescription` / `NSPhotoLibraryUsageDescription`
  eklendi (önceden eksikti — kullanıcı "Fotoğraf çek" derse uygulama
  çökerdi, bu düzeltildi).
- Bildirim izni (Web Push) yalnızca kullanıcı Bakım ve Ödeme Takvimi'nde
  "Bildirimleri aç" derse istenir; App Store/gizlilik dokümanları buna göre
  güncellendi (`docs/app-store-*.md`, `docs/ios-*.md`,
  `docs/testflight-qa-checklist.md`).
- **Yapılamayan/eksik kalan**: Gerçek iPhone + Xcode testi, Apple Developer
  hesabı gerektiren adımlar (native push APNs kurulumu, TestFlight yükleme).
  Bunlar bu bulut/Linux ortamında fiziksel olarak yapılamaz.

## Bu oturumda düzeltilen gerçek bug'lar

1. Fotoğraf AI kesin hasar ifadesi kullanabiliyordu → sunucu tarafında
   otomatik yumuşatma eklendi.
2. `Info.plist`'te kamera/fotoğraf izin metni eksikti → eklendi.
3. Triger/şanzıman bakım alanında kullanıcı "Bilinmiyor" dediğinde sistem
   bunu "düşük risk" gibi gösteriyordu (`maintenanceHistoryUnresolved`
   eklenerek düzeltildi).
4. README.md, zaten canlı olan 6-7 özelliği "gelecekte yapılacak" diye
   yanlış tanıtıyordu → güncellendi.
5. Araç Sağlık Karnesi'ndeki "Kayıt ekle" kayıtları yalnızca component
   state'te tutuluyordu, sayfa yenilenince siliniyordu → localStorage'a
   taşındı.
6. "Karşılaştırmaya ekle" butonuna art arda basılınca aynı analiz 3
   slotluk karşılaştırma listesine birden fazla kez eklenebiliyordu →
   ilk başarılı eklemeden sonra buton devre dışı bırakılıp "Karşılaştırmaya
   eklendi" olarak değişiyor.
7. Tekrarlayan hatırlatmalar (örn. yıllık MTV taksiti) son tarihi geçince
   `loadReminders()` tarihi bir sonraki döneme ilerletip localStorage'a
   yazıyordu, ama `bakim-odeme-takvimi` sayfası bu güncellenmiş listeyi push
   bildirim sunucusuna hiç senkronize etmiyordu → bildirimler açıksa sunucuda
   eski (geçmiş) son tarih kalıyor ve o hatırlatma için 30/15 gün eşiği bir
   daha asla tutmuyordu, yani tekrarlayan hatırlatmalar ilk döngüden sonra
   sessizce bildirim göndermeyi bırakıyordu. Düzeltme: sayfa açılışında
   hatırlatmalar yüklendikten ve push durumu "subscribed" olduğu
   doğrulandıktan sonra `syncRemindersToPush(loaded)` çağrılıyor
   (`src/app/bakim-odeme-takvimi/page.tsx`). Ayrıca `reminders-storage.ts`
   için hiç birim testi yoktu → `tests/unit/reminders-storage.test.ts`
   eklendi (ekleme/silme + tarih ilerletme + kalıcılık senaryoları).
8. `unsubscribeFromPush()` (`src/lib/push/client.ts`), tarayıcının
   `PushSubscription.unsubscribe()` çağrısı reddedilirse (nadir ama gerçek bir
   tarayıcı/izin durumu) hiçbir try/catch olmadan hatayı yukarı fırlatıyordu;
   sayfadaki `disableNotifications()` bunu yakalamadığı için `pushBusy`
   sonsuza kadar `true` kalıp "Bildirimleri kapat" butonu kalıcı olarak devre
   dışı kalıyordu. Düzeltme: `unsubscribeFromPush()` artık local unsubscribe
   hatasını yutup yine de sunucuya kaldırma isteği gönderiyor ve asla
   reddetmiyor. `push/client.ts` için hiç birim testi yoktu →
   `tests/unit/push-client.test.ts` eklendi (bozulma senaryosu dahil, önce
   düzeltmeden önce başarısız olduğu doğrulandı).
9. Araç Sağlık Karnesi'nin skor trend grafiğinde ve tablo görünümünde React
   `key` olarak `point.date` (gün hassasiyetinde) kullanılıyordu; aynı gün
   içinde birden fazla skorlu kayıt eklenirse (ör. "Şu anki analiz skorunu
   ekle" iki kez veya aynı gün için elle iki kayıt) anahtarlar çakışıyor, bu
   da yanlış/duplicate render veya React uyarısına yol açabiliyordu. Düzeltme:
   `ScorePoint` tipine `id` eklendi (`src/lib/health-record/model.ts`),
   `scoreTrend()` artık kaydın kendi id'sini taşıyor; grafik ve tablo
   `point.id` üzerinden anahtarlanıyor (`src/app/arac-saglik-karnesi/page.tsx`).
   Regresyon testi `tests/unit/health-record-trend.test.ts`'e eklendi.
10. "Akıllı Satış Hazırlığı" (`/satis-hazirligi`) sayfasındaki 10 maddelik
    hazırlık listesi yalnızca component `useState`'te tutuluyordu; sayfadan
    ayrılıp geri dönmek (hatta yanlışlıkla sayfayı yenilemek) tüm işaretli
    kutucukları sıfırlıyordu. Diğer kardeş modüller (Test Sürüşü Kontrol
    Listesi, Resmi Sorgu Rehberi) aynı desenle `sessionStorage`'a
    yazıyorken bu sayfa dışarıda kalmıştı — tutarsızlık ve gereksiz kullanıcı
    yorgunluğuydu. Düzeltme: `createSessionChecklistStore` paylaşılan
    yardımcısı yeniden kullanılarak `src/lib/storage/sale-checklist-storage.ts`
    eklendi, sayfa artık işaretleri oturum boyunca koruyor
    (`src/app/satis-hazirligi/page.tsx`). Test:
    `tests/unit/sale-checklist-storage.test.ts`.
11. `/profil` sayfasındaki "Kullanım özeti" kartı "Aktif modül: İlan Analizi"
    diye sabit kodlanmıştı — uygulamada artık 13 aktif modül varken sanki tek
    modül varmış gibi yanlış/eksik bilgi veriyordu (README'nin daha önce
    düzeltilen aynı tür bayatlamış-içerik sorunu). Düzeltme:
    `src/app/profil/page.tsx` artık `activeModules().length`'i
    `src/lib/modules/registry.ts`'den okuyup "N modül" olarak gösteriyor,
    böylece yeni modül eklendikçe bir daha manuel güncelleme gerekmeyecek.
12. Uygulama içi **Gizlilik** sayfası (`/gizlilik`) hâlâ "üyelik, reklam
    takibi, analytics kodu, çerez bannerı gerektirecek üçüncü taraf servis
    veya **fotoğraf yükleme özelliği bulunmaz**" diyordu — oysa Fotoğraftan
    Hasar Analizi modülü fotoğrafları üçüncü taraf bir AI görsel servisine
    (OpenRouter) gönderiyor ve bu özellik uzun süredir aktif. Ayrıca Bakım ve
    Ödeme Takvimi'nin push bildirimi için sunucuda tutulan hatırlatma
    kopyasından hiç bahsetmiyordu. Bu, `docs/app-store-privacy-answers.md`'de
    zaten doğru belgelenen gerçek veri akışıyla kullanıcıya gösterilen metnin
    çelişmesi anlamına geliyordu — gizlilik sayfası için önemli bir doğruluk
    sorunu. Düzeltme: `src/app/gizlilik/page.tsx` artık fotoğraf analizi için
    OpenRouter'a geçici işleme, kamera/galeri izninin yalnızca o an istendiği
    ve push bildirimi açıldığında sunucuda tutulan hatırlatma kopyası
    hakkında `docs/app-store-privacy-answers.md` ile tutarlı, doğru bilgi
    veriyor.
13. Çoklu araç profili özelliği eklenirken bulunan 2 gerçek bug:
    "MTV taksitlerini ekle" butonu eklenen kayıtları hiç `localStorage`'a
    yazmıyordu (yalnızca React state'e) — sayfa yenilenince kayboluyorlardı.
    Ayrıca sayfa açılışında araç yüklemesi bir `requestAnimationFrame` ile
    geciktiriliyor; bu dar pencerede bir kayıt eklenirse boş string
    `vehicleId` ile kalıcı olarak damgalanıp filtrelemede kalıcı olarak
    kayboluyordu (e2e testiyle reprodüklendi, mobile projede tutarlı şekilde
    tetiklendi). Düzeltme: `addMtvInstallments` artık her kaydı
    `upsertReminder` ile yazıyor; ilgili formlar araç profili yüklenene
    kadar (`selectedVehicleId` boşken) devre dışı.
14. AI karar destek notu üretiminde canlı bir denemede **"User Safety: safe"**
    gibi anlamsız bir çıktı geldi — bkz. yukarıdaki "AI servisleri canlıya
    alındı" bölümündeki ayrıntılı açıklama (`openrouter/free` router'ının
    rastgele seçtiği bir moderasyon modeli).
15. Bakım ve Ödeme Takvimi'nde bir hatırlatmayı düzenlerken ("Düzenle")
    kullanıcı araç değiştirirse (araç ekleme/seçme), düzenleme formu eski
    aracın kaydına bağlı kalmaya devam ediyordu — form hâlâ eski kaydın
    bilgilerini gösteriyor, altındaki takvim listesi ise farklı (yeni) aracın
    kayıtlarını gösteriyordu. "Kaydı güncelle"ye basılsa, görünmeyen bir
    kayıt sessizce güncellenirdi. Düzeltme: `selectVehicle`, `addVehicle` ve
    `removeVehicle` artık araç değişince `resetForm()` çağırıp düzenleme
    durumunu iptal ediyor. Regresyon testi eklendi.
16. `src/lib/modules/registry.ts`'deki Bakım ve Ödeme Takvimi, Gider Defteri
    ve Araç Sağlık Karnesi modül tanımları çoklu araç desteğinden hiç
    bahsetmiyordu — `/moduller` sayfasına bakan bir kullanıcı bu özelliğin
    var olduğunu fark edemezdi. Her üçüne de "Çoklu araç" capability'si
    eklendi.
17. `/analizlerim` sayfasındaki hızlı erişim kartları (`assistantModules`)
    eski, basit `/bakim-takibi` (kalıcı kayıt yok, çoklu araç yok) sayfasına
    bağlıydı; daha zengin ve artık çoklu araç + push bildirimi destekleyen
    `/bakim-odeme-takvimi` sayfasına bu bölümden hiç link verilmiyordu. Bu,
    en çok kullanılan hızlı erişim alanının zayıf/eski modülü öne çıkarıp
    daha iyi olanı gizlemesi anlamına geliyordu (bir keşfedilebilirlik
    sorunu; `/bakim-takibi` sayfası ayrıca `src/lib/modules/registry.ts`'de
    bağımsız bir modül olarak kalmaya devam ediyor, silinmedi). Düzeltme:
    `src/app/analizlerim/page.tsx`'teki ilgili satır
    `/bakim-odeme-takvimi` → "Bakım ve Ödeme Takvimi" olarak güncellendi.
18. `/bakim-takibi` (eski, kayıtsız, tek seferlik km/tarih hesaplayıcısı)
    sayfasından, kalıcı ve çoklu araç destekli Bakım ve Ödeme Takvimi'ne hiç
    link verilmiyordu — bu sayfaya gelen bir kullanıcı daha iyi aracın var
    olduğunu fark edemeyebilirdi. Bu sayfa tamamen kaldırılmadı çünkü tek
    seferlik hızlı tahmin ihtiyacı için hâlâ geçerli, farklı bir kullanım
    senaryosu sunuyor (bkz. madde 17'nin notu). Düzeltme:
    `src/app/bakim-takibi/page.tsx`'e "Bakım ve Ödeme Takvimi'ne git" çapraz
    linki eklendi; `tests/e2e/module-tools.spec.ts`'e bu linkin
    `/bakim-odeme-takvimi`'ye gittiğini doğrulayan bir assertion eklendi.
19. `/gizlilik` sayfası yalnızca Fotoğraftan Hasar Analizi'nin OpenRouter'a
    veri gönderdiğinden bahsediyordu; sonuç ekranındaki isteğe bağlı "AI
    karar destek notu" özelliği de (araç yıl/marka/model, risk skoru ve
    bulgu başlıkları — fotoğrafsız) OpenRouter'a gönderiliyor ama gizlilik
    sayfasında hiç geçmiyordu. `docs/app-store-privacy-answers.md` bunu
    zaten doğru şekilde kapsıyordu, yalnızca uygulama içi gizlilik sayfası
    eksikti (madde 12'nin tamamlanmamış hâli). Düzeltme:
    `src/app/gizlilik/page.tsx`'e bu özelliği açıklayan bir paragraf
    eklendi.
20. Uygulamada hiç özel `not-found.tsx` veya `error.tsx` yoktu — var olmayan
    bir rota veya beklenmeyen bir client hatası, Next.js'in stilsiz/İngilizce
    varsayılan sayfalarına düşüyordu (uygulamanın geri kalanıyla tutarsız,
    kullanıcıyı sakinleştirmeyen bir deneyim). Düzeltme:
    `src/app/not-found.tsx` (Türkçe "Sayfa bulunamadı" + ana sayfaya dön
    linki) ve `src/app/error.tsx` (Türkçe "Bir şeyler ters gitti" + "Tekrar
    dene"/"Ana sayfaya dön") eklendi; ikisi de `offline` sayfasıyla aynı
    görsel dil ve sakin, kesin hüküm içermeyen tonu kullanıyor. e2e testi
    (`tests/e2e/main-flow.spec.ts`, "shows a friendly not-found page for
    unknown routes") eklendi.
21. **Ciddi bir bug**: `VehicleSwitcher`'daki "Bu aracı ve kayıtlarını sil"
    butonu tek tıkla, hiçbir onay istemeden aracı ve ona bağlı TÜM
    hatırlatma/gider/sağlık kayıtlarını kalıcı olarak siliyordu. Uygulamadaki
    tek-kayıt silme butonları (`Sil`) için onay istenmemesi bilinçli bir
    tercih (küçük, kolayca yeniden eklenebilir kayıtlar), ama bir araç
    profilini silmek üç farklı modüldeki aylarca birikmiş veriyi tek seferde
    yok ediyor — bu, aynı davranışı hak etmeyen çok daha büyük ve geri
    alınamaz bir işlem. Ayrıca bu buton için hiç unit veya e2e testi de
    yoktu. Düzeltme: `src/components/vehicles/vehicle-switcher.tsx`'e
    inline bir onay adımı eklendi ("... bu işlem geri alınamaz" uyarısı +
    "Evet, sil" / "Vazgeç"); `tests/unit/vehicle-switcher.test.tsx` eklendi
    (ilk tıklamada silinmediğini, yalnızca onaydan sonra silindiğini ve
    vazgeçilince hiç silinmediğini doğrulayan 3 test).
22. Bakım ve Ödeme Takvimi ile Gider Defteri'ndeki `formMessage` durum
    paragrafları (`"Kayıt eklendi."`, `"Son araç profili silinemez."` gibi)
    hiçbir ARIA rolü taşımıyordu — ekran okuyucu kullanan biri için bu
    mesajlar sessizce görünüp kaybolabiliyordu (Fotoğraftan Hasar Analizi
    sayfası aynı desende zaten `role="status"` kullanıyordu, bu ikisi
    tutarsız kalmıştı). Ayrıca yeni eklenen araç silme onay uyarısı da
    (madde 21) bir ARIA rolü taşımıyordu. Düzeltme: her iki sayfadaki durum
    paragrafına `role="status"`, `VehicleSwitcher`'daki onay kutusuna
    `role="alert"` eklendi.
23. **Kullanıcının kendi testinde bulduğu gerçek bug**: `/analiz` formundaki
    Model listesi Marka'ya göre hiç filtrelenmiyordu — `Fiat` seçilse bile
    Model listesinde `i20` (Hyundai) gibi o markaya ait olmayan seçenekler
    görünüyordu, çünkü tek bir düz `modelOptions` dizisi tüm markalar için
    ortak kullanılıyordu. Kullanıcı sahibinden.com'un detaylı arama
    filtresinden doğru marka→model eşlemesini öğrenmemi istedi; ancak
    sahibinden.com otomatik erişimi engelliyor (403, bot koruması) —
    `WebFetch` ile doğrulandı, kullanıcıya bildirildi. Bunun yerine
    `src/components/forms/analysis-form-sections.tsx`'e gerçek, doğru
    marka→model eşlemesi (`modelsByBrand`, 30 marka) eklendi; Model alanı
    artık Marka seçilene kadar devre dışı, Marka değişince Model otomatik
    sıfırlanıyor (`VehicleInfoSection` artık `watch`/`setValue` kullanıyor).
    Regresyon testleri: `tests/unit/analysis-form-sections.test.ts`
    (`modelOptionsForBrand` için) ve `tests/e2e/main-flow.spec.ts`'e "model
    list only shows models that belong to the selected brand" testi eklendi.
24. **Kullanıcı isteğiyle aşırı sadeleştirme**: Kullanıcı Fotoğraftan Hasar
    Analizi ekranındaki "Fotoğrafta araç veya araç parçası görünüyor" manuel
    onay kutusunu gereksiz buldu (zaten AI kendisi `isVehiclePhoto` ile bunu
    güvenilir şekilde tespit ediyor — backend zaten araç değilse
    `findings=[]` döndürüyor). Ayrıca sayfadaki ek açıklama/ipucu metinlerinin
    ve `/profil` sayfasındaki "EksperIQ hesabı olmadan kullanılabilir" /
    "Kullanım özeti" (Üyelik, Veri saklama, Aktif modül) bölümünün gereksiz
    olduğunu belirtti. Düzeltme: `src/app/fotograf-hasar/page.tsx`'ten
    `isVehiclePhoto` state'i ve radio grubu tamamen kaldırıldı (manuel
    "Bulguyu ekle" artık yalnızca fotoğraf + bölge/bulgu/güven seviyesi
    ister; AI butonu yalnızca fotoğraf ister), açıklama metinleri kısaltıldı.
    `src/app/profil/page.tsx`'teki başlık "EksperIQ ücretsiz kullanılabilir."
    olarak değiştirildi, "Kullanım özeti" bölümü tamamen kaldırıldı. e2e
    testleri güncellendi (`module-tools.spec.ts`'teki "photo damage tool
    refuses non-vehicle photos" testi artık mock'lanmış AI yanıtıyla
    `isVehiclePhoto:false` senaryosunu doğruluyor; `main-flow.spec.ts`'teki
    profil başlık assertion'ı güncellendi).
25. **Kullanıcının sorusuyla ortaya çıkan ciddi bug**: Kullanıcı "geri
    bildirim yaparlarsa biz nereden görürüz" diye sordu. Kontrol edilince
    `akifyapayzeka/eksperiq` GitHub reposunun **private** olduğu görüldü
    (`mcp__github__search_repositories` ile doğrulandı). `/geri-bildirim`
    sayfasındaki "Kullanıcı testi notu gönder" / "Kural geri bildirimi
    gönder" butonları private repoda GitHub issue oluşturma linkine
    gidiyordu — repo'ya erişimi olmayan gerçek bir uygulama kullanıcısı bu
    linke tıkladığında GitHub 404 döndürür, yani **geri bildirim hiçbir
    yere ulaşmıyordu**. Kullanıcıya sorulup e-posta tabanlı bir çözüm
    istendi (hedef adres: ruzgar.mesavo@gmail.com). Düzeltme:
    `src/lib/constants/app.ts`'teki üç GitHub URL'i (`feedbackIssueUrl`,
    `newRuleFeedbackUrl`, `newUserTestFeedbackUrl`) kaldırılıp yerine
    `feedbackEmail` eklendi; `src/app/geri-bildirim/page.tsx`'teki iki
    buton artık kategoriye özel önceden doldurulmuş konu/gövde metniyle
    `mailto:` linkine gidiyor. Redundant olan üçüncü "İlk kullanıcı testi
    issue'su" butonu (mailto ile karşılığı olmadığı için) kaldırıldı.
    `tests/e2e/main-flow.spec.ts`'teki test artık her iki linkin doğru
    `mailto:ruzgar.mesavo@gmail.com?...` adresine gittiğini doğruluyor.
    Not: `.github/ISSUE_TEMPLATE/` ve `docs/user-test-feedback-triage.md`
    değiştirilmedi — bunlar geliştiricinin e-postayla gelen notu kendi
    repo'sunda manuel olarak issue'a çevirme sürecini anlatan iç
    dokümanlar, kullanıcıya gösterilmiyor.

## Rakip/benzer uygulama araştırması ve entegre edilen bulgular (2026-08-02)

Kullanıcı "başka uygulamalara bak, dil ve tasarımlarını araştır, kendini
geliştir ve EksperIQ'a entegre et" dedi. sahibinden.com ve arabam.com
otomatik erişimi engelliyor (403 — `WebFetch` ile doğrulandı). Bunun yerine
erişilebilen kaynaklar araştırıldı: App Store'daki "Tramer" uygulaması (hasar
sorgulama), RS Oto Ekspertiz'in hasar kaydı sorgulama rehberi ve Findeks risk
raporu sayfası.

**Somut, entegre edilen bulgu:** Gerçek ekspertiz/hasar-sorgu kaynakları
tutarlı şekilde şu uyarıyı veriyor: _"hasar kaydı bulunmaması aracın hiç
hasar görmediği anlamına gelmez"_ (sigortasız/nakit onarılan hasarlar
TRAMER'e hiç yansımayabilir). EksperIQ'ta bu nüans hem `/resmi-sorgu-rehberi`
sayfasında hem de sonuç ekranındaki "Güçlü taraflar" (strengths) listesinde
eksikti — "Ağır hasar kaydı belirtilmemiş" gibi maddeler hiçbir uyarı
olmadan gösteriliyordu, oysa bunlar kullanıcının kendi girdiği/satıcı
beyanına dayanan, resmi kayıtla doğrulanmamış bilgiler. Bu, uygulamanın
"asla kesin hüküm verme" ilkesiyle doğrudan ilgili gerçek bir içerik
eksikliğiydi. Düzeltme:

- `src/lib/vehicle-checks/official-lookup.ts`'teki "Hasar/TRAMER kaydı"
  maddesinin notuna bu uyarı eklendi.
- `src/components/results/result-client.tsx`'teki "Güçlü taraflar"
  bölümüne "Bu maddeler girdiğiniz bilgiye dayanır; TRAMER veya e-Devlet'ten
  doğrulanmadıkça kesin kabul edilmemelidir." açıklaması eklendi.
- Regresyon testleri: `tests/unit/official-lookup-guide.test.ts` ve
  `tests/e2e/main-flow.spec.ts`'e eklendi.

Diğer bulgular (Tramer uygulamasının "güvenle sorgula" gibi güven-inşa eden
dili, Findeks'in şeffaf gecikme/itiraz süreci açıklaması) EksperIQ'ın zaten
sahip olduğu yaklaşımla tutarlıydı, ek değişiklik gerektirmedi.

## PR #10 merge edildi (2026-08-02)

Kullanıcı PR #10'u kendisi merge etti. Dal (`claude/eksperiq-app-development-mr9eed`)
`origin/master`'a resetlenip force-with-lease ile push edildi — artık master
ile birebir aynı, yeni değişiklikler bu temiz temelden devam ediyor.

## Fotoğraf analizlerinin kaydedilip Analizlerim'de listelenmesi (2026-08-02)

Kullanıcı gerçek kullanımda şunu fark etti: "Fotoğraftan Hasar Analizi"nde
birkaç fotoğraf analiz ettirdi ama bu analizler `/analizlerim` sayfasında hiç
görünmüyordu — sayfa yalnızca component state'te tutuluyordu, hiçbir kalıcı
kayıt yoktu. Kullanıcı analiz ettiği fotoğrafların, fotoğrafları da göstererek
Analizlerim'de listelenmesini istedi.

Eklenenler:

- `src/lib/photo-analysis/types.ts` — `PhotoAnalysisRecord` tipi (id,
  createdAt, thumbnails, findings, aiSummary?).
- `src/lib/photo-analysis/downscale-image.ts` — fotoğrafı canvas ile küçük
  bir JPEG thumbnail'e (maks. 480px genişlik, %60 kalite) çevirir. Bilinçli
  tasarım kararı: gerçek telefon kamerası fotoğrafları (2-8 MB) ham hâlde
  localStorage'a yazılırsa tarayıcı depolama kotası (genelde 5-10 MB) hızla
  aşılır — bu yüzden orijinal değil, küçültülmüş thumbnail saklanıyor.
  Decode başarısız olursa (bozuk/sahte veri) `null` döner ve çağıran taraf
  o fotoğrafı sessizce atlar; hata fırlatmaz.
- `src/lib/storage/photo-analysis-storage.ts` — localStorage CRUD (diğer
  storage modülleriyle aynı desen). En fazla 20 kayıt tutulur (en eskiler
  otomatik düşer). `writeRaw` kota hatası alırsa önce thumbnail'leri boşaltıp
  tekrar dener; o da başarısız olursa sayfa çökmesin diye sessizce vazgeçer.
- `src/app/fotograf-hasar/page.tsx` — "Analizi kaydet" butonu eklendi
  (dosya seçili VE en az bir manuel bulgu ya da AI analizi varken aktif).
  Kaydedince fotoğraflar küçültülüp bulgularla birlikte kaydediliyor.
- `src/app/analizlerim/page.tsx` — yeni "Fotoğraf analizlerim" bölümü:
  kaydedilen her analizi tarih, küçük fotoğraflar, AI özeti ve bulgu
  listesiyle gösterir; her kaydın yanında "Sil" butonu var.
- Testler: `tests/unit/photo-analysis-storage.test.ts` (kayıt/liste/silme/20
  kayıt sınırı) ve `tests/e2e/module-tools.spec.ts`'e "saved photo analysis
  appears in Analizlerim" testi eklendi (kaydet → Analizlerim'de gör → sil →
  boş duruma dön akışının tamamını doğruluyor).
- Yan etki: `/analizlerim` sayfasında artık iki "Analizlerim" metni geçen
  başlık var ("Analizlerim" ve "Fotoğraf analizlerim"), bu üç e2e testte
  strict-mode çakışmasına yol açtı (`main-flow.spec.ts`, `button-actions.spec.ts`,
  `screenshots.spec.ts`) — hepsi `{ exact: true }` ile düzeltildi.

Bu değişiklikler PR #11'e taşındı (draft, `claude/eksperiq-app-development-mr9eed` → `master`).

## Pro kullanıcılar için farklı/güçlü AI modeli — güvenli iskelet (2026-08-02)

Kullanıcı "Pro kullanıcıya foto analizinde daha güçlü/ücretli bir AI kullansak"
dedi. Buradaki gerçek engel açıklandı: uygulamada hesap/giriş yok, yani
sunucu tarafında "bu istek gerçekten Pro'dan mı geliyor" diye doğrulayacak
hiçbir mekanizma yok. Client tarafında bir bayrakla ("isPro") model seçmek,
herkesin o bayrağı taklit edip bedavaya pahalı modeli kullanabileceği **gerçek
bir güvenlik/maliyet açığı** olurdu — OpenRouter faturasını admin öder, hiç
gelir gelmez.

Kullanıcı admin olarak kendi kendine test etmek istediğini belirtti; Apple/Google
sandbox test satın almalarının gerçekten ücretsiz olduğu doğrulandı (bu bilgi
kullanıcıya iletildi), ama bu, native StoreKit/Play Billing kodunu Mac+Xcode'da
yazma zorunluluğunu ortadan kaldırmıyor (aynı, önceden belgelenen engel).

Kullanıcı bunun yerine **yalnızca sunucu tarafında, admin kontrolündeki ayrı
bir test ortamında** aktif olan bir çözümü onayladı ("Test için OpenRouter
kredisini kullanabiliriz, içeride var kredi" diyerek gerçek API çağrısı
maliyetini de kabul etti). Eklenen:

- `api/ai/photo-damage.js`'e `resolveVisionModel()` fonksiyonu eklendi.
  Yalnızca `process.env.EKSPERIQ_FORCE_PRO === "true"` (tam string eşitliği,
  başka hiçbir değer — "1", "TRUE", boş, tanımsız — kabul edilmez) VE
  `OPENROUTER_VISION_MODEL_PRO` ayarlıysa güçlü modeli kullanır; aksi halde
  mevcut ücretsiz model mantığı aynen çalışır. Her iki değişken de yalnızca
  Vercel ortam değişkeni olarak ayarlanır — client hiçbir zaman bunu okuyamaz
  veya değiştiremez, bu yüzden production'da hiçbir kullanıcı bunu tetikleyemez.
- `.env.example`'a `EKSPERIQ_FORCE_PRO` ve `OPENROUTER_VISION_MODEL_PRO`
  eklendi, production'da boş bırakılması gerektiği açıkça yazıldı.
- `tests/unit/photo-damage-endpoint.test.ts`'e iki regresyon testi eklendi:
  (1) `EKSPERIQ_FORCE_PRO` tam olarak `"true"` değilse (unset/"false"/"1"/
  "TRUE"/boş) pro model asla seçilmez, (2) `EKSPERIQ_FORCE_PRO=true` ama pro
  model ayarlı değilse normal ücretsiz modele düşer.

**Kalan adım (kullanıcı admin olarak kendi test ortamını kurmak isterse):**
Vercel'de bu branch/preview için ayrı bir deployment/environment açıp
`EKSPERIQ_FORCE_PRO=true` ve `OPENROUTER_VISION_MODEL_PRO=<gerçek paid model
id>` ortam değişkenlerini yalnızca o deployment'a eklemek yeterli — production
ortamı (eksperiq.vercel.app) bu değişkenlerden habersiz kalıp herkese
ücretsiz modeli sunmaya devam eder. Gerçek Pro kullanıcı segmentasyonu
(satın alma bazlı) hâlâ IAP + sunucu taraflı makbuz doğrulaması gerektiriyor
(bkz. "Abonelik/Pro planı" bölümü) — bu iskelet yalnızca admin'in kendi
testine hizmet eder, gerçek bir ödeme/entitlement sistemi değildir.

Kullanıcı bunu kendi Preview ortamında kurdu (`EKSPERIQ_FORCE_PRO=true`,
`OPENROUTER_VISION_MODEL_PRO=openai/gpt-4o-mini`, yalnızca Preview/Sensitive
olarak işaretli) ve Vercel'in "Protection Bypass for Automation" token'ını
paylaştı. Bu token ile Preview URL'sine gerçek bir istek gönderilip
doğrulandı: yanıttaki `model` alanı `"openai/gpt-4o-mini"` döndü — gate
çalışıyor. Test scripti geçiciydi, token hiçbir yere kaydedilmedi/commit
edilmedi.

## `/moduller` sayfasındaki eski/yanlış içerik kaldırıldı (2026-08-02)

`/loop` dinamik modunda tarama sırasında bulundu: `/moduller` sayfasında iki
ayrı, artık **yanlış** bölüm vardı:

1. "Garajım" teaser kutusu "Sağlık Karnesi: Hazırlanıyor" ve "MVP aşamasında
   veriler kalıcı kaydedilmez... kullanıcı hesabı eklendiğinde aktif olacak"
   diyordu — oysa Araç Sağlık Karnesi aylardır aktif ve localStorage'da
   kalıcı, hesap gerektirmiyor. Bu, aynı sayfadaki "Aktif modüller"
   listesindeki doğru bilgiyle doğrudan çelişiyordu.
2. Sayfa altındaki mavi CTA kutusu "çoklu araç, bakım hatırlatma ve satış
   hazırlığı özellikleri sonraki sürümlerin ana odağı olacak" diyordu — bu
   üçü de (PR #10 ile çoklu araç dahil) zaten aktif ve kayıtlı.

İkisi de kaldırıldı (README'de daha önce düzeltilen aynı tür "bayatlamış
roadmap içeriği" hatası). `tests/e2e/main-flow.spec.ts`'teki artık var
olmayan "Garajım" başlığı assertion'ı kaldırıldı.

## PR #11 merge edildi, otonom merge yetkisi verildi (2026-08-02)

Kullanıcı PR #11'i (fotoğraf analizi kaydetme + Pro AI model iskeleti +
moduller sayfası düzeltmesi) merge etmemi istedi ve **standing bir yetki**
verdi: "Sonrasında Merge de et ben çok anlamam zaten kontrol etmeme gerek
yok en son uygulama %100 bitince test eder ona göre konuşuruz." Yani
bundan sonra her PR için "ready for review yap ve merge et" onayı
beklemeden, CI yeşil ve mergeable olduğunda **doğrudan merge edebilirim**;
kullanıcı uygulamayı yalnızca %100 bittiğinde kendisi test edecek.

PR #11 `merge` metoduyla (squash değil, PR #10 ile aynı konvansiyon)
merge edildi, PR aktivite aboneliği iptal edildi, dal `origin/master`'a
resetlenip force-with-lease ile push edildi. Ardından yalnızca
`eksperiq_codex.md` güncellemesini içeren PR #12 de aynı şekilde
(doğrudan, onay beklenmeden) merge edildi — yeni standing yetkinin ilk
uygulanışı.

## README.md'deki bayatlamış modül listesi ve roadmap düzeltildi (2026-08-02)

`/loop` taraması sırasında bulundu: "Uzun vadeli vizyon" bölümündeki aktif
modül listesi 13 aktif modülden yalnızca 9'unu sayıyordu — Test Sürüşü
Kontrol Listesi, Resmi Sorgu Rehberi, Gider Defteri ve Karşılaştırmalı İlan
Analizi eksikti. Ayrıca "Gelecek geliştirmeler" bölümü "Resmî kayıt kontrolü
için kullanıcı yönlendirme rehberleri"ni hâlâ gelecek özellik olarak
listeliyordu — oysa bu tam olarak Resmi Sorgu Rehberi modülünün kendisi ve
uzun süredir aktif. Düzeltme: modül listesi tamamlandı (çoklu araç desteği
olan üçü de işaretlendi), o roadmap maddesi kaldırıldı, yerine gerçek ve
hâlâ geçerli bir gelecek maddesi ("Gerçek Apple/Google IAP ile Pro
abonelik") eklendi. `Özellikler` listesine kaydedilen fotoğraf
analizlerinin Analizlerim'de listelendiği notu eklendi.

### Kapsamlı manuel + otomatik test turu (kullanıcı isteğiyle)

Kullanıcı "uygulamayı tamamen test ettin mi" diye sorunca şu tam tarama
yapıldı:

- `npx playwright test` **tüm** e2e paketiyle (4 dosya, 56 test — daha önceki
  turlarda yalnızca 3 dosyanın hedefli alt kümesi çalıştırılıyordu,
  `screenshots.spec.ts` hiç çalıştırılmamıştı) → 54 geçti, 2 kasıtlı skip.
- Dev sunucu açılıp 24 route'un tamamı (tüm sayfalar) gerçek bir Chromium
  tarayıcısında gezildi; konsol hatası/uyarısı, `pageerror` ve başarısız
  network isteği/4xx-5xx yanıtı için dinlendi → **sıfır bulgu**.
- Uçtan uca gerçek kullanıcı akışları elle sürüldü ve konsol izlendi: yeni
  model + 0 km + yüksek tramer ile analiz oluşturma (skor/karar doğru
  render oluyor), MTV taksitlerini ekleme (tarihler bugüne göre doğru
  hesaplanıyor — 2026-08-01 itibarıyla hem Ocak hem Temmuz taksiti geçmiş
  olduğu için ikisi de 2027'ye kaydı, bu doğru davranış), hatırlatma
  düzenleme/silme, karşılaştırmaya ekleme → hepsi hatasız çalıştı.
- Bu tarama sırasında `satis-hazirligi` (Akıllı Satış Hazırlığı) sayfasının
  hiç e2e testi olmadığı fark edildi — diğer tüm kardeş kontrol listesi
  sayfalarının (test sürüşü, resmi sorgu rehberi) dedicated e2e testi varken
  bu sayfa eksikti. `tests/e2e/module-tools.spec.ts`'e "sale preparation
  checklist persists checked items within the session" testi eklendi.
- Not: ilk elle test sırasında satış hazırlığı ve test sürüşü kontrol
  listelerinde reload sonrası "sıfırlanıyor" gibi görünen bir sonuç alındı;
  detaylı incelemede bunun gerçek bir bug değil, benim tek seferlik
  doğrulama scriptimin `requestAnimationFrame` ile geciktirilen storage
  yüklemesini beklemeden okuma yapmasından kaynaklanan bir yarış durumu
  olduğu doğrulandı (Playwright'ın `expect().toBeVisible()` otomatik
  yeniden denemesi bu gecikmeyi zaten doğru şekilde bekliyor). Gerçek
  uygulama davranışında sorun yok.

## Bu oturumda eklenen yeni özellikler (kullanıcı isteğiyle)

- Karşılaştırmalı İlan Analizi (`/karsilastirma`)
- Gider Defteri (`/gider-defteri`)
- Test Sürüşü Kontrol Listesi (`/test-surusu-kontrol`)
- Model/marka bazlı sık sorulan noktalar → **yeni bir sayfa olarak değil**,
  mevcut dinamik satıcı soruları motoruna (`src/lib/analysis/questions.ts`)
  araç özelliklerine göre (yakıt türü, çekiş, kilometre, yaş) soru ekleyerek
  entegre edildi. Uygulamayı sadeleştirme ilkesi gereği yeni bir sayfa/modül
  açılmadı.
- Resmi Sorgu Rehberi (`/resmi-sorgu-rehberi`)
- Araç Sağlık Karnesi'nde sağlık skoru trend grafiği (yukarıda bug fix ile
  birlikte)

## Test ve doğrulama komutları

İş bitmeden önce hepsi geçmeli:

```bash
npm run lint
npm run typecheck
npm run test
npx playwright test tests/e2e/main-flow.spec.ts tests/e2e/module-tools.spec.ts tests/e2e/button-actions.spec.ts --reporter=line
npm run release:check
npm run deploy:check
```

Not: Bu sandbox ortamında Playwright'ın pinlediği Chromium build'i
`/opt/pw-browsers` altında farklı bir sürüm numarasıyla geliyor; testleri
çalıştırmak için geçici bir `playwright.local.config.ts` (executablePath
override) kullanılıp iş bitince silindi — repoya commit edilmedi.

## Abonelik/Pro planı (2026-08-02'de başlandı)

Kullanıcı "1'den fazla aracı olanlar abone olsun" fikrini önerdi; birlikte
değerlendirilip şu abonelik/Pro fikirleri üzerinde duruldu: bulut
yedekleme/senkron, çoklu araç, yüksek AI limiti, markalı PDF rapor, galeri/filo
modu. Ödeme yöntemi olarak kullanıcı **Apple/Google uygulama içi satın alma
(IAP)**'yı seçti (Stripe web checkout değil).

**Önemli kısıt:** Apple/Google IAP yalnızca native uygulama içinde çalışır —
web sitesinde (eksperiq.vercel.app) hiçbir şekilde çalışamaz. StoreKit/Play
Billing kodu ancak gerçek bir Mac + Xcode + Apple Developer Program hesabı
(yıllık ücretli) ile derlenip test edilebilir; bunların hiçbiri bu Linux
sandbox'ta yok. Bu yüzden gerçek satın alma butonu ve StoreKit/Play Billing
entegrasyonu **bilerek yapılmadı** — bu, iOS widget'ı ve native push (APNs)
ile aynı kategoride bir Apple-araçları eksikliği.

Bu ortamda tam olarak yapılıp test edilebilen kısımlar tamamlandı:

1. **Çoklu araç profili** (`src/lib/vehicles/`, `src/lib/storage/vehicle-storage.ts`,
   `src/components/vehicles/vehicle-switcher.tsx`) — Bakım ve Ödeme Takvimi,
   Gider Defteri ve Araç Sağlık Karnesi'ne entegre edildi. **Şu an tamamen
   ücretsiz ve sınırsız** (henüz gerçek satın alma yolu olmadığı için bir
   sınır koymak kullanıcıyı özellikten tamamen mahrum bırakır — bu yanlış
   olur). Gelecekte gerçek IAP çalışınca, `MAX_FREE_VEHICLES` gibi bir sabit
   ve `isPro()` kontrolüyle ikinci araçtan itibaren kısıtlama eklenebilir.
   Bu sırada iki gerçek bug bulunup düzeltildi (bkz. bug listesi altında).
2. **Yazdırma/PDF raporu iyileştirmesi** — `/sonuc` sayfasının print
   görünümüne markalı bir başlık eklendi (`.print-only` CSS sınıfı,
   `src/app/globals.css`): "EksperIQ" adı + rapor oluşturma tarihi, yalnızca
   yazdırma/PDF çıktısında görünür, ekranda görünmez. Böylece yazdırılan
   rapor bağlamından koparılsa bile hangi uygulamadan geldiği belli olur.
3. **Pro altyapısı** (`src/lib/pro/entitlement.ts`) — `isPro()` fonksiyonu
   şimdilik her zaman `false` döner, net bir yorumla neden ve ne zaman
   gerçek hale geleceği açıklanıyor. **Bilinçli olarak herhangi bir "Pro'ya
   geç" / satın alma ekranı eklenmedi** — çalışmayan bir buton göstermek
   kullanıcıyı yanıltır ve güven kırar; bunun yerine bu bölüm gelecekteki
   çalışma için referans.

**Gerçek IAP'yi bağlamak için (macOS + Xcode + Apple Developer hesabı olan biri
tarafından) gereken adımlar:**

- Apple Developer Program'a kayıt (App Store Connect'te abonelik ürünleri
  tanımlamak için).
- App Store Connect'te bir abonelik grubu ve ürün(ler) oluşturma (örn.
  "eksperiq_pro_monthly").
- `ios/App` projesine StoreKit 2 entegrasyonu (native Swift kodu veya bir
  Capacitor IAP eklentisi, örn. `@capacitor-community/in-app-purchases` —
  seçim ve kurulum bu ortamda doğrulanamadı).
- Satın alma/restore akışını `src/lib/pro/entitlement.ts`'e bağlamak
  (`isPro()`'yu gerçek StoreKit `Transaction.currentEntitlements`
  sonucuna göre döndürecek şekilde güncellemek).
- Gerçek cihaz/TestFlight üzerinde sandbox test hesabıyla satın alma akışını
  test etmek.
- Ancak bunlardan sonra: çoklu araç sınırı, yüksek AI limiti gibi
  özellikleri `isPro()` ile kısıtlamak ve bir "Pro'ya geç" ekranı eklemek.

## Devam eden / yapılamayan görevler

- **iOS ana ekran widget'ı (WidgetKit)**: İstendi ama yapılamadı. Gerçek bir
  WidgetKit uzantısı Swift ile yazılmalı, bir Xcode target'ı olarak
  `ios/App` projesine eklenmeli ve App Group ile ana uygulamayla veri
  paylaşmalıdır (Bakım ve Ödeme Takvimi'nin en yakın tarihini göstermek
  için). Bu, gerçek bir macOS + Xcode ortamı ve derleme/test döngüsü
  gerektirir; bu bulut/Linux ortamında Swift kodu yazılıp _hiç
  derlenmeden/test edilmeden_ bırakmak yanlış/çalışmayan kod riski taşır,
  bu yüzden bilerek yapılmadı. macOS + Xcode erişimi olan biri tarafından
  yapılmalı. Bu, önceki "native push (APNs)" sınırlamasıyla aynı kategoride
  bir Apple-araçları eksikliğidir.
- **Apple/Google IAP (abonelik satın alma)**: Yukarıdaki "Abonelik/Pro planı"
  bölümüne bakın — aynı Apple-araçları eksikliği kategorisi.

## 2026-08-03: Bakım/ödeme hatırlatma bildirimlerinde tekrarlayan kayıt hatası düzeltildi

Sürekli çalışma modunda (`/loop`) tarama sırasında bulundu: `api/cron/check-reminders.js`
her gün çalışıp son tarihe 30/15 gün kala push bildirimi gönderiyor ve hangi
eşiklerin (30, 15 gün) hangi hatırlatma için gönderildiğini `notified[reminder.id]`
altında saklıyordu. Ancak tekrarlayan kayıtlarda (MTV her yıl, kasko/sigorta 6
ayda bir) `advanceIfPast()` son tarih geçince aynı `id`'yi koruyarak tarihi bir
sonraki döneme ilerletiyor — ama eski `notified` kaydı asla sıfırlanmıyordu.
Sonuç: bir hatırlatma ilk döneminde 30/15 gün bildirimlerini aldıktan sonra,
sonraki her yıl/dönemde `thresholds: [30, 15]` zaten "kullanılmış" sayıldığından
bir daha **hiç** bildirim gönderilmiyordu — kullanıcı ikinci MTV döneminden
itibaren sessizce bildirim almayı bırakıyordu.

Düzeltme: eşleşme mantığı `nextThresholdToNotify()` adıyla ayrı, test edilebilir
bir fonksiyona çıkarıldı; artık kayıtlı eşikler yalnızca `notified[id].dueDate`
mevcut `reminder.dueDate` ile **aynıysa** geçerli sayılıyor, tarih ilerleyince
(yeni döneme geçilince) eşik listesi otomatik sıfırlanıyor. `tests/unit/cron-check-reminders.test.ts`'e
3 yeni test eklendi (ilk bildirim, aynı dönemde tekrar engelleme, yeni döneme
geçince yeniden bildirim). Tam doğrulama döngüsü (lint/typecheck/test/e2e/
release:check/deploy:check) geçti.

## 2026-08-03: Pro abonelik fiyatlandırması hakkında rapor (kod değişikliği yok)

Kullanıcı iki ayrı fiyatlandırma sorusu sordu, ikisi de yalnızca analiz/rapor
istekleriydi, kod değişikliği talep edilmedi:

1. "3 gün deneme + gerçek AI maliyetinin 5 katı fiyat, aylık kaç TL olur?"
   sorusuna, `openai/gpt-4o-mini` (Pro modeli) OpenRouter fiyatlandırması ve
   görsel tokenizasyon formülü (2.833 taban + 5.667 token/512px karo) ile ayda
   8 analiz × 3 foto varsayımı altında ~22 TL/ay hesaplandı; Apple/Google
   IAP komisyonu ve altyapı/destek maliyeti kapsam dışı bırakıldı (kullanıcının
   açık isteğiyle).
2. "Ayda 100+ foto yorumlatan ağır kullanıcı, Pro/Pro+ katmanları (Pro ~50,
   Pro+ ~100-200 foto, kullanıcıya foto sayısı olarak sunulmayacak), 1000 TL/ay
   fiyat kazandırır mı?" sorusuna: saf AI maliyeti açısından (gpt-4o-mini yerine
   kalite/maliyet dengesi için `openai/gpt-4o` önerildi — görsel başına token
   sayısı daha düşük: 85 taban + 170/karo) 200 foto/ay bile ~33 TL/ay maliyet
   çıkıyor; yani 1000 TL/ay fiyatta AI maliyeti kâr marjını hiçbir şekilde
   tehdit etmiyor (%95+ brüt marj). Asıl risk AI maliyeti değil, Türkiye
   pazarında 1000 TL/ay'ın tüketici algısında kabul görüp görmeyeceği ve kalite
   beklentisi karşılanmazsa iade talepleri — bu yüzden kaliteli model seçimi
   ve fiyatın pazar konumlandırmasıyla test edilmesi önerildi.

## 2026-08-03: Araç Değer Takibi'nde ölü/etkisiz "Benzer ilan sayısı" alanı düzeltildi

Sürekli çalışma modunda tarama sırasında bulundu: `/arac-deger-takibi`
sayfasındaki "Benzer ilan sayısı" girdisi kullanıcıya bir şey soruyormuş gibi
görünüyor ama fiyat yorumu hesaplamasında **hiç kullanılmıyordu** — girilen
değer ne olursa olsun sonuç değişmiyordu. Bu, kullanıcıyı yanıltan ölü bir
alan. Düzeltme: örnek sayısı artık düşükse (1-2: "güvenilirliği düşüktür",
3-5: "örnek sayısını artırın") bir uyarı notu gösteriyor; 6+ örnekte not
gösterilmiyor. `tests/e2e/module-tools.spec.ts`'e bu davranışı doğrulayan bir
assertion eklendi. Tam doğrulama döngüsü geçti.

## 2026-08-03: Kullanıcı "firevibe.ai" ile yeni bir arayüz tasarımı üretti; Analizlerim buna taşındı

Kullanıcı firevibe.ai adlı bir tasarım aracıyla EksperIQ'un yeni bir arayüz taslağını
üretti ve Ana Sayfa, Analizlerim, Garajım ekranlarının 9 ekran görüntüsünü paylaştı.
Yeni tasarım dili: koyu lacivert vurgu kartları, açık gri arka plan, pill-style
butonlar/filtreler, renk kodlu risk rozetleri (kırmızı/turuncu/yeşil).

Entegrasyon sırasında iki önemli bulgu:

1. **Mockup'ta "Yakında" etiketlenen özellikler aslında zaten aktif** (Bakım Takibi,
   Araç Sağlık Karnesi, Araç Değer Takibi, Akıllı Satış Hazırlığı) — firevibe gerçek
   uygulama durumunu bilmeden placeholder içerik üretmiş; entegrasyonda düzeltilecek.
2. **Gerçek bir eksiklik ortaya çıktı**: mockup "12 analiz"lik bir geçmiş listesi
   varsayıyor ama gerçek uygulamada yalnızca son oturumun tekil analizi
   (sessionStorage) saklanıyordu — kalıcı bir analiz geçmişi yoktu.

Bu nedenle yeni bir **kalıcı analiz geçmişi** özelliği eklendi (`analysis-history-storage.ts`,
photo-analysis-storage.ts deseninde, localStorage, cihaz başına en fazla 50 kayıt).
`saveAnalysis()` artık hem oturum tekil sonucunu hem de kalıcı geçmişi güncelliyor;
yeni `openAnalysisFromHistory()` fonksiyonu geçmişten bir kaydı oturuma yükleyip
`/sonuc` sayfasında açıyor. Bu değişiklik, uygulamanın önceki "analiz yalnızca
oturumda tutulur" beyanını yanlış hale getirdiği için `appConfig.privacy`,
`/gizlilik` sayfası ve modül kayıt defterindeki ilgili metinler "yalnızca bu cihaza
kaydedilir" şeklinde güncellendi (hesaba değil, cihaza kaydediliyor — hâlâ doğru
ve dürüst bir beyan).

`/analizlerim` sayfası bu gerçek geçmiş verisiyle yeni tasarıma taşındı: istatistik
şeridi (analiz sayısı, ortalama risk skoru, araç sayısı — gerçek veriden), arama/filtre
artık tüm geçmiş üzerinde çalışıyor, her kart risk rengiyle kodlanmış rozet + "Raporu
Aç" + "Sil" aksiyonları içeriyor.

Araç görseli konusunda kullanıcı marka/model'e göre otomatik gerçek fotoğraf istedi;
araştırılan tüm araç görsel API'leri (IMAGIN.studio, CarImages, Vehicle Imagery API)
satış/hesap gerektiren ücretli B2B servisler çıktı, anahtarsız ücretsiz katman yok.
Kullanıcı üçüncü taraf API'yi tercih etti ama hesap açma/ödeme kullanıcıya ait olduğu
için şimdilik sade bir CarFront ikonuyla devam ediliyor; kullanıcı bir servise kayıt
olup API anahtarı sağladığında gerçek fotoğrafa geçilecek.

Kalan işler (devam ediyor): Garajım/Moduller sayfalarının aynı tasarıma taşınması,
"Yakında" yanlış etiketlerinin düzeltilmesi.

## 2026-08-03: Ana Sayfa firevibe tasarımına taşındı

Ana Sayfa (`src/app/page.tsx`) client component'e çevrildi ve gerçek verilerle
yeni tasarıma taşındı: "Analiz özetin" istatistik şeridi (analiz sayısı, ortalama
risk skoru, araç sayısı — hepsi gerçek localStorage'dan) ve varsa "En son inceleme"
kartı (en son analizin marka/model/yıl, risk rozeti, öncelikli bulgu, "Raporu Aç")
eklendi. Hesap sistemi olmadığı için mockup'taki "Merhaba, Ahmet" kişiselleştirilmiş
karşılaması kullanılmadı; mevcut dürüst hero metni ("Link gerekmiyor...") korundu.
Risk rengi kodlaması için `riskBucket()` fonksiyonu `analysis/risk-bucket.ts`'e
çıkarıldı (Analizlerim ve Ana Sayfa olmak üzere iki yerde kullanıldığı için — üçüncü
kullanım Garajım'da da beklendiğinden "rule of three" ile paylaşılan yardımcıya
taşındı). Tam doğrulama döngüsü + gerçek Playwright test akışıyla tarayıcıda görsel
doğrulama yapıldı.

## Genel ilkeler (her yeni özellikte hatırlanmalı)

- Kesin hüküm/garanti ifadesi yok.
- Ücretli servis, gizli anahtar commit etme, ilan sitesi scraping yok.
- Uygulama sade kalmalı, kullanıcıyı yormamalı — yeni modül eklerken bunu
  göz önünde bulundur (kullanıcı bu konuda açıkça uyardı: "Eksperiq
  uygulaması sade ve anlaşılır olacak kullanıcıyı yormayacak").
- Her yeni özellik: unit test + (mümkünse) e2e test + yukarıdaki tam
  doğrulama komutları + commit + push ile tamamlanmalı.
- Kullanıcı İngilizce bilmiyor: bundan sonra tüm PR başlıkları, PR açıklamaları
  ve commit mesajları Türkçe yazılmalı (kod/tanımlayıcılar İngilizce kalabilir,
  yalnızca insan tarafından okunan metinler Türkçe olmalı).
- **2026-08-02'den itibaren standing yetki**: Kullanıcı PR'ları tek tek
  onaylamak istemiyor ("Sonrasında Merge de et ben çok anlamam zaten kontrol
  etmeme gerek yok en son uygulama %100 bitince test eder ona göre
  konuşuruz"). Yani: CI yeşil ve mergeable olan her PR, tam doğrulama
  döngüsünden geçtikten sonra kullanıcı onayı beklenmeden doğrudan merge
  edilebilir. Kullanıcı uygulamayı yalnızca tamamen bittiğinde kendisi test
  edecek.
