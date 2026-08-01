# App Store Gizlilik Cevapları

Bu dosya App Store Connect gizlilik formu doldurulurken kullanılacak ilk sürüm cevaplarını sabitler. Cevaplar yalnızca mevcut MVP davranışı için geçerlidir.

## Veri Toplama

- Kullanıcı hesabı: Yok.
- Kullanıcı adı, e-posta, telefon, adres: Toplanmaz.
- Konum verisi: Toplanmaz.
- Kişiler, mikrofon: Erişim istenmez.
- Kamera, fotoğraflar: Yalnızca kullanıcı fotoğraf ekleme ekranında kamerayla çekim veya galeriden seçim başlattığı anda, tek bir fotoğraf için erişilir; sürekli veya arka planda erişim yoktur.
- Bildirim: Yalnızca kullanıcı Bakım ve Ödeme Takvimi ekranında "Bildirimleri aç" derse istenir; kullanıcı hesabı olmadığından bildirim aboneliği yalnızca cihaz/tarayıcı push aboneliğine ve kullanıcının kendi eklediği MTV/sigorta/muayene/bakım kayıtlarına bağlıdır.
- Reklam takibi: Yok.
- Üçüncü taraf analytics: Yok.
- Geliştirici sunucusuna kalıcı analiz kaydı: Yok.
- İlan sitesi scraping: Yok.
- Ödeme veya abonelik: İlk sürümde yok.

## Cihazda Geçici Veri

Kullanıcının manuel girdiği araç ve ilan bilgileri mevcut tarayıcı/native oturumunda karar destek raporu üretmek için tutulur. Kullanıcı oturum verisini silebilir. Bu veri geliştirici sunucusuna kalıcı kayıt olarak gönderilmez.

## Bakım ve Ödeme Takvimi Bildirimleri

Bakım ve Ödeme Takvimi kayıtları (MTV, sigorta, muayene, bakım gibi başlık/tarih/tutar bilgileri) cihazda kalıcı olarak saklanır (hesaba değil, yalnızca cihaza). Kullanıcı bildirimleri açarsa, son tarihe 30 ve 15 gün kala bildirim gönderebilmek için bu kayıtların bir kopyası ve push aboneliği bilgisi (kullanıcı kimliğiyle ilişkilendirilmeden) sunucuda tutulur; bildirimler kapatılırsa veya kayıt silinirse bu kopya da silinir. Bu veri üçüncü taraflarla paylaşılmaz veya reklam/analitik amacıyla kullanılmaz.

## AI Karar Destek ve Fotoğraf Kontrolü

AI karar destek notu ve fotoğraf kontrolü yalnızca kullanıcının açık aksiyonuyla çalışır. İlan/araç bilgileri veya seçilen fotoğraf OpenRouter üzerinden geçici olarak işlenebilir; geliştirici sunucusunda kalıcı hesap kaydı olarak saklanmaz. AI çıktısı kural tabanlı raporun, profesyonel ekspertizin veya resmi kayıt kontrolünün yerine geçmez.

App Store gizlilik formunda üçüncü taraf AI işleme açıkça belirtilmeli; kamera ve fotoğraf kitaplığı izinleri yalnızca kullanıcı fotoğraf ekleme ekranında bir fotoğraf çekmeyi veya seçmeyi başlattığı anda, o tek fotoğraf için istenir.

## App Store Review İçin Net Sınır

EksperIQ profesyonel araç ekspertizinin, servis kontrolünün, resmi kayıt sorgularının veya hukuki incelemenin yerine geçmez. Hiçbir aracın güvenli, hasarsız veya satın almaya uygun olduğunu garanti etmez.
