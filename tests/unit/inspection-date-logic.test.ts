import { describe, expect, it } from "vitest";
import { maintenanceRules } from "@/lib/analysis/rules/maintenance-rules";
import { costSignals } from "@/lib/analysis/recommendations";
import type { VehicleFormData } from "@/lib/schemas/vehicle";

/**
 * Muayene tarihi mantığı. Süresi GEÇMİŞ bir muayene ile YAKLAŞAN bir muayene
 * aynı şey değil: geçmiş muayeneyle araç trafiğe çıkamaz (idari para cezası +
 * ruhsat/plaka riski) ve alıcı bunu devraldığı anda masraf kesindir. Önceki
 * kod `inspectionDays <= 60` diyerek negatif günleri de bu kapsama alıyordu,
 * yani 8 ay önce süresi dolmuş bir muayene ekranda "Muayene tarihi yakın"
 * (orta önem) olarak görünüyordu.
 */

function daysFromToday(offset: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

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
  inspectionEndDate: "",
  lpgStatus: "Yok",
  lpgRegistered: false,
  hasSpareKey: true,
  hasMaintenanceInvoices: true,
  sellerDescription: "Araç ekspertize açık, bakımları düzenli yapılmış ve servis kayıtları görülebilir durumdadır.",
  listingUrl: "",
};

describe("muayene tarihi — süresi geçmiş vs yaklaşan", () => {
  it("süresi 240 gün önce dolmuş muayeneyi 'yakın' değil 'geçmiş' olarak bildirir", () => {
    const findings = maintenanceRules({ ...baseInput, inspectionEndDate: daysFromToday(-240) });
    const inspection = findings.filter((finding) => finding.id.startsWith("inspection-"));

    expect(inspection).toHaveLength(1);
    expect(inspection[0].id).toBe("inspection-expired");
    expect(inspection[0].severity).toBe("high");
    expect(inspection[0].title).not.toContain("yakın");
  });

  it("dün dolmuş muayene bile 'geçmiş' sayılır (sınır: 0 gün hâlâ geçerli)", () => {
    const expired = maintenanceRules({ ...baseInput, inspectionEndDate: daysFromToday(-1) });
    expect(expired.some((finding) => finding.id === "inspection-expired")).toBe(true);

    const lastValidDay = maintenanceRules({ ...baseInput, inspectionEndDate: daysFromToday(0) });
    expect(lastValidDay.some((finding) => finding.id === "inspection-expired")).toBe(false);
    expect(lastValidDay.some((finding) => finding.id === "inspection-soon")).toBe(true);
  });

  it("30 gün sonra dolacak muayene 'yakın' olarak kalır", () => {
    const findings = maintenanceRules({ ...baseInput, inspectionEndDate: daysFromToday(30) });
    expect(findings.some((finding) => finding.id === "inspection-soon")).toBe(true);
    expect(findings.some((finding) => finding.id === "inspection-expired")).toBe(false);
  });

  it("2 yıl sonra dolacak muayene için hiç bulgu üretmez", () => {
    const findings = maintenanceRules({ ...baseInput, inspectionEndDate: daysFromToday(730) });
    expect(findings.some((finding) => finding.id.startsWith("inspection-"))).toBe(false);
  });
});

describe("maliyet sinyali — muayene satırı gerçek tarihi yansıtır", () => {
  function muayeneLevel(inspectionEndDate: string): string {
    const signal = costSignals({ ...baseInput, inspectionEndDate }).find((item) => item.item === "Muayene");
    return signal?.level ?? "";
  }

  it("tarih girilmemişse bilgi yetersiz", () => {
    expect(muayeneLevel("")).toBe("Bilgi yetersiz");
  });

  it("süresi geçmiş muayene yüksek masraf sinyali verir", () => {
    expect(muayeneLevel(daysFromToday(-240))).toBe("Yüksek");
  });

  it("yaklaşan muayene 'Yakın tarihli' kalır", () => {
    expect(muayeneLevel(daysFromToday(30))).toBe("Yakın tarihli");
  });

  it("2 yıl sonrası için 'Yakın tarihli' demez — düşük masraf sinyalidir", () => {
    expect(muayeneLevel(daysFromToday(730))).toBe("Düşük");
  });
});
