# 15 Ağustos 2026 Launch Planı

Hedef: EksperIQ'u 15 Ağustos 2026'ya kadar satılabilir, gerçek kullanıcıya açılabilir ve App Store'a gönderilebilir seviyeye getirmek.

## Kritik gerçeklik

- App Store yayını teknik build'den ibaret değildir; Apple Developer Program üyeliği, macOS/Xcode, App Store Connect kaydı, TestFlight ve Apple Review süreci gerekir.
- Apple Developer Program yıllık ücretlidir. Üyelik ve ödeme kullanıcı tarafından açılmalıdır.
- 28 Nisan 2026'dan beri App Store Connect'e yüklenen uygulamalar Xcode 26 veya sonrası ve iOS 26 SDK ile build edilmelidir.
- Apple Review süresi garanti edilemez. Teknik teslim hedefi 10-12 Ağustos olmalıdır; 15 Ağustos mağazada görünür olma hedefi dış onaya bağlıdır.

## Yayın stratejisi

İlk App Store sürümü ücretsiz olmalı.

Gerekçe:

- MVP henüz hesap, kalıcı garaj, ödeme veya gerçek fotoğraf analizi içermiyor.
- Ücretsiz yayın daha hızlı geri bildirim toplar.
- Satılabilirlik ilk etapta ürünü pazara çıkarma, güven veren arayüz, App Store varlığı ve kullanıcı geri bildirimiyle kural setini büyütme anlamına gelmelidir.

Ücretli model sonraki sürüme bırakılmalı:

- Premium rapor çıktısı
- Fotoğraftan hasar analizi
- Bakım hatırlatma
- Araç sağlık karnesi
- Çoklu araç garajı

## 1. Hafta: 29 Temmuz - 4 Ağustos

Amaç: Ürünün mobil uygulama hissini ve ana akışlarını bitirmek.

- Sonuç sayfasını mobil kart tasarımına geçirmek.
- Analizlerim sayfasını gerçek liste görünümüne yaklaştırmak.
- Profil ekranını ayarlar, gizlilik ve uygulama bilgisiyle güçlendirmek.
- Uzmanlık kontrol listesini raporla daha iyi bağlamak.
- Ana sayfa, analiz, sonuç, profil, analizlerim, kontrol listesi için Playwright screenshot seti üretmek.
- App Store metinlerini son ürün diliyle güncellemek.

## 2. Hafta: 5 Ağustos - 10 Ağustos

Amaç: App Store/TestFlight öncesi teknik kaliteyi kapatmak.

- iOS App Store screenshot ölçülerini üretmek.
- App icon 1024x1024 final asset hazırlamak.
- Native wrapper'da offline fallback, safe area ve paylaşım davranışını macOS/Xcode üzerinde test etmek.
- TestFlight build almak.
- Gizlilik etiketi cevaplarını App Store Connect'e hazır hale getirmek.
- Review note ve demo akışını son kez doğrulamak.

## 3. Aşama: 11 Ağustos - 15 Ağustos

Amaç: Gönderim ve dış onay sürecini yönetmek.

- TestFlight gerçek cihaz testi.
- İlk 5 kullanıcı testi planındaki notların issue'a çevrilmesi.
- Kritik bug fix.
- App Store Connect metadata girişi.
- App Review gönderimi.
- Review yanıtı gerekirse aynı gün düzeltme ve yeniden gönderim.
- Web/Vercel canlı sürümünü App Store sayfasıyla tutarlı tutmak.

## Dış bağımlılıklar

Bu işler kod içinde çözülemez ve kullanıcı tarafında açılmalıdır:

- Apple Developer Program üyeliği.
- macOS/Xcode 26 ortamı.
- App Store Connect erişimi.
- Bundle ID ve signing team.
- Gerekirse şirket/marka hesabı bilgileri.
- Final App Store ikon kararı.

## Minimum App Store kabul paketi

- Uygulama adı: EksperIQ
- Bundle ID: `com.eksperiq.app`
- Kategori: Utilities veya Productivity
- Fiyat: Ücretsiz
- Gizlilik politikası: `https://eksperiq.vercel.app/gizlilik`
- Destek URL'si: `https://eksperiq.vercel.app/geri-bildirim`
- Pazarlama URL'si: `https://eksperiq.vercel.app`
- Review note: `docs/app-store-submission.md`
- Screenshot kaynağı: `test-results/screenshots`

## Teknik çıkış kapısı

Bu komutlar temiz geçmeden release yapılmaz:

```bash
npm run format
npm run lint
npm run typecheck
npm run test
npm run launch:check
npm run e2e
npm run screenshots
npm run build
npm run native:build
npm run hostinger:package
```

## Sonraki en yüksek etkili 3 iş

1. Sonuç sayfasını mobil kart tabanlı rapor ekranına çevirmek.
2. App Store screenshot ölçülerini ayrı Playwright projeleriyle üretmek.
3. Xcode 26/TestFlight hazırlığı için iOS platform kurulum kontrol dosyasını eklemek.
