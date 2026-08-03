"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GitCompareArrows, Trash2 } from "lucide-react";
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
    <main className="flex-1 bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-2xl bg-slate-900 p-6 text-white shadow-sm">
          <GitCompareArrows aria-hidden="true" className="h-9 w-9 text-teal-200" />
          <p className="mt-5 text-sm font-semibold text-teal-200">Karşılaştırmalı İlan Analizi</p>
          <h1 className="mt-2 text-3xl font-semibold">Birden fazla ilanı yan yana gör</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Sonuç sayfasındaki &quot;Karşılaştırmaya ekle&quot; butonuyla en fazla 3 analiz burada yan yana
            görüntülenir. Bu bir karşılaştırma özeti sunar; hangi ilanın alınacağına dair kesin karar vermez.
          </p>
        </section>

        {entries.length ? (
          <section className="mt-5 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <table className="w-full min-w-[560px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
                  <th className="p-4 font-semibold text-slate-600 dark:text-slate-400">Karşılaştırma</th>
                  {entries.map((entry) => (
                    <th key={entry.id} className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-slate-950 dark:text-white">{entry.label}</span>
                        <button
                          type="button"
                          onClick={() => removeEntry(entry.id)}
                          aria-label={`${entry.label} karşılaştırmadan kaldır`}
                          className="shrink-0 text-red-700 hover:underline"
                        >
                          <Trash2 aria-hidden="true" className="h-4 w-4" />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <td className="p-4 font-medium text-slate-600 dark:text-slate-400">Risk skoru</td>
                  {entries.map((entry) => (
                    <td key={entry.id} className="p-4 font-semibold text-slate-950 dark:text-white">
                      {entry.result.totalScore}/100 · {entry.result.riskLabel}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-slate-100 bg-slate-50 dark:border-slate-800">
                  <td className="p-4 font-medium text-slate-600 dark:text-slate-400">Fiyat</td>
                  {entries.map((entry) => (
                    <td key={entry.id} className="p-4 text-slate-800 dark:text-slate-300">
                      {entry.result.input.price.toLocaleString("tr-TR")} TL
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <td className="p-4 font-medium text-slate-600 dark:text-slate-400">Kilometre</td>
                  {entries.map((entry) => (
                    <td key={entry.id} className="p-4 text-slate-800 dark:text-slate-300">
                      {entry.result.input.mileage.toLocaleString("tr-TR")} km
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-slate-100 bg-slate-50 dark:border-slate-800">
                  <td className="p-4 font-medium text-slate-600 dark:text-slate-400">Şehir</td>
                  {entries.map((entry) => (
                    <td key={entry.id} className="p-4 text-slate-800 dark:text-slate-300">
                      {entry.result.input.city || "Belirtilmedi"}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <td className="p-4 font-medium text-slate-600 dark:text-slate-400">Bulgular</td>
                  {entries.map((entry) => {
                    const counts = severityCounts(entry);
                    return (
                      <td key={entry.id} className="p-4 text-slate-800 dark:text-slate-300">
                        {(Object.keys(severityLabels) as Array<keyof typeof severityLabels>).map((key) => (
                          <span key={key} className="mr-2 inline-block">
                            {severityLabels[key]}: {counts[key]}
                          </span>
                        ))}
                      </td>
                    );
                  })}
                </tr>
                <tr className="border-b border-slate-100 bg-slate-50 dark:border-slate-800">
                  <td className="p-4 font-medium text-slate-600 dark:text-slate-400">Bilgi doluluğu</td>
                  {entries.map((entry) => (
                    <td key={entry.id} className="p-4 text-slate-800 dark:text-slate-300">
                      {entry.result.completeness.completed}/{entry.result.completeness.total}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-medium text-slate-600 dark:text-slate-400">Öncelikli bulgu</td>
                  {entries.map((entry) => (
                    <td key={entry.id} className="p-4 text-slate-800 dark:text-slate-300">
                      {entry.result.findings[0]?.title ?? "Öncelikli bulgu yok"}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </section>
        ) : (
          <section className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-800/50">
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
              Henüz karşılaştırmaya eklenmiş ilan yok. Bir analiz oluşturup sonuç sayfasından &quot;Karşılaştırmaya
              ekle&quot; butonunu kullanın.
            </p>
            <Link
              href="/analiz"
              className="mt-4 inline-flex min-h-11 items-center rounded-full bg-teal-700 px-4 text-sm font-semibold text-white"
            >
              Analiz başlat
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}
