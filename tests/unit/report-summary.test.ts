import { describe, expect, it } from "vitest";
import { analyzeVehicle } from "@/lib/analysis/engine";
import { formatAnalysisSummary, formatSellerQuestionMessage } from "@/lib/analysis/report-summary";
import type { VehicleFormData } from "@/lib/schemas/vehicle";

const input: VehicleFormData = {
  brand: "Toyota",
  model: "Corolla",
  year: 2020,
  trim: "",
  fuelType: "Benzin",
  transmission: "Otomatik",
  mileage: 90000,
  price: 1200000,
  city: "İstanbul",
  bodyType: "",
  engineSize: "",
  enginePower: "",
  drivetrain: "",
  ownerInfo: "",
  tradeStatus: "",
  tramerAmount: 150000,
  paintedParts: "",
  replacedParts: "kaput, sol kapı",
  localPaintedParts: "",
  hasHeavyDamage: false,
  hasChassisRepair: false,
  airbagStatus: "",
  hasTotalLossHistory: false,
  hasCommercialHistory: false,
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
  sellerDescription: "Ekspertize açık, masrafsız yazılmış ama detayları doğrulanmalı.",
  listingUrl: "https://example.com/ilan/123",
};

describe("report summary", () => {
  it("formats a copyable Turkish report summary", () => {
    const summary = formatAnalysisSummary(analyzeVehicle(input));

    expect(summary).toContain("EksperIQ ikinci el araç ilanı karar desteği");
    expect(summary).toContain("Araç: Toyota Corolla 2020");
    expect(summary).toContain("Risk skoru:");
    expect(summary).toContain("Bilgi doluluğu:");
    expect(summary).toContain("Öncelikli ilk aksiyonlar:");
    expect(summary).toContain("Neden:");
    expect(summary).toContain("Öne çıkan riskler:");
    expect(summary).toContain("Satıcıya ilk sorular:");
    expect(summary).not.toContain("İlan referansı:");
    expect(summary).not.toContain("https://example.com/ilan/123");
    expect(summary).toContain("Profesyonel araç ekspertizinin");
  });

  it("formats a seller-ready question message", () => {
    const message = formatSellerQuestionMessage(analyzeVehicle(input));

    expect(message).toContain("Merhaba, 2020 Toyota Corolla ilanınızla ilgileniyorum.");
    expect(message).toContain("Satın alma öncesi birkaç bilgiyi netleştirmek isterim:");
    expect(message).toContain("1.");
    expect(message).toContain("EksperIQ karar desteği notum:");
    expect(message).toContain("kesin ekspertiz sonucu değildir");
    expect(message).not.toContain("İlan referansı:");
    expect(message).not.toContain("https://example.com/ilan/123");
  });
});
