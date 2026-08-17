"use client";

import { appConfig } from "@/lib/constants/app";
import { recordProductEvent } from "@/lib/analytics/productEvents";
import { CURRENT_DATA_SCHEMA_VERSION, dataExportBundleSchema, type DataExportBundle } from "./schema";
import { migrateBundle } from "./migrations";
import { EXPORTABLE_STORAGE_KEYS } from "./keys";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readJsonArray(storageKey: string): Record<string, unknown>[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isRecord);
  } catch {
    return [];
  }
}

export function buildDataExportBundle(): DataExportBundle {
  const data: Record<string, Record<string, unknown>[]> = {};
  for (const [name, storageKey] of Object.entries(EXPORTABLE_STORAGE_KEYS)) {
    data[name] = readJsonArray(storageKey);
  }
  return {
    schemaVersion: CURRENT_DATA_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    appVersion: appConfig.name,
    data,
  };
}

export function exportDataAsJson(): string {
  const bundle = buildDataExportBundle();
  recordProductEvent("data_exported", {
    exportableKeyCount: Object.keys(bundle.data).length,
    recordCount: Object.values(bundle.data).reduce((total, records) => total + records.length, 0),
  });
  return JSON.stringify(bundle, null, 2);
}

export type ImportResult = { ok: true; importedKeys: string[] } | { ok: false; error: string };

/**
 * Validates, migrates, then writes an uploaded export bundle back into
 * localStorage. Only the envelope shape and per-key "is this an array of
 * records" invariant are enforced here (via Zod) — this is intentional: a
 * malformed/foreign JSON file must never corrupt storage or crash the app,
 * but deep per-record correctness is re-checked anyway the next time each
 * page loads via its own existing, already-tested storage loader.
 */
export function importDataFromJson(raw: string): ImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: "Dosya geçerli bir JSON değil." };
  }

  const validated = dataExportBundleSchema.safeParse(parsed);
  if (!validated.success) {
    return { ok: false, error: "Dosya EksperIQ veri yedeği formatında değil." };
  }

  if (typeof window === "undefined") {
    return { ok: false, error: "İçe aktarma yalnızca tarayıcıda çalışır." };
  }

  const migrated = migrateBundle(validated.data);
  const importedKeys: string[] = [];

  for (const [name, storageKey] of Object.entries(EXPORTABLE_STORAGE_KEYS)) {
    const value = migrated.data[name];
    if (!Array.isArray(value)) continue;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(value));
      importedKeys.push(name);
    } catch {
      // A single key failing to persist (e.g. quota) must not abort the rest of the import.
    }
  }

  return { ok: true, importedKeys };
}
