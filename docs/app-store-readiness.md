# App Store Hazırlık Notları

EksperIQ şu anda ücretsiz çalışan responsive web uygulamasıdır. App Store yayını için uygulamanın iOS native paketine dönüştürülmesi, Apple Developer Program üyeliği ve macOS/Xcode ile imzalanmış build gerekir.

15 Ağustos 2026 yayın hedefi için ana plan: `docs/launch-plan-2026-08-15.md`

## Mevcut Hazırlık Durumu

- Uygulama statik export üretebilir.
- Canlı web adresi: `https://eksperiq.vercel.app`
- PWA manifest hazırdır.
- iOS ana ekran ikonu ve Apple web app metadata hazırdır.
- Capacitor konfigürasyonu hazırdır: `capacitor.config.ts`
- Production OpenRouter AI env değerleri Vercel üzerinde aktiftir.
- Fotoğraf AI production kontrolü `npm run ai:photo-prod-check` ile geçer.
- Kullanıcı verisi geliştirici sunucusunda kalıcı hesap kaydı olarak saklanmaz.
- Analytics, reklam takip kodu ve çerez bannerı gerektiren servis yoktur.
- Ürün kullanım sinyalleri yalnızca cihaz içinde `eksperiq:product-events` localStorage anahtarında tutulur; üçüncü taraf analytics yoktur ve araç marka/model, ilan metni, fotoğraf, kullanıcı notu gibi içerikler kaydedilmez.

## Hazır Native Komutlar

Windows üzerinde çalıştırılabilir:

```bash
npm run build
npm run native:build
```

macOS ve Xcode gereken adımlar:

```bash
npm run ios:add
npm run ios:sync
npm run ios:open
```

`ios:add` komutu iOS proje klasörünü üretir. Bu klasör üretildikten sonra Xcode içinde bundle id, signing team, launch screen, app icon set ve deployment target ayarları kontrol edilmelidir.

Güncel Apple yükleme gerekliliği: App Store Connect'e gönderilecek build Apple'ın güncel kabul ettiği Xcode ve iOS SDK sürümüyle hazırlanmalıdır.

## App Store İçin Önerilen Yol

1. Apple Developer Program üyeliği açılır.
2. macOS üzerinde güncel Xcode kurulur.
3. `npm run ios:add` ile Capacitor iOS platformu oluşturulur.
4. `npm run ios:sync` ile güncel statik web çıktısı iOS projesine aktarılır.
5. App Store Connect üzerinde uygulama kaydı oluşturulur.
6. Gizlilik etiketleri, ekran görüntüleri, açıklamalar ve yaş derecelendirmesi girilir.
7. TestFlight ile gerçek cihaz testi yapılır.
8. İnceleme için gönderilir.

## Native Wrapper İlkeleri

- İlk native sürüm, mevcut ilan analizi ve karar destek akışını korumalıdır.
- Rapor paylaşma/kaydetme gibi cihaz deneyimine değer katan aksiyonlar korunmalı ve gerçek cihazda test edilmelidir.
- Fotoğraf kontrolü kullanıcı dosya seçimiyle çalışmalı; kamera ve galeri izinleri yalnızca kullanıcı fotoğraf çekme veya seçme aksiyonunu başlattığı anda, tek fotoğraf için istenmelidir. Tüm fotoğraf arşivine sürekli erişim istenmemelidir.
- Hesap veya ödeme eklenmeyecekse ilgili iOS izinleri istenmemelidir. Bildirim izni yalnızca Bakım ve Ödeme Takvimi'nde kullanıcı açıkça "Bildirimleri aç" derse istenmelidir; kapsamı yalnızca kullanıcının eklediği MTV/sigorta/muayene/bakım tarihleriyle sınırlı kalmalıdır.
- WebView içinde dış ilan siteleri scrape edilmemelidir.
- Kullanıcıya kesin ekspertiz, kesin hasar veya satın alma garantisi verilmemelidir.
- App Store sürümü ile web sürümü aynı gizlilik sınırlarını kullanmalıdır.

## App Store Gizlilik Beyanı Taslağı

