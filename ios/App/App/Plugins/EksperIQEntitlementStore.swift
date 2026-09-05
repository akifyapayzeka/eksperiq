import Foundation
import StoreKit

// EksperIQEntitlementStore — real StoreKit 2 implementation written for the
// production-hardening effort. This repository has no Xcode/Swift
// toolchain, so it has never been compiled here directly — but
// .github/workflows/ios-xcode-build-check.yml (a real Xcode 26 macOS
// runner) has compiled this exact file successfully (BUILD SUCCEEDED) as
// recently as commit 9a589bf; nothing under ios/App/App/Plugins has
// changed since. That verifies syntax/API compatibility only — it has
// still never been RUN. Before this can be trusted:
//   1. DONE — all four subscription products (com.eksperiq.app.pro.monthly,
//      .pro.yearly, .proplus.monthly, .proplus.yearly) exist in App Store
//      Connect with prices and localizations set.
//   2. DONE (compiles) — still needs running on the StoreKit Testing /
//      Sandbox environment at least once.
//   3. Exercise purchase, restore, and the currentEntitlements listener on
//      a real device against a sandbox Apple ID.
// See docs/ios-storekit-integration.md for the full checklist.
@available(iOS 15.0, *)
actor EksperIQEntitlementStore {
    static let shared = EksperIQEntitlementStore()

    private var updatesTask: Task<Void, Never>?

    /// Starts listening for transaction updates (renewals, refunds, revocations)
    /// that arrive outside of an explicit purchase() call. Safe to call more
    /// than once — only the first call starts the listener.
    func startListeningForTransactionUpdates() {
        guard updatesTask == nil else { return }
        updatesTask = Task.detached { [weak self] in
            for await update in Transaction.updates {
                await self?.handle(update)
            }
        }
    }

    private func handle(_ result: VerificationResult<Transaction>) async {
        guard case .verified(let transaction) = result else {
            // Apple could not cryptographically verify this transaction —
            // never treat it as granting entitlement.
            return
        }
        await transaction.finish()
    }

    struct EntitlementSnapshot {
        let state: String
        let expiresAt: String?
        let transactionId: String?
        /// VerificationResult.jwsRepresentation — the original signed JWS
        /// Apple gave the device for this transaction. Forwarded to the
        /// server (api/iap/entitlement.js) when a server-confirmed,
        /// short-lived entitlement token is needed.
        let signedTransactionInfo: String?
    }

    /// One App Store Connect subscription product's real, localized
    /// storefront info — never hard-coded on the client. `displayPrice` is
    /// already formatted for the user's storefront/currency by StoreKit
    /// (e.g. "₺149,99"); `periodUnit`/`periodValue` describe the billing
    /// interval (e.g. unit "month", value 1) so the caller can label it
    /// without guessing from the product id.
    struct ProductInfo {
        let productId: String
        let displayName: String
        let displayPrice: String
        let periodUnit: String?
        let periodValue: Int?
    }

    private func periodUnitString(_ unit: Product.SubscriptionPeriod.Unit) -> String {
        switch unit {
        case .day: return "day"
        case .week: return "week"
        case .month: return "month"
        case .year: return "year"
        @unknown default: return "unknown"
        }
    }

    /// Fetches real, localized product info for the given product ids via
    /// `Product.products(for:)` — the only source of truth for what to show
    /// on the paywall. Products that don't exist yet in App Store Connect
    /// (or haven't propagated) are simply absent from the result; callers
    /// must not synthesize a price for a missing product.
    func products(for productIds: [String]) async throws -> [ProductInfo] {
        let products = try await Product.products(for: productIds)
        return products.map { product in
            let period = product.subscription?.subscriptionPeriod
            return ProductInfo(
                productId: product.id,
                displayName: product.displayName,
                displayPrice: product.displayPrice,
                periodUnit: period.map { periodUnitString($0.unit) },
                periodValue: period?.value
            )
        }
    }

    private static let isoFormatter: ISO8601DateFormatter = {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return formatter
    }()

    private func snapshot(from status: Product.SubscriptionInfo.Status) -> EntitlementSnapshot {
        guard case .verified(let transaction) = status.transaction else {
            return EntitlementSnapshot(state: "unknown", expiresAt: nil, transactionId: nil, signedTransactionInfo: nil)
        }

        let expiresAt = transaction.expirationDate.map { Self.isoFormatter.string(from: $0) }
        let transactionId = String(transaction.id)
        let signedTransactionInfo = status.transaction.jwsRepresentation

        let state: String
        if status.state == .subscribed {
            state = "pro"
        } else if status.state == .inGracePeriod {
            state = "gracePeriod"
        } else if status.state == .inBillingRetryPeriod {
            state = "billingRetry"
        } else if status.state == .revoked {
            state = "revoked"
        } else if status.state == .expired {
            state = "expired"
        } else {
            state = "unknown"
        }

        return EntitlementSnapshot(
            state: state,
            expiresAt: expiresAt,
            transactionId: transactionId,
            signedTransactionInfo: signedTransactionInfo
        )
    }

    private static let freeSnapshot = EntitlementSnapshot(
        state: "free", expiresAt: nil, transactionId: nil, signedTransactionInfo: nil
    )

    /// Reads the current entitlement directly from StoreKit — no network
    /// round trip to EksperIQ's own server for this read; Apple's
    /// on-device StoreKit data is already cryptographically signed.
    func currentEntitlement(productId: String) async throws -> EntitlementSnapshot {
        let products = try await Product.products(for: [productId])
        guard let product = products.first, let subscription = product.subscription else {
            return Self.freeSnapshot
        }

        let statuses = try await subscription.status
        guard let status = statuses.first else {
            return Self.freeSnapshot
        }

        return snapshot(from: status)
    }

    func purchase(productId: String) async throws -> (snapshot: EntitlementSnapshot, cancelled: Bool) {
        let products = try await Product.products(for: [productId])
        guard let product = products.first else {
            throw EksperIQEntitlementError.productNotFound
        }

        let result = try await product.purchase()

        switch result {
        case .success(let verification):
            guard case .verified(let transaction) = verification else {
                throw EksperIQEntitlementError.unverifiedTransaction
            }
            await transaction.finish()
            let updated = try await currentEntitlement(productId: productId)
            return (updated, false)
        case .userCancelled:
            return (Self.freeSnapshot, true)
        case .pending:
            return (EntitlementSnapshot(state: "unknown", expiresAt: nil, transactionId: nil, signedTransactionInfo: nil), false)
        @unknown default:
            return (EntitlementSnapshot(state: "unknown", expiresAt: nil, transactionId: nil, signedTransactionInfo: nil), false)
        }
    }

    /// AppStore.sync() re-syncs the device's transaction history with
    /// Apple's servers — the StoreKit 2 equivalent of "restore purchases".
    func restore() async throws {
        try await AppStore.sync()
    }
}

enum EksperIQEntitlementError: LocalizedError {
    case productNotFound
    case unverifiedTransaction

    var errorDescription: String? {
        switch self {
        case .productNotFound:
            return "Ürün App Store Connect'te bulunamadı."
        case .unverifiedTransaction:
            return "İşlem Apple tarafından doğrulanamadı."
        }
    }
}
