# Tüm Adımların Durumu

Bu dosya EksperIQ için tüm ürün, test, yayın, kullanıcı testi ve App Store/TestFlight adımlarını tek listede gösterir. Yerelde tamamlanabilen adımlar kapatılmıştır. Dış hesap, ödeme, cihaz veya insan katılımı gerektiren adımlar beklemede tutulur.

Denetim komutu:

```bash
npm run launch:audit
```

## Tamamlanan Yerel Adımlar

- [x] Yeni bağımsız repo yapısı kuruldu.
- [x] Next.js, TypeScript, App Router ve Tailwind yapısı hazır.
- [x] Marka adı merkezi config üzerinden yönetiliyor.
- [x] Türkçe kullanıcı arayüzü oluşturuldu.
- [x] Ana sayfa mobil öncelikli hazırlandı.
- [x] Analiz formu Zod ve React Hook Form ile çalışıyor.
- [x] Kural tabanlı analiz motoru UI'dan bağımsız kuruldu.
- [x] Risk skoru ve kategori kırılımı üretiliyor.
- [x] Sonuç ekranı risk skoru, ilk kontrol, sonraki adım, satıcı soruları ve ekspertiz checklist gösteriyor.
- [x] Session storage akışı ve yenileme boş-state davranışı çalışıyor.
- [x] Gizlilik, kullanım koşulları, hakkında ve nasıl çalışır sayfaları mevcut.
- [x] Mobil alt navigasyon profil, yeni analiz, analiz raporu ve uzmanlık kontrol listesine bağlı.
- [x] Mobil formda şehir, araç detayları ve hasar parça alanları seçenekli/dokunulabilir hale getirildi.
- [x] Analizlerim, profil, modüller ve kontrol listesi ekranları hazır.
- [x] Sonuç ekranında satıcıya gönderilebilir kısa mesaj kopyalama aksiyonu eklendi.
- [x] Satıcı açıklamasındaki belirsiz/kaçamak ifadeler kural tabanlı doğrulama bulgusu olarak yakalanıyor.
- [x] Fotoğraf AI endpoint'i OpenRouter vision çağrısını JSON schema ile zorluyor.
- [x] Local OpenRouter fotoğraf AI testi araç dışı görselde bulgu üretmeme davranışını doğruluyor.
- [x] Manuel fotoğraf notu akışı araç/araç parçası onayı olmadan bulgu eklemiyor.
- [x] Kural geri bildirimi ve kullanıcı testi issue şablonları hazır.
- [x] İlk 5 kullanıcı testi planı ve issue taslakları hazır.
- [x] Kullanıcı testi ham notlarını triage taslağına çeviren yerel komut ve kontrol komutu hazır.
- [x] Kural backlog ve kural adayları typed servis dosyasında takip ediliyor.
- [x] App Store metadata metinleri hazır.
- [x] App Store gizlilik cevapları hazır.
- [x] App Store ikon ve screenshot üretimi otomatik.
- [x] App Store teslim paketi otomatik üretiliyor.
- [x] App Store metadata güvenlik kontrolü var.
- [x] Hostinger statik zip paketi ve zip içerik kontrolü var.
- [x] Vercel canlı sağlık kontrolü var.
- [x] Canlı Vercel üzerinde mobil analizden sonuca temel akış ve satıcı mesajı butonu doğrulandı.
- [x] Vercel production fotoğraf AI flag kontrolü `npm run ai:photo-prod-check` ile ayrı kalite kapısına alındı.
- [x] Vercel AI env değerlerini `.env.local` üzerinden secret yazdırmadan senkronlayacak `npm run vercel:sync-ai-env` komutu hazır.
- [x] Vercel production AI env değerleri Chrome üzerinden girildi ve production redeploy oluşturuldu.
- [x] Production deploy sonrası `npm run ai:photo-prod-check` geçti.
- [x] Canlı fotoğraf AI testi araç dışı görselde `isVehiclePhoto=false` ve bulgu sayısı `0` döndürdü.
- [x] GitHub remote/local commit eşleşme kontrolü var.
- [x] iOS/TestFlight ön kontrol, QA checklist ve iOS repo stratejisi yazıldı.
- [x] GitHub `iOS Xcode Build Check` macOS 26 runner üzerinde Xcode 26.6 / iOS 26.5 SDK ile geçti.
- [x] GitHub `iOS TestFlight Upload` workflow'u eklendi; Xcode 26 kapısını geçiyor ve eksik signing/App Store Connect secret'larında kontrollü duruyor.
- [x] Supabase production schema ve RLS migration dosyası hazır: `supabase/migrations/202608090001_initial_production_schema.sql`.
- [x] Supabase client/server boundary ve env kontrolü hazır: `npm run supabase:env-check`.
- [x] Apple + Supabase GitHub secret durumunu raporlayan dış hazırlık kontrolü hazır: `npm run external:check`.
- [x] Secret, eski marka ve istenmeyen env taraması yapılıyor.
- [x] Format, lint, typecheck, unit, e2e, build, native build, App Store package, Hostinger package/check, deploy check ve staging check kapıları geçiyor.

## Dış Bağımlılıkta Bekleyen Adımlar

- [ ] Gerçek 5 kullanıcı testi yapılacak.
- [ ] Tekrarlanan geri bildirimler gerçek GitHub issue olarak açılacak.
- [ ] Kanıtı oluşan kural adayları pozitif/negatif unit test ile aktif kurala taşınacak.
- [x] Vercel panelinde son deployment commit ile eşleştiği görsel olarak kontrol edildi; son kontrol Production ve Ready durumundaydı.
- [ ] Vercel projesi local klasöre linklenecek; panel erişimi yoksa env güncellemesi Chrome üzerinden yapılacak.
- [ ] Hostinger kullanılacaksa zip `public_html` içine yüklenip canlı yenileme testi yapılacak.
- [ ] Apple Developer Program üyeliği açılacak.
- [ ] Apple signing certificate, provisioning profile ve App Store Connect API key GitHub secrets'a eklenecek; `npm run external:check -- --required` temiz geçecek.
- [x] GitHub macOS 26 runner üzerinde Xcode 26 veya Apple'ın güncel kabul ettiği sürüm doğrulandı.
- [x] `npm run ios:add` ile Capacitor iOS proje klasörü oluşturuldu; final arşivleme/signing macOS/Xcode ortamında yapılacak.
- [ ] Supabase production projesi oluşturulacak/linklenecek, `supabase db push` ile migration uygulanacak ve Vercel/GitHub env'leri eklenecek.
- [ ] Xcode signing team ve Bundle ID Apple hesabında/provisioning profile'da doğrulanacak.
- [ ] Gerçek iPhone üzerinde TestFlight QA checklist işaretlenecek.
- [ ] App Store Connect metadata, privacy ve screenshot alanları girilecek.
- [ ] App Review gönderimi yapılacak.

## Kural

- Yerel komutla yapılabilen yeni bir adım çıkarsa bu dosyada "Tamamlanan Yerel Adımlar" bölümüne taşınmadan hedef tamamlandı sayılmaz.
- Dış bağımlılık gerektiren adım için gerekli hesap, cihaz veya insan katılımı hazır olmadan tamamlandı işareti verilmez.
