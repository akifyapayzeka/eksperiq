import Foundation
import StoreKit

// EksperIQEntitlementStore — real StoreKit 2 implementation written for the
// production-hardening effort, but it has NEVER been compiled or run: this
// repository has no Xcode/Swift toolchain, and there is no App Store
// Connect subscription product for PRO_MONTHLY_PRODUCT_ID
// ("com.eksperiq.app.pro.monthly") yet either. Before this can be trusted:
//   1. Create the subscription product in App Store Connect with that
//      exact product id (or update the constant on both sides to match).
//   2. Open the project in Xcode, fix any compile errors, run on the
//      StoreKit Testing / Sandbox environment.
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
