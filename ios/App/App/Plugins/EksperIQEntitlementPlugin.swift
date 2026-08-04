import Foundation
import Capacitor

// EksperIQEntitlementPlugin — the Capacitor bridge wrapping
// EksperIQEntitlementStore.swift's StoreKit 2 calls. Written for the
// production-hardening effort but, like the store actor it wraps, has
// NEVER been compiled or run: this repository has no Xcode/Swift
// toolchain. Before this can be trusted, see the checklist at the top of
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
        CAPPluginMethod(name: "restore", returnType: CAPPluginReturnPromise)
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
