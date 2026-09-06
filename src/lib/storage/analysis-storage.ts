"use client";

import { appConfig } from "@/lib/constants/app";
import type { AnalysisResult } from "@/lib/analysis/types";
import { recordProductEvent } from "@/lib/analytics/productEvents";
import { createAnalysisHistoryId, upsertAnalysisHistory } from "@/lib/storage/analysis-history-storage";

const checklistStorageKey = `${appConfig.storageKey}:checklist`;
const findingFilterStorageKey = `${appConfig.storageKey}:finding-filter`;
const validFindingFilters = ["all", "high", "medium", "low"] as const;

export type StoredFindingFilter = (typeof validFindingFilters)[number];

export type AnalysisSaveOutcome = {
  /** Analiz gerçekten yazıldıysa true — çağıran taraf buna bakmadan "kaydedildi" varsaymamalı. */
  stored: boolean;
  /** Kotaya sığdırmak için ilan fotoğrafları düşürüldüyse true. */
  droppedImages: boolean;
};

/** Fotoğraflar olmadan aynı analiz — kota dolduğunda raporun kendisini kurtarmak için. */
function withoutListingImages(result: AnalysisResult): AnalysisResult {
  return { ...result, listingImages: [], listingImageData: [] };
}

function writeSessionAnalysis(result: AnalysisResult): boolean {
  try {
    sessionStorage.setItem(appConfig.storageKey, JSON.stringify(result));
    return true;
  } catch {
    return false;
  }
}

/**
 * İlan içe aktarmada araç fotoğrafları base64 olarak analizin içinde
 * saklanıyor ve sessionStorage kotasını (~5 MB) gerçekten doldurabiliyor.
 * Eskiden bu yazım korumasızdı: kota dolduğunda saveAnalysis fırlatıyor,
 * çağıran akıştaki kota sayacı ve /sonuc yönlendirmesi hiç çalışmıyordu —
 * kullanıcı butona basıyor, hiçbir şey olmuyor, hata da görmüyordu. Artık
 * önce fotoğraflar düşürülerek rapor kurtarılmaya çalışılıyor ve sonuç
 * çağırana dürüstçe bildiriliyor.
 */
export function saveAnalysis(result: AnalysisResult): AnalysisSaveOutcome {
  if (typeof window === "undefined") return { stored: false, droppedImages: false };

  let stored = writeSessionAnalysis(result);
  let droppedImages = false;
  let persisted = result;

  if (!stored) {
    persisted = withoutListingImages(result);
    droppedImages = true;
    stored = writeSessionAnalysis(persisted);
  }

  if (!stored) return { stored: false, droppedImages: false };

  sessionStorage.removeItem(checklistStorageKey);
  sessionStorage.removeItem(findingFilterStorageKey);
  upsertAnalysisHistory({ id: createAnalysisHistoryId(), result: persisted });
  recordProductEvent("analysis_created", {
    scoreBand: Math.floor(result.totalScore / 10) * 10,
    riskLabel: result.riskLabel,
    findingCount: result.findings.length,
    highFindingCount: result.findings.filter((finding) => finding.severity === "high").length,
    completenessPercent: result.completeness.percentage,
  });

  return { stored: true, droppedImages };
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
