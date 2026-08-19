"use client";

import { useSubscriptionTier } from "@/lib/pro/tier";
import { PaywallPlansScreen } from "@/components/paywall/paywall-plans";

/**
 * Always-visible Pro/Pro+ promo in the profile — shown whether the user is
 * logged in or not, and regardless of platform (StoreKit purchases only
 * work natively, but the pitch itself is worth showing everywhere). Hidden
 * only once someone is already on the top tier, since there's nothing left
 * to upsell.
 */
export function ProfilePlansPromoSection() {
  const tier = useSubscriptionTier();
  if (tier === "proPlus") return null;

  return (
    <section className="mt-4 flex justify-center rounded-theme border border-border bg-card p-5 shadow-sm">
      <PaywallPlansScreen
        headline={tier === "pro" ? "Pro+'a yükseltin" : "Pro ile daha güçlü analiz"}
        description="İlan analizlerinde çok daha yüksek limit ve garajınıza daha fazla araç ekleme imkanı için Pro veya Pro+'a geçin."
      />
    </section>
  );
}
