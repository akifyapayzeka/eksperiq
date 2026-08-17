"use client";

import { useMemo, useState } from "react";
import { Calculator } from "lucide-react";

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

/**
 * Önceden ayrı bir "/onarim-maliyeti" modülüydü; her zaman Fotoğraftan Hasar
 * Analizi bulgularına bağımlı olduğu için ayrı bir üst düzey modül olmayı
 * hak etmiyordu — artık o sayfanın bir bölümü.
 */
export function RepairCostEstimator() {
  const [repair, setRepair] = useState<keyof typeof repairBase>("Tampon boya");
  const [service, setService] = useState<keyof typeof serviceFactors>("Özel servis");

  const range = useMemo(() => {
    const [low, high] = repairBase[repair];
    const factor = serviceFactors[service];
    return [Math.round(low * factor), Math.round(high * factor)];
  }, [repair, service]);

  return (
    <section className="mt-5 rounded-theme border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <Calculator aria-hidden="true" className="h-5 w-5 text-accent" />
        <h2 className="text-xl font-semibold text-foreground">Tahmini onarım maliyeti</h2>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Yukarıdaki bulgulardan birini seçip yaklaşık maliyet aralığını görün. Net fiyat vermez; şehir, parça, servis
        ve boya kalitesine göre değişir.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
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
      <div className="mt-4 rounded-theme-sm border border-accent/20 bg-accent/10 p-4 text-foreground">
        <p className="text-sm font-medium">Yaklaşık aralık</p>
        <p className="mt-1 text-2xl font-semibold">
          {range[0].toLocaleString("tr-TR")} - {range[1].toLocaleString("tr-TR")} TL
        </p>
      </div>
    </section>
  );
}
