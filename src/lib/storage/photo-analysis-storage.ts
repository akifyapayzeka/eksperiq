"use client";

import { appConfig } from "@/lib/constants/app";
import type { PhotoAnalysisRecord } from "@/lib/photo-analysis/types";

const MAX_RECORDS = 20;

function isPhotoAnalysisRecord(value: unknown): value is PhotoAnalysisRecord {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.createdAt === "string" &&
    Array.isArray(record.thumbnails) &&
    Array.isArray(record.findings)
  );
}

function readRaw(): PhotoAnalysisRecord[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(appConfig.photoAnalysesStorageKey);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isPhotoAnalysisRecord);
  } catch {
    window.localStorage.removeItem(appConfig.photoAnalysesStorageKey);
    return [];
  }
}

function writeRaw(records: PhotoAnalysisRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(appConfig.photoAnalysesStorageKey, JSON.stringify(records));
  } catch {
    try {
      const withoutThumbnails = records.map((record) => ({ ...record, thumbnails: [] }));
      window.localStorage.setItem(appConfig.photoAnalysesStorageKey, JSON.stringify(withoutThumbnails));
    } catch {
      // Storage unavailable or still too large; give up rather than crash the page.
    }
  }
}

export function loadPhotoAnalyses(): PhotoAnalysisRecord[] {
  return readRaw();
}

export function upsertPhotoAnalysis(record: PhotoAnalysisRecord): PhotoAnalysisRecord[] {
  const current = readRaw();
  const next = [record, ...current.filter((item) => item.id !== record.id)].slice(0, MAX_RECORDS);
  writeRaw(next);
  return next;
}

export function deletePhotoAnalysis(id: string): PhotoAnalysisRecord[] {
  const next = readRaw().filter((item) => item.id !== id);
  writeRaw(next);
  return next;
}

export function createPhotoAnalysisId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `photo-analysis-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
