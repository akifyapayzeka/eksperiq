# StoreKit 2 Entegrasyon Planı (Pro Abonelik)

Bu doküman gerçek bir Apple/Xcode ortamı olmadan **Linux'ta tamamlanabilen** kısmı (async entitlement mimarisi) ile
Xcode + gerçek bir Apple Developer/App Store Connect hesabı gerektiren kalan işi ayırır. Hiçbir aşamada
localStorage/istemci tarafı bir bayrakla sahte "Pro" açılmaz; gerçek satın alma doğrulaması olmadan hiçbir ekran
çalışmayan bir "Pro'ya geç" butonu göstermez.

## Şu an tamamlanmış olan (bu ortamda, doğrulanabilir)

`src/lib/pro/entitlement.ts`:

- `EntitlementState`: `"free" | "pro" | "expired" | "billingRetry" | "gracePeriod" | "revoked" | "unknown"` — StoreKit
  2'nin gerçek abonelik durumlarıyla birebir eşleşir.
- `EntitlementProvider` arayüzü: `getEntitlement(): Promise<EntitlementSnapshot>`. Tüm entitlement kontrolü asenkron;
  hiçbir yerde senkron bir `boolean` bayrağa güvenilmez.
- `unavailableEntitlementProvider`: gerçek satın alma mekanizması henüz yokken kullanılan varsayılan sağlayıcı;
  her zaman dürüstçe `"free"` döner. **Bu, spesifikasyondaki "feature flag" karşılığıdır** — bu sağlayıcı aktifken
  hiçbir ekran satın alma/yükseltme aksiyonu göstermemelidir (şu an da göstermiyor: `isPro()` kod tabanında hiçbir UI
  bileşeni tarafından çağrılmıyor).
- `isPro(provider?)`: varsayılan olarak `unavailableEntitlementProvider` kullanır, `"pro"` veya `"gracePeriod"`
  durumlarını "erişim var" sayar.
- `tests/unit/pro-entitlement.test.ts`: tüm durumlar için `isPro()` davranışı test edilir.

Bu mimari, gerçek bir StoreKit 2 sağlayıcısı yazıldığında `isPro(realProvider)` şeklinde takılabilecek şekilde
tasarlandı — çağıran kodun değişmesi gerekmez.

## Xcode + Apple Developer hesabı gerektiren, bu ortamda tamamlanamayan iş

Aşağıdaki adımların hiçbiri bu Linux ortamında yazılamaz/derlenemez/test edilemez; gerçek bir macOS + Xcode + Apple
Developer Program üyeliği + App Store Connect erişimi gerektirir. Sırasıyla:

### 1. App Store Connect (iş/hesap adımı, kod değil)

- Abonelik ürünü (`com.eksperiq.app.pro.monthly` gibi bir product ID) App Store Connect'te oluşturulmadan hiçbir
  satın alma test edilemez ve bu ürün satışta gösterilemez (kesin kural: oluşturulmamış ürünü satışta gösterme).
- App Store Server Notifications V2 için App Store Connect'te bir webhook URL'si ve (opsiyonel) paylaşılan sır
  tanımlanmalı.
- Sunucu tarafı doğrulama için bir App Store Connect API anahtarı (.p8 dosyası + Key ID + Issuer ID) oluşturulmalı.

### 2. Native Swift — satın alma/restore/currentEntitlements (Xcode gerekli)

Beklenen şekil (referans amaçlı, **derlenmedi/test edilmedi**):

```swift
// EksperIQ/StoreKit/EntitlementListener.swift — REFERANS, DERLENMEDİ
import StoreKit

actor EntitlementListener {
    static let shared = EntitlementListener()
    private var updatesTask: Task<Void, Never>?

    func start() {
        updatesTask = Task.detached {
            for await update in Transaction.updates {
                await Self.shared.handle(update)
            }
        }
    }

    private func handle(_ result: VerificationResult<Transaction>) async {
        switch result {
        case .verified(let transaction):
            // TODO: yerel durumu güncelle, gerekiyorsa sunucuya bildir, transaction.finish()
            await transaction.finish()
        case .unverified:
            // Apple imzasını doğrulayamadı — entitlement verme.
            break
        }
    }

    func currentEntitlement(for productId: String) async -> VerificationResult<Transaction>? {
        for await result in Transaction.currentEntitlements {
            if case .verified(let transaction) = result, transaction.productID == productId {
                return result
            }
        }
        return nil
    }

    func purchase(_ product: Product) async throws -> VerificationResult<Transaction>? {
        let result = try await product.purchase()
        switch result {
        case .success(let verification): return verification
        case .userCancelled, .pending: return nil
        @unknown default: return nil
        }
    }

    func restore() async throws {
        try await AppStore.sync()
    }
}
```

