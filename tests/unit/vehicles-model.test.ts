import { describe, expect, it } from "vitest";
import { filterByVehicle, recordVehicleId } from "@/lib/vehicles/model";
import type { VehicleProfile } from "@/lib/vehicles/types";

const vehicleA: VehicleProfile = { id: "a", label: "Aracım", createdAt: "2026-01-01T00:00:00.000Z" };
const vehicleB: VehicleProfile = { id: "b", label: "İkinci Arabam", createdAt: "2026-02-01T00:00:00.000Z" };
const vehicles = [vehicleA, vehicleB];

describe("recordVehicleId", () => {
  it("returns the record's own vehicleId when tagged", () => {
    expect(recordVehicleId({ vehicleId: "b" }, vehicles)).toBe("b");
  });

  it("falls back to the first vehicle for untagged legacy records", () => {
    expect(recordVehicleId({}, vehicles)).toBe("a");
  });
});

describe("filterByVehicle", () => {
  const records = [{ id: "r1", vehicleId: "a" }, { id: "r2", vehicleId: "b" }, { id: "r3" }];

  it("includes untagged records under the first (default) vehicle", () => {
    expect(filterByVehicle(records, "a", vehicles).map((r) => r.id)).toEqual(["r1", "r3"]);
  });

  it("excludes records belonging to other vehicles", () => {
    expect(filterByVehicle(records, "b", vehicles).map((r) => r.id)).toEqual(["r2"]);
  });
});
