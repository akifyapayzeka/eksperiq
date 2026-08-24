import { describe, expect, it } from "vitest";
import { analyzeVehicle } from "@/lib/analysis/engine";
import { SCORE_WEIGHTS } from "@/lib/constants/analysis";
import type { ScoreCategory } from "@/lib/analysis/types";
import type { VehicleFormData } from "@/lib/schemas/vehicle";

const inputWithAllCategorySignals: VehicleFormData = {
  brand: "Renault",
  model: "Megane",
  year: 2018,
  trim: "",
  fuelType: "Dizel",
  transmission: "Otomatik",
  mileage: 260000,
  price: 900000,
  city: "Izmir",
  bodyType: "",
  engineSize: "",
  enginePower: "",
  drivetrain: "",
  ownerInfo: "",
  tradeStatus: "",
  tramerAmount: 200000,
  paintedParts: "",
  replacedParts: "kaput, sol kapi, sag kapi",
  localPaintedParts: "",
  hasHeavyDamage: true,
  hasChassisRepair: true,
  airbagStatus: "acmis",
  hasTotalLossHistory: true,
  hasCommercialHistory: false,
  hasExpertiseReport: false,
  lastMaintenanceDate: "",
  timingBeltInfo: "",
  transmissionMaintenanceInfo: "",
  batteryStatus: "",
  tireStatus: "kotu",
  inspectionEndDate: "2026-01-01",
  lpgStatus: "var",
  lpgRegistered: false,
  hasSpareKey: false,
  hasMaintenanceInvoices: false,
  sellerDescription: "Acil satılık, masrafsız, hatasız.",
  listingUrl: "",
};

describe("scoring category coverage", () => {
  it("applies findings to every configured score category", () => {
    const result = analyzeVehicle(inputWithAllCategorySignals);

    for (const category of Object.keys(SCORE_WEIGHTS) as ScoreCategory[]) {
      expect(result.breakdown[category]).toBeLessThan(SCORE_WEIGHTS[category]);
    }
  });
});
