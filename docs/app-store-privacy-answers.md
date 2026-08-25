# App Store Gizlilik Cevapları

Bu dosya App Store Connect gizlilik formu doldurulurken kullanılacak cevapları sabitler. Cevaplar mevcut koddaki gerçek davranışa göre yazılmıştır (bkz. `api/_lib/rate-limit.js`, `api/_lib/openrouter.js`, `api/_lib/push-store.js`, `src/lib/photo-analysis/prepare-ai-image.ts`, `src/lib/push/native.ts`, `src/lib/data-management/*`); kodla tutarsız hale gelirse bu dosya da güncellenmelidir.

## Veri Toplama

- Kullanıcı hesabı: Opsiyoneldir; yalnızca Pro/Pro+ abonelik ve giriş için kullanılır. Araç kayıtları ve analizler geliştirici sunucusunda kalıcı hesap kaydı olarak tutulmaz.
- E-posta adresi: Yalnızca kullanıcı hesap oluştururken (Supabase Authentication) girilir; kimlik doğrulama ve girişi yönetmek için kullanılır. Kullanıcı hesabını "Hesabımı sil" ile kalıcı olarak silebilir.
- Ad/Soyad: Yalnızca kullanıcı hesap oluştururken girilir (Supabase Authentication user_metadata); reklam, izleme veya profil oluşturma amacıyla kullanılmaz.
- Kullanıcı/hesap ID'si (User ID): Hesap oluşturulduğunda Supabase Authentication kalıcı bir hesap UUID'si atar; bu UUID Supabase'in auth.users tablosunda hesap kaydının birincil anahtarı olarak tutulur ve `api/account/delete.js`'nin doğrulama adımında (auth.getUser → user.id) geliştirici sunucusuna da ulaşır. Bu, Apple'ın "collected" tanımına girer (cihaz dışına gönderiliyor ve hesabın parçası olarak saklanıyor) — kullanılmıyor/paylaşılmıyor olması "toplanmıyor" anlamına gelmez, bu iki ayrı soru. App Store Connect: **User ID = YES, Linked to User = YES, Tracking = NO, Purpose = App Functionality** (yalnızca hesap kimlik doğrulama/silme için; reklam, profil oluşturma veya izleme amacıyla kullanılmaz/paylaşılmaz).
- Konum verisi: Yalnızca kullanıcı "konumuma göre" bir işlem başlatırsa cihazdan anlık alınır (`navigator.geolocation.getCurrentPosition(..., { enableHighAccuracy: false })` — bu W3C API ayarı düşük güç/hız tercih eder ama iOS'un ayrı "Approximate Location" anahtarını devre dışı bırakmaz; kod hiçbir yerde precise/coarse ayrımı yapmıyor, kullanıcı Ayarlar'da Precise Location'ı kapatmadıysa alınan koordinat hassas olabilir). Bu ham koordinatlar `api/geo/reverse-geocode.js` üzerinden OpenStreetMap Nominatim'e ve `api/places/nearby.js` üzerinden Google Places API'ye istek sırasında iletilir; her iki uç nokta da koordinatı hiçbir veritabanına yazmaz, yalnızca üçüncü taraf yanıtını (şehir adı / yakındaki işletmeler) döndürür — istek ömrü dışında tutulmaz. App Store Connect: **Precise Location = YES, Linked to User = NO, Tracking = NO, Purpose = App Functionality**.
- Kişiler, mikrofon: Erişim istenmez.
- Kamera, fotoğraflar: Yalnızca kullanıcı fotoğraf ekleme ekranında kamerayla çekim veya galeriden seçim başlattığı anda, tek bir fotoğraf için erişilir; sürekli veya arka planda erişim yoktur. Fotoğraf, AI'ya gönderilmeden önce cihazda küçültülür/yeniden sıkıştırılır ve EXIF meta verileri (konum, cihaz bilgisi) silinir.
- Bildirim: Yalnızca kullanıcı Bakım ve Ödeme Takvimi ekranında "Bildirimleri aç" derse istenir. iOS mağaza sürümünde bildirim tamamen cihaz üzerinde planlanır (`@capacitor/local-notifications`), hiçbir kayıt sunucuya gönderilmez. Web/PWA sürümünde Web Push kullanılır; bkz. aşağıdaki "Bakım ve Ödeme Takvimi Bildirimleri" bölümü.
- Cihaz/tanımlayıcılar: Uygulama içi kötüye kullanımı sınırlamak için rastgele, anonim bir kurulum kimliği (cihazda üretilip yalnızca localStorage'da tutulur) ve/veya istek IP adresi, sunucuya ulaşır ulaşmaz tek yönlü bir özete (HMAC-SHA256) dönüştürülür; ham değer hiçbir zaman saklanmaz. Bu özetler yalnızca kısa ömürlü istek sayaçları için kullanılır (burst penceresi saniyeler, günlük sayaç ~26 saat sonra kendiliğinden silinir) ve kullanıcı kimliğiyle ilişkilendirilemez. Kullanım amacı: App Functionality (kötüye kullanım/oran sınırlama) — reklam, profil oluşturma veya izleme amaçlı değildir.
- Reklam takibi: Yok.
- Üçüncü taraf analytics: Yok.
- Geliştirici sunucusuna kalıcı hesap/analiz kaydı: Yok. (Bildirim özelliğiyle ilgili sınırlı, TTL'li istisna için aşağıya bakın.)
- İlan sitesi scraping: Yok.
- Ödeme veya abonelik: Pro/Pro+ planları yalnızca ilan linki analiz hakkını genişletmek için kullanılır. Fotoğraf analizi ücretsiz kalır. StoreKit satın alma akışı gerçek App Store ürünleri ve sandbox doğrulaması tamamlanmadan etkinleştirilmez.

## Cihazda Geçici/Kalıcı Veri

Kullanıcının manuel girdiği araç ve ilan bilgileri, oluşturulan analiz raporları, araçlar, hatırlatmalar, gider kayıtları, sağlık kayıtları ve fotoğraf analizleri yalnızca cihazda (localStorage/IndexedDB) tutulur; geliştirici sunucusuna kalıcı kayıt olarak gönderilmez. Kullanıcı bu verileri Profil > Verilerim ekranından JSON olarak dışa/içe aktarabilir veya tek dokunuşla tamamen silebilir.

## Bakım ve Ödeme Takvimi Bildirimleri

Bakım ve Ödeme Takvimi kayıtları (MTV, sigorta, muayene, bakım gibi başlık/tarih/tutar bilgileri) her durumda önce cihazda kalıcı olarak saklanır (hesaba değil, yalnızca cihaza).

- **Web/PWA:** Kullanıcı bildirimleri açarsa, son tarihe 30 ve 15 gün kala bildirim gönderebilmek için bu kayıtların bir kopyası ve push aboneliği bilgisi (kullanıcı kimliğiyle ilişkilendirilmeden) sunucu tarafı veritabanı altyapısında (Upstash) tutulur. Bu kopya, cihaz 90 gün boyunca hiç senkronize olmazsa kendiliğinden otomatik silinir (Redis TTL); bildirimler kapatılırsa veya kayıt silinirse ya da kullanıcı "tüm verilerimi sil" derse hemen silinir. Bu veri üçüncü taraflarla paylaşılmaz veya reklam/analitik amacıyla kullanılmaz; yalnızca bildirimi teslim etmek için tarayıcının/işletim sisteminin kendi push servisi aracı olarak kullanılır.
- **iOS mağaza sürümü:** Bildirimler `@capacitor/local-notifications` ile tamamen cihaz üzerinde planlanır; hiçbir kayıt sunucuya gönderilmez.

## AI İlan Normalizasyonu ve Fotoğraf Kontrolü

İlan linki normalizasyonu ve fotoğraf kontrolü yalnızca kullanıcının açık aksiyonuyla çalışır. İlan metni/fotoğrafları veya seçilen (önceden cihazda sıkıştırılıp EXIF'i temizlenmiş) fotoğraf, OpenRouter üzerinden geçici olarak, "bu veriyi model eğitimi için toplama/saklama" talimatıyla işlenir; geliştirici sunucusunda kalıcı hesap kaydı olarak saklanmaz. AI istekleri zaman aşımı ve kontrollü yeniden deneme ile sınırlıdır; AI çıktısındaki kesin/yanıltıcı ifadeler bir çıktı filtresiyle yumuşatılır. AI çıktısı kural tabanlı raporun, profesyonel araç ekspertizinin veya resmi kayıt kontrolünün yerine geçmez.

App Store gizlilik formunda üçüncü taraf AI işleme (OpenRouter) açıkça belirtilmeli; kamera ve fotoğraf kitaplığı izinleri yalnızca kullanıcı fotoğraf ekleme ekranında bir fotoğraf çekmeyi veya seçmeyi başlattığı anda, o tek fotoğraf için istenir.

İlan linki normalizasyonunda ve fotoğraf kontrolünde ilan metninde geçen satıcıya ait telefon, e-posta veya plaka gibi kişisel veriler, OpenRouter'a gönderilmeden hemen önce sunucu tarafında otomatik olarak kaldırılır (bkz. `api/_lib/redact-personal-data.js`). Bu bir NLP-düzeyinde tespit değildir — yalnızca telefon/e-posta/plaka gibi belirgin kalıpları yakalar; serbest metin ad/adres tespiti kasıtlı olarak yapılmaz (yanlış pozitifle araç açıklama metnini bozma riski gerçek kişisel veri sızıntısı riskinden daha yaygın çıkardı).

## Yurt Dışı Veri Aktarımı

OpenRouter (AI işleme), Upstash (sunucu tarafı veritabanı altyapısı, yalnızca Web Push aboneliği için), Supabase (hesap kimlik doğrulama), OpenStreetMap Nominatim (şehir tahmini) ve Google Places (yakındaki ekspertiz/noter/servis önerileri) yurt dışında barındırılan hizmetlerdir. Yukarıda açıklanan sınırlı veriler bu sağlayıcıların sunucularında işlenebilir/geçici olarak tutulabilir. Bu sağlayıcılar dışında hiçbir üçüncü tarafla veri paylaşılmaz.

## KVKK Kapsamındaki Haklar

Araç, analiz, hatırlatma, gider ve sağlık karnesi kayıtları cihazda tutulduğundan 6698 sayılı KVKK'nın 11. maddesindeki bilgi talep etme, düzeltme, silme ve itiraz haklarının büyük kısmı Analizlerim ekranındaki tekil silme işleviyle doğrudan kullanıcı tarafından, aracı olmadan kullanılabilir. Hesap açan kullanıcılar için e-posta/ad-soyad verisi, Profil ekranındaki "Hesabımı sil" akışıyla (bkz. `api/account/delete.js`, `src/lib/auth/delete-account.ts`) kalıcı olarak silinebilir — bu, Supabase Authentication'daki kullanıcıyı gerçekten siler, hesap silme App Store aboneliğini otomatik iptal etmez (kullanıcı ayrıca "Abonelikleri Yönet" ile iptal etmelidir). Sunucu tarafında tutulan sınırlı Web Push bildirim kopyası, bildirim kapatıldığında veya kayıt silindiğinde otomatik silinir. Ek taleplerin `/geri-bildirim` sayfasındaki iletişim kanalından iletilebileceği belirtilmelidir.

Not: "Profil > Verilerim" ekranında dışa/içe aktarma ve tek dokunuşla tümünü silme işlevleri kod düzeyinde mevcuttur (`src/lib/data-management/delete-all.ts`, `export-import.ts`) ancak şu an herhangi bir ekrana bağlı değildir — bu doküman ve kullanıcıya açık gizlilik sayfası bu yüzden yalnızca gerçekten erişilebilir olan Analizlerim tekil silme ve yeni hesap silme akışını referans alır. Bu orphan kod tabanı bir sonraki oturumda ele alınmalı: ya gerçek bir ekrana bağlanmalı ya da kaldırılmalı.

## App Store Review İçin Net Sınır

EksperIQ profesyonel araç ekspertizinin, servis kontrolünün, resmi kayıt sorgularının veya hukuki incelemenin yerine geçmez. Hiçbir aracın güvenli, hasarsız veya satın almaya uygun olduğunu garanti etmez. "Hiçbir veri paylaşılmaz" gibi mutlak ifadeler kullanılmamalı; yukarıdaki sınırlı, amaca özgü paylaşımlar (OpenRouter, Upstash, tarayıcı push servisi) açıkça belirtilmelidir.
