# Yayın Operasyon Checklist'i

Bu checklist Vercel, Hostinger ve App Store hazırlık yollarında aynı kalite standardını korumak için kullanılır.

15 Ağustos 2026 launch planı: `docs/launch-plan-2026-08-15.md`

## Her yayın öncesi

```bash
npm run format
npm run lint
npm run typecheck
npm run test
npm run launch:check
npm run build
npm run e2e
npm run screenshots
```

Kontrol edilecekler:

- Uygulama adı merkezi config içinden geliyor.
- Türkçe görünen metinlerde bozuk karakter yok.
- Eski çalışma adı, secret veya gereksiz env referansı yok.
- `/`, `/analiz`, `/sonuc`, `/moduller`, `/gizlilik` sayfaları çalışıyor.
- Sonuç sayfasında yasal uyarı, paylaşma/kopyalama/yazdırma aksiyonları ve geri bildirim bağlantısı görünüyor.
- Demo/screenshot verisi `tests/fixtures/demo-vehicle.ts` ile tutarlı.

## Vercel

- GitHub `master` branch push sonrası production deployment otomatik başlamalı.
- Vercel panelinde son commit `Ready` durumunda görünmeli.
- Canlı URL: `https://eksperiq.vercel.app`
- Kontrol:

```bash
Invoke-WebRequest -Uri https://eksperiq.vercel.app -UseBasicParsing
Invoke-WebRequest -Uri https://eksperiq.vercel.app/manifest.webmanifest -UseBasicParsing
```

## Hostinger

- Paket komutu:

```bash
npm run hostinger:package
```

- Çıktı: `dist/eksperiq-hostinger-static.zip`
- Zip içinde bulunması gerekenler:
  - `.htaccess`
  - `index.html`
  - `analiz.html`
  - `sonuc.html`
  - `moduller.html`
  - `offline.html`
  - `_next/static`
- Paket `public_html` içine açıldıktan sonra sayfa yenileme testi yapılmalı.

## App Store / TestFlight

- Native hazırlık komutu:

```bash
npm run native:build
```

- macOS/Xcode üzerinde:

```bash
npm run ios:add
npm run ios:sync
npm run ios:open
```

Kontrol edilecekler:

- Bundle ID: `com.eksperiq.app`
- App adı: `EksperIQ`
- Build ortamı: Xcode 26 veya sonrası, iOS 26 SDK
- Gizlilik politikası URL'si: `https://eksperiq.vercel.app/gizlilik`
- Kamera, konum, fotoğraf veya bildirim izni gerekmedikçe istenmiyor.
- Raporu paylaş aksiyonu gerçek iOS cihazda çalışıyor.
- `/offline` ekranından üretilen `out/offline.html` fallback ekranı olarak native projeye taşınmış olmalı.
- `safe-area-shell` sınıfı iOS güvenli alanlarında içerik taşmasını engellemeli.
- App Store metinleri kesin ekspertiz veya satın alma garantisi vermiyor.
- App Store Connect metinleri `docs/app-store-submission.md` dosyasından kontrol edildi.
- iOS/TestFlight ön kontrol dosyası: `docs/ios-testflight-preflight.md`

## Geri bildirim ve kural geliştirme

- Canlı uygulamada `/geri-bildirim` sayfası görünür olmalı.
- GitHub issue şablonu: `.github/ISSUE_TEMPLATE/rule-feedback.md`
- Kullanıcı testi issue şablonu: `.github/ISSUE_TEMPLATE/user-test-feedback.md`
- İlk 5 kullanıcı testi planı: `docs/first-5-user-tests.md`
- İlk takip issue'su: `https://github.com/akifyapayzeka/eksperiq/issues/1`
- Kural adayları: `src/lib/feedback/rule-candidates.ts`
- Kural backlog dosyası: `docs/rule-backlog.md`
- Kullanıcı testi triage dosyası: `docs/user-test-feedback-triage.md`
- Bir aday aktif kurala taşınmadan önce pozitif ve negatif unit test yazılmalı.

## Demo ve screenshot

- Sabit demo verisi: `tests/fixtures/demo-vehicle.ts`
- Görsel çekim senaryosu: `docs/demo-screenshot-scenario.md`
- Otomatik screenshot komutu: `npm run screenshots`
- Çıktı klasörü: `test-results/screenshots`
- App Store görsellerinde kesin garanti dili kullanılmamalı.
