import { describe, expect, it } from "vitest";
import { canAddVehicle, getVehicleLimit } from "@/lib/pro/vehicle-limit";

describe("vehicle limit", () => {
  it("caps free at 1, pro at 5, and proPlus at 20 vehicles", () => {
    expect(getVehicleLimit("free")).toBe(1);
    expect(getVehicleLimit("pro")).toBe(5);
    expect(getVehicleLimit("proPlus")).toBe(20);
  });

  it("allows adding a vehicle only while under the tier's limit", () => {
    expect(canAddVehicle("free", 0)).toBe(true);
    expect(canAddVehicle("free", 1)).toBe(false);

    expect(canAddVehicle("pro", 4)).toBe(true);
    expect(canAddVehicle("pro", 5)).toBe(false);

    expect(canAddVehicle("proPlus", 19)).toBe(true);
    expect(canAddVehicle("proPlus", 20)).toBe(false);
  });
});