Bu Swift kodu bir Capacitor custom plugin (`EksperIQEntitlementPlugin`) üzerinden JS tarafına köprülenmeli; JS
tarafındaki gerçek `EntitlementProvider` implementasyonu bu plugin'i çağırıp `EntitlementSnapshot`'a çevirir:

```ts
// Referans — henüz yazılmadı (gerçek plugin yoksa derlenmez/çalışmaz)
class NativeStoreKitEntitlementProvider implements EntitlementProvider {
  async getEntitlement(): Promise<EntitlementSnapshot> {
    const result = await EksperIQEntitlementPlugin.currentEntitlement({ productId: "com.eksperiq.app.pro.monthly" });
    return mapNativeResultToSnapshot(result);
  }
}
```

### 3. Sunucu tarafı JWS doğrulama + App Store Server Notifications V2 (Xcode gerekmez ama Apple kimlik bilgisi gerekir)

Bu parça teorik olarak Xcode olmadan da yazılabilir (Apple'ın Server API'leri düz HTTPS + JWT), ancak:

- Gerçek bir App Store Connect API anahtarı olmadan Apple'ın Server API'sine hiçbir istek atılamaz.
- Gerçek bir abonelik ürünü olmadan Apple'dan gerçek bir App Store Server Notification asla gelmez, dolayısıyla JWS
  doğrulama kodu **gerçek Apple trafiğine karşı bu ortamda test edilemez** — yalnızca sentetik/kendi ürettiğimiz
  anahtarlarla "kod doğru mu decode/verify ediyor" test edilebilir, "gerçek Apple imzasını doğru kabul/ret ediyor mu"
  test edilemez.

Bu yüzden bu iş kasıtlı olarak bu turda canlı bir `/api/iap/*` endpoint'i olarak **eklenmedi** — yarım/doğrulanamamış
bir endpoint'i "tamamlandı" gibi göstermek yerine, bir sonraki mühendisin (gerçek App Store Connect erişimiyle) tam
güvenle uygulayabileceği net bir sözleşme burada bırakılıyor:

- **Endpoint**: `POST /api/iap/notifications` — Apple'dan gelen `signedPayload` (JWS) alır.
  - Fail-closed: `APPLE_APP_STORE_NOTIFICATIONS_ENABLED !== "true"` veya gerekli Apple kök sertifika/anahtar
    yapılandırması yoksa **503** döner (cron ve AI rate-limit endpoint'lerindeki fail-closed desenle aynı).
  - JWS header'daki `x5c` sertifika zincirini Apple'ın yayınladığı kök sertifikaya kadar doğrular (bkz.
    [Apple'ın resmi dokümantasyonu](https://developer.apple.com/documentation/appstoreservernotifications)),
    ardından payload'ı decode eder.
  - Doğrulanan `notificationType`/`subtype` ve transaction bilgisini, ilgili kurulum kimliğine (hash'lenmiş) karşılık
    gelen entitlement kaydına Upstash'te kısa TTL ile yazar.
- **Endpoint**: `POST /api/iap/entitlement` — istemci, StoreKit'ten aldığı doğrulanmış transaction JWS'ini gönderir;
  sunucu bunu doğrular ve kısa ömürlü (ör. 15 dakika), HMAC imzalı bir entitlement token'ı döner. İstemci bu token'ı
  yalnızca bellekte tutar (localStorage'a yazmaz), süresi dolunca yeniden ister.
- Her iki endpoint de mevcut `api/_lib/rate-limit.js` ve `api/_lib/cron-log.js` desenleriyle aynı fail-closed/HMAC
  yaklaşımını izlemeli.

### 4. PrivacyInfo.xcprivacy güncellemesi

Gerçek satın alma eklendiğinde `NSPrivacyCollectedDataTypes` listesine "Purchase History" eklenmeli ve Apple'ın
`NSPrivacyAccessedAPICategoryUserDefaults` gerekçesi güncellenmeli (bkz. `docs/ios-privacy-manifest.md`).

## Özet — manuel blocker listesi

1. App Store Connect'te abonelik ürünü + fiyatlandırma oluşturma (iş adımı).
2. App Store Connect API anahtarı (.p8) üretme ve güvenli şekilde saklama (iş adımı).
3. `EntitlementListener.swift` + Capacitor custom plugin'i Xcode'da yazma, derleme, gerçek cihazda (App Store
   Connect sandbox test kullanıcısıyla) test etme.
4. `/api/iap/notifications` ve `/api/iap/entitlement` endpoint'lerini gerçek Apple kök sertifikasına karşı yazıp
   Apple'ın sandbox bildirimleriyle uçtan uca doğrulama.
5. `PrivacyInfo.xcprivacy`'yi satın alma verisiyle güncelleme.
6. Yukarıdaki hiçbiri tamamlanmadan `isPro()`'nun varsayılan sağlayıcısı (`unavailableEntitlementProvider`) değiştirilmemeli.
