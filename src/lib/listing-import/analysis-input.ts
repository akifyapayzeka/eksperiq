import { vehicleSchema, type VehicleFormData } from "@/lib/schemas/vehicle";
import { brandOptions, modelOptionsForBrand } from "@/components/forms/analysis-form-sections";
import type { ListingImageData, ListingImportResult } from "./types";
import { filterListingImageUrls } from "./image-filter";

type ImportedAnalysisInputResult =
  | { ok: true; data: VehicleFormData; images: string[]; imageData: ListingImageData[]; warnings: string[] }
  | { ok: false; missingFields: string[] };

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

/** Türkçe harfler dahil "kelime karakteri" — JS'in \b'si ç/ğ/ı/ö/ş/ü'yü tanımaz. */
const WORD_CHARACTER = /[0-9a-zçğıöşüâîû]/;

/**
 * Katalog adını (marka/model) metinde KELİME olarak arar. Düz `includes`
 * kullanıldığında gerçek ilan cümleleri yanlış markayla eşleşiyordu:
 * "mini onarım yapıldı" -> Mini, "yaylada kullanıldı" -> Lada. Ad, kelime
 * başında olmalı; sonrasına Türkçe ek gelebilir ("Opel'in", "Renault'un"),
 * bu yüzden yalnızca SOL sınır zorunlu tutuluyor, sağda ayırıcı ya da
 * kesme işareti aranıyor. Bu bir tahmin katmanı olduğu için kaçırmak
 * (yanlış negatif) yanlış marka atamaktan daha güvenlidir: kaçırıldığında
 * rapor dürüstçe "Bilinmeyen marka" der.
 */
function containsCatalogWord(haystack: string, needle: string): boolean {
  const text = haystack.toLocaleLowerCase("tr-TR");
  const term = needle.toLocaleLowerCase("tr-TR");
  if (!term) return false;

  let index = text.indexOf(term);
  while (index !== -1) {
    const before = index === 0 ? "" : text[index - 1];
    const after = text[index + term.length] ?? "";
    const leftIsBoundary = before === "" || !WORD_CHARACTER.test(before);
    const rightIsBoundary = after === "" || !WORD_CHARACTER.test(after) || after === "'" || after === "’";
    if (leftIsBoundary && rightIsBoundary) return true;
    index = text.indexOf(term, index + 1);
  }
  return false;
}

function fallbackYear(result: ListingImportResult): number | null {
  const match = searchText(result).match(/\b(19[8-9]\d|20[0-3]\d)\b/);
  return match ? Number(match[1]) : null;
}

function fallbackSafeYear(result: ListingImportResult): number {
  return fallbackYear(result) ?? new Date().getFullYear();
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

/**
 * Marka tahmini SADECE ilan başlığından yapılır. Serbest açıklama metni bu iş
 * için güvenilir değil: "mini onarım yapıldı" cümlesi kelime sınırı kuralını
 * da geçiyor ("mini" gerçekten ayrı bir kelime) ama marka değil, sıfat.
 * sahibinden/arabam başlıkları zaten "Renault Megane 1.5 dCi" biçiminde
 * marka ile başlar; başlıkta yoksa dürüstçe "Bilinmeyen marka" demek, yanlış
 * marka atayıp raporun tamamını (kronik arızalar, model rehberi) yanlış araca
 * göre üretmekten iyidir.
 */
function fallbackBrand(result: ListingImportResult): string | null {
  const title = importedString(result.title) ?? "";
  return brandOptions.find((brand) => brand !== "Diğer / listede yok" && containsCatalogWord(title, brand)) ?? null;
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
  const catalogMatch = modelOptionsForBrand(brand).find((model) => containsCatalogWord(text, model));
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

function descriptionWithMissingIdentityNotes(result: ListingImportResult, missingIdentityFields: string[]): string {
  const base = sellerDescriptionFromImport(result);
  if (!missingIdentityFields.length) return base;
  const labelMap: Record<string, string> = {
    brand: "marka",
    model: "model",
    year: "model yılı",
  };
  const labels = missingIdentityFields.map((field) => labelMap[field] ?? field).join(", ");
  return `${base}\n\nEksperIQ notu: İlan linkinden ${labels} bilgisi net alınamadı. Rapor bu eksikleri satıcıya sorulacak kritik bilgi olarak değerlendirir.`;
}

export function buildVehicleInputFromListingImport(
  result: ListingImportResult,
  _listingUrl: string,
): ImportedAnalysisInputResult {
  void _listingUrl;
  const fields = result.fields;
  const brand = importedString(fields.brand) ?? fallbackBrand(result);
  const model = importedString(fields.model) ?? fallbackModel(result, brand);
  const year = importedNumber(fields.year) ?? fallbackYear(result);
  const missingIdentityFields = [brand ? null : "brand", model ? null : "model", year ? null : "year"].filter(
    (field): field is string => Boolean(field),
  );
  const input = {
    brand: brand ?? "Bilinmeyen marka",
    model: model ?? "Bilinmeyen model",
    year: year ?? fallbackSafeYear(result),
    // Yıl ilandan okunamadıysa yukarıdaki değer bir yer tutucudur; yaşa
    // dayalı hiçbir hesap bunu gerçek model yılı gibi kullanmamalı.
    yearIsEstimated: year === null,
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
    hasCommercialHistory: importedBoolean(fields.hasCommercialHistory),
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
    sellerDescription: descriptionWithMissingIdentityNotes(result, missingIdentityFields),
    listingUrl: "",
  };

  const parsed = vehicleSchema.safeParse(input);
  if (parsed.success) {
    const filteredImages = filterListingImageUrls(result.images, 40);
    const filteredImageUrls = new Set(filteredImages);
    return {
      ok: true,
      data: parsed.data,
      images: filteredImages,
      imageData: (result.imageData ?? []).filter((item) => filteredImageUrls.has(item.url)),
      warnings: missingIdentityFields,
    };
  }

  const missingFields = parsed.error.issues
    .map((issue) => issue.path[0])
    .filter((field): field is string => typeof field === "string");

  return { ok: false, missingFields: Array.from(new Set(missingFields)) };
}
