import { describe, expect, it } from "vitest";
import { findChronicIssues } from "@/lib/chronic-issues/match";

describe("findChronicIssues", () => {
  it("matches by engine code mentioned in the seller description over bare displacement", () => {
    const { issues } = findChronicIssues({
      brand: "Seat",
      model: "Ibiza",
      year: 2015,
      fuelType: "Benzin",
      engineSize: "1.2",
      trim: "Reference",
      sellerDescription: "Temiz 1.2 TSI, tek elden, bakımları yetkili serviste yapılmış.",
    });

    expect(issues.length).toBeGreaterThan(0);
    expect(issues.every((issue) => issue.engineLabel === "1.2 TSI")).toBe(true);
    expect(issues.some((issue) => issue.id === "ibiza-12tsi-cbzb-chain")).toBe(true);
  });

  it("falls back to displacement matching when the description has no engine code", () => {
    const { issues } = findChronicIssues({
      brand: "Fiat",
      model: "Egea",
      year: 2018,
      fuelType: "Dizel",
      engineSize: "1.6",
      trim: "",
      sellerDescription: "Bakımlı, hasarsız araç.",
    });

    expect(issues.length).toBeGreaterThan(0);
    expect(issues.every((issue) => issue.engineLabel === "1.6 Multijet")).toBe(true);
  });

  it("returns a broad, flagged match when neither description nor displacement disambiguates the engine", () => {
    const { issues } = findChronicIssues({
      brand: "Fiat",
      model: "Egea",
      year: 2018,
      fuelType: "Dizel",
      engineSize: "",
      trim: "",
      sellerDescription: "Bakımlı, hasarsız araç.",
    });

    expect(issues.length).toBeGreaterThan(0);
    expect(issues.every((issue) => issue.broadMatch)).toBe(true);
  });

  it("returns nothing for an unknown model", () => {
    const { entry, issues } = findChronicIssues({
      brand: "UnknownBrand",
      model: "UnknownModel",
      year: 2018,
      fuelType: "Benzin",
      engineSize: "1.6",
      trim: "",
      sellerDescription: "",
    });

    expect(entry).toBeNull();
    expect(issues).toEqual([]);
  });

  it("returns nothing when the year falls outside the model's production range", () => {
    const { issues } = findChronicIssues({
      brand: "Fiat",
      model: "Egea",
      year: 1999,
      fuelType: "Dizel",
      engineSize: "1.6",
      trim: "",
      sellerDescription: "",
    });

    expect(issues).toEqual([]);
  });
});
