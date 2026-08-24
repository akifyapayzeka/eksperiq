import { describe, expect, it } from "vitest";
import { calculateDataCompleteness } from "@/lib/analysis/completeness";
import type { VehicleFormData } from "@/lib/schemas/vehicle";

const sparseInput: VehicleFormData = {
  brand: "Toyota",
  model: "Corolla",
  year: 2020,
  trim: "",
  fuelType: "Benzin",
  transmission: "Otomatik",
  mileage: 90000,
  price: 1200000,
  city: "İstanbul",
  bodyType: "",
  engineSize: "",
  enginePower: "",
  drivetrain: "",
  ownerInfo: "",
  tradeStatus: "",
  tramerAmount: 0,
  paintedParts: "",
  replacedParts: "",
  localPaintedParts: "",
  hasHeavyDamage: false,
  hasChassisRepair: false,
  airbagStatus: "",
  hasTotalLossHistory: false,
  hasCommercialHistory: false,
  hasExpertiseReport: false,
  lastMaintenanceDate: "",
  timingBeltInfo: "",
  transmissionMaintenanceInfo: "",
  batteryStatus: "",
  tireStatus: "",
  inspectionEndDate: "",
  lpgStatus: "",
  lpgRegistered: false,
  hasSpareKey: false,
  hasMaintenanceInvoices: false,
  sellerDescription: "Ekspertize açık, detaylar satıcıdan doğrulanmalı.",
  listingUrl: "",
};

describe("data completeness", () => {
  it("reports missing optional information without blocking analysis", () => {
    const completeness = calculateDataCompleteness(sparseInput);

    expect(completeness.completed).toBeLessThan(completeness.total);
    expect(completeness.percentage).toBeGreaterThan(0);
    expect(completeness.missing).toEqual(
      expect.arrayContaining(["Paket", "Ruhsat sahibi bilgisi", "Son bakım tarihi"]),
    );
  });

  it("treats imported unknown placeholders as missing information", () => {
    const completeness = calculateDataCompleteness({
      ...sparseInput,
      fuelType: "Bilinmiyor",
      transmission: "Bilinmiyor",
      mileage: 0,
      price: 0,
      city: "Bilinmiyor",
    });

    expect(completeness.missing).toEqual(
      expect.arrayContaining(["Yakıt türü", "Vites türü", "Kilometre", "İlan fiyatı", "Şehir"]),
    );
  });
});
