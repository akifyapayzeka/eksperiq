# EksperIQ Nasıl Test Edilir?

Bu rehber uygulamayı para harcamadan, hesap açmadan ve secret paylaşmadan test etmek için kullanılır.

## 1. Yerel teknik kontrol

```bash
npm install
npm run release:check
```

Bu komut format, lint, typecheck, privacy check, unit test, kullanıcı testi triage check, launch readiness, App Store metadata ve production build kontrollerini çalıştırır.

## 2. Tarayıcıda yerel kullanım

```bash
npm run dev
```

Sonra `http://localhost:3000` adresini aç.

Kontrol et:

- Ana sayfadan `Ücretsiz analiz et` ile forma geçiliyor.
- Seçenekli alanlar klavye açtırmadan kullanılabiliyor.
- Sayı alanlarında sadece değer giriliyor.
- Boş zorunlu alanlarda anlaşılır hata çıkıyor.
- Demo veya gerçekçi anonim ilan bilgisiyle rapor oluşuyor.
- Sonuçta risk skoru, yasal uyarı, satıcı soruları ve ekspertiz listesi görünüyor.
- `Raporu paylaş`, `Kısa özeti kopyala` ve satıcı mesajı kopyalama çalışıyor.
- Sayfa yenilenince sonuç kaybolursa kullanıcı yeniden analize yönlendiriliyor.

## 3. Mobil görünüm

Telefonla canlı siteyi aç:

```text
https://eksperiq.vercel.app
```

Kontrol et:

- Alt menüde `Profil`, `Yeni Analiz`, `Analiz Raporu`, `Kontrol` rahat okunuyor.
- Butonlar tek elle basılabilir.
- Form alanları ekran dışına taşmıyor.
- Klavye açılınca kritik butonlar tamamen kaybolmuyor.
- Risk durumu yalnız renkle anlatılmıyor, metinle de açıklanıyor.

## 4. Tam tarayıcı testi

```bash
npm run e2e
```

Bu komut ana akış, validasyon, mobil alt menü, analiz oluşturma, paylaşma/kopyalama, print görünümü ve yatay taşma kontrollerini çalıştırır.

## 5. App Store görsel ve paket kontrolü

```bash
npm run screenshots
npm run appstore:prepare
```

Çıktılar:

- Screenshot kaynakları: `test-results/screenshots`
- App Store teslim paketi: `dist/app-store-package`

Bu klasörler git'e eklenmez.

## 6. Canlı deploy kontrolü

```bash
npm run deploy:check
npm run ai:staging-check
```

`deploy:check` temel canlı sayfaları kontrol eder. `ai:staging-check` canlı AI çağrısı yapmadan endpoint/fallback davranışını doğrular.

## 7. Gerçek kullanıcı testi

Kullanıcıdan plaka, telefon, açık adres, satıcı adı veya kişisel veri isteme.

Test akışı:

1. Telefonda ana sayfayı açtır.
2. Gerçek veya örnek ilanı anonimleştirerek forma girdir.
3. Raporu okutup ilk üç aksiyonunu sor.
4. Satıcı soruları ve ekspertiz listesini faydalı bulup bulmadığını sor.
5. Notu `docs/user-test-intake-template.md` formatında kaydet.
6. Triage için çalıştır:

```bash
npm run user-tests:triage -- path/to/user-note.txt
```

Issue açarken sadece redakte edilmiş triage çıktısını kullan.

Kural adayı çıktıysa:

```bash
npm run rule-backlog:check
npm run rule-feedback:check
npm run rule-feedback:package
```

Sonra `dist/rule-feedback-issues` altındaki ilgili taslağı GitHub issue'ya çevir.
