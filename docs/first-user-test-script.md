# İlk Kullanıcı Testi Senaryosu

Amaç: EksperIQ'un ikinci el araç ilanı karar desteğini 5 dakikada anlaşılır, güvenilir ve mobilde kullanılabilir olup olmadığını görmek.

## Test Öncesi

- Kullanıcıdan kişisel veri, plaka, telefon, açık adres veya gerçek satıcı adı istemeyin.
- Kullanıcı gerçek ilan kullanacaksa ilan metnini anonimleştirmesini isteyin.
- Testi mümkünse telefonda yaptırın.

## Görevler

1. Ana sayfadan analiz formuna geç.
2. Gerçek veya örnek ilan bilgilerini gir; şehir, araç detayları ve hasar parçalarında hazır seçenekleri kullan.
3. Eksik bıraktığın alanlar varsa uygulamanın bunu nasıl anlattığını kontrol et.
4. Analiz oluştur.
5. Risk skorunu, kısa özeti ve satıcı sorularını oku.
6. Ekspertiz kontrol listesinde en az iki madde işaretle.
7. Satıcı mesajını ve kısa özeti kopyalamayı dene.

## Sorular

1. İlk ekranda uygulamanın ne yaptığı net miydi?
2. Formda gereksiz veya zor gelen alan var mıydı?
3. Seçenekli alanlar telefonda yazı yazmayı yeterince azalttı mı?
4. Risk skoru güven verdi mi, fazla kesin mi hissettirdi?
5. Satıcıya sorulacak sorular ve satıcı mesajı işine yarar mıydı?
6. Ekspertiz kontrol listesinde eksik gördüğün madde var mı?
7. Sonuç raporunu bir arkadaşına veya ustaya gönderir miydin?
8. Bu uygulamayı ücretsiz kullansan tekrar açar mıydın?

## Not Formatı

```text
Cihaz:
Kullanılan ilan tipi:
Tamamlama süresi:
Takıldığı yer:
En faydalı bölüm:
Eksik gördüğü kural:
Zor gelen form alanı:
Güven sorunu:
Bir sonraki iyileştirme:
```

Notlar önce `docs/user-test-intake-template.md` ile anonimleştirilip önceliklendirilir. GitHub'a aktarılırken kullanıcı testi şablonu kullanılmalı: `.github/ISSUE_TEMPLATE/user-test-feedback.md`. Kural motorunu ilgilendiren ayrı öneriler `docs/user-test-feedback-triage.md` üzerinden kural geri bildirimi issue'suna dönüştürülür.

## Başarı Ölçütü

- Kullanıcı yardım almadan rapora ulaşabiliyor.
- Kullanıcı yasal uyarıyı ve karar desteği sınırını anlıyor.
- Kullanıcı en az bir satıcı sorusunu faydalı buluyor.
- Kullanıcı raporu paylaşma fikrini mantıklı buluyor.
