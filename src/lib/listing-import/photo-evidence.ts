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

function normalizeEvidenceText(value: unknown): string {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

const damagePartAliases: Array<[string, RegExp]> = [
  ["Ön tampon", /on\s+tampon/i],
  ["Arka tampon", /arka\s+tampon/i],
  ["Kaput", /kaput/i],
  ["Bagaj kapağı", /bagaj\s+kapagi/i],
  ["Tavan", /tavan/i],
  ["Sağ ön çamurluk", /sag\s+on\s+camurluk/i],
  ["Sol ön çamurluk", /sol\s+on\s+camurluk/i],
  ["Sağ arka çamurluk", /sag\s+arka\s+camurluk/i],
  ["Sol arka çamurluk", /sol\s+arka\s+camurluk/i],
  ["Sağ ön kapı", /sag\s+on\s+kapi/i],
  ["Sol ön kapı", /sol\s+on\s+kapi/i],
  ["Sağ arka kapı", /sag\s+arka\s+kapi/i],
  ["Sol arka kapı", /sol\s+arka\s+kapi/i],
];

function extractPartsNearKeyword(text: string, keyword: RegExp): string | null {
  const normalized = normalizeEvidenceText(text);
  const match = normalized.match(keyword);
  if (!match) return null;
  const start = Math.max(0, (match.index ?? 0) - 90);
  const end = Math.min(normalized.length, (match.index ?? 0) + match[0].length + 90);
  const window = normalized.slice(start, end);
  const parts = damagePartAliases.filter(([, pattern]) => pattern.test(window)).map(([name]) => name);
  return parts.length ? Array.from(new Set(parts)).join(", ") : null;
}

function extractQuantifiedPaintedParts(text: string): string | null {
  const normalized = normalizeEvidenceText(text);
  if (!/boya|boyali/.test(normalized)) return null;

  const parts: string[] = [];
  const hasTwo = (word: string) => new RegExp(`(?:\\b2\\b|\\biki\\b)\\s+${word}`, "i").test(normalized);
  const hasOne = (word: string) => new RegExp(`(?:\\b1\\b|\\bbir\\b|\\btek\\b)\\s+${word}`, "i").test(normalized);

  if (hasTwo("kap[ıi]")) parts.push("İki kapı");
  else if (hasOne("kap[ıi]")) parts.push("Bir kapı");

  if (hasTwo("camurluk")) parts.push("İki çamurluk");
  else if (hasOne("camurluk")) parts.push("Bir çamurluk");

  if (hasTwo("parca")) parts.push("İki parça");
  else if (hasOne("parca")) parts.push("Bir parça");

  return parts.length ? Array.from(new Set(parts)).join(", ") : null;
}

function inferDamageFieldsFromEvidenceText(evidence: ListingPhotoEvidenceFields): ListingPhotoEvidenceFields {
  const evidenceText = [
    evidence.sellerDescriptionAppend,
    evidence.paintedParts,
    evidence.replacedParts,
    evidence.localPaintedParts,
  ]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .join(" ");
  if (!evidenceText) return evidence;

  return {
    ...evidence,
    paintedParts:
      evidence.paintedParts ??
      extractQuantifiedPaintedParts(evidenceText) ??
      extractPartsNearKeyword(evidenceText, /\bboyali\b|yuzeysel\s+boya|boya\s+vardir/i),
    replacedParts: evidence.replacedParts ?? extractPartsNearKeyword(evidenceText, /\bdegisen\b/i),
    localPaintedParts:
      evidence.localPaintedParts ?? extractPartsNearKeyword(evidenceText, /lokal\s+boya|lokal\s+boyali/i),
  };
}

function mergeFields(fields: ImportedListingFields, evidence: ListingPhotoEvidenceFields): ImportedListingFields {
  const merged: ImportedListingFields = { ...fields };
  const normalizedEvidence = inferDamageFieldsFromEvidenceText(evidence);

  for (const fieldName of MERGEABLE_FIELD_NAMES) {
    const incoming = normalizedEvidence[fieldName];
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
      if (existing === null || existing === false || incoming === true)
        (merged[fieldName] as boolean | null) = incoming;
    }
  }

  const append = normalizedEvidence.sellerDescriptionAppend?.trim();
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

export async function enrichListingImportWithPhotoEvidence(result: ListingImportResult): Promise<ListingImportResult> {
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

    const evidenceFields = inferDamageFieldsFromEvidenceText(payload.analysis.fields);
    const fields = mergeFields(result.fields, evidenceFields);
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
      missingFields: removeMissingFields(result.missingFields, evidenceFields),
      warnings: Array.from(new Set(warnings)),
    };
  } catch {
    return result;
  }
}
