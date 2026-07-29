import { beforeEach, describe, expect, it } from "vitest";
import { analyzeVehicle } from "@/lib/analysis/engine";
import { appConfig } from "@/lib/constants/app";
import {
  clearAnalysis,
  loadChecklist,
  loadFindingFilter,
  saveAnalysis,
  saveChecklist,
  saveFindingFilter,
} from "@/lib/storage/analysis-storage";
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

  it("persists only valid finding filters", () => {
    saveFindingFilter("high");

    expect(loadFindingFilter()).toBe("high");

    sessionStorage.setItem(findingFilterStorageKey, "kritik");

    expect(loadFindingFilter()).toBe("all");
    expect(sessionStorage.getItem(findingFilterStorageKey)).toBeNull();
  });
});
