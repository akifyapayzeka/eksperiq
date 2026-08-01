# Kullanıcı Testi Issue Planı

Gerçek kullanıcı testi yapılmadan issue'lar tamamlandı kabul edilmez. Bu dosya, test katılımcısı bulunduğunda açılacak beş GitHub issue başlığını ve beklenen kanıtı önceden netleştirir.

Issue gövde taslaklarını üretmek için:

```bash
npm run user-tests:package
```

Çıktı klasörü: `dist/user-test-issues`

## Açılacak issue'lar

1. `[Kullanıcı testi] İlk kez ikinci el araç bakacak kullanıcı`
   - Senaryo: Ana sayfadan örnek ilanla rapora ulaşma.
   - Kanıt: Tamamlama süresi, takıldığı yer, risk skorunu nasıl yorumladığı.

2. `[Kullanıcı testi] Araçtan anlayan yakın çevre kullanıcısı`
   - Senaryo: Anonim gerçek ilanla satıcı soruları ve ekspertiz listesini değerlendirme.
   - Kanıt: Eksik görülen soru, fazla sert/zayıf bulunan uyarı.

3. `[Kullanıcı testi] Mobil tek elle kullanım`
   - Senaryo: Küçük telefonda form doldurma, hata düzeltme ve rapora ulaşma.
   - Kanıt: Klavye, buton, yatay taşma veya okunabilirlik notu.

4. `[Kullanıcı testi] Yüksek riskli ilan değerlendirmesi`
   - Senaryo: Hasar, bakım ve belge bilgisi zayıf ilanla rapor okuma.
   - Kanıt: Kullanıcının ilk üç aksiyonu anlayıp anlamadığı; fotoğraf AI denendiyse araç dışı görselde hasar bulgusu üretilmediği.

5. `[Kullanıcı testi] Paylaşma ve ekspertize hazırlık`
   - Senaryo: Kısa özeti kopyalama, satıcı sorularını okuma, checklist işaretleme.
   - Kanıt: Paylaşılabilir özet, yasal uyarı ve App Store dili hakkında geri bildirim.

## Kapanış kuralı

- Issue kişisel veri içermemeli.
- Her issue en az bir ekran, bir takılma noktası ve bir beklenen iyileştirme içermeli.
- Tekrarlanan kural önerileri `docs/rule-backlog.md` dosyasına bağlanmalı.
- Fotoğraf AI araç dışı görselde hasar bulgusu üretirse P1 issue olarak ayrılmalı.
- P0/P1 bug çıkarsa release öncesi düzeltilmeden App Store/TestFlight ilerletilmemeli.
