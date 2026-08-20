"use client";

import { useState } from "react";
import { Check, Clock, RotateCcw, Sparkles } from "lucide-react";
import { EKSPERIQ_PLAN_PRICING, formatTry, type EksperIqPlanPricing } from "@/lib/pro/pricing";
import { formatListingAnalysisLimit } from "@/lib/pro/listing-quota";
import { purchasePlan, restorePurchases } from "@/lib/pro/entitlement";
import { Spinner } from "@/components/ui/spinner";

const isStoreKitPurchasesEnabled = process.env.NEXT_PUBLIC_STOREKIT_PURCHASES_ENABLED === "true";

export function PaywallPlansScreen({
  headline,
  description,
  dismissLabel,
  onDismiss,
}: {
  headline: string;
  description: string;
  dismissLabel?: string;
  onDismiss?: () => void;
}) {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [purchaseMessage, setPurchaseMessage] = useState<string | null>(null);
  const [purchasingPlanId, setPurchasingPlanId] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  const plans = Object.values(EKSPERIQ_PLAN_PRICING);

  async function handlePlanCta(plan: EksperIqPlanPricing) {
    if (purchasingPlanId) return;
    const productId = billing === "monthly" ? plan.monthlyProductId : plan.yearlyProductId;
    setPurchasingPlanId(plan.id);
    setPurchaseMessage(null);
    try {
      const result = await purchasePlan(productId);
      if (result.cancelled) {
        // User backed out of Apple's own sheet — not an error, say nothing.
        return;
      }
      if (result.state === "pro" || result.state === "gracePeriod") {
        onDismiss?.();
        return;
      }
      if (result.state === "unknown") {
        // Apple returned .pending (e.g. "Ask to Buy") — genuinely in progress.
        setPurchaseMessage("Satın alma onay bekliyor. Onaylandığında otomatik olarak aktif olacak.");
        return;
      }
      setPurchaseMessage("Satın alma tamamlanamadı. Lütfen tekrar deneyin.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      setPurchaseMessage(
        message.includes("bulunamadı") || message.toLowerCase().includes("not found")
          ? "Bu paket App Store'da henüz aktif değil. Kısa süre içinde açılacak."
          : "Satın alma şu anda tamamlanamadı. Lütfen birazdan tekrar deneyin.",
      );
    } finally {
      setPurchasingPlanId(null);
    }
  }

  async function handleRestore() {
    if (isRestoring) return;
    setIsRestoring(true);
    setPurchaseMessage(null);
    try {
      await restorePurchases();
      setPurchaseMessage("Önceki satın almalar kontrol edildi. Aktif bir aboneliğiniz varsa otomatik tanınacaktır.");
    } catch {
      setPurchaseMessage("Satın almalar şu anda geri yüklenemedi. Lütfen birazdan tekrar deneyin.");
    } finally {
      setIsRestoring(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-5 flex flex-col items-center gap-2 text-center">
        <Sparkles aria-hidden="true" className="h-9 w-9 text-accent" />
        <h1 className="font-heading text-2xl font-bold text-foreground">{headline}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="mb-4 flex justify-center gap-1 rounded-full border border-border bg-muted p-1">
        <button
          type="button"
          onClick={() => setBilling("monthly")}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${billing === "monthly" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
        >
          Aylık
        </button>
        <button
          type="button"
          onClick={() => setBilling("yearly")}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${billing === "yearly" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
        >
          Yıllık (indirimli)
        </button>
      </div>

      <div className="grid gap-3">
        {plans.map((plan) => (
          <div key={plan.id} className="rounded-theme border border-border bg-card p-4 shadow-sm">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="font-heading font-bold text-foreground">{plan.name}</h2>
              <p className="text-lg font-bold text-foreground">
                {formatTry(billing === "monthly" ? plan.monthlyPriceTry : plan.yearlyPriceTry)}
                <span className="text-xs font-medium text-muted-foreground">
                  {billing === "monthly" ? "/ay" : "/yıl"}
                </span>
              </p>
            </div>
            <p className="mt-2 flex items-center gap-2 text-sm text-foreground/90">
              <Check aria-hidden="true" className="h-4 w-4 shrink-0 text-success" />
              {formatListingAnalysisLimit(plan.id)} ilan linki analizi
            </p>
            <p className="mt-1 flex items-center gap-2 text-sm text-foreground/90">
              <Check aria-hidden="true" className="h-4 w-4 shrink-0 text-success" />
              Garajınıza daha fazla araç ekleme imkanı
            </p>
            <p className="mt-1 flex items-center gap-2 text-sm text-foreground/90">
              <Check aria-hidden="true" className="h-4 w-4 shrink-0 text-success" />
              Fotoğraf analizi tüm planlarda ücretsiz
            </p>
            <button
              type="button"
              onClick={() => handlePlanCta(plan)}
              disabled={!isStoreKitPurchasesEnabled || purchasingPlanId !== null}
              className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
            >
              {purchasingPlanId === plan.id ? <Spinner /> : null}
              {!isStoreKitPurchasesEnabled ? (
                <>
                  <Clock aria-hidden="true" className="h-4 w-4" />
                  App Store onayı bekleniyor
                </>
              ) : purchasingPlanId === plan.id ? (
                "İşleniyor..."
              ) : (
                `${plan.name}'a geç`
              )}
            </button>
          </div>
        ))}
      </div>

      {!isStoreKitPurchasesEnabled ? (
        <p className="mt-3 rounded-theme-sm border border-warning/30 bg-warning/10 px-3 py-2 text-center text-sm font-medium text-foreground">
          Pro abonelikleri App Store Connect ürünleri ve gerçek cihaz satın alma testi tamamlandıktan sonra açılacak.
          Ücretsiz akışları kullanmaya devam edebilirsiniz.
        </p>
      ) : null}

      {purchaseMessage ? <p className="mt-3 text-center text-sm text-foreground">{purchaseMessage}</p> : null}

      {isStoreKitPurchasesEnabled ? (
        <button
          type="button"
          onClick={handleRestore}
          disabled={isRestoring}
          className="mt-4 flex w-full items-center justify-center gap-1.5 text-sm font-semibold text-muted-foreground underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isRestoring ? <Spinner /> : <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />}
          Satın almaları geri yükle
        </button>
      ) : null}

      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="mt-2 w-full text-center text-sm font-semibold text-muted-foreground underline-offset-4 hover:underline"
        >
          {dismissLabel}
        </button>
      ) : null}
    </div>
  );
}
