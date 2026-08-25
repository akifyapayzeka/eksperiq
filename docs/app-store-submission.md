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

**Demo account** (persistent, already confirmed — no self-signup needed):

- Username: provided separately, outside this repository (see final task report)
- Password: provided separately, outside this repository
- Account type: standard user account (free tier). No plan tier gates any core analysis functionality — sign-in is only required to reach the subscription purchase flow and account deletion, both of which are reachable with this demo account.

Recommended review flow:

1. Open the app. On first launch you'll see an onboarding screen offering "Üye ol / Giriş yap" (sign up / sign in) or "Üye olmadan devam et" (continue without an account). Sign in with the demo credentials above ("Giriş yap" tab).
2. On the Analysis tab, either paste a public vehicle listing URL or fill the manual vehicle form, then generate the report (risk score, seller questions, inspection checklist, chronic issue notes, photo section, disclaimer).
3. Open Profile ("Profil") to reach the subscription paywall. All four subscription products (Pro Monthly, Pro Yearly, Pro+ Monthly, Pro+ Yearly) are enabled in this build with real App Store Connect pricing, and each shows title, duration, price, auto-renewal terms, Privacy Policy, Terms of Use and Restore Purchases. Purchases use the App Store Sandbox automatically during review — no real charge occurs.
4. Account deletion is available from Profile > Account > "Hesabımı sil" (two-step confirmation), which permanently deletes the demo account's email/name from our authentication provider (Supabase). Please do not use this on the shared demo account during review — a fresh demo account can be provided if deletion testing is needed.
5. Open the photo analysis flow if desired; photo analysis is free and clearly framed as a non-definitive visual pre-check.

The app does not guarantee that a vehicle is safe, undamaged, legally clean or suitable to purchase. It does not replace professional vehicle inspection, service checks, official record checks or legal review. Listing import uses visible listing content from the user's submitted URL and may process text through OpenRouter for temporary normalization. Vehicle/analysis records are stored locally on-device; only the optional account's email and name are stored server-side (Supabase Authentication), used solely to manage the Pro/Pro+ subscription and let the user sign in on another device.

A screen recording covering app launch → demo sign-in → paywall (all four products, real price/duration) → Privacy Policy → Terms/EULA → Restore Purchases → main feature access is attached to this submission.

Guideline 2.1 additional information response draft: `docs/app-review-2-1-response.md`

## Gizlilik Cevap Özeti

- Kullanıcı hesabı: Opsiyonel; yalnızca Pro/Pro+ abonelik ve giriş içindir (Supabase Authentication — e-posta + ad/soyad). Profil > Hesap > "Hesabımı sil" ile kalıcı olarak silinebilir.
- Reklam takibi: Yok.
- Üçüncü taraf analytics: Yok.
- Geliştirici sunucusuna kalıcı hesap kaydı: Yalnızca hesap açan kullanıcılar için e-posta/ad-soyad (yukarıya bakın); araç/analiz kayıtları sunucuya gönderilmez.
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
