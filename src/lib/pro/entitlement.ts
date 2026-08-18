"use client";

import { Capacitor } from "@capacitor/core";
import { EksperIQEntitlementPlugin } from "./native-entitlement-plugin";

/**
 * StoreKit 2 subscription status values (Apple's model): a real purchase can
 * be in any of these states, not just "on"/"off". See
 * docs/ios-storekit-integration.md for the full integration plan and its
 * remaining Apple Developer/App Store Connect account and Xcode-build
 * manual blockers.
 */
export type EntitlementState = "free" | "pro" | "expired" | "billingRetry" | "gracePeriod" | "revoked" | "unknown";

/**
 * The App Store Connect subscription product id this app expects. Must
 * match exactly what's created in App Store Connect (see
 * docs/ios-storekit-integration.md) — that product does not exist yet, so
 * this id is a placeholder until it's created there.
 */
export const PRO_MONTHLY_PRODUCT_ID = "com.eksperiq.app.pro.monthly";
export const PRO_YEARLY_PRODUCT_ID = "com.eksperiq.app.pro.yearly";
export const PRO_PLUS_MONTHLY_PRODUCT_ID = "com.eksperiq.app.proplus.monthly";
export const PRO_PLUS_YEARLY_PRODUCT_ID = "com.eksperiq.app.proplus.yearly";

/** Every subscription product id this app can sell — checked as a group when resolving entitlement. */
export const ALL_PRODUCT_IDS = [
  PRO_MONTHLY_PRODUCT_ID,
  PRO_YEARLY_PRODUCT_ID,
  PRO_PLUS_MONTHLY_PRODUCT_ID,
  PRO_PLUS_YEARLY_PRODUCT_ID,
];

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
 * Reads the real on-device StoreKit 2 entitlement via the native plugin
 * (ios/App/App/Plugins/EksperIQEntitlementPlugin.swift). Written and wired
 * up, but **not** the default provider anywhere in the app yet — see
 * docs/ios-storekit-integration.md for the remaining Apple Developer
 * account, App Store Connect product, and Xcode-build steps required before
 * this can safely replace unavailableEntitlementProvider. Until then, the
 * Swift plugin has never been compiled into a real build, so any call here
 * would reject with "not implemented" — handled below by resolving to
 * "unknown" rather than ever claiming "pro" on a failure.
 */
// A user may hold any one of the four Pro/Pro+ x monthly/yearly products —
// StoreKit only reports status per product id, so every known id is checked
// and the first non-"free" result wins.
const ENTITLEMENT_STATE_PRIORITY: EntitlementState[] = [
  "pro",
  "gracePeriod",
  "billingRetry",
  "revoked",
  "expired",
  "unknown",
  "free",
];

function pickBestSnapshot(
  snapshots: Array<{ state: EntitlementState; expiresAt?: string }>,
): { state: EntitlementState; expiresAt?: string } {
  for (const wanted of ENTITLEMENT_STATE_PRIORITY) {
    const match = snapshots.find((snapshot) => snapshot.state === wanted);
    if (match) return match;
  }
  return { state: "free" };
}

export const nativeStoreKitEntitlementProvider: EntitlementProvider = {
  async getEntitlement(): Promise<EntitlementSnapshot> {
    if (!Capacitor.isNativePlatform()) {
      return { state: "free", checkedAt: new Date().toISOString() };
    }
    try {
      const results = await Promise.all(
        ALL_PRODUCT_IDS.map((productId) =>
          EksperIQEntitlementPlugin.currentEntitlement({ productId }).catch(
            () => ({ state: "unknown" as EntitlementState }),
          ),
        ),
      );
      const best = pickBestSnapshot(results);
      return { state: best.state, expiresAt: best.expiresAt, checkedAt: new Date().toISOString() };
    } catch {
      return { state: "unknown", checkedAt: new Date().toISOString() };
    }
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
  if (!Capacitor.isNativePlatform()) {
    throw new Error("Satın alma yalnızca mağaza sürümünde kullanılabilir.");
  }
  const result = await EksperIQEntitlementPlugin.purchase({ productId });
  return {
    state: result.state,
    expiresAt: result.expiresAt,
    checkedAt: new Date().toISOString(),
    cancelled: result.cancelled,
  };
}

/** @deprecated use purchasePlan(productId) — kept only if older callers still import this name. */
export async function purchasePro(): Promise<EntitlementSnapshot> {
  return purchasePlan(PRO_MONTHLY_PRODUCT_ID);
}

/** Restores previous purchases via StoreKit 2's AppStore.sync(). No-op on web. */
export async function restorePurchases(): Promise<{ restored: boolean }> {
  if (!Capacitor.isNativePlatform()) {
    return { restored: false };
  }
  return EksperIQEntitlementPlugin.restore();
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
