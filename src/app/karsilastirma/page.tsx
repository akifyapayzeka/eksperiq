"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GitCompareArrows, Trash2 } from "lucide-react";
import { HeroCard } from "@/components/cards/hero-card";
import { AppShell } from "@/components/layout/app-shell";
import { loadComparisonEntries, removeFromComparison } from "@/lib/storage/comparison-storage";
import type { ComparisonEntry } from "@/lib/comparison/types";

const severityLabels = { high: "Yüksek", medium: "Orta", low: "Düşük" } as const;

function severityCounts(entry: ComparisonEntry) {
  return entry.result.findings.reduce(
    (counts, finding) => {
      counts[finding.severity] += 1;
      return counts;
    },
    { high: 0, medium: 0, low: 0 },
  );
}

export default function ComparisonPage() {
  const [entries, setEntries] = useState<ComparisonEntry[]>([]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setEntries(loadComparisonEntries()));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function removeEntry(id: string) {
    setEntries(removeFromComparison(id));
  }

  return (
    <AppShell>
      <div className="max-w-5xl pt-6">
        <HeroCard
          icon={GitCompareArrows}
          eyebrow="Karşılaştırmalı İlan Analizi"
          title="Birden fazla ilanı yan yana gör"
          description='Analizlerim ekranındaki "Karşılaştırmaya ekle" butonuyla en fazla 3 analiz burada yan yana
            görüntülenir. Bu bir karşılaştırma özeti sunar; hangi ilanın alınacağına dair kesin karar vermez.'
          tone="accent"
        />

        {entries.length ? (
          <section className="mt-5 overflow-x-auto rounded-theme border border-border bg-card shadow-sm">
            <table className="w-full min-w-[560px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted">
                  <th className="p-4 font-semibold text-muted-foreground">Karşılaştırma</th>
                  {entries.map((entry) => (
                    <th key={entry.id} className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-foreground">{entry.label}</span>
                        <button
                          type="button"
                          onClick={() => removeEntry(entry.id)}
                          aria-label={`${entry.label} karşılaştırmadan kaldır`}
                          className="shrink-0 text-destructive hover:underline"
                        >
                          <Trash2 aria-hidden="true" className="h-4 w-4" />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="p-4 font-medium text-muted-foreground">Risk skoru</td>
                  {entries.map((entry) => (
                    <td key={entry.id} className="p-4 font-semibold text-foreground">
                      {entry.result.totalScore}/100 · {entry.result.riskLabel}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border bg-muted">
                  <td className="p-4 font-medium text-muted-foreground">Fiyat</td>
                  {entries.map((entry) => (
                    <td key={entry.id} className="p-4 text-foreground/90">
                      {entry.result.input.price.toLocaleString("tr-TR")} TL
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border">
                  <td className="p-4 font-medium text-muted-foreground">Kilometre</td>
                  {entries.map((entry) => (
                    <td key={entry.id} className="p-4 text-foreground/90">
                      {entry.result.input.mileage.toLocaleString("tr-TR")} km
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border bg-muted">
                  <td className="p-4 font-medium text-muted-foreground">Şehir</td>
                  {entries.map((entry) => (
                    <td key={entry.id} className="p-4 text-foreground/90">
                      {entry.result.input.city || "Belirtilmedi"}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border">
                  <td className="p-4 font-medium text-muted-foreground">Bulgular</td>
                  {entries.map((entry) => {
                    const counts = severityCounts(entry);
                    return (
                      <td key={entry.id} className="p-4 text-foreground/90">
                        {(Object.keys(severityLabels) as Array<keyof typeof severityLabels>).map((key) => (
                          <span key={key} className="mr-2 inline-block">
                            {severityLabels[key]}: {counts[key]}
                          </span>
                        ))}
                      </td>
                    );
                  })}
                </tr>
                <tr className="border-b border-border bg-muted">
                  <td className="p-4 font-medium text-muted-foreground">Bilgi doluluğu</td>
                  {entries.map((entry) => (
                    <td key={entry.id} className="p-4 text-foreground/90">
                      {entry.result.completeness.completed}/{entry.result.completeness.total}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-medium text-muted-foreground">Öncelikli bulgu</td>
                  {entries.map((entry) => (
                    <td key={entry.id} className="p-4 text-foreground/90">
                      {entry.result.findings[0]?.title ?? "Öncelikli bulgu yok"}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </section>
        ) : (
          <section className="mt-5 rounded-theme border border-dashed border-border bg-muted p-8 text-center">
            <p className="text-sm leading-6 text-muted-foreground">
              Henüz karşılaştırmaya eklenmiş ilan yok. Analizlerim ekranından bir analizin &quot;Karşılaştırmaya
              ekle&quot; butonunu kullanın.
            </p>
            <Link
              href="/analizlerim"
              className="mt-4 inline-flex min-h-11 items-center rounded-full bg-accent px-4 text-sm font-semibold text-primary-foreground"
            >
              Analizlerim&apos;e git
            </Link>
          </section>
        )}
      </div>
    </AppShell>
  );
}
