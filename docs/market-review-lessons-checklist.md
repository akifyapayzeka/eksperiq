# Market Review Lessons Checklist

Bu dosya App Store, Google Play ve kamuya acik sikayet/yorum kaynaklarinda ikinci el arac, ilan, ekspertiz ve arac yorum uygulamalari icin tekrar eden urun derslerini EksperIQ release kapilarina baglar.

Kaynak ozeti:

- App Store arabam.com yorumlari: ekspertiz sonuclu ilan gorme ve deger bilgisi kullanici tarafinda seviliyor.
- Google Play OtoYorum sayfasi: kronik sorun, arti/eksi yonler, usta sorusu ve kullanici yorumlari beklenen karar destek degeri olarak one cikiyor.
- Sikayetvar sahibinden/arabam.com/oto ekspertiz basliklari: eksik ekspertiz tespiti, guvenlik kusuru atlanmasi, ilandaki bilgi ile gercek ekspertiz farki, teklif/fiyat farkinin aciklanmamasi ve iletisimsizlik ana sikayetler.
- Eksisozluk/forum geri bildirimleri: kullanici tek bir ekspertiz raporuna guvenmek istemiyor; neye bakacagini, hangi soruyu soracagini ve nerede teyit edecegini bilmek istiyor.

## Release Kapilari

- [x] Rapor dili kesin alim, hasarsizlik, arizasizlik veya ekspertiz garantisi vermez.
- [x] Sonuc ekraninda kronik sorunlar risk skorundan ayri, model/motor/yil bilgisi olarak gosterilir.
- [x] Ilan linkinden gelen eksik bilgi analiz akisini patlatmaz; eksikler raporda sorulacak/teyit edilecek bilgiye doner.
- [x] Ilan fotograf filtreleme logolari, ikonlari, reklam/placeholder gorselleri ayiklar.
- [x] Foto hasar ve ekspertiz raporu AI akislarinda ucuncu taraf AI onayi olmadan istek atilmaz.
- [x] Mobil alt navigasyon sayfa sonu butonlarini ve rapor aksiyonlarini kapatmaz.
- [x] Kullanici geri bildirimleri `/geri-bildirim` sayfasi ve issue taslaklariyla kural backlog'una baglanir.
- [x] Kronik sorun verisi 40 marka katalog hedefi icin marka/model kapsamini ve yil genisletmesini test eder.
- [x] Pro/paywall, StoreKit urunleri canli dogrulanmadan satin alma denemesi baslatmaz.
- [ ] Gercek TestFlight cihazinda ilan linki -> fotograf -> rapor -> satici sorulari akisi tek oturumda tekrar dogrulanacak.
- [ ] App Store Connect abonelik urunleri, sandbox satin alma ve restore akisiyla canli dogrulanacak.
- [ ] Gercek kullanici testlerinden tekrar eden sikayetler issue olarak acilip kural/teste baglanacak.

## Urun Davranisi Kurallari

- EksperIQ tek bir "al/alma" emri vermemeli; "alinmadan once sunlari teyit et" ve "bu riskleri ekspertizde ozellikle kontrol ettir" ciktisi vermeli.
- Fiyat yorumu, piyasa garantisi degil, girilen ilan bilgisi ve bilinen risklere gore karar destegi olarak kalmali.
- Guvenlik basliklari her zaman one cikmali: airbag, sase/podye, agir hasar, fren/suspansiyon, motor/sanziman uyari isaretleri.
- Kullaniciya baska yerde arama yaptirmamak icin raporda kronik sorun, saticiya sorular, ekspertiz kontrol listesi, resmi sorgu rehberi ve yakindaki hizmetlere gecis birlikte bulunmali.
- Bilinmeyen bilgi gizlenmemeli; "Bilinmiyor" veya "satıcıdan teyit et" olarak gorunmeli.
