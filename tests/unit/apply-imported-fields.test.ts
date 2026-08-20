import { describe, expect, it, vi } from "vitest";
import { applyImportedFieldsToForm } from "@/lib/listing-import/apply-to-form";
import type { ImportedListingFields } from "@/lib/listing-import/types";

function baseFields(overrides: Partial<Record<keyof ImportedListingFields, unknown>> = {}): ImportedListingFields {
  return {
    brand: null,
    model: null,
    year: null,
    trim: null,
    fuelType: null,
    transmission: null,
    mileage: null,
    price: null,
    city: null,
    bodyType: null,
    engineSize: null,
    enginePower: null,
    drivetrain: null,
    ownerInfo: null,
    tradeStatus: null,
    tramerAmount: null,
    paintedParts: null,
    replacedParts: null,
    localPaintedParts: null,
    airbagStatus: null,
    lpgStatus: null,
    hasHeavyDamage: null,
    hasChassisRepair: null,
    hasTotalLossHistory: null,
    hasExpertiseReport: null,
    lpgRegistered: null,
    hasSpareKey: null,
    hasMaintenanceInvoices: null,
    lastMaintenanceDate: null,
    timingBeltInfo: null,
    transmissionMaintenanceInfo: null,
    batteryStatus: null,
    tireStatus: null,
    inspectionEndDate: null,
    sellerDescription: null,
    ...overrides,
  } as ImportedListingFields;
}

describe("applyImportedFieldsToForm", () => {
  it("normalizes label/value objects before writing select fields", () => {
    const setValue = vi.fn();

    applyImportedFieldsToForm(
      baseFields({
        brand: { label: "Fiat", value: "Fiat" },
        transmission: { label: "Manuel", value: "Manuel" },
        city: { label: "İstanbul", value: "İstanbul" },
        year: 2005,
        mileage: 317000,
        price: 329000,
        fuelType: "Benzin",
        lpgStatus: "Var",
        lpgRegistered: true,
        replacedParts: "Kaput, Sol ön kapı",
      }),
      setValue,
    );

    expect(setValue).toHaveBeenCalledWith("brand", "Fiat", expect.anything());
    expect(setValue).toHaveBeenCalledWith("transmission", "Manuel", expect.anything());
    expect(setValue).toHaveBeenCalledWith("city", "İstanbul", expect.anything());
    expect(setValue).toHaveBeenCalledWith("year", 2005, expect.anything());
    expect(setValue).toHaveBeenCalledWith("mileage", 317000, expect.anything());
    expect(setValue).toHaveBeenCalledWith("price", 329000, expect.anything());
    expect(setValue).toHaveBeenCalledWith("fuelType", "Benzin", expect.anything());
    expect(setValue).toHaveBeenCalledWith("lpgStatus", "Var", expect.anything());
    expect(setValue).toHaveBeenCalledWith("lpgRegistered", true, expect.anything());
    expect(setValue).toHaveBeenCalledWith("replacedParts", "Kaput, Sol ön kapı", expect.anything());
  });

  it("does not write arbitrary objects into string select fields", () => {
    const setValue = vi.fn();

    applyImportedFieldsToForm(
      baseFields({
        brand: { name: "Fiat" },
        transmission: { text: "Manuel" },
        city: {},
      }),
      setValue,
    );

    expect(setValue).not.toHaveBeenCalledWith("brand", expect.anything(), expect.anything());
    expect(setValue).not.toHaveBeenCalledWith("transmission", expect.anything(), expect.anything());
    expect(setValue).not.toHaveBeenCalledWith("city", expect.anything(), expect.anything());
  });
});
