# Yayın Operasyon Checklist'i

Bu checklist Vercel, Hostinger ve App Store hazırlık yollarında aynı kalite standardını korumak için kullanılır.

15 Ağustos 2026 launch planı: `docs/launch-plan-2026-08-15.md`

Tüm adımların merkezi takip dosyası: `docs/launch-master-checklist.md`

Manuel test rehberi: `docs/how-to-test.md`

## Her yayın öncesi

```bash
npm run release:check
npm run format
npm run lint
npm run typecheck
npm run test
npm run privacy:check
npm run rule-backlog:check
npm run launch:check
npm run launch:audit
npm run appstore:metadata-check
npm run repo:check
npm run user-tests:package
npm run user-tests:triage-check
npm run user-tests:commands-check
npm run rule-feedback:package
npm run rule-feedback:check
npm run deploy:check
npm run build
npm run e2e
npm run screenshots
```

Kontrol edilecekler:

- Uygulama adı merkezi config içinden geliyor.
- Türkçe görünen metinlerde bozuk karakter yok.
- Eski çalışma adı, secret veya gereksiz env referansı yok.
- `/`, `/analiz`, `/sonuc`, `/moduller`, `/gizlilik` sayfaları çalışıyor.
- Analiz formunda şehir, araç detayları ve hasar parçaları uygun yerlerde seçenekli/dokunulabilir çalışıyor.
- Sonuç sayfasında yasal uyarı, paylaşma/kopyalama/yazdırma, satıcı mesajı ve geri bildirim bağlantısı görünüyor.
- Satıcı açıklamasında belirsiz/kaçamak ifade girildiğinde raporda doğrulama bulgusu oluşuyor.
- Demo/screenshot verisi `tests/fixtures/demo-vehicle.ts` ile tutarlı.

## Vercel

- GitHub `master` branch push sonrası production deployment otomatik başlamalı.
- GitHub remote/local commit kontrolü: `npm run repo:check`
- Vercel panelinde son commit `Ready` durumunda görünmeli.
- Canlı URL: `https://eksperiq.vercel.app`
- Kontrol:

```bash
npm run deploy:check
```

## Hostinger

- Paket komutu:

```bash
npm run hostinger:package
npm run hostinger:check
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
- App Store gizlilik cevapları `docs/app-store-privacy-answers.md` dosyasından kontrol edildi.
- Metadata güvenlik kontrolü: `npm run appstore:metadata-check`
- iOS/TestFlight ön kontrol dosyası: `docs/ios-testflight-preflight.md`

## Geri bildirim ve kural geliştirme

- Canlı uygulamada `/geri-bildirim` sayfası görünür olmalı.
- GitHub issue şablonu: `.github/ISSUE_TEMPLATE/rule-feedback.md`
- Kullanıcı testi issue şablonu: `.github/ISSUE_TEMPLATE/user-test-feedback.md`
- İlk 5 kullanıcı testi planı: `docs/first-5-user-tests.md`
- Kullanıcı testi issue planı: `docs/user-test-issue-plan.md`
- Kullanıcı testi issue taslakları: `npm run user-tests:package`
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
