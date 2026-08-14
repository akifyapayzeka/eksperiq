# eksperIQ Abonelik Donusum Entegrasyonu

Tarih: 2026-08-14

Bu not, ortak `SUBSCRIPTION_GROWTH_SYSTEM.md` standardinin eksperIQ icin uygulanacak halidir.

## Ilk Deger

Kullanici odeme istemeden en az bir arac fotografi veya ilan metni icin temel risk/hasar analizini gormelidir. Ilk deger uretilmeden tam ekran zorunlu paywall gosterilmez.

## Pro Degerleri

- Coklu fotograf analizi.
- Daha ayrintili hasar bolgesi yorumu.
- PDF on ekspertiz/ilan risk raporu.
- Analiz gecmisi ve karsilastirma.
- Daha kaliteli AI modeli veya daha yuksek analiz limiti.

## Fiyatlandirma

Fiyatlar `src/lib/pro/pricing.ts` icinde maliyetin tam 5 kati olarak tutulur; App Store Connect urunleri acilinca ayni tutarlar StoreKit tarafina girilir.

| Plan          | Aylik operasyon maliyeti | Aylik fiyat | Yillik fiyat | AI kapsami                                       |
| ------------- | -----------------------: | ----------: | -----------: | ------------------------------------------------ |
| EksperIQ Pro  |                    44 TL |      220 TL |     2.640 TL | Ayda 50 AI fotograf analizi                      |
| EksperIQ Pro+ |                   200 TL |    1.000 TL |    12.000 TL | Ayda 200 AI fotograf analizi ve daha guclu model |

## Paywall Triggerlari

- Kullanici ikinci/ucuncu fotograf eklemek ister.
- PDF rapor/export ister.
- Daha ayrintili AI yorumu ister.
- Ucretsiz analiz limiti dolar.

## Guven ve Uyum

- Yonlendirici alis veya satis emri gibi okunabilecek dil kullanilmaz.
- Fiyat, deneme, yenileme ve iptal bilgisi ayni ekranda gorunur.
- "Simdilik Free ile devam et" aksiyonu gorunur kalir.
- App Review notlarinda premium analiz, PDF export ve varsa AI model farki aciklanir.

## Eventler

`first_value_created`, `premium_feature_tapped`, `paywall_viewed`, `purchase_started`, `purchase_completed`, `restore_purchases_clicked`, `export_completed`.
