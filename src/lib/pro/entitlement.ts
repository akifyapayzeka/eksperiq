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
 * The default provider passed to isPro() below when the caller doesn't pass
 * one — honestly "free", never a fake "pro" via localStorage or any other
 * client-only flag. isPro() itself has no call sites in the app anymore
 * (superseded by SubscriptionManager.getSnapshot() / resolveSubscriptionTier()
 * in tier.ts, which do read the real on-device StoreKit entitlement); this
 * stays as a safe default for the standalone isPro() helper and its tests.
 */
export const unavailableEntitlementProvider: EntitlementProvider = {
  async getEntitlement(): Promise<EntitlementSnapshot> {
    return { state: "free", checkedAt: new Date().toISOString() };
  },
};

/**
 * Reads the real on-device StoreKit 2 entitlement via SubscriptionManager
 * (ios/App/App/Plugins/EksperIQEntitlementPlugin.swift underneath). Not
 * passed as isPro()'s default (see unavailableEntitlementProvider above),
 * but this is the same read tier.ts's resolveSubscriptionTier() and the
 * paywall UI actually use in production, gated behind the
 * NEXT_PUBLIC_STOREKIT_PURCHASES_ENABLED flag (see paywall-plans.tsx) until
 * App Store Connect products + a real-device purchase have been verified.
 */
export const nativeStoreKitEntitlementProvider: EntitlementProvider = {
  async getEntitlement(): Promise<EntitlementSnapshot> {
    const snapshot = await SubscriptionManager.getSnapshot();
    return { state: snapshot.state, expiresAt: snapshot.expiresAt, checkedAt: snapshot.checkedAt };
  },
};

/**
 * Starts a real StoreKit 2 purchase for the given App Store Connect product
 * id via SubscriptionManager.purchase(). Throws on web (no purchase
 * mechanism there) — callers must catch this and show a friendly message
 * rather than crash. On native this calls the real compiled Swift plugin;
 * the paywall UI still gates the purchase button behind
 * NEXT_PUBLIC_STOREKIT_PURCHASES_ENABLED until App Store Connect products
 * and a real-device purchase have been verified end to end.
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
