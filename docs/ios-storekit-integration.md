# StoreKit 2 Entegrasyon Planı (Pro Abonelik)

Bu doküman gerçek bir Apple/Xcode ortamı olmadan **Linux'ta tamamlanabilen** kısmı ile Xcode + gerçek bir Apple
Developer/App Store Connect hesabı gerektiren kalan işi ayırır. Hiçbir aşamada localStorage/istemci tarafı bir
bayrakla sahte "Pro" açılmaz; gerçek satın alma doğrulaması olmadan hiçbir ekran çalışmayan bir "Pro'ya geç" butonu
göstermez.

**Güncelleme**: Bu turda, Apple Developer hesabı _dışında_ kalan her şey artık gerçek (referans/taslak değil) kodla
yazıldı: TS köprü katmanı, Swift StoreKit 2 + Capacitor plugin kodu, ve sunucu tarafı JWS doğrulama + iki `/api/iap/*`
endpoint'i. Aşağıdaki "tamamlanmış" ve "Xcode/Apple hesabı gerekli" bölümleri buna göre güncellendi — ne test
edildiği ve ne edilmediği her madde için açıkça belirtiliyor.

## Şu an tamamlanmış olan (bu ortamda, doğrulanabilir — gerçek kod, gerçek testler)

### İstemci tarafı (TypeScript) — tsc/lint/vitest ile doğrulandı

`src/lib/pro/entitlement.ts`:

- `EntitlementState`: `"free" | "pro" | "expired" | "billingRetry" | "gracePeriod" | "revoked" | "unknown"` — StoreKit
  2'nin gerçek abonelik durumlarıyla birebir eşleşir.
- `EntitlementProvider` arayüzü: `getEntitlement(): Promise<EntitlementSnapshot>`. Tüm entitlement kontrolü asenkron;
  hiçbir yerde senkron bir `boolean` bayrağa güvenilmez.
- `unavailableEntitlementProvider`: gerçek satın alma mekanizması henüz yokken kullanılan varsayılan sağlayıcı;
  her zaman dürüstçe `"free"` döner. **Bu, spesifikasyondaki "feature flag" karşılığıdır** — bu sağlayıcı aktifken
  hiçbir ekran çalışan satın alma/yükseltme aksiyonu göstermemelidir. Paywall plan kartları görünebilir, ancak
  `NEXT_PUBLIC_STOREKIT_PURCHASES_ENABLED=true` olmadan StoreKit çağrısı başlatmaz ve kullanıcıya App Store onayının
  beklendiğini söyler. `isPro()` kod tabanında hiçbir UI bileşeni tarafından çağrılmıyor, ve varsayılan parametresi
  hâlâ `unavailableEntitlementProvider`.
