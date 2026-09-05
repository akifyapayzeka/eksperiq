"use client";

import { appConfig } from "@/lib/constants/app";
import { recordProductEvent } from "@/lib/analytics/productEvents";
import { MAX_COMPARISON_ENTRIES } from "@/lib/comparison/types";
import type { ComparisonEntry } from "@/lib/comparison/types";
import type { AnalysisResult } from "@/lib/analysis/types";

function isComparisonEntry(value: unknown): value is ComparisonEntry {
  if (typeof value !== "object" || value === null) return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.id === "string" &&
    typeof entry.label === "string" &&
    typeof entry.addedAt === "string" &&
    typeof entry.result === "object" &&
    entry.result !== null
  );
}

function readRaw(): ComparisonEntry[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(appConfig.comparisonStorageKey);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isComparisonEntry);
  } catch {
    window.localStorage.removeItem(appConfig.comparisonStorageKey);
    return [];
  }
}

function writeRaw(entries: ComparisonEntry[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(appConfig.comparisonStorageKey, JSON.stringify(entries));
}

export function loadComparisonEntries(): ComparisonEntry[] {
  return readRaw();
}

export type AddComparisonResult = { ok: true } | { ok: false; reason: "full" | "duplicate" };

/**
 * Karşılaştırmanın amacı FARKLI ilanları yan yana koymak. Aynı analizi ikinci
 * kez eklemek (çift dokunuş, listeye dönüp tekrar basma) aynı aracı iki satır
 * yapıp üç kontenjandan birini daha yiyordu. `generatedAt` her analiz için
 * benzersiz olduğundan kimlik olarak onu kullanıyoruz.
 */
function isSameAnalysis(entry: ComparisonEntry, result: AnalysisResult): boolean {
  return entry.result.generatedAt === result.generatedAt;
}

export function addToComparison(result: AnalysisResult): AddComparisonResult {
  const current = readRaw();
  if (current.some((entry) => isSameAnalysis(entry, result))) return { ok: false, reason: "duplicate" };
  if (current.length >= MAX_COMPARISON_ENTRIES) return { ok: false, reason: "full" };

  const entry: ComparisonEntry = {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `comparison-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    label: `${result.input.year} ${result.input.brand} ${result.input.model}`.trim(),
    addedAt: new Date().toISOString(),
    result,
  };

  writeRaw([...current, entry]);
  recordProductEvent("comparison_entry_added", {
    entryCount: current.length + 1,
    scoreBand: Math.floor(result.totalScore / 10) * 10,
    riskLabel: result.riskLabel,
  });
  return { ok: true };
}

export function removeFromComparison(id: string): ComparisonEntry[] {
  const next = readRaw().filter((entry) => entry.id !== id);
  writeRaw(next);
  return next;
}

export function clearComparison(): void {
  writeRaw([]);
}
