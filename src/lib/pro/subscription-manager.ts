"use client";

import { Capacitor } from "@capacitor/core";
import {
  EksperIQEntitlementPlugin,
  type NativeProductInfo,
} from "./native-entitlement-plugin";
import type { EksperIqPaidPlanId } from "./pricing";

/**
 * StoreKit 2 subscription status values (Apple's model): a real purchase can
 * be in any of these states, not just "on"/"off". See
 * docs/ios-storekit-integration.md for the full integration plan. Canonical
 * home for this type and the product ids below — entitlement.ts re-exports
 * them for backward compatibility, keeping the dependency one-directional
 * (entitlement.ts depends on subscription-manager.ts, never the reverse).
 */
export type EntitlementState = "free" | "pro" | "expired" | "billingRetry" | "gracePeriod" | "revoked" | "unknown";

/** App Store Connect subscription product ids — must match exactly what's created there. */
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

export type SubscriptionTier = "free" | EksperIqPaidPlanId;

export type SubscriptionSnapshot = {
  tier: SubscriptionTier;
  state: EntitlementState;
  expiresAt?: string;
  checkedAt: string;
};

const ACTIVE_STATES: ReadonlySet<EntitlementState> = new Set(["pro", "gracePeriod"]);

/** Same priority order entitlement.ts has always used for isPro() — kept identical so behavior doesn't change. */
const STATE_PRIORITY: EntitlementState[] = [
  "pro",
  "gracePeriod",
  "billingRetry",
  "revoked",
  "expired",
  "unknown",
  "free",
];

const PRODUCT_TIER: Record<string, EksperIqPaidPlanId> = {
  [PRO_MONTHLY_PRODUCT_ID]: "pro",
  [PRO_YEARLY_PRODUCT_ID]: "pro",
  [PRO_PLUS_MONTHLY_PRODUCT_ID]: "proPlus",
  [PRO_PLUS_YEARLY_PRODUCT_ID]: "proPlus",
};

/** Pro+ outranks Pro when both are (unexpectedly) simultaneously reported active. */
function tierRank(productId: string): number {
  return PRODUCT_TIER[productId] === "proPlus" ? 1 : 0;
}

let productsCache: NativeProductInfo[] | null = null;
let productsCachePromise: Promise<NativeProductInfo[]> | null = null;

type EntitlementSnapshotByProduct = { productId: string; state: EntitlementState; expiresAt?: string };

/**
 * Single source of truth for every StoreKit-related read/write the app
 * needs: the real localized product catalog, the combined entitlement +
 * tier snapshot, purchasing, and restoring. Previously this logic was
 * duplicated across entitlement.ts (state only, no tier) and tier.ts
 * (tier only, via its own separate native calls) — each re-fetching from
 * the native plugin independently. entitlement.ts and tier.ts now delegate
 * here; their existing exported function signatures are unchanged so no
 * other call site in the app needs to change.
 */
export const SubscriptionManager = {
  /**
   * Real, localized App Store product catalog (name, price, billing
   * period) via Product.products(for:) — never a hard-coded price. Cached
   * after the first successful native fetch for the lifetime of the page;
   * pass forceRefresh to bypass the cache (e.g. a manual retry after a
   * failed load).
   */
  async getProducts(options: { forceRefresh?: boolean } = {}): Promise<NativeProductInfo[]> {
    if (!Capacitor.isNativePlatform()) return [];
    if (productsCache && !options.forceRefresh) return productsCache;
    if (productsCachePromise && !options.forceRefresh) return productsCachePromise;

    productsCachePromise = EksperIQEntitlementPlugin.fetchProducts({ productIds: ALL_PRODUCT_IDS })
      .then((result) => {
        productsCache = result.products;
        return result.products;
      })
      .catch(() => {
        productsCache = null;
        return [];
      })
      .finally(() => {
        productsCachePromise = null;
      });
    return productsCachePromise;
  },

  /** Drops the cached product catalog — call after a purchase in case pricing/eligibility changed. */
  clearProductsCache(): void {
    productsCache = null;
    productsCachePromise = null;
  },

  /** Per-product entitlement, each read directly from StoreKit (never cached — always a fresh on-device read). */
  async getEntitlementSnapshots(): Promise<EntitlementSnapshotByProduct[]> {
    if (!Capacitor.isNativePlatform()) {
      return ALL_PRODUCT_IDS.map((productId) => ({ productId, state: "free" as EntitlementState }));
    }
    return Promise.all(
      ALL_PRODUCT_IDS.map((productId) =>
        EksperIQEntitlementPlugin.currentEntitlement({ productId })
          .catch(() => ({ state: "unknown" as EntitlementState, expiresAt: undefined as string | undefined }))
          .then((result) => ({ productId, state: result.state, expiresAt: result.expiresAt })),
      ),
    );
  },

  /**
   * The one combined read the rest of the app should use: overall
   * entitlement state (for isPro()) and which paid tier it belongs to (for
   * feature limits) in a single pass over the same underlying StoreKit
   * reads — instead of two separate scans of ALL_PRODUCT_IDS.
   */
  async getSnapshot(): Promise<SubscriptionSnapshot> {
    const checkedAt = new Date().toISOString();
    if (!Capacitor.isNativePlatform()) {
      return { tier: "free", state: "free", checkedAt };
    }
    try {
      const snapshots = await SubscriptionManager.getEntitlementSnapshots();
      for (const wanted of STATE_PRIORITY) {
        const matches = snapshots.filter((snapshot) => snapshot.state === wanted);
        if (matches.length === 0) continue;
        const best = [...matches].sort((a, b) => tierRank(b.productId) - tierRank(a.productId))[0];
        const tier: SubscriptionTier = ACTIVE_STATES.has(wanted) ? (PRODUCT_TIER[best.productId] ?? "free") : "free";
        return { tier, state: wanted, expiresAt: best.expiresAt, checkedAt };
      }
      return { tier: "free", state: "free", checkedAt };
    } catch {
      return { tier: "free", state: "unknown", checkedAt };
    }
  },

  /**
   * Starts a real StoreKit 2 purchase. Throws on web; callers must catch
   * and show a friendly message, never assume success. Clears the product
   * cache on any completed (non-cancelled) result since eligibility to
   * purchase again (e.g. cross/downgrade) can change.
   */
  async purchase(productId: string): Promise<SubscriptionSnapshot & { cancelled?: boolean }> {
    if (!Capacitor.isNativePlatform()) {
      throw new Error("Satın alma yalnızca mağaza sürümünde kullanılabilir.");
    }
    const result = await EksperIQEntitlementPlugin.purchase({ productId });
    if (!result.cancelled) {
      SubscriptionManager.clearProductsCache();
    }
    const tier: SubscriptionTier = ACTIVE_STATES.has(result.state) ? (PRODUCT_TIER[productId] ?? "free") : "free";
    return {
      tier,
      state: result.state,
      expiresAt: result.expiresAt,
      checkedAt: new Date().toISOString(),
      cancelled: result.cancelled,
    };
  },

  /** Restores previous purchases via StoreKit 2's AppStore.sync(). No-op on web. */
  async restore(): Promise<{ restored: boolean }> {
    if (!Capacitor.isNativePlatform()) {
      return { restored: false };
    }
    return EksperIQEntitlementPlugin.restore();
  },
};