- `nativeStoreKitEntitlementProvider`: gerçek native plugin'i çağıran sağlayıcı — **yazıldı ve test edildi, ama
  hiçbir UI bileşeni tarafından henüz kullanılmıyor** (madde 6'daki kural gereği: Swift tarafı Xcode'da derlenip
  gerçek cihazda doğrulanmadan bu, `isPro()`'nun varsayılanı yapılmayacak).
- `purchasePlan(productId)` / `restorePurchases()`: gerçek native plugin çağrıları; web'de `purchasePlan()` hata
  fırlatır, `restorePurchases()` no-op döner.
- App Store Connect'te oluşturulması gereken ürünler ve uygulamadaki fiyat karşılıkları:
  - `com.eksperiq.app.pro.monthly`: EksperIQ Pro aylık, 150 TL.
  - `com.eksperiq.app.pro.yearly`: EksperIQ Pro yıllık, 1.500 TL.
  - `com.eksperiq.app.proplus.monthly`: EksperIQ Pro+ aylık, 400 TL.
  - `com.eksperiq.app.proplus.yearly`: EksperIQ Pro+ yıllık, 4.000 TL.
- `src/lib/pro/native-entitlement-plugin.ts`: Capacitor `registerPlugin<...>("EksperIQEntitlement")` köprüsü —
  web implementasyonu yok, yalnızca `Capacitor.isNativePlatform()` arkasında çağrılmalı.
- `isPro(provider?)`: varsayılan olarak `unavailableEntitlementProvider` kullanır, `"pro"` veya `"gracePeriod"`
  durumlarını "erişim var" sayar.
- `tests/unit/pro-entitlement.test.ts`: 11 test — `isPro()`'nun tüm durumları, `nativeStoreKitEntitlementProvider`,
  `purchasePro()`, `restorePurchases()`.

`src/components/paywall/paywall-plans.tsx`:

- Satın alma CTA'ları `NEXT_PUBLIC_STOREKIT_PURCHASES_ENABLED=true` olmadan StoreKit çağrısı başlatmaz.
- Bu env yalnızca App Store Connect abonelik ürünleri oluşturulduktan, TestFlight/sandbox cihazda satın alma ve
  restore akışı doğrulandıktan sonra açılmalı.
- `npm run storekit:gate-check`, `NEXT_PUBLIC_STOREKIT_PURCHASES_ENABLED=true` açılırsa aynı ortamda
  `STOREKIT_APP_STORE_PRODUCTS_VERIFIED=true` ve `STOREKIT_SANDBOX_PURCHASE_VERIFIED=true` bekler; aksi halde release
  preflight durur.
- iOS GitHub Actions workflow'ları bu üç flag'i repository secret'lardan okur. Build 53 veya sonraki TestFlight
  build'lerinde abonelik butonunu aktif derlemek için repository secrets:
  `NEXT_PUBLIC_STOREKIT_PURCHASES_ENABLED=true`, `STOREKIT_APP_STORE_PRODUCTS_VERIFIED=true`,
  `STOREKIT_SANDBOX_PURCHASE_VERIFIED=true` olmalıdır.
- Env kapalıyken kullanıcıya Pro'nun App Store onayı beklediği gösterilir; fake satın alma, fake Pro veya boşa düşen
  buton yoktur.

Bu mimari, gerçek bir StoreKit 2 sağlayıcısı doğrulandığında `isPro(nativeStoreKitEntitlementProvider)` şeklinde
takılabilecek şekilde tasarlandı — çağıran kodun değişmesi gerekmez.

**Güncelleme (bu turda)**: `src/lib/pro/subscription-manager.ts` eklendi — `entitlement.ts` (durum) ve `tier.ts`
(Pro/Pro+ ayrımı) daha önce native plugin'i birbirinden bağımsız iki kez çağırıyordu; artık ikisi de tek bir
`SubscriptionManager`'a delege ediyor (`getSnapshot()`), StoreKit okuması tek yerde. Aynı modül artık gerçek App
Store Connect ürün kataloğunu da çekiyor: `SubscriptionManager.getProducts()` → Swift tarafında yeni
`EksperIQEntitlementStore.products(for:)` (native `Product.products(for:)` sarmalayıcı) →
`EksperIQEntitlementPlugin.fetchProducts` → `native-entitlement-plugin.ts`. `paywall-plans.tsx` artık aşağıdaki
sabit tabloyu (bir sonraki paragraf) UI'da **göstermiyor** — fiyatlar App Store'dan gerçek zamanlı, kullanıcının
kendi mağaza/para birimine göre biçimlenmiş olarak (`product.displayPrice`) çekiliyor; ürün henüz yüklenmemişse veya
App Store Connect'te henüz yoksa nötr bir "—" placeholder gösteriliyor, hiçbir zaman tahmini/sabit bir rakam değil.
Paywall'a ayrıca bir Ücretsiz plan kartı ile her zaman görünen Gizlilik Politikası / Kullanım Koşulları / Abonelikleri
Yönet bağlantıları ve otomatik yenileme açıklaması eklendi.
`tests/unit/subscription-manager.test.ts` ve güncellenen `tests/unit/paywall-plans.test.tsx` bu davranışı (web'de
no-op, native'de cache, hata durumunda asla sahte "pro" iddiası) mock'lu native plugin'e karşı doğruluyor — gerçek
cihaz testi değil. Bu Swift değişikliği dahil tüm native taraf `ios-xcode-build-check.yml` ile gerçek Xcode 26
Simulator hedefinde derleme doğrulaması aldı (**BUILD SUCCEEDED**, unsigned) — kod derleniyor, ama satın
alma/restore davranışı hâlâ gerçek cihazda doğrulanmadı (bkz. aşağıdaki madde 2).

### Sunucu tarafı (Node) — vitest ile doğrulandı, gerçek Apple trafiğine karşı DEĞİL

`api/_lib/apple-jws.js`:

- `verifyAppleSignedPayload(compactJws)`: Apple'ın StoreKit 2 transaction/renewal info ve App Store Server
  Notifications V2 için kullandığı ES256 JWS + `x5c` sertifika zinciri doğrulamasını Node'un yerleşik `crypto`
  modülüyle (harici bağımlılık yok) uygular. Trust anchor, Apple'ın gerçek, resmi PKI dağıtımından
  (`https://www.apple.com/certificateauthority/AppleRootCA-G3.cer`) indirilip koda gömüldü.
- `tests/unit/apple-jws.test.ts`: gerçek bir openssl ile üretilen sentetik kök→ara→yaprak sertifika zinciriyle 9
  test — imza doğrulama, zincir doğrulama, bozuk zincir reddi, kurcalanmış payload reddi, desteklenmeyen algoritma
  reddi, ve Apple'ın gerçek kök sertifikasının hâlâ geçerli/kendinden imzalı olduğu doğrulaması. **Bunlar kriptonun
  doğru çalıştığını kanıtlar; gerçek Apple imzalı bir payload'a karşı hiçbir zaman test edilmedi** (böyle bir
  payload üretmek için gerçek bir App Store Connect sandbox işlemi gerekir).

`api/iap/notifications.js` — `POST`, Apple'ın App Store Server Notifications V2 webhook'u:

- Fail-closed: `APPLE_APP_STORE_NOTIFICATIONS_ENABLED !== "true"` ise her istek 503.
- Dış zarfı (`signedPayload`), içindeki `signedTransactionInfo`'yu ve varsa `signedRenewalInfo`'yu ayrı ayrı
  `verifyAppleSignedPayload` ile doğrular; herhangi biri doğrulanamazsa 401, detay sızdırmaz.
- Doğrulanan durumu `api/_lib/iap-store.js` üzerinden `originalTransactionId`'nin hash'ine karşılık gelen kayda
  yazar (bu uygulamada kullanıcı hesabı yok — tek stabil kimlik Apple'ın kendi `originalTransactionId`'si).
- **Güncelleme (audit turu)**: kayıt artık Apple'ın bildirimdeki `environment` alanını (`Production`/`Sandbox`) da
  taşıyor ve saklama anahtarı buna göre ayrışıyor (`hashOriginalTransactionId(id, environment)`,
  `api/_lib/iap-store.js`) — Apple aynı webhook URL'sine hem Sandbox hem Production bildirimlerini gönderdiği için
  bu iki ortam artık asla aynı kaydı okuyup üzerine yazamıyor. `deriveEntitlementState` refund (`revocationDate`),
  expire, renew ve grace period durumlarını `notificationType` etiketine değil doğrudan imzalı
  transaction/renewal alanlarına bakarak çözüyor — daha sağlam bir yaklaşım, ayrıca değiştirilmedi. Aynı bildirim iki
  kez işlenirse (Apple'ın kendi retry mekanizması) sonuç deterministik üretildiği için kayıt üzerine aynı değerle
  yazılıyor — ayrı bir idempotency-anahtarı gerekmiyor.
- `buildEntitlementRecord()` artık ayrı, saf bir fonksiyon olarak dışa açılıyor — gerçek/sentetik Apple imzası
  olmadan bu mantık (`tests/unit/iap-notifications-endpoint.test.ts`) doğrudan test edilebiliyor: environment
  etiketleme, refund→revoked, grace period, expired, idempotent-overwrite.
- `tests/unit/iap-notifications-endpoint.test.ts`: handler seviyesinde fail-closed ve reddetme yollarını kapsar
  (bkz. yukarıdaki not — başarı yolu bu ortamda gerçek Apple imzasıyla test edilemez).

`api/iap/entitlement.js` — `POST`, istemciye açık (CORS'lu):

- Fail-closed: `APPLE_IAP_ENTITLEMENT_ENABLED !== "true"` VEYA `STOREKIT_ENTITLEMENT_TOKEN_SECRET` tanımsızsa 503.
- İstemcinin kendi StoreKit çağrısından aldığı `signedTransactionInfo` JWS'ini sunucu tarafında bağımsızca yeniden
  doğrular (cihazdaki bir jailbreak/kurcalama tek başına asla yeterli olmasın diye), `productId`'yi kontrol eder,
  kısa ömürlü (15 dk) HMAC imzalı bir entitlement token'ı döner. İstemci bu token'ı yalnızca bellekte tutmalı.
- **Güvenlik bulgusu ve düzeltme (audit turu)**: bir Sandbox transaction JWS'i gerçek, Apple tarafından geçerli
  şekilde imzalanmış bir kriptografik nesnedir — herkes ücretsiz bir Sandbox test Apple ID'siyle bunu elde
  edebilir, satın alma veya App Review gerekmez. Düzeltmeden önce, bu Sandbox JWS'i doğrudan bu endpoint'e POST
  etmek (uygulamayı tamamen atlayarak) gerçek bir ödeyen müşteriyle birebir aynı kod yolundan geçerli bir "pro"
  token'ı elde edebiliyordu. Artık `transactionInfo.environment !== "Production"` ise, `APPLE_IAP_ACCEPT_SANDBOX`
  açıkça `"true"` yapılmadığı sürece 400 ile reddediliyor — bu depodaki diğer flag'lerle aynı fail-closed deseni
  (varsayılan kapalı). Sandbox'ı tamamen her zaman reddetmemek bilinçli bir tercih: TestFlight testi ve App Review
  öncesi test her zaman Sandbox ortamında çalışır, bu yüzden ihtiyaç olursa flag ile açılabilir olması gerekiyordu.
- `buildEntitlementRecord()` de burada ayrı bir saf fonksiyon — environment kaydı ve state türetme
  `tests/unit/iap-entitlement-endpoint.test.ts`'te gerçek imza gerekmeden test ediliyor.
- `tests/unit/iap-entitlement-endpoint.test.ts`: fail-closed, CORS preflight, Sandbox reddi (`acceptsSandbox()`), ve
  reddetme yollarını kapsar.
- `tests/unit/iap-store.test.ts` (yeni): `hashOriginalTransactionId`'nin aynı id için Production/Sandbox'ta farklı
  anahtar ürettiğini ve bir ortamdaki kaydın diğerini hiç etkilemediğini doğrudan doğruluyor.

## Xcode + Apple Developer hesabı gerektiren, bu ortamda tamamlanamayan iş

Aşağıdaki adımların hiçbiri bu Linux ortamında yazılamaz/derlenemez/test edilemez; gerçek bir macOS + Xcode + Apple
Developer Program üyeliği + App Store Connect erişimi gerektirir. Sırasıyla:

### 1. App Store Connect (iş/hesap adımı, kod değil)

- Abonelik ürünleri (`com.eksperiq.app.pro.monthly`, `com.eksperiq.app.pro.yearly`,
  `com.eksperiq.app.proplus.monthly`, `com.eksperiq.app.proplus.yearly`) App Store Connect'te oluşturulmadan hiçbir
  satın alma test edilemez ve bu ürün satışta gösterilemez (kesin kural: oluşturulmamış ürünü satışta gösterme).
- App Store Server Notifications V2 için App Store Connect'te bir webhook URL'si ve (opsiyonel) paylaşılan sır
  tanımlanmalı.
- Sunucu tarafı doğrulama için bir App Store Connect API anahtarı (.p8 dosyası + Key ID + Issuer ID) oluşturulmalı.

### 2. Native Swift — satın alma/restore/currentEntitlements (yazıldı, gerçek Xcode'da derleniyor, cihazda HİÇ doğrulanmadı)

Artık referans/taslak değil, gerçek kaynak dosyalar olarak var ve `ios/App/App.xcodeproj/project.pbxproj`'a
kaydedildi (Sources build phase'e eklendi — Xcode açıldığında derleme listesinde görünecek):

- `ios/App/App/Plugins/EksperIQEntitlementStore.swift` — `actor EksperIQEntitlementStore`: `Transaction.updates`
  dinleyicisi, `currentEntitlement(productId:)`, `purchase(productId:)`, `restore()` (AppStore.sync()).
  `Product.SubscriptionInfo.Status`'u bu dokümanın en üstündeki `EntitlementState`'e eşler (`snapshot(from:)`).
- `ios/App/App/Plugins/EksperIQEntitlementPlugin.swift` — bunu saran `CAPPlugin, CAPBridgedPlugin` sınıfı.
  `jsName = "EksperIQEntitlement"`, `src/lib/pro/native-entitlement-plugin.ts`'teki
  `registerPlugin("EksperIQEntitlement")` ile isim eşleşmesiyle bağlanıyor (derleme zamanı kontrolü yok — bu isim
  eşleşmesi Xcode'da gerçek bir cihazda çalıştırılana kadar doğrulanamaz).

`ios-xcode-build-check.yml` bu iki dosya dahil tüm native tarafı gerçek Xcode 26'da derliyor ve **BUILD SUCCEEDED**
sonucunu veriyor (unsigned Simulator, code signing kapalı) — syntax hatası veya Capacitor API uyumsuzluğu yok. Ama
bu yalnızca derleme; aşağıdaki checklist'in 2. ve 3. maddeleri (gerçek cihazda çalıştırma, sandbox satın alma) hâlâ
tamamlanmadı:

1. App Store Connect'te dört abonelik ürününü yukarıdaki product ID'leriyle oluştur.
2. Xcode'da projeyi aç, olası derleme hatalarını düzelt, StoreKit Testing/Sandbox ortamında çalıştır.
3. Satın alma, restore ve `currentEntitlements` dinleyicisini gerçek bir cihazda sandbox Apple ID'siyle doğrula.
4. Bu üç adım geçmeden `STOREKIT_APP_STORE_PRODUCTS_VERIFIED=true`, `STOREKIT_SANDBOX_PURCHASE_VERIFIED=true` ve
   `NEXT_PUBLIC_STOREKIT_PURCHASES_ENABLED=true` açma.

**Not — `.github/workflows/ios-xcode-build-check.yml`**: Apple Developer hesabı beklemeden madde 2'nin "derleme
hatası var mı" kısmı artık GitHub'ın macOS runner'ında doğrulanabilir — bu workflow (yalnızca manuel tetiklenir,
Actions sekmesinden "Run workflow") projeyi `xcodebuild` ile iOS Simulator hedefine, code signing kapalı olarak
derler. Gerçek bir Apple hesabı/sertifika/cihaz gerektirmez, yalnızca "bu Swift kodu gerçekten derleniyor mu"
sorusunu cevaplar — satın alma/restore/bildirim davranışını doğrulamaz, o hâlâ madde 3'ün konusu.

### 3. Sunucu tarafı JWS doğrulama + App Store Server Notifications V2 (yazıldı, gerçek Apple trafiğine karşı DOĞRULANMADI)

Yukarıdaki "Şu an tamamlanmış olan" bölümünde açıklanan `api/_lib/apple-jws.js`, `api/iap/notifications.js`,
`api/iap/entitlement.js` artık gerçek, çalışan kod — ama iki şey hâlâ eksik ve bu ortamda tamamlanamaz:

- Gerçek bir App Store Connect API anahtarı (.p8 + Key ID + Issuer ID) olmadan Apple'ın Server API'sine (ör.
  abonelik durumu sorgulama) hiçbir istek atılamaz — bu iki endpoint şu an yalnızca Apple'ın **kendiliğinden
  gönderdiği** webhook'ları (notifications.js) ve istemcinin kendi imzalı transaction'ını (entitlement.js) işliyor,
  Apple'a giden bir istek yok, dolayısıyla bu anahtar bugün gerekmiyor — yalnızca gelecekte "sunucudan abonelik
  durumu sorgula" gibi bir özellik eklenirse gerekir.
- Gerçek bir abonelik ürünü ve App Store Connect'te kayıtlı bir webhook URL'si olmadan Apple'dan gerçek bir App
  Store Server Notification asla gelmez, dolayısıyla JWS doğrulama kodu **gerçek Apple trafiğine karşı bu ortamda
  test edilemedi** — yalnızca sentetik/kendi ürettiğimiz bir sertifika zinciriyle "kod doğru mu decode/verify
  ediyor" kanıtlandı (`tests/unit/apple-jws.test.ts`), "gerçek Apple imzasını doğru kabul/ret ediyor mu" hâlâ
  doğrulanamadı.

Kalan iş: App Store Connect'te webhook URL'sini `https://eksperiq.vercel.app/api/iap/notifications` olarak
kaydetmek, `APPLE_APP_STORE_NOTIFICATIONS_ENABLED=true` ve `APPLE_IAP_ENTITLEMENT_ENABLED=true` +
`STOREKIT_ENTITLEMENT_TOKEN_SECRET`'i production'da ayarlamak, ve Apple'ın sandbox bildirimleriyle uçtan uca
doğrulamak.

### 4. PrivacyInfo.xcprivacy — kontrol edildi, değişiklik gerekmedi

Önceki bir turda `NSPrivacyCollectedDataTypePurchaseHistory` eklenmişti; gerçek veri akışı denetlendiğinde (istemci
kodu `/api/iap/entitlement` veya `/api/iap/notifications`'ı hiç çağırmıyor — bkz. `src/lib/pro/subscription-manager.ts`,
`signedTransactionInfo` alanı native plugin sonucunda hep atılıyor) bu beyanın gerçek davranışı yansıtmadığı görüldü
ve **geri alındı**. Uygulama satın alma/abonelik durumunu yalnızca cihaz üzerinde StoreKit 2'nin
`Transaction.currentEntitlements`'ı üzerinden okuyor; hiçbir satın alma/işlem verisi backend'e gönderilmiyor,
sunucuda saklanmıyor veya kullanıcı/cihaz kimliğiyle ilişkilendirilmiyor. `api/iap/*` uçları (aşağıdaki madde 3) kod
olarak var ama şu an devre dışı (feature flag kapalı) ve istemciden hiç çağrılmıyor — gelecekte bu uçlar gerçekten
devreye alınıp istemci onlara `signedTransactionInfo` göndermeye başlarsa, o zaman `NSPrivacyCollectedDataTypePurchaseHistory`
gerçek hale gelir ve o noktada eklenmelidir.

## Özet — manuel blocker listesi

1. App Store Connect'te abonelik ürünü + fiyatlandırma oluşturma (iş adımı).
2. `EksperIQEntitlementStore.swift` + `EksperIQEntitlementPlugin.swift`'i Xcode'da açma, derleme hatalarını
   düzeltme, gerçek cihazda (App Store Connect sandbox test kullanıcısıyla) satın alma/restore/dinleyiciyi
   doğrulama. **Kod yazıldı, yalnızca bu adım eksik.**
3. App Store Connect'te App Store Server Notifications V2 webhook URL'sini kaydetme, `APPLE_APP_STORE_NOTIFICATIONS_ENABLED`
   ve `APPLE_IAP_ENTITLEMENT_ENABLED` + `STOREKIT_ENTITLEMENT_TOKEN_SECRET`'i ayarlama, Apple'ın sandbox
   bildirimleriyle `/api/iap/notifications` ve `/api/iap/entitlement`'i uçtan uca doğrulama. **Kod yazıldı, yalnızca
   bu doğrulama eksik.**
4. `PrivacyInfo.xcprivacy`: değişiklik gerekmiyor — uygulama bugün purchase history collect etmiyor (kontrol edildi,
   madde 4'e bak). `/api/iap/*` gerçekten devreye alınıp istemci onlara veri göndermeye başladığında yeniden
   değerlendirilmeli.
5. Yukarıdaki hiçbiri tamamlanmadan `isPro()`'nun varsayılan sağlayıcısı (`unavailableEntitlementProvider`)
   değiştirilmemeli, ve hiçbir UI bileşeni `purchasePro()`/`restorePurchases()`/`nativeStoreKitEntitlementProvider`'ı
   çağırmamalı.
