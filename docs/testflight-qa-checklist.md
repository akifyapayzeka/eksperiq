# TestFlight QA Checklist

Bu checklist App Store hesabı, macOS ve Xcode hazır olduktan sonra gerçek iPhone üzerinde çalıştırılır. İlk sürümde konum, bildirim veya hesap izni istenmemelidir. Kamera ve fotoğraf izni yalnızca kullanıcı fotoğraf kontrolü ekranında çekim veya galeri seçimi başlattığında, o tek fotoğraf için istenir.

## Hazırlık

- [ ] `npm run native:build` geçti.
- [ ] `npm run appstore:prepare` geçti.
- [ ] Xcode signing team seçildi.
- [ ] Bundle ID `com.eksperiq.app` veya onaylanan final ID ile eşleşiyor.
- [ ] App icon setinde opak 1024 x 1024 ikon var.
- [ ] TestFlight build notunda karar destek sınırı yazıyor.

## İlk Açılış

- [ ] Uygulama soğuk açılışta boş ekran göstermiyor.
- [ ] Ana sayfa iPhone küçük ekranda yatay taşma yapmıyor.
- [ ] Alt navigasyon safe area ile çakışmıyor.
- [ ] İlk ekranda login, ödeme, reklam veya analytics izni istenmiyor.
- [ ] Gizlilik metni ve yasal sınır uygulama içinde erişilebilir.

## Analiz Akışı

- [ ] `Yeni Analiz` sekmesi doğru sayfayı açıyor.
- [ ] Form alanlarında label ve hata mesajları okunuyor.
- [ ] Klavye açıkken kritik CTA tamamen kapanmıyor.
- [ ] Demo gerçekçi değerlerle analiz oluşturulabiliyor.
- [ ] Sonuç sayfası risk skoru, karar özeti ve yasal uyarıyı gösteriyor.
- [ ] Satıcı soruları ve ekspertiz kontrol listesi görünüyor.
- [ ] Checklist tikleri oturum içinde korunuyor.
- [ ] Analiz temizleme akışı kullanıcıyı kilitlemiyor.

## Rapor ve Paylaşım

- [ ] `Raporu paylaş` iOS share sheet veya güvenli kopyalama davranışına düşüyor.
- [ ] Paylaşılan/kopyalanan metin kesin satın alma veya hasarsızlık garantisi vermiyor.
- [ ] Yazdırma/rapor görünümünde alt navigasyon ve gereksiz UI çıkmıyor.

## AI Notu

- [ ] Feature flag kapalıyken AI notu alanı görünmüyor.
- [ ] Staging flag açıkken AI notu butonu görünür ama karar destek sınırını korur.
- [ ] AI hata durumunda kural tabanlı rapor kaybolmuyor.
- [ ] AI notu kesin ekspertiz, kesin alım veya hasarsızlık iddiası üretmiyor.

## Fotoğraf Kontrolü ve İzinler

- [ ] Fotoğraf ekleme ekranında "Fotoğraf çek" seçilince kamera izni diyaloğu Info.plist metniyle çıkıyor ve uygulama çökmüyor.
- [ ] Fotoğraf ekleme ekranında galeriden seçim yapılınca gerekiyorsa fotoğraf kitaplığı izni diyaloğu çıkıyor ve uygulama çökmüyor.
- [ ] İzin reddedilirse uygulama anlaşılır bir uyarı gösteriyor, çökmüyor.
- [ ] Fotoğraf AI kontrolü araç dışı görselde hasar bulgusu üretmiyor.

## Offline ve Hata Durumları

- [ ] Uçak modunda uygulama anlaşılır offline davranışı gösteriyor.
- [ ] Geri dönüş hareketi layout'u bozmuyor.
- [ ] Dış linkler kullanıcıyı native kabuk içinde sıkıştırmıyor.
- [ ] Uygulama kapatılıp açıldığında oturum davranışı beklenen şekilde.

## Redde Yol Açabilecek Riskler

- [ ] Uygulama yalnızca boş web wrapper gibi hissettirmiyor; rapor/paylaşım/offline deneyimi çalışıyor.
- [ ] İlan siteleri scrape edilmiyor.
- [ ] Kullanıcı verisinin sunucuya kalıcı kaydedilmediği doğru beyan ediliyor.
- [ ] App Store gizlilik cevapları uygulama davranışıyla tutarlı.
