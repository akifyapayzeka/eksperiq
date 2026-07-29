import { describe, expect, it } from "vitest";
import { analyzeVehicle } from "@/lib/analysis/engine";
import type { VehicleFormData } from "@/lib/schemas/vehicle";

const baseInput: VehicleFormData = {
  brand: "BMW",
  model: "320i",
  year: 2016,
  trim: "",
  fuelType: "Benzin",
  transmission: "Otomatik",
  mileage: 210000,
  price: 1300000,
  city: "Bursa",
  bodyType: "",
  engineSize: "",
  enginePower: "",
  drivetrain: "",
  ownerInfo: "",
  tradeStatus: "",
  tramerAmount: 300000,
  paintedParts: "",
  replacedParts: "kaput, sol ön kapı, sağ ön kapı",
  localPaintedParts: "",
  hasHeavyDamage: true,
  hasChassisRepair: true,
  airbagStatus: "açmış",
  hasTotalLossHistory: false,
  hasExpertiseReport: false,
  lastMaintenanceDate: "",
  timingBeltInfo: "",
  transmissionMaintenanceInfo: "",
  batteryStatus: "",
  tireStatus: "kötü",
  inspectionEndDate: "",
  lpgStatus: "var",
  lpgRegistered: false,
  hasSpareKey: false,
  hasMaintenanceInvoices: false,
  sellerDescription: "Acil satılık, detaylar telefonda konuşulur.",
  listingUrl: "",
};

describe("dynamic inspection focus", () => {
  it("prioritizes inspection items from high-risk findings", () => {
    const result = analyzeVehicle(baseInput);

    expect(result.inspectionFocus.slice(0, 4)).toEqual([
      "Şasi, podye, direk ve tavan",
      "Airbag sistemi ve emniyet kemerleri",
      "Otomatik şanzıman",
      "LPG sistemi ve ruhsat uyumu",
    ]);
    expect(result.inspectionFocus).toContain("Lastik diş derinliği ve üretim tarihi");
  });

  it("creates up to five priority actions from the highest risk signals", () => {
    const result = analyzeVehicle(baseInput);

    expect(result.priorityActions).toHaveLength(5);
    expect(result.priorityActions[0]).toEqual({
      title: "Hasar tarihini, kapsamını ve onarım belgelerini bağımsız ekspertizde doğrulayın.",
      reason: "Ağır hasar kaydı belirtilmiş",
    });
    expect(result.priorityActions.map((action) => action.reason)).toContain("Şasi veya podye işlemi var");
  });
});
