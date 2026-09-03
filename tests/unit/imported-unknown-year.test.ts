import { describe, expect, it } from "vitest";
import { buildVehicleInputFromListingImport } from "@/lib/listing-import/analysis-input";
import { analyzeVehicle } from "@/lib/analysis/engine";
import { evaluateMileage } from "@/lib/analysis/rules/mileage-rules";
import type { ImportedListingFields, ListingImportResult } from "@/lib/listing-import/types";

/**
 * İlan sayfasından model yılı okunamadığında, kod eksik yılın yerine sessizce
 * BUGÜNÜN yılını yazıyordu. Bu tek başına "raporda yanlış bir sayı" değil:
 * yaş buradan hesaplandığı için araç 1 yaşında sayılıyor ve gerçek
 * kilometresi bu sahte yaşa bölünüyor. 250.000 km'lik gerçek bir araç
 * "yılda 250.000 km" gibi görünüp YÜKSEK önemli sahte bir bulgu üretiyordu —
 * yani uydurulmuş bir sayı, kullanıcıya gerçek bir risk tespiti olarak
 * sunuluyordu.
 */

const emptyFields: ImportedListingFields = {
  brand: "Renault",
  model: "Megane",
  year: null,
  trim: null,
  fuelType: "Dizel",
  transmission: "Manuel",
  mileage: 250000,
  price: 450000,
  city: "İzmir",
  bodyType: null,
  engineSize: null,
  enginePower: null,
  drivetrain: null,
  ownerInfo: null,
  tradeStatus: null,
  tramerAmount: null,
  paintedParts: null,
  replacedParts: null,
  localPaintedParts: null,
  airbagStatus: null,
  lpgStatus: null,
  hasHeavyDamage: null,
  hasChassisRepair: null,
  hasTotalLossHistory: null,
  hasCommercialHistory: null,
  hasExpertiseReport: null,
  lpgRegistered: null,
  hasSpareKey: null,
  hasMaintenanceInvoices: null,
  lastMaintenanceDate: null,
  timingBeltInfo: null,
  transmissionMaintenanceInfo: null,
  batteryStatus: null,
  tireStatus: null,
  inspectionEndDate: null,
  sellerDescription: "Aracımız bakımlıdır, ilgilenenler arayabilir.",
};

function importResult(overrides: Partial<ImportedListingFields> = {}): ListingImportResult {
  return {
    title: "Sahibinden temiz araç",
    images: [],
    fields: { ...emptyFields, ...overrides },
    lowConfidenceFields: [],
    missingFields: [],
    warnings: [],
  };
}

describe("ilan içe aktarma — model yılı okunamadığında", () => {
  it("yılı okunamayan aracı 'tahmini yıl' olarak işaretler", () => {
    const built = buildVehicleInputFromListingImport(importResult(), "https://example.com/ilan");
    expect(built.ok).toBe(true);
    if (!built.ok) return;

    expect(built.warnings).toContain("year");
    expect(built.data.yearIsEstimated).toBe(true);
  });

  it("gerçek yıl okunduğunda tahmini olarak işaretlemez", () => {
    const built = buildVehicleInputFromListingImport(importResult({ year: 2015 }), "https://example.com/ilan");
    expect(built.ok).toBe(true);
    if (!built.ok) return;

    expect(built.data.year).toBe(2015);
    expect(built.data.yearIsEstimated).toBeFalsy();
  });

  it("tahmini yıldan yıllık kilometre üretmez", () => {
    const built = buildVehicleInputFromListingImport(importResult(), "https://example.com/ilan");
    expect(built.ok).toBe(true);
    if (!built.ok) return;

    const mileage = evaluateMileage(built.data);
    expect(mileage.label).toBe("Bilgi yetersiz");
    expect(mileage.annualMileage).toBe(0);
  });

  it("tahmini yıl yüzünden 'çok yüksek kilometre' sahte bulgusu üretmez", () => {
    const built = buildVehicleInputFromListingImport(importResult(), "https://example.com/ilan");
    expect(built.ok).toBe(true);
    if (!built.ok) return;

    const result = analyzeVehicle(built.data);
    const mileageFindings = result.findings.filter((finding) => finding.category === "Kilometre");
    expect(mileageFindings).toHaveLength(0);
  });

  it("yıl gerçekten okunduğunda kilometre değerlendirmesi çalışmaya devam eder", () => {
    const built = buildVehicleInputFromListingImport(importResult({ year: 2015 }), "https://example.com/ilan");
    expect(built.ok).toBe(true);
    if (!built.ok) return;

    const mileage = evaluateMileage(built.data);
    expect(mileage.annualMileage).toBeGreaterThan(0);
    expect(mileage.label).not.toBe("Bilgi yetersiz");
  });
});
