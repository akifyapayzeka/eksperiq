# App Store Teslim Metinleri

Bu dosya App Store Connect alanlarını tutarlı doldurmak için taslaktır. Metinler EksperIQ'un karar destek sınırını korur; kesin ekspertiz, hasarsızlık veya satın alma garantisi vermez.

## Uygulama Adı

EksperIQ

## Alt Başlık

İkinci el araç karar desteği

## Kısa Açıklama

Araç ilanını girin; riskli noktaları, satıcı sorularını ve ekspertiz kontrol listesini görün.

## Uzun Açıklama

EksperIQ, ikinci el araç ilanlarını daha bilinçli değerlendirmenize yardımcı olan ücretsiz bir karar destek uygulamasıdır.

Araç bilgilerini, hasar geçmişini, bakım durumunu ve satıcı açıklamasını manuel girerek kural tabanlı bir risk değerlendirmesi oluşturabilirsiniz. Uygulama; risk skorunu, dikkat edilmesi gereken noktaları, satıcıya sorulacak öncelikli soruları, satıcıya gönderilebilecek kısa mesajı, olası masraf sinyallerini ve ekspertizde özellikle kontrol edilecek başlıkları gösterir.

EksperIQ ayrıca kullanıcının açık aksiyonuyla AI karar destek notu ve fotoğraf ön kontrolü sunabilir. Fotoğraf kontrolü kesin hasar tespiti değildir; yalnızca araç görselinde kontrol edilmesi gereken olası noktaları ve güven seviyesini düzenler. Araç olmayan görseller için hasar bulgusu üretilmemelidir.

EksperIQ kullanıcı verilerini geliştirici sunucusuna kalıcı hesap kaydı olarak kaydetmez. Analiz, mevcut cihaz/tarayıcı oturumu içinde çalışır. İlan bağlantıları otomatik okunmaz veya scrape edilmez.

EksperIQ profesyonel araç ekspertizinin, servis kontrolünün, resmi kayıt sorgularının veya hukuki incelemenin yerine geçmez. Hiçbir aracın güvenli, hasarsız veya satın almaya uygun olduğunu garanti etmez. Son satın alma kararı kullanıcıya aittir.

## Anahtar Kelime Taslağı

ikinci el araç, araç ekspertiz, tramer, araba alım, araç kontrol, oto rapor, hasar kaydı, bakım takibi, satıcı soruları

## Promosyon Metni

Araç ilanını manuel girin; riskli noktaları ve satıcıya sorulacak soruları saniyeler içinde görün.

## Review Note

EksperIQ is a free decision-support app for evaluating used vehicle listings in Turkish. The app does not provide a definitive inspection result and does not guarantee that a vehicle is safe, undamaged, or suitable to purchase.

The app does not require login, payment, ads, analytics, location, microphone, contacts, or background tracking. User-entered vehicle and listing data is not permanently stored as a developer account record. Listing URLs are accepted only as manual references; the app does not scrape listing websites.

AI assistance is available only when the user explicitly requests it. The AI note and photo check are limited decision-support features and do not replace professional inspection. Photo access is initiated only by the user's own action on the photo upload screen — either taking a single photo or picking one from the library — and camera/photo library permission is requested only at that moment, for that one photo.

Recommended review flow:

1. Open the app.
2. Tap "Ücretsiz analiz et".
3. Fill the vehicle form manually or use realistic sample values.
4. Submit the form.
5. Review the generated risk score, seller questions, seller-ready copy message, legal disclaimer, and checklist.
6. Open "Fotoğraftan Hasar Analizi" and verify that the photo check is framed as a non-definitive control note.

## Gizlilik Cevap Özeti

- Kullanıcı hesabı: Yok.
- Reklam takibi: Yok.
- Üçüncü taraf analytics: Yok.
- Geliştirici sunucusuna kalıcı hesap kaydı: Yok.
- Konum izni: Yok.
- Kamera izni: Yalnızca kullanıcı fotoğraf ekleme ekranında "Fotoğraf çek" seçeneğini kullandığı anda, tek bir fotoğraf için istenir; sürekli veya arka planda erişim yoktur.
- Fotoğraf erişimi: Yalnızca kullanıcının dosya seçmesiyle ve AI fotoğraf kontrolü talebiyle sınırlı.
- AI işleme: OpenRouter üzerinden kullanıcı aksiyonuyla geçici karar destek işleme.
- Mikrofon/rehber izni: Yok.
- Hassas kişisel veri işleme: Yok.

Detaylı App Store gizlilik cevapları: `docs/app-store-privacy-answers.md`

## Ekran Görüntüsü Seti

Yerel üretim komutu:

```bash
npm run screenshots
```

Çıktı klasörü:

```text
test-results/screenshots
```

App Store için önce mobil çıktılar incelenmelidir:

- `mobile-home.png`
- `mobile-analysis-form.png`
- `mobile-result.png`
- `mobile-my-analyses.png`
- `mobile-offline.png`
