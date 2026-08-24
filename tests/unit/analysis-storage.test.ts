import { beforeEach, describe, expect, it } from "vitest";
import { analyzeVehicle } from "@/lib/analysis/engine";
import { appConfig } from "@/lib/constants/app";
import {
  clearAnalysis,
  loadAnalysis,
  loadChecklist,
  loadFindingFilter,
  openAnalysisFromHistory,
  saveAnalysis,
  saveChecklist,
  saveFindingFilter,
} from "@/lib/storage/analysis-storage";
import { loadAnalysisHistory } from "@/lib/storage/analysis-history-storage";
import type { VehicleFormData } from "@/lib/schemas/vehicle";

const checklistStorageKey = `${appConfig.storageKey}:checklist`;
const findingFilterStorageKey = `${appConfig.storageKey}:finding-filter`;

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
  tramerAmount: 0,
  paintedParts: "",
  replacedParts: "",
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
  sellerDescription: "Ekspertize açık, bakım ve hasar detayları satıcıdan belgeyle doğrulanmalı.",
  listingUrl: "",
};

describe("analysis storage", () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  it("loads only checklist items that belong to the current report", () => {
    saveChecklist(["Ruhsat sahibini doğruladım", "Geçersiz madde"]);

    expect(loadChecklist(["Ruhsat sahibini doğruladım", "Tramer kaydını gördüm"])).toEqual([
      "Ruhsat sahibini doğruladım",
    ]);
  });

  it("clears checklist state when a new analysis is saved", () => {
    saveChecklist(["Ruhsat sahibini doğruladım"]);
    saveFindingFilter("high");
    saveAnalysis(analyzeVehicle(input));

    expect(loadChecklist(["Ruhsat sahibini doğruladım"])).toEqual([]);
    expect(loadFindingFilter()).toBe("all");
  });

  it("removes invalid checklist JSON instead of throwing", () => {
    sessionStorage.setItem(checklistStorageKey, "{bozuk-json");

    expect(loadChecklist(["Ruhsat sahibini doğruladım"])).toEqual([]);
    expect(sessionStorage.getItem(checklistStorageKey)).toBeNull();
  });

  it("clears analysis and checklist storage together", () => {
    saveAnalysis(analyzeVehicle(input));
    saveChecklist(["Ruhsat sahibini doğruladım"]);
    saveFindingFilter("medium");

    clearAnalysis();

    expect(sessionStorage.getItem(appConfig.storageKey)).toBeNull();
    expect(sessionStorage.getItem(checklistStorageKey)).toBeNull();
    expect(sessionStorage.getItem(findingFilterStorageKey)).toBeNull();
  });

  it("also appends the saved analysis to the device-wide analysis history", () => {
    const result = analyzeVehicle(input);
    saveAnalysis(result);

    const history = loadAnalysisHistory();
    expect(history).toHaveLength(1);
    expect(history[0].result.totalScore).toBe(result.totalScore);
  });

  it("keeps analysis history intact when the current session result is cleared", () => {
    saveAnalysis(analyzeVehicle(input));
    clearAnalysis();

    expect(loadAnalysisHistory()).toHaveLength(1);
  });

  it("opens a past analysis into the current session slot without duplicating history", () => {
    const first = analyzeVehicle(input);
    saveAnalysis(first);
    const second = analyzeVehicle({ ...input, brand: "Honda", model: "Civic" });
    saveAnalysis(second);

    openAnalysisFromHistory(first);

    expect(JSON.parse(sessionStorage.getItem(appConfig.storageKey) ?? "null")?.totalScore).toBe(first.totalScore);
    expect(loadAnalysisHistory()).toHaveLength(2);
  });

  it("defaults knownIssues to an empty array when loading a report saved before that field existed", () => {
    const legacy = analyzeVehicle(input) as unknown as Record<string, unknown>;
    delete legacy.knownIssues;
    sessionStorage.setItem(appConfig.storageKey, JSON.stringify(legacy));

    expect(loadAnalysis()?.knownIssues).toEqual([]);
  });

  it("persists only valid finding filters", () => {
    saveFindingFilter("high");

    expect(loadFindingFilter()).toBe("high");

    sessionStorage.setItem(findingFilterStorageKey, "kritik");

    expect(loadFindingFilter()).toBe("all");
    expect(sessionStorage.getItem(findingFilterStorageKey)).toBeNull();
  });
});
