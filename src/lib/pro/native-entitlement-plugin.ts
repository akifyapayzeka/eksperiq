"use client";

import { registerPlugin } from "@capacitor/core";
import type { EntitlementState } from "./entitlement";

export type NativeEntitlementResult = {
  state: EntitlementState;
  expiresAt?: string;
  transactionId?: string;
  /**
   * The compact JWS StoreKit gave the device for this transaction
   * (VerificationResult.jwsRepresentation) — forwarded to the server when a
   * short-lived, server-confirmed entitlement token is needed (see
   * docs/ios-storekit-integration.md, api/iap/entitlement.js).
   */
  signedTransactionInfo?: string;
};

export type NativePurchaseResult = NativeEntitlementResult & { cancelled?: boolean };

/**
 * A real, localized App Store Connect product — always sourced from
 * `Product.products(for:)` on-device (see EksperIQEntitlementStore.swift's
 * `products(for:)`). `displayPrice` is pre-formatted by StoreKit for the
 * user's own storefront/currency; never construct a price string manually
 * from this.
 */
export type NativeProductInfo = {
  productId: string;
  displayName: string;
  displayPrice: string;
  periodUnit?: "day" | "week" | "month" | "year" | "unknown";
  periodValue?: number;
};

export interface EksperIQEntitlementPluginInterface {
  currentEntitlement(options: { productId: string }): Promise<NativeEntitlementResult>;
  purchase(options: { productId: string }): Promise<NativePurchaseResult>;
  restore(): Promise<{ restored: boolean }>;
  fetchProducts(options: { productIds: string[] }): Promise<{ products: NativeProductInfo[] }>;
}

/**
 * Bridges to ios/App/App/Plugins/EksperIQEntitlementPlugin.swift. There is
 * no web implementation — this must only ever be called behind
 * Capacitor.isNativePlatform() (see nativeStoreKitEntitlementProvider in
 * entitlement.ts). Calling it before the Swift plugin has actually been
 * compiled into an Xcode build throws a "not implemented" rejection, which
 * callers here treat as an unknown/unavailable entitlement, never as "pro".
 */
export const EksperIQEntitlementPlugin = registerPlugin<EksperIQEntitlementPluginInterface>("EksperIQEntitlement");
