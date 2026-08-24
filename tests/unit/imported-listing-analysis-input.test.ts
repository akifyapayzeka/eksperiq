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
      hasCommercialHistory: null,
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
    images: [
      "https://i0.shbdn.com/photos/12/34/56/x5_123456789abc.jpg",
      "https://cdn.example.com/assets/wrench-icon.png",
      "https://cdn.arabam.com/prod/listing/vehicle-photo.webp",
      "https://cdn.example.com/logo.png",
    ],
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
    expect(result.images).toEqual([
      "https://i0.shbdn.com/photos/12/34/56/x5_123456789abc.jpg",
      "https://cdn.arabam.com/prod/listing/vehicle-photo.webp",
    ]);
  });

  it("keeps analyzing with explicit unknown identity placeholders when the listing identity is missing", () => {
    const result = buildVehicleInputFromListingImport(
      baseImportResult({
        title: "Eksik ilan",
        fields: { ...baseImportResult().fields, brand: null, model: null, year: null, price: null },
      }),
      "https://shbd.io/s/example",
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.brand).toBe("Bilinmeyen marka");
    expect(result.data.model).toBe("Bilinmeyen model");
    expect(result.data.year).toBe(2005);
    expect(result.data.sellerDescription).toContain("İlan linkinden marka, model bilgisi net alınamadı");
    expect(result.warnings).toEqual(["brand", "model"]);
  });

  it("keeps analyzing when non-identity listing details are missing", () => {
    const result = buildVehicleInputFromListingImport(
      baseImportResult({
        fields: {
          ...baseImportResult().fields,
          transmission: null,
          mileage: null,
          price: null,
          city: null,
        },
      }),
      "https://shbd.io/s/example",
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.transmission).toBe("Bilinmiyor");
    expect(result.data.mileage).toBe(0);
    expect(result.data.price).toBe(0);
    expect(result.data.city).toBe("Bilinmiyor");
  });

  it("falls back to the title for brand and model when the AI leaves them null", () => {
    const result = buildVehicleInputFromListingImport(
      baseImportResult({
        title: "2005 Fiat Albea Active LPG'li değişensiz klimalı",
        fields: { ...baseImportResult().fields, brand: null, model: null },
      }),
      "https://shbd.io/s/example",
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.brand).toBe("Fiat");
    expect(result.data.model).toBe("Albea");
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
