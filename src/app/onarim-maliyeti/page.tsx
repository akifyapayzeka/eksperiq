"use client";

import { useMemo, useState } from "react";
import { Calculator } from "lucide-react";
import { HeroCard } from "@/components/cards/hero-card";
import { AppShell } from "@/components/layout/app-shell";

const repairBase = {
  "Tampon boya": [3500, 9000],
  "Göçük düzeltme": [2500, 12000],
  "Far değişimi": [6000, 35000],
  "Cam değişimi": [4000, 18000],
  "Jant tamiri": [1500, 8000],
  "Kapı boya": [5000, 15000],
  "Pasta cila": [2500, 10000],
} as const;

const serviceFactors = {
  "Özel servis": 1,
  "Yetkili servis": 1.7,
  "Usta/kaporta atölyesi": 0.85,
} as const;

export default function RepairCostPage() {
  const [repair, setRepair] = useState<keyof typeof repairBase>("Tampon boya");
  const [service, setService] = useState<keyof typeof serviceFactors>("Özel servis");

  const range = useMemo(() => {
    const [low, high] = repairBase[repair];
    const factor = serviceFactors[service];
    return [Math.round(low * factor), Math.round(high * factor)];
  }, [repair, service]);

  return (
    <AppShell>
      <div className="max-w-3xl pt-6">
        <HeroCard
          icon={Calculator}
          eyebrow="Tahmini Onarım Maliyeti"
          title="Hasar kalemi için yaklaşık maliyet aralığı"
          description="Net fiyat vermez; şehir, parça, servis ve boya kalitesine göre değişir."
        />
        <section className="mt-5 rounded-theme border border-border bg-card p-5 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-foreground/90">
              İşlem
              <select
                value={repair}
                onChange={(event) => setRepair(event.target.value as keyof typeof repairBase)}
                className="min-h-12 rounded-theme-sm border border-border px-3"
              >
                {Object.keys(repairBase).map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium text-foreground/90">
              Servis tipi
              <select
                value={service}
                onChange={(event) => setService(event.target.value as keyof typeof serviceFactors)}
                className="min-h-12 rounded-theme-sm border border-border px-3"
              >
                {Object.keys(serviceFactors).map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
          </div>
        </section>
        <section className="mt-5 rounded-theme border border-accent/20 bg-accent/10 p-5 text-foreground">
          <h2 className="text-xl font-semibold">Yaklaşık aralık</h2>
          <p className="mt-3 text-3xl font-semibold">
            {range[0].toLocaleString("tr-TR")} - {range[1].toLocaleString("tr-TR")} TL
          </p>
          <p className="mt-3 text-sm leading-6">
            EksperIQ bu aralığı karar desteği için gösterir; teklif veya ekspertiz değeri değildir.
          </p>
        </section>
      </div>
    </AppShell>
  );
}
