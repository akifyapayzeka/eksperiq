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

  it("matches model names even when form and database accents differ", () => {
    const { entry, issues } = findChronicIssues({
      brand: "Citroen",
      model: "C-Elysée",
      year: 2018,
      fuelType: "Dizel",
      transmission: "Manuel",
      engineSize: "1.6",
      trim: "",
      sellerDescription: "1.6 HDi manuel C-Elysee",
    });

    expect(entry?.model).toBe("C-Elysee");
    expect(issues.length).toBeGreaterThan(0);
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

  it("covers every Fiat model listed in the analysis form catalog", () => {
    const fiatModels = ["500", "Doblo", "Egea", "Egea Cross", "Fiorino", "Linea", "Panda", "Punto", "Tipo"];
    const coveredFiatModels = new Set(
      CHRONIC_ISSUES_DB.filter((entry) => entry.brand === "Fiat").map((entry) => entry.model),
    );

    expect(fiatModels.filter((model) => !coveredFiatModels.has(model))).toEqual([]);
  });

  it("separates Fiat Egea's main 2000+ market engine variants", () => {
    const egeaEngines = new Set(
      CHRONIC_ISSUES_DB.filter((entry) => entry.brand === "Fiat" && entry.model === "Egea").flatMap((entry) =>
        entry.engines.map((engine) => engine.engineLabel),
      ),
    );

    expect([...egeaEngines]).toEqual(
      expect.arrayContaining([
        "1.0 FireFly Turbo",
        "1.3 Multijet",
        "1.4 Fire",
        "1.4 T-Jet",
        "1.5 Hybrid T4 DCT",
        "1.6 E-torQ",
        "1.6 Multijet",
      ]),
    );
  });

  it("covers every Volkswagen model listed in the analysis form catalog", () => {
    const volkswagenModels = [
      "Bora",
      "Caddy",
      "Golf",
      "Jetta",
      "Passat",
      "Polo",
      "T-Cross",
      "T-Roc",
      "Tiguan",
      "Touran",
      "Transporter",
    ];
    const coveredVolkswagenModels = new Set(
      CHRONIC_ISSUES_DB.filter((entry) => entry.brand === "Volkswagen").map((entry) => entry.model),
    );

    expect(volkswagenModels.filter((model) => !coveredVolkswagenModels.has(model))).toEqual([]);
  });

  it("covers every Ford model listed in the analysis form catalog", () => {
    const fordModels = [
      "B-Max",
      "C-Max",
      "Courier",
      "EcoSport",
      "Fiesta",
      "Focus",
      "Kuga",
      "Mondeo",
      "Puma",
      "Ranger",
      "Tourneo Connect",
      "Tourneo Courier",
    ];
    const coveredFordModels = new Set(
      CHRONIC_ISSUES_DB.filter((entry) => entry.brand === "Ford").map((entry) => entry.model),
    );

    expect(fordModels.filter((model) => !coveredFordModels.has(model))).toEqual([]);
  });

  it("covers every Renault model listed in the analysis form catalog", () => {
    const renaultModels = [
      "Broadway",
      "Captur",
      "Clio",
      "Fluence",
      "Kadjar",
      "Megane",
      "Symbol",
      "Taliant",
      "Talisman",
    ];
    const coveredRenaultModels = new Set(
      CHRONIC_ISSUES_DB.filter((entry) => entry.brand === "Renault").map((entry) => entry.model),
    );

    expect(renaultModels.filter((model) => !coveredRenaultModels.has(model))).toEqual([]);
  });

  it("covers every Opel model listed in the analysis form catalog", () => {
    const opelModels = ["Astra", "Combo", "Corsa", "Grandland", "Insignia", "Mokka", "Vectra", "Zafira"];
    const coveredOpelModels = new Set(
      CHRONIC_ISSUES_DB.filter((entry) => entry.brand === "Opel").map((entry) => entry.model),
    );

    expect(opelModels.filter((model) => !coveredOpelModels.has(model))).toEqual([]);
  });

  it("covers every Peugeot model listed in the analysis form catalog", () => {
    const peugeotModels = ["2008", "208", "3008", "301", "306", "307", "308", "407", "508"];
    const coveredPeugeotModels = new Set(
      CHRONIC_ISSUES_DB.filter((entry) => entry.brand === "Peugeot").map((entry) => entry.model),
    );

    expect(peugeotModels.filter((model) => !coveredPeugeotModels.has(model))).toEqual([]);
  });

  it("covers every Citroen model listed in the analysis form catalog", () => {
    const citroenModels = ["Berlingo", "C-Elysee", "C3", "C4", "C4 Cactus", "C5", "C5 Aircross", "Jumpy"];
    const coveredCitroenModels = new Set(
      CHRONIC_ISSUES_DB.filter((entry) => entry.brand === "Citroen").map((entry) =>
        entry.model.normalize("NFD").replace(/\p{Diacritic}/gu, ""),
      ),
    );

    expect(citroenModels.filter((model) => !coveredCitroenModels.has(model))).toEqual([]);
  });

  it("covers every Toyota model listed in the analysis form catalog", () => {
    const toyotaModels = ["Auris", "C-HR", "Corolla", "Corolla Cross", "Hilux", "RAV4", "Yaris", "Yaris Cross"];
    const coveredToyotaModels = new Set(
      CHRONIC_ISSUES_DB.filter((entry) => entry.brand === "Toyota").map((entry) => entry.model),
    );

    expect(toyotaModels.filter((model) => !coveredToyotaModels.has(model))).toEqual([]);
  });

  it("covers every Hyundai model listed in the analysis form catalog", () => {
    const hyundaiModels = ["Accent Blue", "Bayon", "Elantra", "i10", "i20", "i30", "Kona", "Santa Fe", "Tucson"];
    const coveredHyundaiModels = new Set(
      CHRONIC_ISSUES_DB.filter((entry) => entry.brand === "Hyundai").map((entry) => entry.model),
    );

    expect(hyundaiModels.filter((model) => !coveredHyundaiModels.has(model))).toEqual([]);
  });

  it("covers every Dacia model listed in the analysis form catalog", () => {
    const daciaModels = ["Dokker", "Duster", "Jogger", "Lodgy", "Logan", "Sandero", "Sandero Stepway", "Spring"];
    const coveredDaciaModels = new Set(
      CHRONIC_ISSUES_DB.filter((entry) => entry.brand === "Dacia").map((entry) => entry.model),
    );

    expect(daciaModels.filter((model) => !coveredDaciaModels.has(model))).toEqual([]);
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
