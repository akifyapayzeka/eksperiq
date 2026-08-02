import { describe, expect, it } from "vitest";
import { brandOptions, modelOptionsForBrand } from "@/components/forms/analysis-form-sections";

describe("modelOptionsForBrand", () => {
  it("returns nothing until a brand is chosen", () => {
    expect(modelOptionsForBrand(undefined)).toEqual([]);
    expect(modelOptionsForBrand("")).toEqual([]);
  });

  it("only returns models that actually belong to the selected brand", () => {
    const fiatModels = modelOptionsForBrand("Fiat");
    expect(fiatModels).toContain("Egea");
    expect(fiatModels).not.toContain("i20");

    const hyundaiModels = modelOptionsForBrand("Hyundai");
    expect(hyundaiModels).toContain("i20");
    expect(hyundaiModels).not.toContain("Egea");
  });

  it("has a real model list for every selectable brand (excluding the catch-all option)", () => {
    for (const brand of brandOptions) {
      if (brand === "Diğer / listede yok") continue;
      const models = modelOptionsForBrand(brand);
      expect(models.length).toBeGreaterThan(1);
    }
  });

  it("always offers a catch-all option at the end", () => {
    expect(modelOptionsForBrand("Toyota").at(-1)).toBe("Diğer / listede yok");
  });
});
