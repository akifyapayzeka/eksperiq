# İlk 5 Kullanıcı Testi Planı

Bu plan, EksperIQ'un 15 Ağustos 2026 hedefinden önce gerçek kullanıcıdan hızlı ve işlenebilir geri bildirim alması için hazırlanmıştır. Testlerde kişisel veri, plaka, telefon, açık adres veya gerçek satıcı adı toplanmaz.

Her testten sonra GitHub'da kullanıcı testi issue'su açılır: `.github/ISSUE_TEMPLATE/user-test-feedback.md`

Issue başlıkları ve beklenen kanıt: `docs/user-test-issue-plan.md`

## Test 1: İlk kez ikinci el araç bakacak kullanıcı

- Amaç: Ana vaadin ve risk skorunun anlaşılır olup olmadığını görmek.
- Senaryo: Ana sayfadan analiz başlatır, örnek ilanı doldurur, sonucu okur.
- Ölçüm: Raporu yardım almadan buldu mu, skor kesin hüküm gibi mi algılandı?
- Beklenen çıktı: UX sorunu veya güven/dil riski notu.

## Test 2: Araçtan anlayan yakın çevre kullanıcısı

- Amaç: Satıcı soruları ve ekspertiz kontrol listesinin pratik değerini ölçmek.
- Senaryo: Gerçek ama anonimleştirilmiş ilan metniyle analiz oluşturur.
- Ölçüm: Eksik gördüğü soru veya kontrol başlığı var mı?
- Beklenen çıktı: Kural geri bildirimi veya kontrol listesi önerisi.

## Test 3: Mobil tek elle kullanım

- Amaç: Form ve sonuç ekranının küçük ekranda yorucu olup olmadığını görmek.
- Senaryo: Telefonda form doldurur, hata mesajı alır, düzeltir ve rapora ulaşır.
- Ölçüm: Takıldığı alan, klavye altında kalan CTA, yatay taşma.
- Beklenen çıktı: Mobil UX bug veya metin sadeleştirme işi.

## Test 4: Yüksek riskli ilan değerlendirmesi

- Amaç: Hasar, bakım ve belge risklerinin yeterince görünür olup olmadığını görmek.
- Senaryo: Ağır hasar, belirsiz bakım ve eksik ekspertiz içeren anonim ilan girilir.
- Ölçüm: Kullanıcı hangi üç aksiyonu önce yapacağını anlayabildi mi? Fotoğraf hasar analizi denendiyse araç dışı görsellerde sistem hasar bulgusu üretmeden duruyor mu?
- Beklenen çıktı: Kural önceliği veya sonuç ekranı iyileştirmesi.

## Test 5: Paylaşma ve ekspertize hazırlık

- Amaç: Kullanıcının raporu ustaya, aile üyesine veya satıcı görüşmesine hazırlık için kullanıp kullanmayacağını görmek.
- Senaryo: Kısa özeti kopyalar, satıcı sorularına bakar, son kontrol listesinden en az iki madde işaretler.
- Ölçüm: Paylaşılabilir özet yeterli mi, yasal uyarı net mi?
- Beklenen çıktı: Rapor dili, paylaşım metni veya App Store riski notu.

## Haftalık değerlendirme

- P0/P1 bug varsa önce düzeltilir.
- Fotoğraf AI aracı araç dışı görselde hasar bulgusu üretirse P1 güven ve App Store riski olarak aynı gün düzeltilir.
- Aynı kural önerisi iki farklı testte tekrarlanırsa `docs/rule-backlog.md` içine aday olarak eklenir.
- "Kesin al", "kesin alma", "hasarsızdır" algısı oluşturan her metin aynı gün düzeltilir.
- Kullanıcı testlerinden çıkan işlerin kapatılması `npm run launch:check` ve ilgili e2e/unit testlerle doğrulanır.
