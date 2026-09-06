import Foundation
import Capacitor

// EksperIQEntitlementPlugin — the Capacitor bridge wrapping
// EksperIQEntitlementStore.swift's StoreKit 2 calls. Written for the
// production-hardening effort; like the store actor it wraps, verified to
// compile on a real Xcode 26 macOS runner (see the header comment in
// EksperIQEntitlementStore.swift) but never run on a device. Before this
// can be trusted, see the checklist at the top of
// EksperIQEntitlementStore.swift and docs/ios-storekit-integration.md.
//
// jsName must exactly match the string passed to registerPlugin() in
// src/lib/pro/native-entitlement-plugin.ts ("EksperIQEntitlement") — the
// two are matched by name at runtime, not by any compile-time check.
@objc(EksperIQEntitlementPlugin)
public class EksperIQEntitlementPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "EksperIQEntitlementPlugin"
    public let jsName = "EksperIQEntitlement"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "currentEntitlement", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "purchase", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "restore", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "fetchProducts", returnType: CAPPluginReturnPromise)
    ]

    override public func load() {
        if #available(iOS 15.0, *) {
            Task {
                await EksperIQEntitlementStore.shared.startListeningForTransactionUpdates()
            }
        }
    }

    @objc func currentEntitlement(_ call: CAPPluginCall) {
        guard #available(iOS 15.0, *) else {
            call.reject("StoreKit 2 requires iOS 15 or later.")
            return
        }
        guard let productId = call.getString("productId") else {
            call.reject("Must provide productId")
            return
        }
        Task {
            do {
                let snapshot = try await EksperIQEntitlementStore.shared.currentEntitlement(productId: productId)
                call.resolve(Self.resultDict(from: snapshot))
            } catch {
                call.reject(error.localizedDescription, nil, error)
            }
        }
    }

    @objc func purchase(_ call: CAPPluginCall) {
        guard #available(iOS 15.0, *) else {
            call.reject("StoreKit 2 requires iOS 15 or later.")
            return
        }
        guard let productId = call.getString("productId") else {
            call.reject("Must provide productId")
            return
        }
        Task {
            do {
                let (snapshot, cancelled) = try await EksperIQEntitlementStore.shared.purchase(productId: productId)
                var result = Self.resultDict(from: snapshot)
                result["cancelled"] = cancelled
                call.resolve(result)
            } catch {
                call.reject(error.localizedDescription, nil, error)
            }
        }
    }

    @objc func fetchProducts(_ call: CAPPluginCall) {
        guard #available(iOS 15.0, *) else {
            call.reject("StoreKit 2 requires iOS 15 or later.")
            return
        }
        guard let productIds = call.getArray("productIds", String.self), !productIds.isEmpty else {
            call.reject("Must provide a non-empty productIds array")
            return
        }
        Task {
            do {
                let products = try await EksperIQEntitlementStore.shared.products(for: productIds)
                let productList = products.map { product -> JSObject in
                    var entry: JSObject = [
                        "productId": product.productId,
                        "displayName": product.displayName,
                        "displayPrice": product.displayPrice
                    ]
                    if let periodUnit = product.periodUnit {
                        entry["periodUnit"] = periodUnit
                    }
                    if let periodValue = product.periodValue {
                        entry["periodValue"] = periodValue
                    }
                    return entry
                }
                call.resolve(["products": productList])
            } catch {
                call.reject(error.localizedDescription, nil, error)
            }
        }
    }

    @objc func restore(_ call: CAPPluginCall) {
        guard #available(iOS 15.0, *) else {
            call.reject("StoreKit 2 requires iOS 15 or later.")
            return
        }
        Task {
            do {
                try await EksperIQEntitlementStore.shared.restore()
                call.resolve(["restored": true])
            } catch {
                call.reject(error.localizedDescription, nil, error)
            }
        }
    }

    @available(iOS 15.0, *)
    private static func resultDict(from snapshot: EksperIQEntitlementStore.EntitlementSnapshot) -> JSObject {
        var result: JSObject = ["state": snapshot.state]
        if let expiresAt = snapshot.expiresAt {
            result["expiresAt"] = expiresAt
        }
        if let transactionId = snapshot.transactionId {
            result["transactionId"] = transactionId
        }
        if let signedTransactionInfo = snapshot.signedTransactionInfo {
            result["signedTransactionInfo"] = signedTransactionInfo
        }
        return result
    }
}
