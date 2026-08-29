# App Store Teslim Metinleri

Bu dosya App Store Connect alanlarını tutarlı doldurmak için taslaktır. Metinler EksperIQ'un karar destek sınırını korur; kesin ekspertiz, hasarsızlık veya satın alma garantisi vermez.

## Uygulama Adı

EksperIQ

## Alt Başlık

İkinci el araç karar desteği

## Kısa Açıklama

Alacağınız aracı detaylı analiz ettirin; riskleri, kronik sorunları ve satıcı sorularını görün.

## Uzun Açıklama

EksperIQ, ikinci el araç alırken ilanı daha bilinçli değerlendirmenize yardımcı olan karar destek uygulamasıdır.

İlan linkiyle analizde uygulama, kullanıcının yapıştırdığı araç ilanından görülebilen bilgileri ve araç fotoğraflarını alır; marka, model, yıl, kilometre, fiyat, yakıt, vites, şehir, satıcı açıklaması, boya/değişen bilgisi ve ekspertiz notları gibi alanları rapora dönüştürmeye çalışır. İlan linki kullanmak istemeyen kullanıcılar aynı analizi manuel form ile de oluşturabilir.

EksperIQ raporu; risk skorunu, alınmadan önce kontrol edilmesi gereken noktaları, satıcıya sorulacak soruları, ekspertizde özellikle bakılacak başlıkları, bakım/evrak uyarılarını ve araçla ilgili bilinen kronik sorun sinyallerini sade şekilde gösterir. Amaç, araçtan anlamayan kullanıcının satın alma öncesinde hangi konuları doğrulaması gerektiğini öğrenmesidir.

Fotoğraf analizi tüm kullanıcılar için ücretsizdir. Kullanıcı kendi aracının fotoğraflarını seçtiğinde görsel ön kontrol yapılır; bu özellik kesin hasar tespiti veya ekspertiz raporu değildir.

EksperIQ profesyonel araç ekspertizinin, servis kontrolünün, resmi kayıt sorgularının veya hukuki incelemenin yerine geçmez. İlandaki bilgiler satıcı beyanı olabilir; boya, değişen, hasar, kilometre, fiyat ve evrak bilgileri satın alma öncesinde ekspertiz, servis ve resmi kayıtlarla doğrulanmalıdır. Hiçbir aracın güvenli, hasarsız veya satın almaya uygun olduğu garanti edilmez. Son satın alma kararı kullanıcıya aittir.

Uygulama ücretsiz kullanılabilir (sınırlı sayıda ilan linki analizi). Daha fazla analiz ve gelişmiş özellikler için isteğe bağlı EksperIQ Pro ve EksperIQ Pro+ otomatik yenilenen abonelikleri sunulur: Pro Aylık, Pro Yıllık, Pro+ Aylık, Pro+ Yıllık. Fiyatlar App Store'da bulunduğunuz bölgeye göre gösterilir. Abonelikler otomatik olarak yenilenir; mevcut dönem bitmeden en az 24 saat önce iptal edilmezse ücret Apple hesabınızdan tahsil edilir; App Store hesap ayarlarınızdan istediğiniz zaman yönetebilir veya iptal edebilirsiniz. Kullanım Koşulları: https://eksperiq.vercel.app/kullanim-kosullari — Gizlilik Politikası: https://eksperiq.vercel.app/gizlilik — Apple'ın Standart Lisans Sözleşmesi: https://www.apple.com/legal/internet-services/itunes/dev/stdeula/

## Anahtar Kelime Taslağı

ikinci el araç,ekspertiz,tramer,araba alım,araç kontrol,oto rapor,hasar kaydı,bakım takibi

## Promosyon Metni

Alacağınız aracı detaylı analiz ettirin; riskleri, kronik sorunları, fotoğrafları ve satıcı sorularını tek raporda görün.

## Review Note (Build 65 taslağı — henüz gönderilmedi)

EksperIQ is a Turkish used-car decision-support app.

**No account or sign-in of any kind.** The app has no user account system — there is nothing to sign in to, no demo credentials are needed, and no signup flow exists to fail. Every screen is reachable immediately on first launch.

Recommended review flow:

1. Open the app — it opens directly to the main screen, no onboarding gate.
2. On the Analysis tab, either paste a public vehicle listing URL or fill the manual vehicle form, then generate the report (risk score, seller questions, inspection checklist, chronic issue notes, photo section, disclaimer).
3. Open Profile ("Profil") to reach the subscription paywall. Once the App Store Connect subscription metadata blockers below are resolved and the purchase flow is enabled for this build **[MANUAL STEP REQUIRED — not yet enabled]**, all four subscription products (Pro Monthly, Pro Yearly, Pro+ Monthly, Pro+ Yearly) will show with real App Store Connect pricing, title, duration, price, auto-renewal terms, Privacy Policy, Terms of Use and Restore Purchases. Purchase and restore both work purely via StoreKit and the reviewer's own Sandbox Apple ID — no app account of any kind is involved. No real charge occurs.
4. Open the photo analysis flow if desired; photo analysis is free and clearly framed as a non-definitive visual pre-check.

The app does not guarantee that a vehicle is safe, undamaged, legally clean or suitable to purchase. It does not replace professional vehicle inspection, service checks, official record checks or legal review. Listing import uses visible listing content from the user's submitted URL and may process text through OpenRouter for temporary normalization. All vehicle/analysis records are stored locally on-device only; the app has no backend user account and stores no personal data (name, email, or any identifier) on our servers.

**[MANUAL STEP REQUIRED]** A screen recording covering app launch → main feature access → paywall (all four products, real price/duration) → Privacy Policy → Terms/EULA → Restore Purchases is not yet attached to this submission — see the checklist in `docs/app-review-2-1-response.md`.

Guideline 2.1 additional information response draft: `docs/app-review-2-1-response.md`

## Gizlilik Cevap Özeti

- Kullanıcı hesabı: Yok. Pro/Pro+ satın alma tamamen Apple StoreKit üzerinden, Apple ID'ye bağlı çalışır.
- Reklam takibi: Yok.
- Üçüncü taraf analytics: Yok.
- Geliştirici sunucusuna kalıcı kullanıcı kaydı: Yok; araç/analiz kayıtları da sunucuya gönderilmez.
- Konum izni: Yalnızca "Konumuma göre tahmin et" (masraf tahmini) ve Yakınımdaki Hizmetler ekranlarında, kullanıcı açıkça başlattığında istenir; hassas konum OpenStreetMap (şehir tespiti) ve Google Places'a (yakın servis önerisi) geçici olarak iletilir, sunucuda kalıcı saklanmaz.
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

- `01-home-1320x2868.png`
- `02-analysis-start-1320x2868.png`
- `03-risk-score-1320x2868.png`
- `04-garage-1320x2868.png`
- `05-buyer-decision-1320x2868.png`
