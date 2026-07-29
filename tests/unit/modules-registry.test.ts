import { describe, expect, it } from "vitest";
import { activeModules, plannedModules, productModules } from "@/lib/modules/registry";

describe("product module registry", () => {
  it("keeps listing analysis as the only active MVP module", () => {
    expect(activeModules().map((module) => module.id)).toEqual(["listing-analysis"]);
  });

  it("defines the long-term assistant modules as independent planned modules", () => {
    expect(productModules).toHaveLength(8);
    expect(plannedModules().map((module) => module.id)).toEqual([
      "photo-damage-analysis",
      "repair-cost-estimation",
      "expertise-report-analysis",
      "maintenance-tracking",
      "vehicle-health-record",
      "vehicle-value-tracking",
      "smart-sale-preparation",
    ]);
  });

  it("requires every module to state data and certainty boundaries", () => {
    for (const productModule of productModules) {
      expect(productModule.dataPolicy.length).toBeGreaterThan(20);
      expect(productModule.certaintyPolicy.length).toBeGreaterThan(20);
    }
  });
});
