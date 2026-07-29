# Kullanıcı Testi Intake Şablonu

Bu şablon gerçek kullanıcıdan gelen ham notu issue ve aksiyon adayına çevirmek için kullanılır. Kişisel veri eklemeyin; plaka, telefon, açık adres, satıcı adı ve ilan sahibi bilgilerini silin.

Ham not bir `.txt` veya `.md` dosyasına alındıktan sonra ilk triage taslağı şu komutla üretilebilir:

```bash
npm run user-tests:triage -- path/to/user-note.txt
```

Çıktı `dist/user-test-triage` altında oluşur. Otomatik sınıflandırma yalnızca ilk ayrıştırmadır; issue açmadan önce kişisel veri ve öncelik manuel kontrol edilmelidir.

Triage çıktısı telefon, plaka, e-posta ve URL olabilecek alanları redakte edilmiş ham not olarak üretir. Issue'a orijinal notu değil, redakte edilmiş sürümü taşı.

## Ham Not

```text
Cihaz:
Tarayıcı:
Test tarihi:
Kullanılan ilan tipi:
Tamamlama süresi:
Kullanıcının kendi cümlesi:
```

## Akış Kanıtı

- [ ] Ana sayfadan analize geçti
- [ ] Formu doldurdu
- [ ] Seçenekli alanları kullandı
- [ ] Hata mesajı gördü
- [ ] Sonuç raporuna ulaştı
- [ ] Satıcı mesajı / soru / özet kopyalamayı denedi
- [ ] Ekspertiz checklist maddesi işaretledi

## Triage

- Sorun tipi: `kritik hata / kullanıcı deneyimi / kural adayı / güven ve dil riski / App Store riski`
- Öncelik: `P0 / P1 / P2 / P3`
- Etkilenen ekran veya modül:
- Otomatik triage alanı: `Etkilenen ekran/akış`
- Issue önerisi: `Başlık / Şablon / Label'lar`
- Önerilen doğrulama:
- Önerilen doğrulama komutları:
- Beklenen davranış:
- Kanıt:
- Tekrarlanabilir mi:

## Aksiyon Kararı

- [ ] Bug fix issue aç
- [ ] UI iyileştirmesi aç
- [ ] Kural adayını `docs/rule-backlog.md` içine ekle
- [ ] App Store/gizlilik metinlerini kontrol et
- [ ] Şimdilik takip et, ikinci kullanıcıdan kanıt bekle

## Kabul Kriteri

- Kullanıcı verisi anonim.
- Beklenen davranış tek cümleyle net.
- Kural değişikliği ise pozitif ve negatif test gereksinimi yazıldı.
- UI değişikliği ise mobil screenshot veya E2E doğrulaması tanımlandı.
