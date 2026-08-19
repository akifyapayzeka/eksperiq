"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Camera, ScanSearch, ShoppingCart } from "lucide-react";
import { AnalysisForm } from "@/components/forms/analysis-form";
import { AppShell } from "@/components/layout/app-shell";
import { HeroCard } from "@/components/cards/hero-card";
import { PaywallPlansScreen } from "@/components/paywall/paywall-plans";
import { resolveSubscriptionTier } from "@/lib/pro/tier";
import { hasListingAnalysisQuotaRemaining } from "@/lib/pro/listing-quota";

type AnalysisIntent = "choice" | "purchase" | "quota-exceeded";

export default function AnalysisPage() {
  const [intent, setIntent] = useState<AnalysisIntent>("choice");

  async function startPurchaseFlow() {
    const tier = await resolveSubscriptionTier();
    setIntent(hasListingAnalysisQuotaRemaining(tier) ? "purchase" : "quota-exceeded");
  }

  if (intent === "quota-exceeded") {
    return (
      <AppShell>
        <div className="flex justify-center pt-6">
          <PaywallPlansScreen
            headline="Ücretsiz ilan analizi hakkınız bitti"
            description="İlan linkiyle analize devam etmek için Pro veya Pro+'a geçin. Aracınızın bakım ve vergi takibini, fotoğraf hasar kontrolünü ücretsiz kullanmaya devam edebilirsiniz."
            dismissLabel="Geri dön"
            onDismiss={() => setIntent("choice")}
          />
        </div>
      </AppShell>
    );
  }

  if (intent === "choice") {
    return (
      <AppShell>
        <div className="pt-6">
          <HeroCard
            icon={ScanSearch}
            title="Yeni analiz oluştur"
            description="Ne yapmak istiyorsunuz?"
            tone="accent"
          />
        </div>
        <div className="mt-5 grid gap-4">
          <button
            type="button"
            onClick={() => void startPurchaseFlow()}
            className="flex items-start gap-4 rounded-theme border border-border bg-card p-5 text-left shadow-sm transition hover:border-accent"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
              <ShoppingCart aria-hidden="true" className="h-6 w-6" strokeWidth={1.8} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-heading text-base font-bold text-foreground">Araç satın alacağım</span>
              <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                İlgilendiğiniz bir ilanı analiz edin — ilan linkini yapıştırın veya bilgileri kendiniz girin.
              </span>
            </span>
            <ArrowUpRight aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" />
          </button>

          <Link
            href="/fotograf-hasar"
            className="flex items-start gap-4 rounded-theme border border-border bg-card p-5 text-left shadow-sm transition hover:border-accent"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
              <Camera aria-hidden="true" className="h-6 w-6" strokeWidth={1.8} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-heading text-base font-bold text-foreground">Kendi aracımı analiz edeceğim</span>
              <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                Aracınızın fotoğraflarını yükleyin, çizik/göçük gibi olası hasarları işaretleyelim.
              </span>
            </span>
            <ArrowUpRight aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" />
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="pt-6">
        <HeroCard
          icon={ShoppingCart}
          title="Araç satın alacağım"
          description="Almak istediğiniz araç için bilgileri seçin veya yazın. Eksik alanlar raporda satıcıdan istenecek bilgiler olarak değerlendirilir."
          tone="accent"
        />
      </div>
      <div className="mt-5">
        <AnalysisForm />
      </div>
    </AppShell>
  );
}
