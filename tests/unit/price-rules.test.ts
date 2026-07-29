import { describe, expect, it } from "vitest";
import { priceRules } from "@/lib/analysis/rules/price-rules";
import type { VehicleFormData } from "@/lib/schemas/vehicle";

const baseInput: VehicleFormData = {
  brand: "Honda",
  model: "Civic",
  year: 2019,
  trim: "",
  fuelType: "Benzin",
  transmission: "Otomatik",
  mileage: 100000,
  price: 1000000,
  city: "Ankara",
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
  sellerDescription: "Araç hakkında temel bilgiler girilmiştir ve detaylar satıcıdan teyit edilecektir.",
  listingUrl: "",
};

describe("price rules", () => {
  it("flags high tramer amount relative to listing price", () => {
    const findings = priceRules({ ...baseInput, tramerAmount: 220000 });
    expect(findings).toContainEqual(expect.objectContaining({ id: "high-tramer-price-ratio", severity: "high" }));
  });

  it("does not create a price finding when tramer amount is low", () => {
    expect(priceRules({ ...baseInput, tramerAmount: 50000 })).toHaveLength(0);
  });
});
