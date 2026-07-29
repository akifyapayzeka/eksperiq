# App Store Varlık Planı

Bu dosya Apple Developer hesabı açılmadan hazırlanabilecek ücretsiz teslim varlıklarını listeler. Ücretli hesap, Xcode imzalama ve App Store Connect yüklemesi bu kapsamda yapılmaz.

## İkon

Kaynak dosya:

```text
public/app-store-icon-source.svg
```

App Store için gereken final ikon:

```text
public/app-store-icon-1024.png
1024 x 1024 PNG, alfa kanalı olmadan
```

Ücretsiz üretim yolu:

```bash
npm run appstore:icon
```

Bu komut `public/app-store-icon-1024.png` dosyasını opak RGB PNG olarak üretir. `npm run appstore:check` ikonun 1024 x 1024 olduğunu ve alpha kanalı içermediğini doğrular. Xcode Asset Catalog içinde AppIcon alanına bu dosya yerleştirilmelidir.

## Screenshot seti

Yerel üretim:

```bash
npm run screenshots
```

Teslim paketi üretimi:

```bash
npm run appstore:prepare
```

Bu komut App Store dokümanlarını, mevcut mobil screenshot çıktısını ve ikon kaynaklarını `dist/app-store-package` altına toplar; mevcut mobil ekran görüntülerinden 1320 x 2868 ölçülü App Store sunum görselleri üretir; paketin beklenen dosyaları ve final screenshot ölçülerini doğrular. `dist` klasörü repoya eklenmez.

Apple'ın App Store Connect screenshot referansına göre iPhone 6.9 inç portre setinde 1320 x 2868, 1290 x 2796 veya 1260 x 2736 piksel kabul edilir. EksperIQ ilk paketleme akışı 1320 x 2868 PNG üretir. Apple ayrıca her screenshot seti için 1-10 PNG/JPG/JPEG dosyası kabul eder.

Öncelikli mobil dosyalar:

```text
test-results/screenshots/mobile-home.png
test-results/screenshots/mobile-analysis-form.png
test-results/screenshots/mobile-result.png
test-results/screenshots/mobile-my-analyses.png
test-results/screenshots/mobile-offline.png
```

App Store ekran görüntüleri için önerilen sıra:

1. Ana ekran: ücretsiz analiz vaadi.
2. Analiz formu: manuel ve gizlilik odaklı akış.
3. Sonuç raporu: risk skoru ve satıcı soruları.
4. Analizlerim: oturum raporu ve gelecek modüller.
5. Offline ekran: stabil hata durumu.

## Store metinleri

Teslim metinleri:

```text
docs/app-store-submission.md
```

Hazırlık ve risk notları:

```text
docs/app-store-readiness.md
docs/release-operations-checklist.md
```

## Ücretsiz QA listesi

- iPhone küçük ekran: yatay taşma yok.
- Form alanları en az 44 px dokunma alanına sahip.
- Klavye açıldığında mobil alt menü ve analiz butonu kritik alanları kapatmıyor.
- Sonuç sayfasında yasal uyarı görünür.
- Rapor yazdırma ekranında header, footer ve alt menü görünmez.
- Paylaşma desteklenmiyorsa rapor özeti panoya kopyalanır.
- Uygulama login, ödeme, reklam, analytics ve gereksiz izin istemez.

## İlk sürüm sınırı

EksperIQ ilk App Store sürümünde yalnızca karar desteği sağlar. Profesyonel ekspertiz, resmi kayıt sorgusu, servis kontrolü veya hukuki inceleme yerine geçmez.
