import { describe, expect, it } from "vitest";
import { activeModules, plannedModules, productModules } from "@/lib/modules/registry";

describe("product module registry", () => {
  it("exposes the current usable product modules", () => {
    expect(activeModules().map((module) => module.id)).toEqual([
      "listing-analysis",
      "photo-damage-analysis",
      "expertise-report-analysis",
      "maintenance-payment-calendar",
      "test-drive-checklist",
      "expense-ledger",
      "listing-comparison",
      "vehicle-health-record",
      "vehicle-value-tracking",
      "smart-sale-preparation",
      "nearby-services",
      "model-guide",
    ]);
  });

  it("keeps all modules independent and routed", () => {
    expect(productModules).toHaveLength(12);
    expect(plannedModules()).toEqual([]);
    for (const productModule of productModules) {
      expect(productModule.href).toMatch(/^\//);
    }
  });

  it("requires every module to state data and certainty boundaries", () => {
    for (const productModule of productModules) {
      expect(productModule.dataPolicy.length).toBeGreaterThan(20);
      expect(productModule.certaintyPolicy.length).toBeGreaterThan(20);
    }
  });
});
