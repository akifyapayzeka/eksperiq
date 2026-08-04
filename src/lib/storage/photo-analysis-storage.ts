"use client";

import { appConfig } from "@/lib/constants/app";
import type { PhotoAnalysisRecord } from "@/lib/photo-analysis/types";
import { deleteThumbnails, loadThumbnails, saveThumbnails } from "@/lib/photo-analysis/indexed-db";

const MAX_RECORDS = 20;

/** What actually lives in localStorage — thumbnails (the large part) live in IndexedDB instead, keyed by id. */
type PhotoAnalysisMetadata = Omit<PhotoAnalysisRecord, "thumbnails">;

function isPhotoAnalysisMetadata(value: unknown): value is PhotoAnalysisMetadata {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return typeof record.id === "string" && typeof record.createdAt === "string" && Array.isArray(record.findings);
}

function readMetadata(): PhotoAnalysisMetadata[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(appConfig.photoAnalysesStorageKey);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isPhotoAnalysisMetadata);
  } catch {
    window.localStorage.removeItem(appConfig.photoAnalysesStorageKey);
    return [];
  }
}

function writeMetadata(records: PhotoAnalysisMetadata[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(appConfig.photoAnalysesStorageKey, JSON.stringify(records));
  } catch {
    // Metadata alone (no thumbnails) is small; if even this fails storage is
    // essentially unusable — give up rather than crash the page.
  }
}

export async function loadPhotoAnalyses(): Promise<PhotoAnalysisRecord[]> {
  const metadata = readMetadata();
  return Promise.all(metadata.map(async (record) => ({ ...record, thumbnails: await loadThumbnails(record.id) })));
}

export type UpsertPhotoAnalysisResult =
  | { ok: true; records: PhotoAnalysisRecord[] }
  | { ok: false; reason: "quota-exceeded" | "unavailable"; records: PhotoAnalysisRecord[] };

export async function upsertPhotoAnalysis(record: PhotoAnalysisRecord): Promise<UpsertPhotoAnalysisResult> {
  const { thumbnails, ...metadata } = record;
  const deduped = [metadata, ...readMetadata().filter((item) => item.id !== record.id)];
  const nextMetadata = deduped.slice(0, MAX_RECORDS);
  const prunedIds = deduped.slice(MAX_RECORDS).map((item) => item.id);

  writeMetadata(nextMetadata);
  await Promise.all(prunedIds.map((prunedId) => deleteThumbnails(prunedId)));

  const thumbnailResult = await saveThumbnails(record.id, thumbnails);
  const records = await loadPhotoAnalyses();

  if (!thumbnailResult.ok) {
    return { ok: false, reason: thumbnailResult.reason, records };
  }
  return { ok: true, records };
}

export async function deletePhotoAnalysis(id: string): Promise<PhotoAnalysisRecord[]> {
  writeMetadata(readMetadata().filter((item) => item.id !== id));
  await deleteThumbnails(id);
  return loadPhotoAnalyses();
}

export function createPhotoAnalysisId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `photo-analysis-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
