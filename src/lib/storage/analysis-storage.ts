"use client";

import { appConfig } from "@/lib/constants/app";
import type { AnalysisResult } from "@/lib/analysis/types";
import { recordProductEvent } from "@/lib/analytics/productEvents";
import { createAnalysisHistoryId, upsertAnalysisHistory } from "@/lib/storage/analysis-history-storage";

const checklistStorageKey = `${appConfig.storageKey}:checklist`;
const findingFilterStorageKey = `${appConfig.storageKey}:finding-filter`;
const validFindingFilters = ["all", "high", "medium", "low"] as const;

export type StoredFindingFilter = (typeof validFindingFilters)[number];

export function saveAnalysis(result: AnalysisResult): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(appConfig.storageKey, JSON.stringify(result));
  sessionStorage.removeItem(checklistStorageKey);
  sessionStorage.removeItem(findingFilterStorageKey);
  upsertAnalysisHistory({ id: createAnalysisHistoryId(), result });
  recordProductEvent("analysis_created", {
    scoreBand: Math.floor(result.totalScore / 10) * 10,
    riskLabel: result.riskLabel,
    findingCount: result.findings.length,
    highFindingCount: result.findings.filter((finding) => finding.severity === "high").length,
    completenessPercent: result.completeness.percentage,
  });
}

/** Loads a past analysis from device history into the current session slot, so /sonuc can render it. */
export function openAnalysisFromHistory(result: AnalysisResult): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(appConfig.storageKey, JSON.stringify(result));
  sessionStorage.removeItem(checklistStorageKey);
  sessionStorage.removeItem(findingFilterStorageKey);
}

export function loadAnalysis(): AnalysisResult | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(appConfig.storageKey);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as AnalysisResult;
    // Reports saved before knownIssues (chronic-issues) shipped lack the field entirely;
    // default it so reopening an older history entry doesn't crash the report page.
    if (!Array.isArray(parsed.knownIssues)) parsed.knownIssues = [];
    return parsed;
  } catch {
    sessionStorage.removeItem(appConfig.storageKey);
    return null;
  }
}

export function clearAnalysis(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(appConfig.storageKey);
  sessionStorage.removeItem(checklistStorageKey);
  sessionStorage.removeItem(findingFilterStorageKey);
}

export function saveChecklist(items: string[]): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(checklistStorageKey, JSON.stringify(items));
}

export function loadChecklist(validItems: string[]): string[] {
  if (typeof window === "undefined") return [];
  const raw = sessionStorage.getItem(checklistStorageKey);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const valid = new Set(validItems);
    return parsed.filter((item): item is string => typeof item === "string" && valid.has(item));
  } catch {
    sessionStorage.removeItem(checklistStorageKey);
    return [];
  }
}

export function saveFindingFilter(filter: StoredFindingFilter): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(findingFilterStorageKey, filter);
}

export function loadFindingFilter(): StoredFindingFilter {
  if (typeof window === "undefined") return "all";
  const raw = sessionStorage.getItem(findingFilterStorageKey);
  if (!raw) return "all";
  if (validFindingFilters.includes(raw as StoredFindingFilter)) return raw as StoredFindingFilter;
  sessionStorage.removeItem(findingFilterStorageKey);
  return "all";
}
