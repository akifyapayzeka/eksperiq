# Demo ve Screenshot Senaryosu

Bu senaryo Vercel, Hostinger, TestFlight ve App Store görsellerinde aynı anonim araç verisiyle tutarlı ekranlar üretmek için kullanılır.

## Veri kaynağı

E2E testleri ve demo ekranları için temel veri `tests/fixtures/demo-vehicle.ts` dosyasında tutulur.

Bu veri:

- Gerçek plaka, telefon, açık adres veya satıcı adı içermez.
- İlan açıklamasında doğrulanacak iddialar içerir.
- Garaj kullanımı iddiası kuralını görünür hale getirir.
- Bakım, tramer, ekspertiz ve yedek anahtar alanlarını doldurarak raporu daha gerçekçi gösterir.

## Otomatik üretim

Screenshot setini üretmek için:

```bash
npm run screenshots
```

Çıktılar `test-results/screenshots` klasörüne yazılır. Bu klasör test çıktısıdır ve Git deposuna eklenmez.

Üretilen temel dosyalar:

- `chromium-home.png`
- `chromium-analysis-form.png`
- `chromium-result.png`
- `chromium-offline.png`
- `mobile-home.png`
- `mobile-analysis-form.png`
- `mobile-result.png`
- `mobile-offline.png`

## Çekilecek ekranlar

1. Ana sayfa
2. Analiz formu üst bölümü
3. Analiz formu açıklama bölümü
4. Sonuç skoru ve kısa karar özeti
5. Riskli noktalar ve garaj kullanımı iddiası
6. Satıcıya sorulacak sorular
7. Son kontrol listesi
8. Geri bildirim sayfası

## App Store için not

Screenshot metinlerinde kesin ekspertiz sonucu, kesin hasarsızlık veya satın alma garantisi verilmemelidir. Görseller karar desteği, soru hazırlığı ve ekspertiz öncesi kontrol odağını göstermelidir.
