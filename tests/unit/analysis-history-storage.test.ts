import { beforeEach, describe, expect, it } from "vitest";
import { analyzeVehicle } from "@/lib/analysis/engine";
import {
  createAnalysisHistoryId,
  deleteAnalysisHistory,
  getAnalysisHistoryRecord,
  loadAnalysisHistory,
  upsertAnalysisHistory,
} from "@/lib/storage/analysis-history-storage";
import type { VehicleFormData } from "@/lib/schemas/vehicle";

const baseInput: VehicleFormData = {
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

describe("analysis history storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts empty", () => {
    expect(loadAnalysisHistory()).toEqual([]);
  });

  it("saves a record and lists it newest-first", () => {
    const first = { id: createAnalysisHistoryId(), result: analyzeVehicle(baseInput) };
    const second = { id: createAnalysisHistoryId(), result: analyzeVehicle({ ...baseInput, brand: "Honda" }) };

    upsertAnalysisHistory(first);
    const records = upsertAnalysisHistory(second);

    expect(records.map((item) => item.id)).toEqual([second.id, first.id]);
    expect(loadAnalysisHistory().map((item) => item.id)).toEqual([second.id, first.id]);
  });

  it("finds a record by id", () => {
    const record = { id: createAnalysisHistoryId(), result: analyzeVehicle(baseInput) };
    upsertAnalysisHistory(record);

    expect(getAnalysisHistoryRecord(record.id)?.result.totalScore).toBe(record.result.totalScore);
    expect(getAnalysisHistoryRecord("does-not-exist")).toBeNull();
  });

  it("deletes a record by id", () => {
    const record = { id: createAnalysisHistoryId(), result: analyzeVehicle(baseInput) };
    upsertAnalysisHistory(record);

    const remaining = deleteAnalysisHistory(record.id);

    expect(remaining).toEqual([]);
    expect(loadAnalysisHistory()).toEqual([]);
  });

  it("caps stored records so history can't grow without bound", () => {
    for (let i = 0; i < 60; i += 1) {
      upsertAnalysisHistory({ id: createAnalysisHistoryId(), result: analyzeVehicle(baseInput) });
    }

    expect(loadAnalysisHistory().length).toBeLessThanOrEqual(50);
  });

  it("ignores malformed JSON instead of throwing", () => {
    localStorage.setItem("eksperiq:analysis-history", "{bozuk-json");

    expect(loadAnalysisHistory()).toEqual([]);
  });
});
