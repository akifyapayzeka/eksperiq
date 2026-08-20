import { describe, expect, it } from "vitest";
import { findChronicIssues } from "@/lib/chronic-issues/match";
import { CHRONIC_ISSUES_DB } from "@/lib/chronic-issues/data";

describe("findChronicIssues", () => {
  it("matches by engine code mentioned in the seller description over bare displacement", () => {
    const { issues } = findChronicIssues({
      brand: "Seat",
      model: "Ibiza",
      year: 2015,
      fuelType: "Benzin",
      transmission: "Manuel",
      engineSize: "1.2",
      trim: "Reference",
      sellerDescription: "Temiz 1.2 TSI, tek elden, bakımları yetkili serviste yapılmış.",
    });

    expect(issues.length).toBeGreaterThan(0);
    expect(issues.some((issue) => issue.id === "ibiza-12tsi-cbzb-chain")).toBe(true);
    expect(issues.some((issue) => issue.id === "ibiza-12tsi-ea211-belt-service")).toBe(true);
  });

  it("does not apply the EA111 chain issue to the EA211 belt-driven 1.2 TSI variant", () => {
    const { issues } = findChronicIssues({
      brand: "Seat",
      model: "Ibiza",
      year: 2016,
      fuelType: "Benzin",
      transmission: "Manuel",
      engineSize: "1.2",
      trim: "Style",
      sellerDescription: "2016 Seat Ibiza 1.2 TSI 110 PS CJZD kayışlı motor, bakımlı.",
    });

    expect(issues.some((issue) => issue.id === "ibiza-12tsi-cbzb-chain")).toBe(false);
    expect(issues.some((issue) => issue.id === "ibiza-12tsi-ea211-belt-service")).toBe(true);
  });

  it("applies DSG DQ200 issues only to semi-automatic Ibiza listings", () => {
    const manual = findChronicIssues({
      brand: "Seat",
      model: "Ibiza",
      year: 2015,
      fuelType: "Benzin",
      transmission: "Manuel",
      engineSize: "",
      trim: "Reference",
      sellerDescription: "Manuel vites 1.2 TSI",
    });
    const dsg = findChronicIssues({
      brand: "Seat",
      model: "Ibiza",
      year: 2015,
      fuelType: "Benzin",
      transmission: "Yarı otomatik",
      engineSize: "",
      trim: "Style",
      sellerDescription: "DSG otomatik 1.2 TSI",
    });

    expect(manual.issues.some((issue) => issue.id === "ibiza-dq200-mechatronic-clutch")).toBe(false);
    expect(dsg.issues.some((issue) => issue.id === "ibiza-dq200-mechatronic-clutch")).toBe(true);
  });

  it("falls back to displacement matching when the description has no engine code", () => {
    const { issues } = findChronicIssues({
      brand: "Fiat",
      model: "Egea",
      year: 2018,
      fuelType: "Dizel",
      transmission: "Manuel",
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
      transmission: "Manuel",
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
      transmission: "Manuel",
      engineSize: "1.6",
      trim: "",
      sellerDescription: "",
    });

    expect(entry).toBeNull();
    expect(issues).toEqual([]);
  });

  it("never has two entries for the same brand+model (findChronicIssues only matches the first)", () => {
    const seen = new Set<string>();
    const duplicates: string[] = [];
    for (const entry of CHRONIC_ISSUES_DB) {
      const key = `${entry.brand.toLocaleLowerCase("tr-TR")}::${entry.model.toLocaleLowerCase("tr-TR")}`;
      if (seen.has(key)) duplicates.push(key);
      seen.add(key);
    }
    expect(duplicates).toEqual([]);
  });

  it("covers the 20 priority Turkish used-car market brands with at least one model entry", () => {
    const priorityBrands = [
      "Volkswagen",
      "Fiat",
      "Renault",
      "Ford",
      "BMW",
      "Opel",
      "Peugeot",
      "Mercedes-Benz",
      "Hyundai",
      "Toyota",
      "Citroen",
      "Honda",
      "Dacia",
      "Nissan",
      "Skoda",
      "Seat",
      "Audi",
      "Kia",
      "Volvo",
      "Suzuki",
    ];
    const covered = new Set(CHRONIC_ISSUES_DB.map((entry) => entry.brand));

    expect(priorityBrands.filter((brand) => !covered.has(brand))).toEqual([]);
  });

  it("covers 20 additional market brands with at least one model entry", () => {
    const additionalBrands = [
      "Alfa Romeo",
      "BYD",
      "Chery",
      "Chevrolet",
      "Cupra",
      "DS Automobiles",
      "Isuzu",
      "Jeep",
      "Lada",
      "Land Rover",
      "Lexus",
      "Mazda",
      "MG",
      "Mini",
      "Mitsubishi",
      "Porsche",
      "SsangYong",
      "Subaru",
      "Tesla",
      "Togg",
    ];
    const covered = new Set(CHRONIC_ISSUES_DB.map((entry) => entry.brand));

    expect(additionalBrands.filter((brand) => !covered.has(brand))).toEqual([]);
  });

  it("matches newly added additional market brand issues", () => {
    const togg = findChronicIssues({
      brand: "Togg",
      model: "T10X",
      year: 2025,
      fuelType: "Elektrik",
      transmission: "Otomatik",
      engineSize: "",
      trim: "",
      sellerDescription: "Togg T10X uzun menzil, servis yazilimi guncel.",
    });
    const mini = findChronicIssues({
      brand: "Mini",
      model: "Cooper",
      year: 2012,
      fuelType: "Benzin",
      transmission: "Manuel",
      engineSize: "1.6",
      trim: "Cooper S",
      sellerDescription: "R56 1.6 turbo Prince motor.",
    });
    const landRover = findChronicIssues({
      brand: "Land Rover",
      model: "Range Rover Evoque",
      year: 2018,
      fuelType: "Dizel",
      transmission: "Otomatik",
      engineSize: "2.0",
      trim: "",
      sellerDescription: "2.0 Ingenium dizel otomatik.",
    });

    expect(togg.issues.some((issue) => issue.id === "togg-t10x-software-battery")).toBe(true);
    expect(mini.issues.some((issue) => issue.id === "mini-r56-prince-chain-carbon")).toBe(true);
    expect(landRover.issues.some((issue) => issue.id === "landrover-evoque-ingenium-chain-dpf")).toBe(true);
  });

  it("matches newly added premium brand engine-specific issues", () => {
    const bmw = findChronicIssues({
      brand: "BMW",
      model: "3 Serisi",
      year: 2014,
      fuelType: "Dizel",
      transmission: "Otomatik",
      engineSize: "2.0",
      trim: "320d",
      sellerDescription: "F30 320d N47 motor, otomatik.",
    });
    const mercedes = findChronicIssues({
      brand: "Mercedes-Benz",
      model: "C Serisi",
      year: 2012,
      fuelType: "Benzin",
      transmission: "Otomatik",
      engineSize: "1.8",
      trim: "C180 AMG",
      sellerDescription: "W204 C180 CGI M271 motor.",
    });
    const audi = findChronicIssues({
      brand: "Audi",
      model: "A3",
      year: 2016,
      fuelType: "Benzin",
      transmission: "Yarı otomatik",
      engineSize: "1.4",
      trim: "Sportback",
      sellerDescription: "1.4 TFSI S tronic DSG.",
    });

    expect(bmw.issues.some((issue) => issue.id === "bmw-3-n47-timing-chain")).toBe(true);
    expect(mercedes.issues.some((issue) => issue.id === "mercedes-c-m271-chain")).toBe(true);
    expect(audi.issues.some((issue) => issue.id === "audi-a3-dq200-mechatronic")).toBe(true);
  });

  it("returns nothing when the year falls outside the model's production range", () => {
    const { issues } = findChronicIssues({
      brand: "Fiat",
      model: "Egea",
      year: 1999,
      fuelType: "Dizel",
      transmission: "Manuel",
      engineSize: "1.6",
      trim: "",
      sellerDescription: "",
    });

    expect(issues).toEqual([]);
  });
});
