import { beforeEach, describe, expect, it } from "vitest";
import {
  createVehicleId,
  deleteVehicle,
  ensureDefaultVehicle,
  loadVehicles,
  upsertVehicle,
} from "@/lib/storage/vehicle-storage";
import { DEFAULT_VEHICLE_LABEL } from "@/lib/vehicles/types";

describe("vehicle storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("creates a default vehicle on first load so single-car users see no change", () => {
    const vehicles = loadVehicles();

    expect(vehicles).toHaveLength(1);
    expect(vehicles[0].label).toBe(DEFAULT_VEHICLE_LABEL);
  });

  it("returns the same default vehicle on repeated loads instead of creating duplicates", () => {
    const first = loadVehicles();
    const second = loadVehicles();

    expect(second).toEqual(first);
  });

  it("adds a second vehicle", () => {
    ensureDefaultVehicle();
    const secondVehicle = { id: createVehicleId(), label: "İkinci Arabam", createdAt: new Date().toISOString() };

    const vehicles = upsertVehicle(secondVehicle);

    expect(vehicles).toHaveLength(2);
    expect(vehicles.map((v) => v.label)).toEqual([DEFAULT_VEHICLE_LABEL, "İkinci Arabam"]);
  });

  it("renames a vehicle by upserting the same id", () => {
    const [defaultVehicle] = ensureDefaultVehicle();

    const vehicles = upsertVehicle({ ...defaultVehicle, label: "Renault Megane" });

    expect(vehicles).toHaveLength(1);
    expect(vehicles[0].label).toBe("Renault Megane");
  });

  it("refuses to delete the last remaining vehicle", () => {
    const [onlyVehicle] = ensureDefaultVehicle();

    const result = deleteVehicle(onlyVehicle.id);

    expect(result).toEqual({ ok: false, reason: "last-vehicle" });
    expect(loadVehicles()).toHaveLength(1);
  });

  it("deletes a vehicle when more than one exists", () => {
    const [firstVehicle] = ensureDefaultVehicle();
    const secondVehicle = { id: createVehicleId(), label: "İkinci Arabam", createdAt: new Date().toISOString() };
    upsertVehicle(secondVehicle);

    const result = deleteVehicle(secondVehicle.id);

    expect(result).toEqual({ ok: true, vehicles: [firstVehicle] });
    expect(loadVehicles()).toEqual([firstVehicle]);
  });
});
