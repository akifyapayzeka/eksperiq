import { describe, expect, it } from "vitest";
import { buildVehicleInputFromListingImport } from "@/lib/listing-import/analysis-input";
import type { ImportedListingFields, ListingImportResult } from "@/lib/listing-import/types";

/**
 * İlan metninden marka/model tahmini alt dize (`includes`) ile yapılıyordu.
 * Marka listesinde "Mini", "Lada", "MG", "Kia" gibi kısa adlar olduğu için
 * gerçek Türkçe ilan cümleleri yanlış markayla eşleşiyordu:
 *   "mini onarım yapıldı"   -> Mini
 *   "minimal çizik var"     -> Mini
 *   "yaylada kullanıldı"    -> Lada
 * Marka yanlış tespit edilince rapordaki kronik arıza listesi ve model
 * rehberi de yanlış araca göre üretiliyor. Yanlış marka, "bilinmiyor"
 * demekten daha zararlıdır: kullanıcı uydurulmuş bir aracın raporunu okur.
 */

const emptyFields: ImportedListingFields = {
  brand: null,
  model: null,
  year: 2018,
  trim: null,
  fuelType: "Dizel",
  transmission: "Manuel",
  mileage: 120000,
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
  sellerDescription: null,
};

function brandFor(title: string, sellerDescription: string | null = null): string {
  const result: ListingImportResult = {
    title,
    images: [],
    fields: { ...emptyFields, sellerDescription },
    lowConfidenceFields: [],
    missingFields: [],
    warnings: [],
  };
  const built = buildVehicleInputFromListingImport(result, "https://example.com/ilan");
  return built.ok ? built.data.brand : "";
}

describe("marka tahmini — kelime içi alt dize yanlış pozitifleri", () => {
  it("'mini onarım' cümlesini Mini markası sanmaz", () => {
    expect(brandFor("Sahibinden temiz araç", "Aracımızda mini onarım yapıldı, boya yok")).toBe("Bilinmeyen marka");
  });

  it("'minimal çizik' cümlesini Mini markası sanmaz", () => {
    expect(brandFor("Temiz araç", "Kaporta üzerinde minimal çizik var")).toBe("Bilinmeyen marka");
  });

  it("'yaylada kullanıldı' cümlesini Lada markası sanmaz", () => {
    expect(brandFor("Aile aracı", "Sahibinden temiz aile aracı, yaylada kullanıldı")).toBe("Bilinmeyen marka");
  });

  it("marka gerçekten geçtiğinde bulmaya devam eder", () => {
    expect(brandFor("Renault Megane 1.5 dCi")).toBe("Renault");
    expect(brandFor("Sahibinden Mini Cooper")).toBe("Mini");
  });

  it("markaya Türkçe ek geldiğinde de bulur", () => {
    expect(brandFor("Opel'in bakımlı örneği")).toBe("Opel");
  });
});
