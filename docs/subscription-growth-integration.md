# eksperIQ Abonelik Donusum Entegrasyonu

Tarih: 2026-08-14

Bu not, ortak `SUBSCRIPTION_GROWTH_SYSTEM.md` standardinin eksperIQ icin uygulanacak halidir.

## Ilk Deger

Kullanici odeme istemeden en az bir arac fotografi veya ilan metni icin temel risk/hasar analizini gormelidir. Ilk deger uretilmeden tam ekran zorunlu paywall gosterilmez.

## Pro Degerleri

- Pro: ayda 20 ilan linki analizi.
- Pro+: sinirsiz ilan linki analizi.
- PDF on ekspertiz/ilan risk raporu.
- Analiz gecmisi ve karsilastirma.
- Fotograf analizi tum planlarda ayni ucretsiz gorsel AI modeliyle sunulur; premium ayrimi degildir.

## Fiyatlandirma

Fiyatlar `src/lib/pro/pricing.ts` icinde maliyetin tam 5 kati olarak tutulur; App Store Connect urunleri acilinca ayni tutarlar StoreKit tarafina girilir.

| Plan          | Aylik operasyon maliyeti | Aylik fiyat | Yillik fiyat | Kapsam                         |
| ------------- | -----------------------: | ----------: | -----------: | ------------------------------ |
| EksperIQ Pro  |                    44 TL |      220 TL |     2.640 TL | Ayda 20 ilan linki analizi     |
| EksperIQ Pro+ |                   200 TL |    1.000 TL |    12.000 TL | Sinirsiz ilan linki analizi    |

Fotograf analizi Free, Pro ve Pro+ icin ucretsiz kalir ve ucretsiz gorsel AI modeliyle calisir.

## Paywall Triggerlari

- PDF rapor/export ister.
- Ucretsiz 3 ilan linki analizi limiti dolar.
- Pro kullanici aylik 20 ilan linki analizi limitine ulasir.

## Guven ve Uyum

- Yonlendirici alis veya satis emri gibi okunabilecek dil kullanilmaz.
- Fiyat, deneme, yenileme ve iptal bilgisi ayni ekranda gorunur.
- "Simdilik Free ile devam et" aksiyonu gorunur kalir.
- App Review notlarinda premium ilan analizi kotasi ve PDF/export ayrimi aciklanir; fotograf analizinde AI model farki pazarlanmaz.

## Eventler

`first_value_created`, `premium_feature_tapped`, `paywall_viewed`, `purchase_started`, `purchase_completed`, `restore_purchases_clicked`, `export_completed`.
