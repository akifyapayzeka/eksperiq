"use client";

import { appConfig } from "@/lib/constants/app";
import { recordProductEvent } from "@/lib/analytics/productEvents";
import type { PhotoAnalysisRecord } from "@/lib/photo-analysis/types";
import { deleteThumbnails, loadThumbnails, saveThumbnails } from "@/lib/photo-analysis/indexed-db";

const MAX_RECORDS = 20;

/** What actually lives in localStorage — thumbnails (the large part) live in IndexedDB instead, keyed by id. */
type PhotoAnalysisMetadata = Omit<PhotoAnalysisRecord, "thumbnails">;

/**
 * Records written before the IndexedDB split still have their thumbnails
 * array inline in this same localStorage key — JSON.parse doesn't know
 * about the (compile-time-only) Omit, so that field is still present at
 * runtime on old data. migrateLegacyInlineThumbnails() below moves it out.
 */
type StoredPhotoAnalysisMetadata = PhotoAnalysisMetadata & { thumbnails?: unknown };

function isPhotoAnalysisMetadata(value: unknown): value is StoredPhotoAnalysisMetadata {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return typeof record.id === "string" && typeof record.createdAt === "string" && Array.isArray(record.findings);
}

function readMetadata(): StoredPhotoAnalysisMetadata[] {
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

function writeMetadata(records: StoredPhotoAnalysisMetadata[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(appConfig.photoAnalysesStorageKey, JSON.stringify(records));
  } catch {
    // Metadata alone (no thumbnails) is small; if even this fails storage is
    // essentially unusable — give up rather than crash the page.
  }
}

function stripLegacyThumbnails(record: StoredPhotoAnalysisMetadata): PhotoAnalysisMetadata {
  return { id: record.id, createdAt: record.createdAt, findings: record.findings, aiSummary: record.aiSummary };
}

/**
 * One-time migration for records saved before thumbnails moved to
 * IndexedDB. Only rewrites localStorage for records it actually migrates,
 * so this is a no-op (besides the cheap field check) on every subsequent
 * load once a device is fully migrated. A record whose IndexedDB write
 * fails (quota/unavailable) keeps its inline thumbnails in localStorage
 * rather than losing them — loadPhotoAnalyses() below reads those inline
 * instead of querying IndexedDB in that case.
 */
async function migrateLegacyInlineThumbnails(
  records: StoredPhotoAnalysisMetadata[],
): Promise<StoredPhotoAnalysisMetadata[]> {
  let didMigrateAny = false;
  const migrated: StoredPhotoAnalysisMetadata[] = [];

  for (const record of records) {
    if (!Array.isArray(record.thumbnails) || record.thumbnails.length === 0) {
      migrated.push(record);
      continue;
    }

    const legacyThumbnails = record.thumbnails.filter(
      (thumbnail): thumbnail is string => typeof thumbnail === "string",
    );
    const result = await saveThumbnails(record.id, legacyThumbnails);

    if (result.ok) {
      migrated.push(stripLegacyThumbnails(record));
      didMigrateAny = true;
    } else {
      migrated.push(record);
    }
  }

  if (didMigrateAny) writeMetadata(migrated);
  return migrated;
}

export async function loadPhotoAnalyses(): Promise<PhotoAnalysisRecord[]> {
  const metadata = await migrateLegacyInlineThumbnails(readMetadata());
  return Promise.all(
    metadata.map(async (record) => {
      if (Array.isArray(record.thumbnails)) {
        const legacyThumbnails = record.thumbnails.filter(
          (thumbnail): thumbnail is string => typeof thumbnail === "string",
        );
        return { ...stripLegacyThumbnails(record), thumbnails: legacyThumbnails };
      }
      return { ...record, thumbnails: await loadThumbnails(record.id) };
    }),
  );
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
  recordProductEvent("photo_damage_analysis_saved", {
    findingCount: record.findings.length,
    hasAiSummary: typeof record.aiSummary === "string" && record.aiSummary.length > 0,
    thumbnailCount: record.thumbnails.length,
  });
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
