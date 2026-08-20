# iOS / TestFlight Ön Kontrol

Bu dosya Windows tarafında hazırlanabilecek iOS teslim şartlarını net tutar. Gerçek arşivleme, signing ve TestFlight yükleme için macOS, Xcode ve Apple Developer hesabı gerekir.

## Yerelde doğrulanacaklar

```bash
npm run launch:check
npm run native:build
npm run appstore:prepare
npm run external:check
```

- Web build statik olarak üretiliyor.
- Capacitor sync hata vermiyor.
- 1024 x 1024 opak App Store ikonu hazır.
- App Store screenshot paketi üretiliyor.
- Gizlilik ve kullanım koşulları canlı web rotalarında mevcut.
- OpenRouter veya Apple secret dosyası commitlenmiyor.
- GitHub macOS 26 runner üzerinde `iOS Xcode Build Check` workflow'u Xcode 26.6 / iOS 26.5 SDK ile unsigned simulator compile check'i geçiriyor.
- `iOS TestFlight Upload` workflow'u Xcode kapısını geçiyor; archive/upload için Apple signing ve App Store Connect secret'ları bekliyor.

## macOS / Xcode ön koşulları

- Xcode 26 veya Apple'ın güncel kabul ettiği sürüm kurulu.
- Apple Developer Program üyeliği aktif.
- App Store Connect erişimi mevcut.
- Bundle ID: `com.eksperiq.app`
- Display name: `EksperIQ`
- Signing team seçildi.
- Release build gerçek iPhone üzerinde açılıyor.
- GitHub repository secret'ları `npm run external:check -- --required` ile eksiksiz görünüyor.

## Signing ve secret sınırı

Repo içine şunlar eklenmez:

- `.p12`
- `.cer`
- `.mobileprovision`
- App Store Connect API key dosyası
- Xcode kullanıcı state dosyaları
- OpenRouter veya başka servis anahtarı

## TestFlight çıkış kapısı

- `docs/testflight-qa-checklist.md` gerçek cihazda işaretlenir.
- Rapor paylaşma veya kopyalama davranışı iOS üzerinde denenir.
- Uçak modu/offline davranışı anlaşılır kalır.
- Uygulama konum iznini yalnızca kullanıcı "konumuma göre" şehir tahmini veya yakındaki ekspertiz/noter/servis araması başlatırsa ister; konum kalıcı saklanmaz. Kamera ve fotoğraf izni yalnızca fotoğraf kontrolü ekranında, kullanıcı çekim/seçim başlattığı o tek fotoğraf için istenir. Bildirim izni yalnızca kullanıcı Bakım ve Ödeme Takvimi ekranında "Bildirimleri aç" seçeneğini kullanırsa istenir.
- App Store metinleri profesyonel ekspertiz yerine geçme iddiası taşımaz.
