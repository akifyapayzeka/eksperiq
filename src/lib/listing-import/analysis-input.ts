import { vehicleSchema, type VehicleFormData } from "@/lib/schemas/vehicle";
import type { ListingImportResult } from "./types";

type ImportedAnalysisInputResult =
  { ok: true; data: VehicleFormData; images: string[] } | { ok: false; missingFields: string[] };

function importedString(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value !== "object" || value === null) return null;
  const candidate = value as { value?: unknown; label?: unknown };
  if (typeof candidate.value === "string" && candidate.value.trim()) return candidate.value.trim();
  if (typeof candidate.label === "string" && candidate.label.trim()) return candidate.label.trim();
  return null;
}

function importedNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function importedBoolean(value: unknown): boolean {
  return typeof value === "boolean" ? value : false;
}

function sellerDescriptionFromImport(result: ListingImportResult): string {
  const description = importedString(result.fields.sellerDescription);
  if (description && description.length >= 20) return description;
  const title = importedString(result.title);
  if (title && title.length >= 20) return title;
  return "İlan açıklaması otomatik analiz için yeterli uzunlukta alınamadı.";
}

export function buildVehicleInputFromListingImport(
  result: ListingImportResult,
  listingUrl: string,
): ImportedAnalysisInputResult {
  const fields = result.fields;
  const input = {
    brand: importedString(fields.brand),
    model: importedString(fields.model),
    year: importedNumber(fields.year),
    trim: importedString(fields.trim) ?? undefined,
    fuelType: importedString(fields.fuelType),
    transmission: importedString(fields.transmission),
    mileage: importedNumber(fields.mileage),
    price: importedNumber(fields.price),
    city: importedString(fields.city),
    bodyType: importedString(fields.bodyType) ?? undefined,
    engineSize: importedString(fields.engineSize) ?? undefined,
    enginePower: importedString(fields.enginePower) ?? undefined,
    drivetrain: importedString(fields.drivetrain) ?? undefined,
    ownerInfo: importedString(fields.ownerInfo) ?? undefined,
    tradeStatus: importedString(fields.tradeStatus) ?? undefined,
    tramerAmount: importedNumber(fields.tramerAmount) ?? 0,
    paintedParts: importedString(fields.paintedParts) ?? undefined,
    replacedParts: importedString(fields.replacedParts) ?? undefined,
    localPaintedParts: importedString(fields.localPaintedParts) ?? undefined,
    hasHeavyDamage: importedBoolean(fields.hasHeavyDamage),
    hasChassisRepair: importedBoolean(fields.hasChassisRepair),
    airbagStatus: importedString(fields.airbagStatus) ?? undefined,
    hasTotalLossHistory: importedBoolean(fields.hasTotalLossHistory),
    hasExpertiseReport: importedBoolean(fields.hasExpertiseReport),
    lastMaintenanceDate: importedString(fields.lastMaintenanceDate) ?? undefined,
    timingBeltInfo: importedString(fields.timingBeltInfo) ?? undefined,
    transmissionMaintenanceInfo: importedString(fields.transmissionMaintenanceInfo) ?? undefined,
    batteryStatus: importedString(fields.batteryStatus) ?? undefined,
    tireStatus: importedString(fields.tireStatus) ?? undefined,
    inspectionEndDate: importedString(fields.inspectionEndDate) ?? undefined,
    lpgStatus: importedString(fields.lpgStatus) ?? undefined,
    lpgRegistered: importedBoolean(fields.lpgRegistered),
    hasSpareKey: importedBoolean(fields.hasSpareKey),
    hasMaintenanceInvoices: importedBoolean(fields.hasMaintenanceInvoices),
    sellerDescription: sellerDescriptionFromImport(result),
    listingUrl,
  };

  const parsed = vehicleSchema.safeParse(input);
  if (parsed.success) {
    return { ok: true, data: parsed.data, images: result.images.slice(0, 30) };
  }

  const missingFields = parsed.error.issues
    .map((issue) => issue.path[0])
    .filter((field): field is string => typeof field === "string");

  return { ok: false, missingFields: Array.from(new Set(missingFields)) };
}
