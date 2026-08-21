"use client";

import { apiFetch } from "@/lib/api/client";
import type { ImportedListingFields, ListingImportResult } from "./types";

const MAX_EVIDENCE_IMAGES = 12;

type ListingPhotoEvidenceFields = Partial<
  Pick<
    ImportedListingFields,
    | "tramerAmount"
    | "paintedParts"
    | "replacedParts"
    | "localPaintedParts"
    | "airbagStatus"
    | "hasHeavyDamage"
    | "hasChassisRepair"
    | "hasTotalLossHistory"
    | "hasExpertiseReport"
    | "hasMaintenanceInvoices"
    | "lastMaintenanceDate"
    | "timingBeltInfo"
    | "transmissionMaintenanceInfo"
    | "batteryStatus"
    | "tireStatus"
    | "inspectionEndDate"
  >
> & {
  sellerDescriptionAppend?: string | null;
};

type EvidenceFieldName = keyof Omit<ListingPhotoEvidenceFields, "sellerDescriptionAppend">;

type ListingPhotoEvidenceAnalysis = {
  hasEvidence: boolean;
  documentImageIndexes: number[];
  documentTypes: string[];
  evidenceSummary: string | null;
  fields: ListingPhotoEvidenceFields;
};

type ListingPhotoEvidenceResponse = {
  analysis?: ListingPhotoEvidenceAnalysis;
  error?: string;
};

const MERGEABLE_FIELD_NAMES: EvidenceFieldName[] = [
  "tramerAmount",
  "paintedParts",
  "replacedParts",
  "localPaintedParts",
  "airbagStatus",
  "hasHeavyDamage",
  "hasChassisRepair",
  "hasTotalLossHistory",
  "hasExpertiseReport",
  "hasMaintenanceInvoices",
  "lastMaintenanceDate",
  "timingBeltInfo",
  "transmissionMaintenanceInfo",
  "batteryStatus",
  "tireStatus",
  "inspectionEndDate",
];

function hasValue(value: unknown): boolean {
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return Number.isFinite(value) && value > 0;
  return typeof value === "boolean";
}

function mergeString(existing: unknown, incoming: unknown): string | null {
  const current = typeof existing === "string" ? existing.trim() : "";
  const next = typeof incoming === "string" ? incoming.trim() : "";
  if (!next) return current || null;
  if (!current) return next;
  if (current.toLocaleLowerCase("tr-TR").includes(next.toLocaleLowerCase("tr-TR"))) return current;
  return `${current}, ${next}`;
}

function mergeFields(fields: ImportedListingFields, evidence: ListingPhotoEvidenceFields): ImportedListingFields {
  const merged: ImportedListingFields = { ...fields };

  for (const fieldName of MERGEABLE_FIELD_NAMES) {
    const incoming = evidence[fieldName];
    if (!hasValue(incoming)) continue;
    const existing = merged[fieldName];

    if (typeof incoming === "string") {
      (merged[fieldName] as string | null) = mergeString(existing, incoming);
      continue;
    }

    if (typeof incoming === "number") {
      if (typeof existing !== "number" || existing <= 0) (merged[fieldName] as number | null) = incoming;
      continue;
    }

    if (typeof incoming === "boolean") {
      if (existing === null || existing === false || incoming === true) (merged[fieldName] as boolean | null) = incoming;
    }
  }

  const append = evidence.sellerDescriptionAppend?.trim();
  if (append) {
    const current = fields.sellerDescription?.trim() ?? "";
    merged.sellerDescription = current.includes(append)
      ? current
      : [current, `İlan görsellerinden okunan belge/kanıt notu: ${append}`].filter(Boolean).join("\n\n");
  }

  return merged;
}

function removeMissingFields(missingFields: string[], fields: ListingPhotoEvidenceFields): string[] {
  const filled = new Set<string>(
    MERGEABLE_FIELD_NAMES.filter((fieldName) => hasValue(fields[fieldName])).map((fieldName) => String(fieldName)),
  );
  if (hasValue(fields.sellerDescriptionAppend)) filled.add("sellerDescription");
  return missingFields.filter((fieldName) => !filled.has(fieldName));
}

function removeDocumentImages(images: string[], documentImageIndexes: number[]): string[] {
  const indexes = new Set(documentImageIndexes);
  const filtered = images.filter((_image, index) => !indexes.has(index));
  return filtered.length ? filtered : images;
}

export async function enrichListingImportWithPhotoEvidence(
  result: ListingImportResult,
): Promise<ListingImportResult> {
  if (!result.images.length) return result;

  try {
    const imageUrls = result.images.slice(0, MAX_EVIDENCE_IMAGES);
    const response = await apiFetch("/api/ai/listing-photo-evidence", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        aiProviderConsent: true,
        imageUrls,
        context: {
          title: result.title,
          sellerDescription: result.fields.sellerDescription,
        },
      }),
    });

    const payload = (await response.json()) as ListingPhotoEvidenceResponse;
    if (!response.ok || !payload.analysis?.hasEvidence) return result;

    const fields = mergeFields(result.fields, payload.analysis.fields);
    const warnings = [
      ...result.warnings,
      payload.analysis.evidenceSummary
        ? `İlan fotoğraflarındaki belge/kanıt görsellerinden ek bilgi okundu: ${payload.analysis.evidenceSummary}`
        : "İlan fotoğraflarındaki belge/kanıt görsellerinden ek bilgi okundu.",
    ];

    return {
      ...result,
      fields,
      images: removeDocumentImages(result.images, payload.analysis.documentImageIndexes),
      missingFields: removeMissingFields(result.missingFields, payload.analysis.fields),
      warnings: Array.from(new Set(warnings)),
    };
  } catch {
    return result;
  }
}