- Kullanıcı hesabı yok.
- Reklam takibi yok.
- Üçüncü taraf analytics yok.
- Konum, mikrofon veya rehber izni yok.
- Kamera ve fotoğraf erişimi yalnızca kullanıcının fotoğraf kontrolü ekranında dosya seçmesiyle veya fotoğraf çekmesiyle, o tek fotoğraf için sınırlı.
- Bildirim izni yalnızca kullanıcı Bakım ve Ödeme Takvimi'nde açıkça isterse, MTV/sigorta/muayene/bakım tarihi hatırlatmaları için istenir; başka amaçla kullanılmaz. iOS mağaza sürümünde bildirim tamamen cihaz üzerinde planlanır (`@capacitor/local-notifications`), sunucuya hiçbir kayıt gitmez — yalnızca Web/PWA sürümü Web Push için sınırlı, TTL'li bir sunucu kopyası tutar (bkz. `docs/app-store-privacy-answers.md`).
- AI karar destek ve fotoğraf kontrolü OpenRouter üzerinden geçici, veri saklama karşıtı parametreyle işleme yapabilir.
- Kötüye kullanımı sınırlamak için anonim, tek yönlü özetlenmiş (hash) kurulum kimliği/IP ile kısa ömürlü istek sayaçları tutulur; kullanıcı kimliğiyle ilişkilendirilemez.
- Analiz ve diğer kullanıcı verisi (araçlar, hatırlatmalar, giderler, sağlık kayıtları, fotoğraf analizleri) yalnızca cihazda tutulur; geliştirici sunucusunda kalıcı hesap kaydı olarak saklanmaz. Kullanıcı bu veriyi Profil > Verilerim ekranından dışa/içe aktarabilir veya tamamen silebilir.
- Yerel ürün olayları yalnızca iş akışı sayaçları ve kaba bant bilgileri içerir; cihaz dışına gönderilmez, reklam takibi veya üçüncü taraf analytics amacıyla kullanılmaz.
- Profil > Verilerim dışa/içe aktarma akışı gerçek localStorage export/import koduna bağlıdır. 2026-08-17'de JSON export download fallback'i Safari/WebView için güçlendirildi: indirme bağlantısı tıklandıktan sonra `URL.revokeObjectURL` kısa gecikmeyle çağrılıyor.

## Mağaza Varlık Checklist'i

- Uygulama adı: EksperIQ
- Bundle ID önerisi: `com.eksperiq.app`
- Kategori önerisi: Utilities veya Productivity
- Yaş derecelendirmesi: Düşük riskli bilgi/karar destek uygulaması olarak doldurulmalı; finansal, tıbbi veya hukuki danışmanlık gibi işaretlenmemeli.
- Destek URL'si: `https://eksperiq.vercel.app/geri-bildirim`
- Pazarlama URL'si: `https://eksperiq.vercel.app`
- Gizlilik politikası URL'si: `https://eksperiq.vercel.app/gizlilik`
- Ekran görüntüleri: `npm run screenshots` ile `test-results/screenshots` altında ana sayfa, analiz formu, sonuç raporu, analizlerim ve offline ekran üretilir.
- Uygulama ikonu: `npm run appstore:prepare` ile `public/app-store-icon-1024.png` üretilir ve alpha kanalı içermeyen 1024x1024 PNG olarak doğrulanır. Xcode asset catalog içinde AppIcon alanına bu dosya yerleştirilmelidir.
- TestFlight notu: Uygulama yalnızca karar desteği sağlar; girilen bilgiler kalıcı hesap kaydı olarak saklanmaz.

## İlk TestFlight Test Senaryoları

1. Uygulama ilk açılışta ana ekranı taşma olmadan gösteriyor mu?
2. Analiz formu iPhone küçük ekranda tek elle doldurulabiliyor mu?
3. Şehir, araç detayları ve hasar parça seçimleri gereksiz klavye açmadan çalışıyor mu?
4. Zod hata mesajları ekranda anlaşılır çıkıyor mu?
5. Sonuç sayfası risk skorunu ve yasal uyarıyı görünür gösteriyor mu?
6. Raporu paylaş, kısa özet ve satıcı mesajı aksiyonları iOS paylaşım panelini açıyor veya güvenli şekilde kopyalama davranışına düşüyor mu?
7. Fotoğraf AI kontrolü araç dışı görselde hasar bulgusu üretmiyor mu?
8. Oturum verisi kapat/aç davranışında beklenen şekilde korunuyor veya temizleniyor mu?
9. Dış linkler native kabuk içinde kullanıcıyı sıkıştırmadan açılıyor mu?
10. iOS geri dönüş hareketi ve güvenli alanlar layout'u bozmuyor mu?
11. `/offline` ekranından üretilen `out/offline.html` native fallback olarak kullanılabiliyor mu?
12. Bakım ve Ödeme Takvimi'nde "Bildirimleri aç" seçildiğinde izin diyaloğu doğru metinle çıkıyor ve gerçek cihazda 30/15 gün öncesi bildirim çalışıyor mu?

