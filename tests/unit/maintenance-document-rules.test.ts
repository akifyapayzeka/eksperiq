import { describe, expect, it } from "vitest";
import { maintenanceRules } from "@/lib/analysis/rules/maintenance-rules";
import { documentRules, missingInformation } from "@/lib/analysis/rules/document-rules";
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
  timingBeltInfo: "Zincir kontrol edildi",
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

function isoDateAfter(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

describe("maintenance rules", () => {
  it("flags unregistered LPG as high severity even when maintenance records exist", () => {
    const findings = maintenanceRules({ ...baseInput, lpgStatus: "Var", lpgRegistered: false });

    expect(findings).toContainEqual(
      expect.objectContaining({
        id: "lpg-not-registered",
        category: "Evrak",
        severity: "high",
      }),
    );
  });

  it("flags inspection dates inside the configured near-term window", () => {
    const findings = maintenanceRules({ ...baseInput, inspectionEndDate: isoDateAfter(10) });

    expect(findings).toContainEqual(expect.objectContaining({ id: "inspection-soon", severity: "medium" }));
  });

  it("does not flag invalid inspection dates as near-term inspection risk", () => {
    const findings = maintenanceRules({ ...baseInput, inspectionEndDate: "geçersiz-tarih" });

    expect(findings).not.toContainEqual(expect.objectContaining({ id: "inspection-soon" }));
  });
});

describe("document rules", () => {
  it("creates low-severity missing information findings for each requested document signal", () => {
    const findings = documentRules({
      ...baseInput,
      ownerInfo: "",
      tireStatus: "",
      inspectionEndDate: "",
      hasExpertiseReport: false,
      hasMaintenanceInvoices: false,
      hasSpareKey: false,
    });

    expect(findings).toContainEqual(expect.objectContaining({ id: "no-expertise", severity: "medium" }));
    expect(findings).toContainEqual(
      expect.objectContaining({
        title: "Ruhsat sahibinin kim olduğu istenmeli",
        severity: "low",
      }),
    );
    expect(findings).toContainEqual(
      expect.objectContaining({
        title: "Lastik üretim tarihi istenmeli",
        severity: "low",
      }),
    );
  });

  it("keeps always-needed verification documents in the missing information list", () => {
    const missing = missingInformation(baseInput);

    expect(missing).toEqual(
      expect.arrayContaining([
        "Şasi numarasının son 6 hanesi",
        "Tramer detay belgesi",
        "Rehin veya haciz bilgisi",
        "Kilometre geçmişi",
      ]),
    );
  });
});
