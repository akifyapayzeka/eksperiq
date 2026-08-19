"use client";

import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { EksperIQEntitlementPlugin } from "./native-entitlement-plugin";
import { EKSPERIQ_PLAN_PRICING, type EksperIqPaidPlanId } from "./pricing";
import type { EntitlementState } from "./entitlement";

export type SubscriptionTier = "free" | EksperIqPaidPlanId;

const ACTIVE_STATES: ReadonlySet<EntitlementState> = new Set(["pro", "gracePeriod"]);

async function isPlanActive(planId: EksperIqPaidPlanId): Promise<boolean> {
  const plan = EKSPERIQ_PLAN_PRICING[planId];
  const results = await Promise.all(
    [plan.monthlyProductId, plan.yearlyProductId].map((productId) =>
      EksperIQEntitlementPlugin.currentEntitlement({ productId }).catch(
        () => ({ state: "unknown" as EntitlementState }),
      ),
    ),
  );
  return results.some((result) => ACTIVE_STATES.has(result.state));
}

/**
 * Resolves which paid tier (if any) is active, distinguishing Pro from
 * Pro+ — unlike EntitlementState (see entitlement.ts), which only reports
 * "pro" for any active subscription regardless of which product it is.
 * Always resolves through StoreKit rather than a client-stored flag; on
 * web, or until the native purchase path is wired up, this always
 * resolves "free" (see unavailableEntitlementProvider in entitlement.ts —
 * the same "never fake an entitlement" rule applies here).
 */
export async function resolveSubscriptionTier(): Promise<SubscriptionTier> {
  if (!Capacitor.isNativePlatform()) return "free";
  try {
    if (await isPlanActive("proPlus")) return "proPlus";
    if (await isPlanActive("pro")) return "pro";
    return "free";
  } catch {
    return "free";
  }
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
