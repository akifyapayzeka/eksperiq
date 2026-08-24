import { describe, expect, it } from "vitest";
import { analyzeVehicle } from "@/lib/analysis/engine";
import { damageRules } from "@/lib/analysis/rules/damage-rules";
import { missingInformation } from "@/lib/analysis/rules/document-rules";
import { evaluateMileage } from "@/lib/analysis/rules/mileage-rules";
import { detectedClaims, sellerRules } from "@/lib/analysis/rules/seller-rules";
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
  hasCommercialHistory: false,
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

  it("does not flag a negated airbag status ('Açmamış') as an intervention", () => {
    // "Açmamış" means "has NOT deployed" — a naive substring match for "aç"
    // matched this negated form too, since Turkish negates with a "-ma-"
    // infix right after the verb stem ("aç" + "ma" + "mış"). This was firing
    // a high-severity "airbag" finding on baseInput itself, which is meant
    // to represent a clean vehicle.
    const findings = damageRules({ ...baseInput, airbagStatus: "Açmamış" });
    expect(findings.some((finding) => finding.id === "airbag")).toBe(false);
  });

  it("still flags an affirmative airbag claim ('Açmış')", () => {
    const findings = damageRules({ ...baseInput, airbagStatus: "Açmış" });
    expect(findings).toContainEqual(expect.objectContaining({ id: "airbag", severity: "high" }));
  });

  it("comments on declared single paint and low-risk bumper replacement details", () => {
    const findings = damageRules({
      ...baseInput,
      paintedParts: "Sağ ön kapı",
      replacedParts: "Ön tampon",
      localPaintedParts: "",
    });

    expect(findings).toContainEqual(expect.objectContaining({ id: "painted-parts-declared", severity: "low" }));
    const replaced = findings.find((finding) => finding.id === "single-replaced-part");
    expect(replaced).toMatchObject({ severity: "low" });
    expect(replaced?.explanation).toContain("tek başına ağır kaza göstergesi sayılmaz");
  });

  it("explains that a replaced door is a medium risk unless structure is affected", () => {
    const findings = damageRules({
      ...baseInput,
      replacedParts: "Sağ ön kapı",
    });

    const replaced = findings.find((finding) => finding.id === "single-replaced-part");
    expect(replaced).toMatchObject({ severity: "medium" });
    expect(replaced?.explanation).toContain("her zaman aracı almaktan vazgeçme sebebi değildir");
    expect(replaced?.recommendation).toContain("direk-eşik geçişi");
  });

  it("treats a replaced hood as high-priority front impact evidence", () => {
    const findings = damageRules({
      ...baseInput,
      replacedParts: "Kaput",
    });

    const replaced = findings.find((finding) => finding.id === "single-replaced-part");
    expect(replaced).toMatchObject({ severity: "high" });
    expect(replaced?.explanation).toContain("ön taraftan alınmış darbeyle ilişkili olabilir");
    expect(replaced?.recommendation).toContain("şasi uçları");
  });

  it("flags a whole-car repaint as high severity instead of the flat 'low' painted-parts treatment", () => {
    // Regression test for 5 real sahibinden.com listings sent by the owner
    // (2026-08-24) — every one described a full-body repaint using this
    // kind of language ("komple boyalı", "TEMİZLİK BOYASI VARDIR" across
    // most panels, "YENİ FIRIN BOYADIR", "SIFIRDAN TOPLANMIŞTIR"), and the
    // existing paintedParts handling scored it identically to a single
    // touched-up bumper (severity "low") — the opposite of the real risk.
    const findings = damageRules({
      ...baseInput,
      sellerDescription: "Araç komple boyalıdır, aksi halde tertemizdir.",
    });
    expect(findings).toContainEqual(expect.objectContaining({ id: "full-body-repaint", severity: "high" }));
  });

  it("also flags a whole-car repaint declared only in paintedParts, not the description", () => {
    const findings = damageRules({ ...baseInput, paintedParts: "Tüm kaporta baştan sona boyalı" });
    expect(findings).toContainEqual(expect.objectContaining({ id: "full-body-repaint", severity: "high" }));
  });

  it("calls out the contradiction when a listing claims both 'no damage record' and a full repaint", () => {
    const findings = damageRules({
      ...baseInput,
      sellerDescription: "Hasar kaydı yok, komple boyalıdır, çok bakımlı bir araçtır.",
    });
    expect(findings).toContainEqual(
      expect.objectContaining({ id: "full-body-repaint-clean-claim-conflict", severity: "high" }),
    );
  });

  it("does not flag an ordinary description mentioning paint just once as a full-body repaint", () => {
    const findings = damageRules({ ...baseInput, paintedParts: "Sağ ön kapı" });
    expect(findings.some((finding) => finding.id === "full-body-repaint")).toBe(false);
  });

  it("scales severity with painted-part count instead of always scoring 'low'", () => {
    // Regression test for a real 2026-08-24 listing: "SOL ARKA KAPI BOYALI,
    // SAĞ ARKA ÇAMURLUK BOYALI" (2 named panels) and another real listing
    // with 3 separately-named local paint spots — both used to score
    // identically to a single touched-up bumper (flat "low"), unlike
    // replacedParts which already scales with count.
    const single = damageRules({ ...baseInput, paintedParts: "Sol arka kapı" });
    expect(single).toContainEqual(expect.objectContaining({ id: "painted-parts-declared", severity: "low" }));
    expect(single.some((finding) => finding.id === "multiple-painted-parts")).toBe(false);

    const twoDoorPanels = damageRules({ ...baseInput, paintedParts: "Sol arka kapı, Sağ arka çamurluk" });
    expect(twoDoorPanels).toContainEqual(expect.objectContaining({ id: "multiple-painted-parts", severity: "medium" }));
    expect(twoDoorPanels.some((finding) => finding.id === "painted-parts-declared")).toBe(false);

    const fourPanels = damageRules({
      ...baseInput,
      paintedParts: "Sağ ön çamurluk, Sol ön çamurluk, Bagaj kapağı, Ön tampon",
    });
    expect(fourPanels).toContainEqual(expect.objectContaining({ id: "multiple-painted-parts", severity: "high" }));

    const paintedHood = damageRules({ ...baseInput, paintedParts: "Kaput, Sağ ön kapı" });
    expect(paintedHood).toContainEqual(expect.objectContaining({ id: "multiple-painted-parts", severity: "high" }));
  });

  it("does not call damage fields empty when the seller description claims no damage record", () => {
    const findings = damageRules({
      ...baseInput,
      paintedParts: "",
      replacedParts: "",
      localPaintedParts: "",
      tramerAmount: 0,
      sellerDescription: "Hatasız boyasız, hasar kaydı yoktur, aile aracı.",
    });

    expect(findings).toContainEqual(
      expect.objectContaining({
        id: "seller-clean-damage-claim",
        title: "Satıcı hasar kaydı olmadığını belirtiyor",
      }),
    );
    expect(findings).not.toContainEqual(expect.objectContaining({ id: "damage-empty" }));
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

  it("does not push tramer/şasi/airbag questions to the top for a routine low-severity paint disclosure", () => {
    // Regression test for a live incident: a listing declaring only a
    // single repainted bumper (the lowest-severity, most common "Hasar"
    // finding — see damage-rules.ts) used to trip the exact same top-3
    // "ilk sorulacak sorular" as a car with real structural damage, even
    // though the listing itself stated it had no damage record.
    const inputWithMinorPaint = { ...baseInput, paintedParts: "Ön tampon" };
    const findings = damageRules(inputWithMinorPaint);
    expect(findings.every((finding) => finding.category !== "Hasar" || finding.severity === "low")).toBe(true);
    const questions = generateSellerQuestions(inputWithMinorPaint, findings);
    expect(questions.slice(0, 3)).not.toContain("Şasi, podye, direk veya tavan işlem gördü mü?");
    expect(questions.slice(0, 3)).not.toContain("Airbag açtı mı veya değişti mi?");
  });

  it("flags a declared commercial/taxi history as a high-severity seller finding", () => {
    // Regression test for 4 of 5 real sahibinden.com listings sent by the
    // owner (2026-08-24) that raised ex-taxi/commercial history unprompted —
    // there was no field, extraction, or rule anywhere for it before this.
    const findings = sellerRules({ ...baseInput, hasCommercialHistory: true });
    expect(findings).toContainEqual(expect.objectContaining({ id: "commercial-history", severity: "high" }));
  });

  it("does not flag commercial history when it was not declared", () => {
    const findings = sellerRules({ ...baseInput, hasCommercialHistory: false });
    expect(findings.some((finding) => finding.id === "commercial-history")).toBe(false);
  });

  it("prioritizes the commercial-history question when it is declared", () => {
    const questions = generateSellerQuestions({ ...baseInput, hasCommercialHistory: true }, []);
    expect(questions[0]).toBe("Aracın ticari (taksi/kiralık) geçmişi var mı, varsa ne kadar süre bu şekilde kullanıldı?");
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
