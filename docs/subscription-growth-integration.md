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

Maliyet hesabi:

- Birincil ilan modeli `openai/gpt-oss-20b:free` oldugu surece AI token maliyeti yoktur; asil risk ucretsiz endpoint kapasite/rate-limit riskidir.
- Opsiyonel ucretli fallback `openai/gpt-oss-20b` acilirsa guncel referans fiyat yaklasik `$0.03 / 1M input token` ve `$0.13 / 1M output token` seviyesindedir.
- 2026-08-20 kur varsayimi: `1 USD ~= 48 TL`.
- Tipik ilan normalize cagrisi cent alti seviyededir; uygulamadaki `monthlyOperatingCostTry` yalniz token maliyeti degil, retry, hatali deneme, Vercel/altyapi payi, Apple kesintisi sonrasi nefes payi ve kotu kullanim tamponudur.

| Plan          | Aylik operasyon maliyeti | Aylik fiyat | Yillik fiyat | Kapsam                         |
| ------------- | -----------------------: | ----------: | -----------: | ------------------------------ |
| EksperIQ Pro  |                    30 TL |      150 TL |     1.500 TL | Ayda 20 ilan linki analizi     |
| EksperIQ Pro+ |                    80 TL |      400 TL |     4.000 TL | Sinirsiz ilan linki analizi    |

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
