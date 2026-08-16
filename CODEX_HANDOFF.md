# Codex Devir Görevi — StoreKit Eklentisinin İlk Xcode Derlemesi

> Bu dosya `akifyapayzeka/aiajans` reposundaki AI ajans sisteminin **Codex Bağlantı Sorumlusu** ajanı tarafından oluşturuldu. Format: `aiajans/docs/playbooks/codex-handoff.md`. Kaynak desen: `akifyapayzeka/afg-ai-os/CLAUDE_CODEX_BRIDGE.md`.

## Bağlam

`docs/ios-storekit-integration.md`'ye göre StoreKit 2 entegrasyonu için `EksperIQEntitlementStore.swift` ve `EksperIQEntitlementPlugin.swift` yazıldı ama **hiçbir zaman Xcode'da derlenmedi** — geliştirme Windows'ta yapıldı, macOS/Xcode erişimi yoktu. Claude Code (bu ajans sistemi) da macOS/Xcode içeren bir ortamda çalışmıyor, dolayısıyla bu adımı yapamıyor. Bu, `akifyapayzeka/aiajans` reposundaki `TASK_QUEUE.md` madde 4 ile ilişkilidir ve App Store gönderiminin önündeki somut bir engeldir (Apple Developer onayı geldiğinde IAP akışının çalışır olması gerekiyor).

## Kesin Görev Tanımı

1. `ios/App/App/` altındaki StoreKit Swift dosyalarını (mevcut plugin/store dosyaları) Xcode projesine dahil ederek **gerçek bir macOS ortamında derle**.
2. Derleme hatalarını (varsa) düzelt — Capacitor plugin köprüleme kurallarına (`docs/ios-storekit-integration.md`'de tanımlı) sadık kalarak.
3. `com.eksperiq.app.pro.monthly` placeholder ürün ID'siyle StoreKit yapılandırma dosyası (`.storekit`) oluştur, Xcode'un yerel StoreKit test ortamında (sandbox Apple hesabı gerekmeden) satın alma akışını simüle et.
4. Sonucu (derleme logu, varsa ekran görüntüsü) bu dosyanın altına "Codex Notu" bölümü olarak ekle.

## Kabul Kriterleri

- [ ] Proje Xcode'da hatasız derleniyor (`xcodebuild` çıktısı veya eşdeğeri paylaşılmalı)
- [ ] Yerel StoreKit test ortamında en az bir mock satın alma akışı çalıştı
- [ ] `docs/ios-storekit-integration.md` gerçek derleme sonucuna göre güncellendi (hâlâ "hiç derlenmedi" yazmamalı)

## Sınırlar — Asla Yapılmayacaklar

- `main`/`master`'a doğrudan merge yok — ayrı branch + PR.
- Gerçek App Store Connect'e ürün oluşturma yok (bu adım sahibin onayını gerektiriyor, `aiajans/docs/playbooks/app-store-submission-playbook.md` madde 5).
- Gerçek Apple sandbox hesabıyla satın alma denemesi yok (henüz Apple Developer onayı yok).

## Geri Bildirim Yeri

Bu dosyanın altına "Codex Notu" ekle + `docs/ios-storekit-integration.md`'yi güncelle + `akifyapayzeka/aiajans` reposundaki `TASK_QUEUE.md` madde 4'ü işaretlemek üzere bir not bırak (aiajans reposuna yazma yetkin yoksa, bu dosyadaki not CEO Orkestratör ajanının bir sonraki turunda okunup oraya yansıtılacak).

---

## Codex Notu

_(Codex bu görevi aldığında buraya yazacak.)_
