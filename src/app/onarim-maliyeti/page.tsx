import { Calculator } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { HeroCard } from "@/components/cards/hero-card";
import { RepairCostEstimator } from "@/components/repair-cost/repair-cost-estimator";

export default function RepairCostPage() {
  return (
    <AppShell>
      <div className="max-w-4xl pt-6">
        <HeroCard
          icon={Calculator}
          eyebrow="Masraf Tahmini"
          title="Almadan önce olası masrafı pazarlığa kat"
          description="Kaporta, boya, far, cam, lastik, akü, fren, triger, turbo, DPF/EGR ve şanzıman gibi kalemlerde yaklaşık aralık görün. Bu fiyat teklifi değildir; servis ve şehir farkı sonucu değiştirir."
          tone="accent"
        />
        <RepairCostEstimator />
      </div>
    </AppShell>
  );
}
