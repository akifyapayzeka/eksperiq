"use client";

import { useEffect, useState } from "react";
import { SubscriptionManager, type SubscriptionTier } from "./subscription-manager";

export type { SubscriptionTier };

/**
 * Resolves which paid tier (if any) is active, distinguishing Pro from
 * Pro+ — unlike EntitlementState (see entitlement.ts), which only reports
 * "pro" for any active subscription regardless of which product it is.
 * Delegates to SubscriptionManager.getSnapshot(), the single place that
 * reads StoreKit; on web, or until the native purchase path is wired up,
 * this always resolves "free" (see unavailableEntitlementProvider in
 * entitlement.ts — the same "never fake an entitlement" rule applies here).
 */
export async function resolveSubscriptionTier(): Promise<SubscriptionTier> {
  const snapshot = await SubscriptionManager.getSnapshot();
  return snapshot.tier;
}

/** React hook wrapper around resolveSubscriptionTier() — starts at "free" while resolving. */
export function useSubscriptionTier(): SubscriptionTier {
  const [tier, setTier] = useState<SubscriptionTier>("free");

  useEffect(() => {
    let cancelled = false;
    void resolveSubscriptionTier().then((resolved) => {
      if (!cancelled) setTier(resolved);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return tier;
}
