import { describe, expect, it } from "vitest";
import { costSignals } from "@/lib/analysis/recommendations";
import type { VehicleFormData } from "@/lib/schemas/vehicle";

const baseInput: VehicleFormData = {
  brand: "Toyota",
  model: "Corolla",
  year: 2020,
  trim: "Dream",
  fuelType: "Benzin",
  transmission: "Otomatik",
  mileage: 90000,
  price: 1200000,
  city: "İstanbul",
  bodyType: "Sedan",
  engineSize: "1.6",
  enginePower: "132 hp",
  drivetrain: "Önden çekiş",
  ownerInfo: "Sahibinden",
  tradeStatus: "Yok",
  tramerAmount: 0,
  paintedParts: "",
  replacedParts: "",
  localPaintedParts: "",
  hasHeavyDamage: false,
  hasChassisRepair: false,
  airbagStatus: "Açmamış",
  hasTotalLossHistory: false,
  hasExpertiseReport: true,
  lastMaintenanceDate: "2026-06-01",
  timingBeltInfo: "",
  transmissionMaintenanceInfo: "Yağ değişti",
  batteryStatus: "İyi",
  tireStatus: "İyi",
  inspectionEndDate: "2027-01-01",
  lpgStatus: "Yok",
  lpgRegistered: false,
  hasSpareKey: true,
  hasMaintenanceInvoices: true,
  sellerDescription: "Araç ekspertize açık, bakımları düzenli yapılmış ve servis kayıtları görülebilir durumdadır.",
  listingUrl: "",
};

function agirBakim(input: VehicleFormData) {
  return costSignals(input).find((signal) => signal.item === "Ağır bakım");
}

describe("cost signals", () => {
  it("reports insufficient info when the timing belt field is left blank", () => {
    expect(agirBakim({ ...baseInput, timingBeltInfo: "" })?.level).toBe("Bilgi yetersiz");
  });

  it("does not report low cost risk when the user explicitly says they don't know", () => {
    expect(agirBakim({ ...baseInput, timingBeltInfo: "Bilinmiyor" })?.level).toBe("Bilgi yetersiz");
  });

  it("does not report low cost risk when the user leaves the field unspecified", () => {
    expect(agirBakim({ ...baseInput, timingBeltInfo: "Belirtilmemiş" })?.level).toBe("Bilgi yetersiz");
  });

  it("reports medium cost risk when a change may be due soon", () => {
    expect(agirBakim({ ...baseInput, timingBeltInfo: "Değişim zamanı yaklaşmış olabilir" })?.level).toBe("Orta");
  });

  it("reports low cost risk once a documented replacement is confirmed", () => {
    expect(agirBakim({ ...baseInput, timingBeltInfo: "Değişmiş, fatura mevcut" })?.level).toBe("Düşük");
  });
});
