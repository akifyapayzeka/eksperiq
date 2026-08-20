import { describe, expect, it } from "vitest";
import { buildVehicleInputFromListingImport } from "@/lib/listing-import/analysis-input";
import type { ListingImportResult } from "@/lib/listing-import/types";

function baseImportResult(overrides: Partial<ListingImportResult> = {}): ListingImportResult {
  return {
    title: "2005 Fiat Albea Active LPG'li değişensiz klimalı",
    fields: {
      brand: "Fiat",
      model: "Albea",
      year: 2005,
      trim: "Active",
      fuelType: "Benzin",
      transmission: "Manuel",
      mileage: 317000,
      price: 329000,
      city: "İstanbul",
      bodyType: "Sedan",
      engineSize: "1.2",
      enginePower: null,
      drivetrain: null,
      ownerInfo: null,
      tradeStatus: null,
      tramerAmount: 0,
      paintedParts: null,
      replacedParts: "Değişen yok",
      localPaintedParts: null,
      airbagStatus: null,
      lpgStatus: "Var",
      hasHeavyDamage: false,
      hasChassisRepair: false,
      hasTotalLossHistory: false,
      hasExpertiseReport: null,
      lpgRegistered: true,
      hasSpareKey: null,
      hasMaintenanceInvoices: null,
      lastMaintenanceDate: null,
      timingBeltInfo: null,
      transmissionMaintenanceInfo: null,
      batteryStatus: null,
      tireStatus: null,
      inspectionEndDate: null,
      sellerDescription: "2005 1.2 8 v Albea Active LPG'li değişensiz klimalı.",
    },
    lowConfidenceFields: [],
    missingFields: [],
    warnings: [],
    images: ["https://example.com/car-1.jpg", "https://example.com/car-2.jpg"],
    ...overrides,
  };
}

describe("buildVehicleInputFromListingImport", () => {
  it("creates a valid analysis input without writing imported data into the manual form", () => {
    const result = buildVehicleInputFromListingImport(baseImportResult(), "https://shbd.io/s/example");

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.brand).toBe("Fiat");
    expect(result.data.model).toBe("Albea");
    expect(result.data.lpgRegistered).toBe(true);
    expect(result.data.replacedParts).toBe("Değişen yok");
    expect(result.images).toEqual(["https://example.com/car-1.jpg", "https://example.com/car-2.jpg"]);
  });

  it("reports missing core fields when the listing cannot support a reliable analysis", () => {
    const result = buildVehicleInputFromListingImport(
      baseImportResult({
        title: "Eksik ilan",
        fields: { ...baseImportResult().fields, brand: null, model: null, price: null },
      }),
      "https://shbd.io/s/example",
    );

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.missingFields).toEqual(expect.arrayContaining(["brand", "model", "price"]));
  });

  it("falls back to title and description for core fields the AI shape omitted", () => {
    const result = buildVehicleInputFromListingImport(
      baseImportResult({
        title: "2005 Fiat Albea Active LPG'li değişensiz klimalı",
        fields: {
          ...baseImportResult().fields,
          model: null,
          year: null,
          fuelType: null,
          sellerDescription: "2005 1.2 8 v ALBEA ACTIVE LPG'Lİ DEĞİŞENSİZ KLİMALI",
        },
      }),
      "https://shbd.io/s/example",
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.model).toBe("Albea");
    expect(result.data.year).toBe(2005);
    expect(result.data.fuelType).toBe("LPG");
  });
});
