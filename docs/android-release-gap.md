# Android Sürümü — Yapılmamış İş Listesi

Bu tur (production hardening) kapsamına Android **dahil edilmedi** — spesifikasyonun 18. maddesi gereği yalnızca bu
doküman hazırlandı; hiçbir Android kodu/klasörü eklenmedi. `ios/` dizini var, `android/` dizini yok.

## Şu an nerede duruyoruz

- Proje bir Next.js statik export (`output: "export"`) + Capacitor 8 üzerine kurulu; Capacitor Android'i de resmî
  olarak destekler, dolayısıyla mimari olarak Android eklemek mümkün.
- `@capacitor/android` bağımlılığı **kurulu değil**; `npx cap add android` hiç çalıştırılmadı.
- Bu turda eklenen native-platform kodu (`Capacitor.isNativePlatform()` dallanması, `@capacitor/local-notifications`,
  `@capacitor/share`) platform-agnostik yazıldı — yani Android eklendiğinde bu kod tekrar yazılmadan çalışması
  beklenir, ancak **Android'de hiç test edilmedi**.
- `src/lib/constants/app.ts` içindeki `productionUrl` merkezi config'i native API çözümlemesi için zaten
  platformdan bağımsız; Android eklenirse ekstra bir değişiklik gerekmez.

## Android eklemek için gereken adımlar (yapılmadı)

1. `npm install @capacitor/android` + `npx cap add android` ile `android/` projesini oluşturmak.
2. `npm run build && npx cap sync android` ile web çıktısını senkronize etmek.
3. Android Studio + gerçek bir Android cihaz/emülatörde:
   - Bildirim izni akışını (`@capacitor/local-notifications`) doğrulamak — Android 13+'ta çalışma zamanı bildirim
     izni Apple'dan farklı davranır (`POST_NOTIFICATIONS` izni gerekir).
   - Native paylaşımı (`@capacitor/share`) doğrulamak.
   - Kamera/galeri izin akışını (fotoğraf yükleme) doğrulamak.
   - Safe area / gesture navigation ile alt menünün çakışmadığını doğrulamak.
4. Play Console'da:
   - Uygulama kaydı, Data Safety formu (bu dokümandaki App Store gizlilik cevaplarının Android eşleniği olarak
     `docs/app-store-privacy-answers.md`'deki gerçek mimariye göre doldurulmalı — kopyala-yapıştır değil, Android'e
     özgü izin modeliyle gözden geçirilerek).
   - İmzalama anahtarı (keystore) oluşturma ve güvenli saklama.
   - Hedef API seviyesi/`minSdkVersion` kararları.
5. Android'e özgü CI adımı (bu turda eklenen `.github/workflows/ci.yml`'e Android build/test job'ı eklenmedi —
   Android projesi yoksa eklenecek bir şey de yok).
6. Gerçek bir Android StoreKit eşleniği (Google Play Billing) — `docs/ios-storekit-integration.md`'deki StoreKit 2
   planının Play Billing karşılığı ayrıca yazılmalı; bu turda **hiç ele alınmadı**.

## Neden bu turda yapılmadı

Görev tanımı (20 maddelik prod-hardening listesi) açıkça "Android'i bu çalışmaya dahil etme — sadece
docs/android-release-gap.md" diyor. iOS tarafında bile büyük kısmı (StoreKit, gerçek cihaz testleri) Xcode/Apple
hesabı gerektiren manuel adımlar olarak kaldı; Android'i aynı turda başlatmak hem bu talimatla çelişir hem de mevcut
iOS-öncelikli kapsamı sulandırır.
