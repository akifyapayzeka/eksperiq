# iOS Privacy Manifest (PrivacyInfo.xcprivacy)

Apple, 2024'ten itibaren App Store'a gönderilen uygulamalar için bir Privacy Manifest dosyası zorunlu kılıyor. Bu
dosya `ios/App/App/PrivacyInfo.xcprivacy` altında oluşturuldu ve Xcode projesine (`project.pbxproj`) App target'ının
"Copy Bundle Resources" build fazına elle eklendi.

**Bu dosya Xcode'da açılıp derlenerek doğrulanmadı — bir sonraki Xcode adımında mutlaka kontrol edilmeli.** Aşağıdaki
gerekçeler koddaki gerçek davranışa göre yazıldı, ancak Apple'ın kendi Privacy Manifest editörü/derleyici şema
kontrolünden geçmedi.

## Neden bu içerik seçildi

### `NSPrivacyTracking = false`, `NSPrivacyTrackingDomains = []`

Uygulamada reklam takibi, üçüncü taraf analytics veya App Tracking Transparency gerektiren bir izleme yok (bkz.
`docs/app-store-privacy-answers.md`).

### `NSPrivacyCollectedDataTypes`

Apple'ın tanımına göre "collected data" cihaz dışına aktarılan (geçici olsa bile) veridir. Buna göre üç kalem
listelendi, üçü de `Linked = false` (kullanıcı kimliğiyle ilişkilendirilmez) ve `Tracking = false`:

- `NSPrivacyCollectedDataTypePhotosorVideos` — Fotoğraftan Hasar Analizi'nde seçilen fotoğraf OpenRouter'a geçici
  olarak gönderilir (`src/lib/photo-analysis/prepare-ai-image.ts`, `api/ai/photo-damage.js`).
- `NSPrivacyCollectedDataTypeOtherUserContent` — İlan/araç bilgisi, hatırlatma başlıkları OpenRouter'a (AI notu) ve
  Web Push açıksa Upstash'e geçici/sınırlı olarak gönderilir (`api/_lib/openrouter.js`, `api/_lib/push-store.js`).
- `NSPrivacyCollectedDataTypeDeviceID` — Kötüye kullanımı sınırlamak için hash'lenmiş, anonim bir kurulum kimliği/IP
  kısa süreli rate-limit sayaçlarında kullanılır (`api/_lib/rate-limit.js`). Ham değer hiçbir zaman saklanmadığı için
  bu satırın App Store Connect'teki gizlilik formunda da aynı şekilde ("App Functionality", kimliğe bağlanmamış)
  işaretlenmesi gerekir.

Tüm üç kalemin amacı `NSPrivacyCollectedDataTypePurposeAppFunctionality` — reklam, analiz veya üçüncü taraf pazarlama
amacı yok.

### `NSPrivacyAccessedAPITypes = []`

@capacitor/core, @capacitor/local-notifications ve @capacitor/share paketlerinin kaynak kodu tarandı; hiçbiri Apple'ın
"required reason" API kategorilerini (UserDefaults, dosya zaman damgası, disk alanı, sistem açılış zamanı, aktif
klavye) kullanmıyor — @capacitor/core zaten kendi boş bir `PrivacyInfo.xcprivacy` dosyasıyla geliyor
(`node_modules/@capacitor/ios/Capacitor/Capacitor/PrivacyInfo.xcprivacy`), bu da aynı sonucu doğruluyor. Uygulamanın
kendi native (Swift) kodu yalnızca Capacitor'ın ürettiği varsayılan `AppDelegate.swift` dosyasından ibaret; App Store
Connect API anahtarı veya gerçek bir Preferences/Filesystem plugin'i eklenmedikçe bu liste boş kalmalı.

## Xcode'da yapılması gereken doğrulama (manuel blocker)

1. Projeyi Xcode'da açıp `PrivacyInfo.xcprivacy` dosyasının App target'ta göründüğünü ve "Target Membership"inin
   işaretli olduğunu doğrulayın.
2. Xcode'un yerleşik Privacy Manifest editörüyle dosyayı açıp şema hatası olmadığını kontrol edin.
3. `xcodebuild -showBuildSettings` veya bir arşiv derlemesiyle App Store Connect'in Privacy Manifest yüklemesini
   reddetmediğini teyit edin (Apple, eksik/yanlış gerekçeli required-reason API'leri build zamanında reddedebilir).
4. StoreKit 2 satın alma özelliği gerçekten eklendiğinde (`docs/ios-storekit-integration.md`), bu dosyaya
   `NSPrivacyCollectedDataTypePurchaseHistory` eklenmeli.
5. Yeni bir Capacitor plugin'i eklenirse, o plugin'in kendi `PrivacyInfo.xcprivacy`'sini (varsa) ve required-reason
   API kullanımını tekrar tarayın.
