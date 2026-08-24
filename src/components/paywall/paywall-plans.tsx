"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Clock, ExternalLink, RotateCcw, Sparkles } from "lucide-react";
import { EKSPERIQ_PLAN_PRICING, type EksperIqPlanPricing } from "@/lib/pro/pricing";
import { formatListingAnalysisLimit } from "@/lib/pro/listing-quota";
import { purchasePlan, restorePurchases } from "@/lib/pro/entitlement";
import { SubscriptionManager } from "@/lib/pro/subscription-manager";
import type { NativeProductInfo } from "@/lib/pro/native-entitlement-plugin";
import { Spinner } from "@/components/ui/spinner";

const isStoreKitPurchasesEnabled = process.env.NEXT_PUBLIC_STOREKIT_PURCHASES_ENABLED === "true";

/** Apple's "Manage Subscriptions" universal link — works from any platform, no app scheme needed. */
const MANAGE_SUBSCRIPTIONS_URL = "https://apps.apple.com/account/subscriptions";

const PERIOD_LABEL: Record<string, string> = {
  day: "gün",
  week: "hafta",
  month: "ay",
  year: "yıl",
};

function findProduct(products: NativeProductInfo[], productId: string): NativeProductInfo | undefined {
  return products.find((product) => product.productId === productId);
}

/**
 * Renders a real App Store product's price, never a hard-coded estimate.
 * When the product hasn't loaded (still fetching, StoreKit unavailable, or
 * the product doesn't exist yet in App Store Connect), shows a neutral
 * placeholder instead of any number — never a guessed/fallback price.
 */
function PriceDisplay({ product, loading }: { product: NativeProductInfo | undefined; loading: boolean }) {
  if (product) {
    const periodLabel = product.periodUnit ? PERIOD_LABEL[product.periodUnit] : undefined;
    return (
      <p className="text-lg font-bold text-foreground">
        {product.displayPrice}
        {periodLabel ? <span className="text-xs font-medium text-muted-foreground">/{periodLabel}</span> : null}
      </p>
    );
  }
  return (
    <p className="text-lg font-bold text-muted-foreground">
      {loading ? <Spinner /> : "—"}
    </p>
  );
}

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
  const [products, setProducts] = useState<NativeProductInfo[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    SubscriptionManager.getProducts()
      .then((result) => {
        if (!cancelled) setProducts(result);
      })
      .finally(() => {
        if (!cancelled) setProductsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

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
        <div className="rounded-theme border border-dashed border-border bg-muted/40 p-4">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="font-heading font-bold text-foreground">Ücretsiz</h2>
            <p className="text-lg font-bold text-foreground">₺0</p>
          </div>
          <p className="mt-2 flex items-center gap-2 text-sm text-foreground/90">
            <Check aria-hidden="true" className="h-4 w-4 shrink-0 text-success" />
            {formatListingAnalysisLimit("free")} ilan linki analizi
          </p>
          <p className="mt-1 flex items-center gap-2 text-sm text-foreground/90">
            <Check aria-hidden="true" className="h-4 w-4 shrink-0 text-success" />
            Temel araç takibi
          </p>
        </div>

        {plans.map((plan) => {
          const productId = billing === "monthly" ? plan.monthlyProductId : plan.yearlyProductId;
          const product = findProduct(products, productId);
          return (
            <div key={plan.id} className="rounded-theme border border-border bg-card p-4 shadow-sm">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="font-heading font-bold text-foreground">{plan.name}</h2>
                <PriceDisplay product={product} loading={productsLoading} />
              </div>
              <p className="mt-2 flex items-center gap-2 text-sm text-foreground/90">
                <Check aria-hidden="true" className="h-4 w-4 shrink-0 text-success" />
                {formatListingAnalysisLimit(plan.id)} ilan linki analizi
              </p>
              <p className="mt-1 flex items-center gap-2 text-sm text-foreground/90">
                <Check aria-hidden="true" className="h-4 w-4 shrink-0 text-success" />
                Daha fazla araç takibi
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
          );
        })}
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

      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-xs text-muted-foreground">
        <Link href="/gizlilik" className="underline-offset-4 hover:underline">
          Gizlilik Politikası
        </Link>
        <span aria-hidden="true">·</span>
        <Link href="/kullanim-kosullari" className="underline-offset-4 hover:underline">
          Kullanım Koşulları
        </Link>
        <span aria-hidden="true">·</span>
        <a
          href={MANAGE_SUBSCRIPTIONS_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 underline-offset-4 hover:underline"
        >
          Abonelikleri Yönet
          <ExternalLink aria-hidden="true" className="h-3 w-3" />
        </a>
      </div>

      <p className="mt-2 text-center text-[11px] leading-relaxed text-muted-foreground">
        Abonelikler otomatik olarak yenilenir; mevcut dönem bitmeden en az 24 saat önce iptal edilmezse ücret App
        Store hesabınızdan tahsil edilir. İptal ve yönetim için &quot;Abonelikleri Yönet&quot; bağlantısını kullanın.
      </p>

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
