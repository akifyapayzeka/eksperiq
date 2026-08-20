# App Store Teslim Metinleri

Bu dosya App Store Connect alanlarını tutarlı doldurmak için taslaktır. Metinler EksperIQ'un karar destek sınırını korur; kesin ekspertiz, hasarsızlık veya satın alma garantisi vermez.

## Uygulama Adı

EksperIQ

## Alt Başlık

İkinci el araç karar desteği

## Kısa Açıklama

İlan linkini yapıştırın; riskleri, kronik sorunları ve satıcı sorularını görün.

## Uzun Açıklama

EksperIQ, ikinci el araç alırken ilanı daha bilinçli değerlendirmenize yardımcı olan karar destek uygulamasıdır.

İlan linkiyle analizde uygulama, kullanıcının yapıştırdığı araç ilanından görülebilen bilgileri ve araç fotoğraflarını alır; marka, model, yıl, kilometre, fiyat, yakıt, vites, şehir, satıcı açıklaması, boya/değişen bilgisi ve ekspertiz notları gibi alanları rapora dönüştürmeye çalışır. İlan linki kullanmak istemeyen kullanıcılar aynı analizi manuel form ile de oluşturabilir.

EksperIQ raporu; risk skorunu, alınmadan önce kontrol edilmesi gereken noktaları, satıcıya sorulacak soruları, ekspertizde özellikle bakılacak başlıkları, bakım/evrak uyarılarını ve araçla ilgili bilinen kronik sorun sinyallerini sade şekilde gösterir. Amaç, araçtan anlamayan kullanıcının satın alma öncesinde hangi konuları doğrulaması gerektiğini öğrenmesidir.

Fotoğraf analizi tüm kullanıcılar için ücretsizdir. Kullanıcı kendi aracının fotoğraflarını seçtiğinde görsel ön kontrol yapılır; bu özellik kesin hasar tespiti veya ekspertiz raporu değildir.

EksperIQ profesyonel araç ekspertizinin, servis kontrolünün, resmi kayıt sorgularının veya hukuki incelemenin yerine geçmez. İlandaki bilgiler satıcı beyanı olabilir; boya, değişen, hasar, kilometre, fiyat ve evrak bilgileri satın alma öncesinde ekspertiz, servis ve resmi kayıtlarla doğrulanmalıdır. Hiçbir aracın güvenli, hasarsız veya satın almaya uygun olduğu garanti edilmez. Son satın alma kararı kullanıcıya aittir.

## Anahtar Kelime Taslağı

ikinci el araç,ekspertiz,tramer,araba alım,araç kontrol,oto rapor,hasar kaydı,bakım takibi

## Promosyon Metni

İlan linkini yapıştırın; riskleri, kronik sorunları, fotoğrafları ve satıcı sorularını tek raporda görün.

## Review Note

EksperIQ is a Turkish used-car decision-support app. No sign-in is required for review.

Recommended review flow:

1. Open the app and continue without creating an account if prompted.
2. On the Analysis tab, either paste a public vehicle listing URL or fill the manual vehicle form.
3. Generate the report and review the risk score, seller questions, inspection checklist, chronic issue notes, photo section and disclaimer.
4. Open the photo analysis flow if desired; photo analysis is free and clearly framed as a non-definitive visual pre-check.

The app does not guarantee that a vehicle is safe, undamaged, legally clean or suitable to purchase. It does not replace professional vehicle inspection, service checks, official record checks or legal review. Listing import uses visible listing content from the user's submitted URL and may process text through OpenRouter for temporary normalization. User-entered reports are stored locally on-device unless the user explicitly shares/exports them.

## Gizlilik Cevap Özeti

- Kullanıcı hesabı: Opsiyonel; yalnızca Pro/Pro+ abonelik ve giriş içindir.
- Reklam takibi: Yok.
- Üçüncü taraf analytics: Yok.
- Geliştirici sunucusuna kalıcı hesap kaydı: Yok.
- Konum izni: Yok.
- Kamera izni: Yalnızca kullanıcı fotoğraf ekleme ekranında "Fotoğraf çek" seçeneğini kullandığı anda, tek bir fotoğraf için istenir; sürekli veya arka planda erişim yoktur.
- Fotoğraf erişimi: Yalnızca kullanıcının dosya seçmesiyle ve AI fotoğraf kontrolü talebiyle sınırlı.
- Bildirim izni: Yalnızca kullanıcı Bakım ve Ödeme Takvimi'nde "Bildirimleri aç" derse istenir; MTV/sigorta/muayene/bakım hatırlatmalarıyla sınırlıdır. iOS mağaza sürümünde bildirim tamamen cihaz üzerinde planlanır, sunucuya gitmez.
- AI işleme: İlan linki normalizasyonu ve fotoğraf ön kontrolü için OpenRouter üzerinden kullanıcı aksiyonuyla geçici işleme; veri saklama karşıtı parametreyle gönderilir.
- Kötüye kullanım önleme: Anonim, tek yönlü özetlenmiş (hash) kurulum kimliği/IP ile kısa ömürlü istek sayaçları; kullanıcı kimliğiyle ilişkilendirilemez.
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
