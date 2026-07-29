import { describe, expect, it } from "vitest";
import { analyzeVehicle } from "@/lib/analysis/engine";
import { damageRules } from "@/lib/analysis/rules/damage-rules";
import { missingInformation } from "@/lib/analysis/rules/document-rules";
import { evaluateMileage } from "@/lib/analysis/rules/mileage-rules";
import { detectedClaims } from "@/lib/analysis/rules/seller-rules";
import { generateSellerQuestions } from "@/lib/analysis/questions";
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

describe("analysis engine", () => {
  it("calculates a score out of 100", () => {
    const result = analyzeVehicle(baseInput);
    expect(result.totalScore).toBeGreaterThanOrEqual(0);
    expect(result.totalScore).toBeLessThanOrEqual(100);
    expect(result.breakdown.damageHistory).toBeLessThanOrEqual(30);
  });

  it("flags heavy damage as high severity", () => {
    const findings = damageRules({ ...baseInput, hasHeavyDamage: true });
    expect(findings).toContainEqual(expect.objectContaining({ id: "heavy-damage", severity: "high" }));
  });

  it("evaluates annual mileage", () => {
    const mileage = evaluateMileage({ ...baseInput, year: 2025, mileage: 120000 });
    expect(mileage.annualMileage).toBeGreaterThan(40000);
    expect(mileage.label).toBe("Çok yüksek kullanım");
  });

  it("detects missing information", () => {
    const missing = missingInformation({ ...baseInput, hasExpertiseReport: false, hasSpareKey: false, ownerInfo: "" });
    expect(missing).toContain("Ekspertiz raporu");
    expect(missing).toContain("Yedek anahtar");
    expect(missing).toContain("Ruhsat sahibinin kim olduğu");
  });

  it("prioritizes seller questions from findings", () => {
    const findings = damageRules({ ...baseInput, hasChassisRepair: true });
    const questions = generateSellerQuestions(baseInput, findings);
    expect(questions[0]).toBe("Tramer kaydının tarih ve detaylarını paylaşır mısınız?");
  });

  it("detects claim phrases in seller description", () => {
    const claims = detectedClaims("Acil satılık, masrafsız, doktordan, fiyat son.");
    expect(claims).toEqual(expect.arrayContaining(["Acil satılık", "Masrafsız", "Doktordan", "Fiyat son"]));
  });
});
