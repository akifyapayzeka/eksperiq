import { describe, expect, it } from "vitest";
import { analyzeVehicle } from "@/lib/analysis/engine";
import { BUYER_DECISION_GUIDE, BUYER_EDUCATION_NOTES } from "@/lib/analysis/buyer-education";
import { buildReportPayload } from "@/lib/report/pdf-share";
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
  replacedParts: "kaput",
  localPaintedParts: "",
  hasHeavyDamage: false,
  hasChassisRepair: false,
  airbagStatus: "",
  hasTotalLossHistory: false,
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
  sellerDescription: "Ekspertize açık, bakımları düzenli denmiş ama fatura paylaşılmamış.",
  listingUrl: "https://example.com/ilan/123",
};

describe("report PDF payload", () => {
  it("carries buyer guide and education notes into the PDF request", () => {
    const payload = buildReportPayload(analyzeVehicle(input));

    expect(payload.buyerDecisionGuide).toEqual(BUYER_DECISION_GUIDE);
    expect(payload.buyerEducation).toEqual(BUYER_EDUCATION_NOTES);
    expect(payload.priorityActions.length).toBeGreaterThan(0);
    expect(payload.sellerQuestions.length).toBeGreaterThan(0);
    expect(payload.inspectionFocus.length).toBeGreaterThan(0);
  });

  it("carries the same sections the app itself shows: strengths, costs, chronic issues, completeness, photos", () => {
    const result = analyzeVehicle(input);
    const payload = buildReportPayload({ ...result, listingImages: ["https://example.com/a.jpg"] });

    expect(payload.strengths).toEqual(result.strengths);
    expect(payload.costs).toEqual(result.costs);
    expect(payload.knownIssues).toEqual(result.knownIssues);
    expect(payload.completeness).toEqual(result.completeness);
    expect(payload.listingImages).toEqual(["https://example.com/a.jpg"]);
  });
});