2026-08-17 ürün tamlığı eklemesi: `Raporu paylaş` native OS share sheet ile
başarıyla tamamlandığında `@capacitor-community/in-app-review` üzerinden App
Store / Play Store in-app review akışı aynı oturumda bir kez best-effort
denenir. Web/PWA paylaşım ve clipboard fallback davranışı değişmedi; gerçek
review sheet davranışı TestFlight/gerçek cihaz üzerinde ayrıca doğrulanmalıdır.

Not: Bu bildirim akışı Web Push standardıyla çalışır ve web/PWA sürümünde
gerçek cihazda test edilebilir. Capacitor ile paketlenen native iOS
uygulamasında aynı davranış için ayrıca `@capacitor/push-notifications`
eklentisi ve Apple Push Notification servisi (APNs) sertifika/anahtar
kurulumu gerekir; bu adım bir Apple Developer hesabı gerektirir ve henüz
yapılmamıştır.

## İnceleme Riski

Apple, yalnızca web sitesini gösteren ve ek native değer sunmayan uygulamaları reddedebilir. Bu riski azaltmak için iOS sürümünde en azından aşağıdaki native kalite beklentileri karşılanmalıdır:

- Hızlı açılış ve stabil offline hata ekranı
- iOS güvenli alanlarına uyumlu layout
- Paylaşılabilir rapor çıktısı veya cihaz içi kaydetme akışı
- Fotoğraf kontrolünde yalnızca kullanıcı aksiyonuyla tetiklenen, tek fotoğraflık kamera/galeri izni davranışı
- TestFlight üzerinde gerçek cihaz testi
- Net gizlilik ve sorumluluk reddi metni

## App Store Ürün Metni Taslağı

Kısa açıklama:

İkinci el araç ilanını girin; riskli noktaları, satıcıya sorulacak soruları ve ekspertizde kontrol edilecek başlıkları görün.

Uzun açıklama:

EksperIQ, ikinci el araç ilanlarını daha bilinçli değerlendirmenize yardımcı olan karar destek uygulamasıdır. Araç, hasar, bakım ve satıcı açıklaması bilgilerini manuel girerek kural tabanlı risk skoru, güçlü taraflar, riskli noktalar, olası masraf sinyalleri, satıcı soruları, satıcıya gönderilecek kısa mesaj ve ekspertiz kontrol listesi oluşturabilirsiniz.

AI karar destek notu ve fotoğraf kontrolü yalnızca kullanıcı talebiyle çalışır. Bu özellikler kesin ekspertiz, kesin hasar veya satın alma garantisi vermez.

EksperIQ profesyonel araç ekspertizinin, servis kontrolünün, resmi kayıt sorgularının veya hukuki incelemenin yerine geçmez. Hiçbir aracın güvenli, hasarsız veya satın almaya uygun olduğunu garanti etmez.

Genel yayın checklist'i için `docs/release-operations-checklist.md` dosyasını da kullanın.

App Store Connect alanları için `docs/app-store-submission.md` dosyasındaki teslim metinlerini kullanın.

İkon, screenshot sırası ve ücretsiz asset hazırlığı için `docs/app-store-assets.md` dosyasını kullanın.

Gerçek cihaz TestFlight kontrolü için `docs/testflight-qa-checklist.md` dosyasını kullanın.

Test sonuçlarını teslim edilebilir rapora çevirmek için `docs/testflight-qa-report.md` dosyasını kullanın.

iOS klasörü üretildiğinde repo ve secret sınırları için `docs/ios-repo-strategy.md` dosyasını kullanın.
