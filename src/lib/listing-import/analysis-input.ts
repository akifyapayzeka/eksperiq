import { vehicleSchema, type VehicleFormData } from "@/lib/schemas/vehicle";
import { brandOptions, modelOptionsForBrand } from "@/components/forms/analysis-form-sections";
import type { ListingImportResult } from "./types";
import { filterListingImageUrls } from "./image-filter";

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

function searchText(result: ListingImportResult): string {
  return [result.title, result.fields.sellerDescription].map((value) => importedString(value) ?? "").join(" ");
}

function fallbackYear(result: ListingImportResult): number | null {
  const match = searchText(result).match(/\b(19[8-9]\d|20[0-3]\d)\b/);
  return match ? Number(match[1]) : null;
}

function fallbackFuelType(result: ListingImportResult): string | null {
  const normalized = searchText(result).toLocaleLowerCase("tr-TR");
  if (/\belektrik/.test(normalized)) return "Elektrik";
  if (/\bhibrit|\bhybrid/.test(normalized)) return "Hibrit";
  if (/\bdizel|\bdiesel/.test(normalized)) return "Dizel";
  if (/\blpg|\botogaz/.test(normalized)) return "LPG";
  if (/\bbenzin/.test(normalized)) return "Benzin";
  return null;
}

function fallbackBrand(result: ListingImportResult): string | null {
  const normalized = searchText(result).toLocaleLowerCase("tr-TR");
  return (
    brandOptions.find(
      (brand) => brand !== "Diğer / listede yok" && normalized.includes(brand.toLocaleLowerCase("tr-TR")),
    ) ?? null
  );
}

function fallbackTransmission(result: ListingImportResult): string | null {
  const normalized = searchText(result).toLocaleLowerCase("tr-TR");
  if (/yar[ıi]\s*otomatik|semi\s*automatic/.test(normalized)) return "Yarı otomatik";
  if (/otomatik|automatic/.test(normalized)) return "Otomatik";
  if (/manuel|manual/.test(normalized)) return "Manuel";
  return null;
}

function fallbackCity(result: ListingImportResult): string {
  return importedString(result.fields.city) ?? "Bilinmiyor";
}

function fallbackModel(result: ListingImportResult, brand: string | null): string | null {
  if (!brand) return null;
  const text = searchText(result);
  const normalized = text.toLocaleLowerCase("tr-TR");
  const catalogMatch = modelOptionsForBrand(brand).find((model) =>
    normalized.includes(model.toLocaleLowerCase("tr-TR")),
  );
  if (catalogMatch) return catalogMatch;

  const escapedBrand = brand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const afterBrand = text.match(new RegExp(`\\b${escapedBrand}\\s+([\\p{L}\\d-]+)`, "iu"));
  return afterBrand?.[1] ?? null;
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
  const brand = importedString(fields.brand) ?? fallbackBrand(result);
  const model = importedString(fields.model) ?? fallbackModel(result, brand);
  const input = {
    brand,
    model,
    year: importedNumber(fields.year) ?? fallbackYear(result),
    trim: importedString(fields.trim) ?? undefined,
    fuelType: importedString(fields.fuelType) ?? fallbackFuelType(result) ?? "Bilinmiyor",
    transmission: importedString(fields.transmission) ?? fallbackTransmission(result) ?? "Bilinmiyor",
    mileage: importedNumber(fields.mileage) ?? 0,
    price: importedNumber(fields.price) ?? 0,
    city: fallbackCity(result),
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
    return { ok: true, data: parsed.data, images: filterListingImageUrls(result.images, 20) };
  }

  const missingFields = parsed.error.issues
    .map((issue) => issue.path[0])
    .filter((field): field is string => typeof field === "string");

  return { ok: false, missingFields: Array.from(new Set(missingFields)) };
}
