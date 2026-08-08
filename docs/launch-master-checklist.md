# Launch Master Checklist

Bu dosya EksperIQ'u web, Hostinger paketi, TestFlight hazırlığı ve App Store teslimi için takip edilecek tüm adımları tek yerde toplar.

Tüm adımların denetlenebilir durum listesi: `docs/all-steps-status.md`

## 1. Yerel Ürün Kalitesi

- [x] Ana sayfa mobil öncelikli hazır.
- [x] Analiz formu Zod doğrulamasıyla çalışıyor.
- [x] Mobil formda şehir, araç detayları ve hasar parça alanları seçenekli/dokunulabilir.
- [x] Kural tabanlı analiz motoru UI'dan bağımsız.
- [x] Satıcı açıklamasında belirsiz/kaçamak ifadeler doğrulama bulgusu olarak yakalanıyor.
- [x] Sonuç ekranı risk skoru, ilk kontrol ve sonraki adım paneli gösteriyor.
- [x] Satıcı soruları ve ekspertiz kontrol listesi dinamik üretiliyor.
- [x] Satıcıya gönderilebilir kısa mesaj panoya kopyalanabiliyor.
- [x] Geri bildirim sayfası kullanıcı testi ve kural önerisi issue şablonlarına bağlı.
- [x] Gizlilik ve kullanım koşulları sayfaları mevcut.

## 2. Test ve Build Kapıları

- [x] `npm run format`
- [x] `npm run lint`
- [x] `npm run typecheck`
- [x] `npm run test`
- [x] `npm run launch:check`
- [x] `npm run launch:audit`
- [x] `npm run e2e`
- [x] `npm run build`
- [x] `npm run native:build`
- [x] `npm run hostinger:package`
- [x] `npm run appstore:prepare`

## 3. App Store Teslim Paketi

- [x] App Store ikon kaynağı hazır — **8 Ağustos 2026 itibarıyla gerçek resmî
      logodan** (`public/brand/eksperiq-amblem-renkli.svg`) üretiliyor.
      Önceki ikon `scripts/generate-app-store-icon.mjs` içinde koddan çizilen
      bir placeholder'dı (gerçek marka değildi); `apple-touch-icon.png`,
      `icon-192.png`, `icon-512.png` de ayrı, tutarsız bir placeholder
      kullanıyordu. Artık 5 dokunuş noktası da (App Store 1024, kaynak SVG,
      apple-touch, PWA 192/512) aynı gerçek amblemden, renk/şekil
      değiştirilmeden üretiliyor.
- [x] 1024 x 1024 opak PNG ikon otomatik üretiliyor.
- [x] Mobil screenshot seti Playwright ile üretiliyor — **FireVibe tasarım
      entegrasyonu sonrası yeni arayüzle yeniden üretildi**, eski tasarımı
      göstermiyor.
- [x] 1320 x 2868 App Store screenshot seti otomatik üretiliyor.
- [x] App Store metadata metinleri hazır.
- [x] App Store gizlilik cevapları hazır.
- [x] Metadata kesin alım, hasarsızlık veya ekspertiz yerine geçme iddiası içermiyor.
- [x] App Store teslim paketi `dist/app-store-package` altında oluşturuluyor.
- [x] `npm run appstore:prepare`, `npm run launch:check`, `npm run
    launch:audit`, `npm run native:build` (build + `cap sync`) — hepsi
      FireVibe entegrasyonu sonrası yeniden doğrulandı, hepsi geçiyor.

## 4. Kullanıcı Testi ve Kural Geliştirme

- [x] İlk 5 kullanıcı testi planı yazıldı.
- [x] Kullanıcı testi issue şablonu hazır.
- [x] Kullanıcı testi issue planı hazır.
- [x] Kullanıcı testi issue taslakları tek komutla üretilebiliyor.
- [x] Ham kullanıcı testi notu triage taslağına çevrilebiliyor ve kontrol komutuyla doğrulanıyor.
- [x] Kural geri bildirimi issue şablonu hazır.
- [x] Kural backlog dosyası hazır.
- [x] Kural adayları typed servis dosyasında takip ediliyor.
- [ ] Gerçek 5 kullanıcı testi yapılacak.
- [ ] Tekrarlanan geri bildirimler issue olarak açılacak.
- [ ] Kanıtı oluşan kural adayları pozitif/negatif unit test ile aktif kurala taşınacak.

## 5. Yayın ve Hosting

- [x] Vercel uyumlu yapı hazır.
- [x] Hostinger statik paket komutu hazır.
- [x] Hostinger paket içerik kontrol komutu hazır.
- [x] Canlı Vercel sağlık kontrol komutu hazır.
- [x] GitHub remote/local commit eşleşme kontrol komutu hazır.
- [x] `.env.local` ve `dist` çıktıları git dışında.
- [x] Canlı Vercel ana akış sayfaları `npm run deploy:check` ile doğrulanıyor.
- [x] Canlı Vercel mobil analiz-sonuç akışında satıcı mesajı aksiyonu doğrulandı.
- [x] GitHub `origin/master` ile yerel HEAD `npm run repo:check` ile doğrulanıyor.
- [x] Vercel son deployment commit ile eşleştiği canlı panelden manuel kontrol edildi; son kontrol Production ve Ready durumundaydı.
- [ ] Hostinger kullanılacaksa zip `public_html` içine açılıp canlı yenileme testi yapılacak.

## 6. iOS / TestFlight

- [x] Capacitor config hazır.
- [x] Windows üzerinde `native:build` geçiyor.
- [x] iOS repo stratejisi yazıldı.
- [x] TestFlight QA checklist hazır.
- [x] iOS/TestFlight ön kontrol dosyası hazır.
- [ ] Apple Developer Program üyeliği açılacak.
- [ ] macOS üzerinde Xcode 26 veya Apple'ın güncel kabul ettiği sürüm kurulacak.
- [x] `npm run ios:add` ile Capacitor iOS proje klasörü oluşturuldu; final arşivleme/signing macOS/Xcode ortamında yapılacak.
- [ ] Xcode signing team ve Bundle ID ayarlanacak.
- [ ] Gerçek iPhone üzerinde TestFlight QA checklist işaretlenecek.
- [ ] App Store Connect metadata, privacy ve screenshot alanları girilecek.
- [ ] App Review gönderimi yapılacak.

## 7. Dış Bağımlılık Sınırı

Aşağıdaki adımlar kod içinde tamamlanamaz:

- Apple Developer Program ödemesi ve üyelik onayı.
- App Store Connect hesabı ve signing team.
- macOS/Xcode ortamı.
- App Review sonucunun garanti edilmesi.
- Gerçek kullanıcı testi katılımcılarının bulunması.
- Hostinger paneline manuel dosya yükleme.
