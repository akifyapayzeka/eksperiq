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

  it("comments on declared single paint and replaced-part details", () => {
    const findings = damageRules({
      ...baseInput,
      paintedParts: "Sağ ön kapı",
      replacedParts: "Ön tampon",
      localPaintedParts: "",
    });

    expect(findings).toContainEqual(expect.objectContaining({ id: "painted-parts-declared", severity: "low" }));
    expect(findings).toContainEqual(expect.objectContaining({ id: "single-replaced-part", severity: "medium" }));
  });

  it("shows chronic issue guidance for 2021 Renault Clio", () => {
    const result = analyzeVehicle({
      ...baseInput,
      brand: "Renault",
      model: "Clio",
      year: 2021,
      fuelType: "Benzin",
      transmission: "Manuel",
      engineSize: "1.0",
      mileage: 115000,
    });

    expect(result.knownIssues.length).toBeGreaterThan(0);
    expect(result.knownIssues[0].engineLabel).toContain("1.0");
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

  it("adds diesel-specific questions for diesel vehicles", () => {
    const questions = generateSellerQuestions({ ...baseInput, fuelType: "Dizel" }, []);
    expect(questions).toContain("Partikül filtresi (DPF) temizliği veya değişimi yapıldı mı?");
    expect(questions).toContain("Turbo arızası veya bakımı geçmişi var mı?");
  });

  it("does not add diesel-specific questions for petrol vehicles", () => {
    const questions = generateSellerQuestions({ ...baseInput, fuelType: "Benzin" }, []);
    expect(questions).not.toContain("Partikül filtresi (DPF) temizliği veya değişimi yapıldı mı?");
  });

  it("adds a battery health question for hybrid and electric vehicles", () => {
    const hybridQuestions = generateSellerQuestions({ ...baseInput, fuelType: "Hibrit" }, []);
    const electricQuestions = generateSellerQuestions({ ...baseInput, fuelType: "Elektrik" }, []);
    expect(hybridQuestions).toContain("Batarya sağlık durumu veya garantisi hakkında belge var mı?");
    expect(electricQuestions).toContain("Batarya sağlık durumu veya garantisi hakkında belge var mı?");
  });

  it("adds a drivetrain question for 4x4/AWD vehicles", () => {
    const questions = generateSellerQuestions({ ...baseInput, drivetrain: "4x4" }, []);
    expect(questions).toContain("Aktarma organları (transfer kutusu, diferansiyel) yağ bakımı yapıldı mı?");
  });

  it("adds a wear-item question for high-mileage vehicles", () => {
    const questions = generateSellerQuestions({ ...baseInput, mileage: 180000 }, []);
    expect(questions).toContain("Süspansiyon burçları ve motor takozlarında değişim yapıldı mı?");
  });

  it("adds a corrosion question for vehicles older than 10 years", () => {
    const questions = generateSellerQuestions({ ...baseInput, year: 2010 }, []);
    expect(questions).toContain("Kaporta veya alt takımda pas/korozyon var mı?");
  });
});
