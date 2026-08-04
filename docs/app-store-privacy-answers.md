# App Store Gizlilik Cevapları

Bu dosya App Store Connect gizlilik formu doldurulurken kullanılacak cevapları sabitler. Cevaplar mevcut koddaki gerçek davranışa göre yazılmıştır (bkz. `api/_lib/rate-limit.js`, `api/_lib/openrouter.js`, `api/_lib/push-store.js`, `src/lib/photo-analysis/prepare-ai-image.ts`, `src/lib/push/native.ts`, `src/lib/data-management/*`); kodla tutarsız hale gelirse bu dosya da güncellenmelidir.

## Veri Toplama

- Kullanıcı hesabı: Yok. Kullanıcı adı, e-posta, telefon, adres: toplanmaz.
- Konum verisi: Toplanmaz.
- Kişiler, mikrofon: Erişim istenmez.
- Kamera, fotoğraflar: Yalnızca kullanıcı fotoğraf ekleme ekranında kamerayla çekim veya galeriden seçim başlattığı anda, tek bir fotoğraf için erişilir; sürekli veya arka planda erişim yoktur. Fotoğraf, AI'ya gönderilmeden önce cihazda küçültülür/yeniden sıkıştırılır ve EXIF meta verileri (konum, cihaz bilgisi) silinir.
- Bildirim: Yalnızca kullanıcı Bakım ve Ödeme Takvimi ekranında "Bildirimleri aç" derse istenir. iOS mağaza sürümünde bildirim tamamen cihaz üzerinde planlanır (`@capacitor/local-notifications`), hiçbir kayıt sunucuya gönderilmez. Web/PWA sürümünde Web Push kullanılır; bkz. aşağıdaki "Bakım ve Ödeme Takvimi Bildirimleri" bölümü.
- Cihaz/tanımlayıcılar: Uygulama içi kötüye kullanımı sınırlamak için rastgele, anonim bir kurulum kimliği (cihazda üretilip yalnızca localStorage'da tutulur) ve/veya istek IP adresi, sunucuya ulaşır ulaşmaz tek yönlü bir özete (HMAC-SHA256) dönüştürülür; ham değer hiçbir zaman saklanmaz. Bu özetler yalnızca kısa ömürlü istek sayaçları için kullanılır (burst penceresi saniyeler, günlük sayaç ~26 saat sonra kendiliğinden silinir) ve kullanıcı kimliğiyle ilişkilendirilemez. Kullanım amacı: App Functionality (kötüye kullanım/oran sınırlama) — reklam, profil oluşturma veya izleme amaçlı değildir.
- Reklam takibi: Yok.
- Üçüncü taraf analytics: Yok.
- Geliştirici sunucusuna kalıcı hesap/analiz kaydı: Yok. (Bildirim özelliğiyle ilgili sınırlı, TTL'li istisna için aşağıya bakın.)
- İlan sitesi scraping: Yok.
- Ödeme veya abonelik: İlk sürümde yok; gerçek StoreKit altyapısı hazırlanana kadar "Pro'ya geç" gibi işlevsel olmayan bir satın alma akışı gösterilmez.

## Cihazda Geçici/Kalıcı Veri

Kullanıcının manuel girdiği araç ve ilan bilgileri, oluşturulan analiz raporları, araçlar, hatırlatmalar, gider kayıtları, sağlık kayıtları ve fotoğraf analizleri yalnızca cihazda (localStorage/IndexedDB) tutulur; geliştirici sunucusuna kalıcı kayıt olarak gönderilmez. Kullanıcı bu verileri Profil > Verilerim ekranından JSON olarak dışa/içe aktarabilir veya tek dokunuşla tamamen silebilir.

## Bakım ve Ödeme Takvimi Bildirimleri

Bakım ve Ödeme Takvimi kayıtları (MTV, sigorta, muayene, bakım gibi başlık/tarih/tutar bilgileri) her durumda önce cihazda kalıcı olarak saklanır (hesaba değil, yalnızca cihaza).

- **Web/PWA:** Kullanıcı bildirimleri açarsa, son tarihe 30 ve 15 gün kala bildirim gönderebilmek için bu kayıtların bir kopyası ve push aboneliği bilgisi (kullanıcı kimliğiyle ilişkilendirilmeden) sunucu tarafı veritabanı altyapısında (Upstash) tutulur. Bu kopya, cihaz 90 gün boyunca hiç senkronize olmazsa kendiliğinden otomatik silinir (Redis TTL); bildirimler kapatılırsa veya kayıt silinirse ya da kullanıcı "tüm verilerimi sil" derse hemen silinir. Bu veri üçüncü taraflarla paylaşılmaz veya reklam/analitik amacıyla kullanılmaz; yalnızca bildirimi teslim etmek için tarayıcının/işletim sisteminin kendi push servisi aracı olarak kullanılır.
- **iOS mağaza sürümü:** Bildirimler `@capacitor/local-notifications` ile tamamen cihaz üzerinde planlanır; hiçbir kayıt sunucuya gönderilmez.

## AI Karar Destek ve Fotoğraf Kontrolü

AI karar destek notu ve fotoğraf kontrolü yalnızca kullanıcının açık aksiyonuyla çalışır. İlan/araç bilgileri veya seçilen (önceden cihazda sıkıştırılıp EXIF'i temizlenmiş) fotoğraf, OpenRouter üzerinden geçici olarak, "bu veriyi model eğitimi için toplama/saklama" talimatıyla işlenir; geliştirici sunucusunda kalıcı hesap kaydı olarak saklanmaz. AI istekleri zaman aşımı ve kontrollü yeniden deneme ile sınırlıdır; AI çıktısındaki kesin/yanıltıcı ifadeler bir çıktı filtresiyle yumuşatılır. AI çıktısı kural tabanlı raporun, profesyonel araç ekspertizinin veya resmi kayıt kontrolünün yerine geçmez.

App Store gizlilik formunda üçüncü taraf AI işleme (OpenRouter) açıkça belirtilmeli; kamera ve fotoğraf kitaplığı izinleri yalnızca kullanıcı fotoğraf ekleme ekranında bir fotoğraf çekmeyi veya seçmeyi başlattığı anda, o tek fotoğraf için istenir.

## Yurt Dışı Veri Aktarımı

OpenRouter (AI işleme) ve Upstash (sunucu tarafı veritabanı altyapısı, yalnızca Web Push aboneliği için) yurt dışında barındırılan hizmetlerdir. Yukarıda açıklanan sınırlı veriler bu sağlayıcıların sunucularında işlenebilir/geçici olarak tutulabilir. Bu iki sağlayıcı dışında hiçbir üçüncü tarafla veri paylaşılmaz.

## KVKK Kapsamındaki Haklar

Uygulamada kullanıcı hesabı olmadığından, 6698 sayılı KVKK'nın 11. maddesindeki bilgi talep etme, düzeltme, silme ve itiraz haklarının büyük kısmı Profil > Verilerim ekranındaki dışa aktarma/içe aktarma/tümünü silme işlevleriyle doğrudan kullanıcı tarafından, aracı olmadan kullanılabilir. Sunucu tarafında tutulan sınırlı Web Push bildirim kopyası için de aynı "tümünü sil" işlemi yeterlidir. Ek taleplerin `/geri-bildirim` sayfasındaki iletişim kanalından iletilebileceği belirtilmelidir.

## App Store Review İçin Net Sınır

EksperIQ profesyonel araç ekspertizinin, servis kontrolünün, resmi kayıt sorgularının veya hukuki incelemenin yerine geçmez. Hiçbir aracın güvenli, hasarsız veya satın almaya uygun olduğunu garanti etmez. "Hiçbir veri paylaşılmaz" gibi mutlak ifadeler kullanılmamalı; yukarıdaki sınırlı, amaca özgü paylaşımlar (OpenRouter, Upstash, tarayıcı push servisi) açıkça belirtilmelidir.
