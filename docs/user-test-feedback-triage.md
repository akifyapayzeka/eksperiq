# Kullanıcı Testi Geri Bildirim Triage

Bu doküman, ilk gerçek kullanıcı testlerinden gelen notları kaybolmadan ürüne çevirmek için kullanılır. Amaç her yorumu aynı anda koda almak değil; doğru yorumu doğru iş tipine ayırıp ölçülebilir hale getirmektir.

## Toplama kuralı

- Kişisel veri, plaka, telefon, açık adres, satıcı adı veya ilan sahibine ait bilgi alınmaz.
- Gerçek ilan kullanıldıysa marka, model, yıl, kilometre ve anonimleştirilmiş açıklama yeterlidir.
- Test notu GitHub issue olarak açılır: `.github/ISSUE_TEMPLATE/user-test-feedback.md`
- Kural motorunu ilgilendiren somut öneriler ayrıca `.github/ISSUE_TEMPLATE/rule-feedback.md` ile açılır.
- Bir not hem kullanıcı deneyimi hem kural önerisi içeriyorsa iki ayrı issue açılır.

## Triage sınıfları

### Kritik hata

Kullanıcı analize başlayamıyor, rapora ulaşamıyor, sonuç kayboluyor, mobilde ana akış bozuluyor veya yasal uyarı görünmüyor.

Çözüm sırası: aynı gün bug fix, e2e test, release kontrolü.

### Kullanıcı deneyimi sorunu

Form alanı anlaşılmıyor, seçenekli alan klavye açtırıyor, metin fazla uzun geliyor, buton konumu zor kullanılıyor, ekran tek elle kullanılamıyor veya kullanıcı ne yapacağını anlamıyor.

Çözüm sırası: küçük UI iyileştirmesi, mobil screenshot kontrolü, gerekirse metin sadeleştirme.

### Kural adayı

Kullanıcı raporda eksik risk, yanlış öncelik, yeni satıcı sorusu, satıcı mesajına eklenmesi gereken bilgi, yeni ekspertiz kontrolü veya yeni ilan açıklaması ifadesi söylüyor.

Çözüm sırası: `docs/rule-backlog.md` içine aday ekle, kabul kriterini yaz, pozitif ve negatif unit test olmadan aktif kurala taşıma.

### Güven ve dil riski

Kullanıcı skorun fazla kesin, korkutucu, satış yönlendirici veya ekspertiz yerine geçiyor gibi hissettirdiğini söylüyor.

Çözüm sırası: sonuç dili, disclaimer görünürlüğü ve App Store metinleri birlikte kontrol edilir.

### App Store riski

Kullanıcı izin, veri saklama, garanti vaadi, yanıltıcı yapay zekâ iddiası veya ödeme beklentisiyle ilgili güven sorunu belirtiyor.

Çözüm sırası: gizlilik sayfası, App Store submission metni ve uygulama içi uyarılar aynı PR içinde güncellenir.

## Öncelik matrisi

| Öncelik | Kriter                                       | Örnek aksiyon                         |
| ------- | -------------------------------------------- | ------------------------------------- |
| P0      | Akış kırılıyor veya yasal/gizlilik riski var | Aynı gün düzelt, e2e ekle             |
| P1      | Kullanıcı raporu yanlış yorumlayabilir       | Metni ve skoru düzelt, unit test ekle |
| P2      | Faydalı ama akışı engellemeyen kural adayı   | Backlog'a al, kanıt bekle             |
| P3      | Vizyon modülü veya ileri dönem fikir         | Roadmap notuna taşı                   |

## Issue kapanış kriteri

- Sorun tipi seçildi.
- Kişisel veri içermediği kontrol edildi.
- Etkilenen ekran veya kural modülü yazıldı.
- Beklenen davranış netleşti.
- Test veya doğrulama adımı eklendi.
- Kural değişikliği ise `docs/rule-backlog.md` ile ilişkilendirildi.
