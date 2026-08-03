"use client";

import { appConfig } from "@/lib/constants/app";
import type { AnalysisResult } from "@/lib/analysis/types";

const MAX_RECORDS = 50;

export type AnalysisHistoryRecord = {
  id: string;
  result: AnalysisResult;
};

function isAnalysisHistoryRecord(value: unknown): value is AnalysisHistoryRecord {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  if (typeof record.id !== "string" || typeof record.result !== "object" || record.result === null) return false;
  const result = record.result as Record<string, unknown>;
  return (
    typeof result.totalScore === "number" &&
    typeof result.riskLabel === "string" &&
    typeof result.generatedAt === "string" &&
    Array.isArray(result.findings)
  );
}

function readRaw(): AnalysisHistoryRecord[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(appConfig.analysisHistoryStorageKey);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isAnalysisHistoryRecord);
  } catch {
    window.localStorage.removeItem(appConfig.analysisHistoryStorageKey);
    return [];
  }
}

function writeRaw(records: AnalysisHistoryRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(appConfig.analysisHistoryStorageKey, JSON.stringify(records));
  } catch {
    // Storage unavailable or quota exceeded; give up rather than crash the page.
  }
}

export function loadAnalysisHistory(): AnalysisHistoryRecord[] {
  return readRaw();
}

export function getAnalysisHistoryRecord(id: string): AnalysisHistoryRecord | null {
  return readRaw().find((record) => record.id === id) ?? null;
}

export function upsertAnalysisHistory(record: AnalysisHistoryRecord): AnalysisHistoryRecord[] {
  const current = readRaw();
  const next = [record, ...current.filter((item) => item.id !== record.id)].slice(0, MAX_RECORDS);
  writeRaw(next);
  return next;
}

export function deleteAnalysisHistory(id: string): AnalysisHistoryRecord[] {
  const next = readRaw().filter((item) => item.id !== id);
  writeRaw(next);
  return next;
}

export function createAnalysisHistoryId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `analysis-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
