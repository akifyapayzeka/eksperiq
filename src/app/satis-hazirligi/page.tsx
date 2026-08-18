"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { HeroCard } from "@/components/cards/hero-card";
import { AppShell } from "@/components/layout/app-shell";
import { loadSaleChecklist, saveSaleChecklist } from "@/lib/storage/sale-checklist-storage";

const saleChecklist = [
  "Son bakım faturalarını hazırla",
  "Muayene ve sigorta tarihlerini kontrol et",
  "Tramer detay belgesini hazırla",
  "Yedek anahtarı bul",
  "Lastik durumunu ve üretim tarihini not et",
  "İç/dış temizlik yaptır",
  "Gündüz ve temiz fonda fotoğraf çek",
  "Boyalı/değişen parçaları ilanda açık yaz",
  "Rehin/haciz durumunu kontrol et",
  "Satış sebebini kısa ve net hazırla",
];

export default function SmartSalePreparationPage() {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const userEditedRef = useRef(false);

  useEffect(() => {
    setChecked((current) => (userEditedRef.current ? current : new Set(loadSaleChecklist(saleChecklist))));
  }, []);

  function setItemChecked(item: string, isChecked: boolean) {
    userEditedRef.current = true;
    setChecked((current) => {
      const next = new Set(current);
      if (isChecked) next.add(item);
      else next.delete(item);
      saveSaleChecklist([...next]);
      return next;
    });
  }

  return (
    <AppShell>
      <div className="max-w-3xl pt-6">
        <HeroCard
          icon={Sparkles}
          eyebrow="Akıllı Satış Hazırlığı"
          title="İlana çıkmadan önce eksikleri kapat"
          description="Bu liste satış garantisi vermez; aracınızı daha şeffaf ve düzenli sunmanıza yardımcı olur."
          tone="accent"
        />
        <section className="mt-5 rounded-theme border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-foreground">Hazırlık listesi</h2>
            <span className="rounded-full bg-accent/10 px-3 py-1 text-sm font-semibold text-accent">
              {checked.size}/{saleChecklist.length}
            </span>
          </div>
          <div className="mt-4 grid gap-3">
            {saleChecklist.map((item) => (
              <label
                key={item}
                className="flex min-h-14 cursor-pointer items-center gap-3 rounded-theme-sm border border-border bg-muted p-4 text-sm font-medium text-foreground/90"
              >
                <input
                  type="checkbox"
                  checked={checked.has(item)}
                  onChange={(event) => setItemChecked(item, event.currentTarget.checked)}
                  className="h-5 w-5 accent-accent"
                />
                {item}
              </label>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
