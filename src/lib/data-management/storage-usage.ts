"use client";

import { EXPORTABLE_STORAGE_KEYS, EPHEMERAL_SESSION_STORAGE_KEYS, DEVICE_IDENTITY_LOCAL_STORAGE_KEYS } from "./keys";

export type StorageUsageEntry = { label: string; bytes: number };

export type StorageUsageSummary = {
  entries: StorageUsageEntry[];
  totalLocalBytes: number;
  totalSessionBytes: number;
  /** From navigator.storage.estimate() when available — includes IndexedDB, so it's normally larger than totalLocalBytes + totalSessionBytes. */
  quotaBytes: number | null;
  usageBytes: number | null;
};

function byteLengthOf(value: string | null): number {
  if (!value) return 0;
  return new Blob([value]).size;
}

export async function getStorageUsageSummary(): Promise<StorageUsageSummary> {
  const entries: StorageUsageEntry[] = [];
  let totalLocalBytes = 0;
  let totalSessionBytes = 0;

  if (typeof window !== "undefined") {
    for (const [name, storageKey] of Object.entries(EXPORTABLE_STORAGE_KEYS)) {
      const bytes = byteLengthOf(window.localStorage.getItem(storageKey));
      entries.push({ label: name, bytes });
      totalLocalBytes += bytes;
    }
    for (const storageKey of DEVICE_IDENTITY_LOCAL_STORAGE_KEYS) {
      totalLocalBytes += byteLengthOf(window.localStorage.getItem(storageKey));
    }
    for (const storageKey of EPHEMERAL_SESSION_STORAGE_KEYS) {
      totalSessionBytes += byteLengthOf(window.sessionStorage.getItem(storageKey));
    }
  }

  let quotaBytes: number | null = null;
  let usageBytes: number | null = null;
  if (typeof navigator !== "undefined" && navigator.storage?.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      quotaBytes = typeof estimate.quota === "number" ? estimate.quota : null;
      usageBytes = typeof estimate.usage === "number" ? estimate.usage : null;
    } catch {
      // Not all browsers support this — best-effort.
    }
  }

  return { entries, totalLocalBytes, totalSessionBytes, quotaBytes, usageBytes };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
