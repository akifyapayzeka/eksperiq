import { z } from "zod";

export const CURRENT_DATA_SCHEMA_VERSION = 1;

/**
 * Each exportable key just needs to be an array of plain objects here.
 * Deep per-record correctness (required fields, enum values, etc.) is
 * intentionally left to each domain's own storage loader — e.g.
 * isVehicleProfile() in src/lib/storage/vehicle-storage.ts — which already
 * discards individually-invalid entries instead of crashing. Re-deriving
 * seven separate exhaustive schemas here would duplicate that logic and
 * risk silently drifting out of sync with the real types over time.
 */
const looseRecordArraySchema = z.array(z.record(z.string(), z.unknown()));

export const dataExportBundleSchema = z.object({
  schemaVersion: z.number().int().positive(),
  exportedAt: z.string(),
  appVersion: z.string().optional(),
  data: z.record(z.string(), looseRecordArraySchema),
});

export type DataExportBundle = z.infer<typeof dataExportBundleSchema>;
