"use client";

import { useEffect, useState } from "react";
import { CheckSquare, ClipboardCheck } from "lucide-react";
import { loadAnalysis, loadChecklist, saveChecklist } from "@/lib/storage/analysis-storage";
import type { AnalysisResult } from "@/lib/analysis/types";
import { AppShell } from "@/components/layout/app-shell";
import { HeroCard } from "@/components/cards/hero-card";
import { PrimaryButton, SecondaryButton } from "@/components/ui/button";

const fallbackChecklist = [
  "Ruhsat sahibini doğruladım",
  "Tramer kaydını gördüm",
  "Kilometre geçmişini kontrol ettim",
  "Aracı soğuk çalıştırdım",
  "Bağımsız ekspertize götürdüm",
  "Şasi numarasını doğruladım",
  "Rehin ve haciz durumunu kontrol ettim",
  "Test sürüşü yaptım",
  "Satış sözleşmesini okudum",
  "Ödemeyi güvenli yöntemle yapacağım",
];

export default function ChecklistPage() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const checklist = analysis?.finalChecklist ?? fallbackChecklist;
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const current = loadAnalysis();
      const currentChecklist = current?.finalChecklist ?? fallbackChecklist;
      setAnalysis(current);
      setCheckedItems(new Set(loadChecklist(currentChecklist)));
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  function toggleItem(item: string) {
    setCheckedItems((current) => {
      const next = new Set(current);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      saveChecklist([...next]);
      return next;
    });
  }

  return (
    <AppShell>
      <div className="pt-6">
        <HeroCard
          icon={ClipboardCheck}
          title="Satın alma öncesi son kontroller"
          description="Bu liste karar desteği sağlar. Resmi kayıt sorgusu, servis kontrolü ve bağımsız ekspertizin yerine geçmez."
          tone="accent"
        />
      </div>

      <section className="mt-5 rounded-theme border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-heading text-lg font-bold text-foreground">
            Tamamlanan kontroller {checkedItems.size} / {checklist.length}
          </h2>
          <CheckSquare aria-hidden="true" className="h-5 w-5 text-accent" />
        </div>
        <div className="mt-5 grid gap-3">
          {checklist.map((item) => (
            <label
              key={item}
              className="flex min-h-14 cursor-pointer items-center gap-3 rounded-theme-sm border border-border bg-muted p-4 text-sm font-medium text-foreground/90"
            >
              <input
                type="checkbox"
                checked={checkedItems.has(item)}
                onChange={() => toggleItem(item)}
                className="h-5 w-5 rounded border-border accent-accent"
              />
              {item}
            </label>
          ))}
        </div>
      </section>

      <div className="mt-5 flex flex-wrap gap-3">
        <PrimaryButton href="/sonuc">Analiz raporuna dön</PrimaryButton>
        <SecondaryButton href="/test-surusu-kontrol">Test sürüşü kontrol listesini aç</SecondaryButton>
        <SecondaryButton href="/resmi-sorgu-rehberi">Resmi sorgu rehberini aç</SecondaryButton>
      </div>
    </AppShell>
  );
}
