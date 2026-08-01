# iOS Repo Stratejisi

EksperIQ web uygulaması bağımsız repo olarak kalır. iOS klasörü yalnızca App Store/TestFlight aşamasına geçildiğinde üretilir.

## Ne zaman `ios/` üretilir?

macOS ve Xcode hazır olduğunda:

```bash
npm run ios:add
npm run ios:sync
```

Windows üzerinde `native:build` ile web çıktısı ve Capacitor sync doğrulanabilir; final iOS build, signing ve TestFlight için macOS gerekir.

## Commit stratejisi

`ios/` klasörü üretildikten sonra ayrı bir commit ile eklenmelidir. Windows üzerinde `npm run ios:add` başarıyla çalıştıysa commit yalnızca Xcode proje iskeletini içermeli; `ios/App/App/public`, Pods, build çıktıları ve kişisel Xcode state dosyaları commitlenmemelidir.

```bash
git status --short
git add ios capacitor.config.ts package.json package-lock.json
git commit -m "Add Capacitor iOS project"
```

Bu commit yalnızca native proje iskeleti ve gerekli config değişikliklerini içermelidir. UI, analiz motoru veya web özellikleriyle karıştırılmamalıdır.

## Commitlenmemesi gerekenler

- Apple Developer kişisel sertifikaları
- Provisioning profile dosyaları
- `.p12`, `.cer`, `.mobileprovision`
- Kişisel Xcode user state dosyaları
- App Store Connect API key dosyaları
- Herhangi bir secret veya token

`.gitignore` zaten `*.pem`, `.env*`, `.vercel`, `dist`, `out`, `.next` ve test çıktısını dışarıda bırakır. iOS üretiminden sonra Xcode'un oluşturduğu kişisel dosyalar ayrıca kontrol edilmelidir.

## Xcode ayarları

Xcode içinde kontrol edilecekler:

- Bundle ID: `com.eksperiq.app`
- Display name: `EksperIQ`
- App icon: `public/app-store-icon-1024.png` kaynağından üretilen opak ikon
- Signing team: kişisel/şirket Apple Developer hesabı
- Deployment target: Apple'ın güncel kabul ettiği iOS sürümü
- Gereksiz permission açıklamaları: ilk sürümde kamera, fotoğraf, konum, mikrofon, rehber ve bildirim izni istenmemeli

## PR / commit kabul kriteri

- `npm run native:build` geçer.
- `npm run appstore:prepare` geçer.
- `npm run launch:check` geçer ve `docs/ios-testflight-preflight.md` güncel kalır.
- `docs/testflight-qa-checklist.md` güncel kalır.
- Secret taramasında Apple veya OpenRouter key görünmez.
- App Store gizlilik beyanı uygulama davranışıyla çelişmez.
