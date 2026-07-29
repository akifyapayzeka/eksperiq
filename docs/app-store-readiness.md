# App Store Hazırlık Notları

EksperIQ şu anda ücretsiz çalışan responsive web uygulamasıdır. App Store yayını için uygulamanın iOS native paketine dönüştürülmesi, Apple Developer Program üyeliği ve macOS/Xcode ile imzalanmış build gerekir.

15 Ağustos 2026 yayın hedefi için ana plan: `docs/launch-plan-2026-08-15.md`

## Mevcut hazırlık durumu

- Uygulama statik export üretebilir.
- Canlı web adresi: `https://eksperiq.vercel.app`
- PWA manifest hazırdır.
- iOS ana ekran ikonu ve Apple web app metadata hazırdır.
- Capacitor konfigürasyonu hazırdır: `capacitor.config.ts`
- Kullanıcı verisi sunucuya kaydedilmez.
- Analytics, reklam takip kodu ve çerez bannerı gerektiren servis yoktur.

## Hazır native komutlar

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

Güncel Apple yükleme gerekliliği: App Store Connect'e gönderilecek build Xcode 26 veya sonrası ve iOS 26 SDK ile hazırlanmalıdır.

## App Store için önerilen yol

1. Apple Developer Program üyeliği açılır.
2. macOS üzerinde Xcode 26 veya sonrası kurulur.
3. `npm run ios:add` ile Capacitor iOS platformu oluşturulur.
4. `npm run ios:sync` ile güncel statik web çıktısı iOS projesine aktarılır.
5. App Store Connect üzerinde uygulama kaydı oluşturulur.
6. Gizlilik etiketleri, ekran görüntüleri, açıklamalar ve yaş derecelendirmesi girilir.
7. TestFlight ile gerçek cihaz testi yapılır.
8. İnceleme için gönderilir.

## Native wrapper ilkeleri

- İlk native sürüm, mevcut ilan analizi akışını korumalıdır.
- Rapor paylaşma/kaydetme gibi cihaz deneyimine değer katan aksiyonlar korunmalı ve gerçek cihazda test edilmelidir.
- Fotoğraf yükleme, bildirim, hesap veya ödeme eklenmeyecekse iOS izinleri istenmemelidir.
- WebView içinde dış ilan siteleri scrape edilmemelidir.
- Kullanıcıya kesin ekspertiz, kesin hasar veya satın alma garantisi verilmemelidir.
- App Store sürümü ile web sürümü aynı gizlilik sınırlarını kullanmalıdır.

## App Store gizlilik beyanı taslağı

İlk native sürüm mevcut web MVP ile aynı kalırsa:

- Kullanıcı hesabı yok.
- Kullanıcı verisi geliştirici sunucusuna gönderilmez.
- Reklam takibi yok.
- Üçüncü taraf analytics yok.
- Konum, kamera, mikrofon, rehber veya fotoğraf izni yok.
- Analiz verisi cihaz/tarayıcı oturumunda geçici tutulur.

Native wrapper ileride fotoğraf analizi, bildirim veya hesap özellikleri eklerse bu beyan yeniden güncellenmelidir.

## Mağaza varlık checklist'i

- Uygulama adı: EksperIQ
- Bundle ID önerisi: `com.eksperiq.app`
- Kategori önerisi: Utilities veya Productivity
- Yaş derecelendirmesi: Düşük riskli bilgi/karar destek uygulaması olarak doldurulmalı; finansal, tıbbi veya hukuki danışmanlık gibi işaretlenmemeli.
- Destek URL'si: İlk aşamada canlı web sitesi veya GitHub issue sayfası kullanılabilir.
- Pazarlama URL'si: `https://eksperiq.vercel.app`
- Gizlilik politikası URL'si: `https://eksperiq.vercel.app/gizlilik`
- Ekran görüntüleri: `npm run screenshots` ile `test-results/screenshots` altında ana sayfa, analiz formu, sonuç raporu ve offline ekran üretilir.
- Uygulama ikonu: Mevcut geçici ikonlar web/PWA içindir; App Store için Xcode asset catalog içinde 1024x1024 final ikon üretilmelidir.
- TestFlight notu: Uygulama yalnızca karar desteği sağlar; girilen bilgiler sunucuya kaydedilmez.

## İlk TestFlight test senaryoları

1. Uygulama ilk açılışta ana ekranı taşma olmadan gösteriyor mu?
2. Analiz formu iPhone küçük ekranda tek elle doldurulabiliyor mu?
3. Zod hata mesajları ekranda anlaşılır çıkıyor mu?
4. Sonuç sayfası risk skorunu ve yasal uyarıyı görünür gösteriyor mu?
5. Raporu paylaş aksiyonu iOS paylaşım panelini açıyor veya güvenli şekilde kopyalama davranışına düşüyor mu?
6. Oturum verisi kapat/aç davranışında beklenen şekilde korunuyor veya temizleniyor mu?
7. Dış linkler native kabuk içinde kullanıcıyı sıkıştırmadan açılıyor mu?
8. iOS geri dönüş hareketi ve güvenli alanlar layout'u bozmuyor mu?
9. `/offline` ekranından üretilen `out/offline.html` native fallback olarak kullanılabiliyor mu?

## İnceleme riski

Apple, yalnızca web sitesini gösteren ve ek native değer sunmayan uygulamaları reddedebilir. Bu riski azaltmak için iOS sürümünde en azından aşağıdaki native kalite beklentileri karşılanmalıdır:

- Hızlı açılış ve stabil offline hata ekranı
- iOS güvenli alanlarına uyumlu layout
- Paylaşılabilir rapor çıktısı veya cihaz içi kaydetme akışı
- TestFlight üzerinde gerçek cihaz testi
- Net gizlilik ve sorumluluk reddi metni

## App Store ürün metni taslağı

Kısa açıklama:

İkinci el araç ilanını girin; riskli noktaları, satıcıya sorulacak soruları ve ekspertizde kontrol edilecek başlıkları görün.

Uzun açıklama:

EksperIQ, ikinci el araç ilanlarını daha bilinçli değerlendirmenize yardımcı olan karar destek uygulamasıdır. Araç, hasar, bakım ve satıcı açıklaması bilgilerini manuel girerek kural tabanlı risk skoru, güçlü taraflar, riskli noktalar, olası masraf sinyalleri, satıcı soruları ve ekspertiz kontrol listesi oluşturabilirsiniz.

EksperIQ profesyonel araç ekspertizinin, servis kontrolünün, resmi kayıt sorgularının veya hukuki incelemenin yerine geçmez. Hiçbir aracın güvenli, hasarsız veya satın almaya uygun olduğunu garanti etmez.

Genel yayın checklist'i için `docs/release-operations-checklist.md` dosyasını da kullanın.

App Store Connect alanları için `docs/app-store-submission.md` dosyasındaki teslim metinlerini kullanın.

İkon, screenshot sırası ve ücretsiz asset hazırlığı için `docs/app-store-assets.md` dosyasını kullanın.

Gerçek cihaz TestFlight kontrolü için `docs/testflight-qa-checklist.md` dosyasını kullanın.

Test sonuçlarını teslim edilebilir rapora çevirmek için `docs/testflight-qa-report.md` dosyasını kullanın.

iOS klasörü üretildiğinde repo ve secret sınırları için `docs/ios-repo-strategy.md` dosyasını kullanın.
