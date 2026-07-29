# App Store Hazırlık Notları

EksperIQ şu anda ücretsiz çalışan responsive web uygulamasıdır. App Store yayını için uygulamanın iOS native paketine dönüştürülmesi, Apple Developer Program üyeliği ve macOS/Xcode ile imzalanmış build gerekir.

## Mevcut hazırlık durumu

- Uygulama statik export üretebilir.
- Canlı web adresi: `https://eksperiq.vercel.app`
- PWA manifest hazırdır.
- iOS ana ekran ikonu ve Apple web app metadata hazırdır.
- Kullanıcı verisi sunucuya kaydedilmez.
- Analytics, reklam takip kodu ve çerez bannerı gerektiren servis yoktur.

## App Store için önerilen yol

1. Apple Developer Program üyeliği açılır.
2. macOS üzerinde Xcode kurulur.
3. Native wrapper için Capacitor veya benzer hafif bir çözüm seçilir.
4. Web uygulaması native kabuk içinde paketlenir.
5. App Store Connect üzerinde uygulama kaydı oluşturulur.
6. Gizlilik etiketleri, ekran görüntüleri, açıklamalar ve yaş derecelendirmesi girilir.
7. TestFlight ile gerçek cihaz testi yapılır.
8. İnceleme için gönderilir.

## Native wrapper ilkeleri

- İlk native sürüm, mevcut ilan analizi akışını korumalıdır.
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
