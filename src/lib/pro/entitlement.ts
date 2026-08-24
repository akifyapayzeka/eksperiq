"use client";

import { SubscriptionManager, PRO_MONTHLY_PRODUCT_ID, type EntitlementState } from "./subscription-manager";

// Re-exported for backward compatibility — subscription-manager.ts is now
// the canonical source (entitlement.ts depends on it, not the other way
// around, so there's no import cycle between the two).
export {
  PRO_MONTHLY_PRODUCT_ID,
  PRO_YEARLY_PRODUCT_ID,
  PRO_PLUS_MONTHLY_PRODUCT_ID,
  PRO_PLUS_YEARLY_PRODUCT_ID,
  ALL_PRODUCT_IDS,
  type EntitlementState,
} from "./subscription-manager";

export type EntitlementSnapshot = {
  state: EntitlementState;
  /** ISO timestamp the current subscription period ends, when known. */
  expiresAt?: string;
  /** When this snapshot was produced. */
  checkedAt: string;
};

/**
 * Resolves the current entitlement asynchronously — never a synchronous
 * boolean. A real implementation reads this from StoreKit 2's
 * `Transaction.currentEntitlements` (verified on-device by Apple) and/or a
 * short-lived token issued by the server after validating an App Store
 * Server Notifications V2 payload.
 */
export interface EntitlementProvider {
  getEntitlement(): Promise<EntitlementSnapshot>;
}

/**
 * The active provider until real StoreKit 2 purchase/restore code is
 * written, compiled, and verified in Xcode: there is no purchase mechanism,
 * so every user is honestly "free" (never fake "pro" via localStorage or any
 * other client-only flag). This is the feature flag referenced in the
 * production-hardening plan — no UI may render a purchase/upgrade action
 * while this provider is active, since it would not do anything.
 */
export const unavailableEntitlementProvider: EntitlementProvider = {
  async getEntitlement(): Promise<EntitlementSnapshot> {
    return { state: "free", checkedAt: new Date().toISOString() };
  },
};

/**
 * Reads the real on-device StoreKit 2 entitlement via
 * SubscriptionManager (ios/App/App/Plugins/EksperIQEntitlementPlugin.swift
 * underneath). Written and wired up, but **not** the default provider
 * anywhere in the app yet — see docs/ios-storekit-integration.md for the
 * remaining Apple Developer account, App Store Connect product, and
 * Xcode-build steps required before this can safely replace
 * unavailableEntitlementProvider.
 */
export const nativeStoreKitEntitlementProvider: EntitlementProvider = {
  async getEntitlement(): Promise<EntitlementSnapshot> {
    const snapshot = await SubscriptionManager.getSnapshot();
    return { state: snapshot.state, expiresAt: snapshot.expiresAt, checkedAt: snapshot.checkedAt };
  },
};

/**
 * Starts a real StoreKit 2 purchase for the given App Store Connect product
 * id. Throws on web (no purchase mechanism there) and, until the manual
 * blockers in docs/ios-storekit-integration.md are resolved, also throws on
 * native (the plugin has no compiled implementation yet) — callers must
 * catch this and show a friendly "coming soon" message rather than crash,
 * and must not render a purchase button that assumes success until this has
 * been verified working on a real device.
 */
export async function purchasePlan(productId: string): Promise<EntitlementSnapshot & { cancelled?: boolean }> {
  const result = await SubscriptionManager.purchase(productId);
  return {
    state: result.state,
    expiresAt: result.expiresAt,
    checkedAt: result.checkedAt,
    cancelled: result.cancelled,
  };
}

/** @deprecated use purchasePlan(productId) — kept only if older callers still import this name. */
export async function purchasePro(): Promise<EntitlementSnapshot> {
  return purchasePlan(PRO_MONTHLY_PRODUCT_ID);
}

/** Restores previous purchases via StoreKit 2's AppStore.sync(). No-op on web. */
export async function restorePurchases(): Promise<{ restored: boolean }> {
  return SubscriptionManager.restore();
}

const PRO_STATES: ReadonlySet<EntitlementState> = new Set(["pro", "gracePeriod"]);

/**
 * Whether the current user has an active EksperIQ Pro entitlement. Always
 * resolves through a provider rather than reading a client-stored flag, so a
 * future real provider can be swapped in without callers changing.
 */
export async function isPro(provider: EntitlementProvider = unavailableEntitlementProvider): Promise<boolean> {
  const snapshot = await provider.getEntitlement();
  return PRO_STATES.has(snapshot.state);
}
