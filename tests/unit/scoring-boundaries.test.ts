import { describe, expect, it } from "vitest";
import { SCORE_WEIGHTS } from "@/lib/constants/analysis";
import { createAnalysis } from "@/lib/services/analysis-service";
import type { VehicleFormData } from "@/lib/schemas/vehicle";

const riskyInput: VehicleFormData = {
  brand: "Toyota",
  model: "Corolla",
  year: 2020,
  trim: "",
  fuelType: "Benzin",
  transmission: "Otomatik",
  mileage: 180000,
  price: 1200000,
  city: "Istanbul",
  bodyType: "",
  engineSize: "",
  enginePower: "",
  drivetrain: "",
  ownerInfo: "",
  tradeStatus: "",
  tramerAmount: 180000,
  paintedParts: "",
  replacedParts: "sol kapi, sag kapi, kaput",
  localPaintedParts: "",
  hasHeavyDamage: true,
  hasChassisRepair: true,
  airbagStatus: "acmis",
  hasTotalLossHistory: true,
  hasExpertiseReport: false,
  lastMaintenanceDate: "",
  timingBeltInfo: "",
  transmissionMaintenanceInfo: "",
  batteryStatus: "",
  tireStatus: "kotu",
  inspectionEndDate: "",
  lpgStatus: "var",
  lpgRegistered: false,
  hasSpareKey: false,
  hasMaintenanceInvoices: false,
  sellerDescription: "Acil satilik, masrafsiz, hatasiz, fiyat son. Detay yok.",
  listingUrl: "",
};

describe("score boundaries", () => {
  it("keeps every category between zero and its configured weight", () => {
    const result = createAnalysis(riskyInput);

    for (const [category, value] of Object.entries(result.breakdown)) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(SCORE_WEIGHTS[category as keyof typeof SCORE_WEIGHTS]);
    }
  });
});
