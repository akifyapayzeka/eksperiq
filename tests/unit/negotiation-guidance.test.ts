import { describe, expect, it } from "vitest";
import { buildNegotiationGuidance } from "@/lib/analysis/negotiation";
import type { AnalysisFinding, CostSignal, DataCompleteness } from "@/lib/analysis/types";

const noFindings: AnalysisFinding[] = [];
const noCosts: CostSignal[] = [];
const completeCompleteness: DataCompleteness = { completed: 10, total: 10, percentage: 100, missing: [] };

function finding(overrides: Partial<AnalysisFinding> = {}): AnalysisFinding {
  return {
    id: "test-finding",
    category: "Hasar",
    severity: "medium",
    title: "Test bulgusu",
    explanation: "",
    recommendation: "",
    ...overrides,
  };
}

describe("buildNegotiationGuidance", () => {
  it("returns a zeroed guidance when the listing has no price", () => {
    const guidance = buildNegotiationGuidance(0, noFindings, noCosts, completeCompleteness);
    expect(guidance.listingPrice).toBe(0);
    expect(guidance.suggestedOfferLow).toBe(0);
    expect(guidance.suggestedOfferHigh).toBe(0);
  });

  it("applies only the base discount range with no findings, costs, or missing info", () => {
    const guidance = buildNegotiationGuidance(1000000, noFindings, noCosts, completeCompleteness);
    expect(guidance.discountPercentLow).toBeCloseTo(0.03);
    expect(guidance.discountPercentHigh).toBeCloseTo(0.06);
    expect(guidance.suggestedOfferLow).toBeLessThan(guidance.suggestedOfferHigh);
    expect(guidance.suggestedOfferHigh).toBeLessThan(1000000);
  });

  it("widens the discount range as high-severity findings increase", () => {
    const oneHigh = buildNegotiationGuidance(1000000, [finding({ severity: "high" })], noCosts, completeCompleteness);
    const threeHigh = buildNegotiationGuidance(
      1000000,
      [finding({ severity: "high" }), finding({ severity: "high" }), finding({ severity: "high" })],
      noCosts,
      completeCompleteness,
    );
    expect(threeHigh.discountPercentHigh).toBeGreaterThan(oneHigh.discountPercentHigh);
    expect(threeHigh.suggestedOfferHigh).toBeLessThan(oneHigh.suggestedOfferHigh);
  });

  it("never exceeds the maximum discount ceiling even with many severe findings", () => {
    const manyHigh = Array.from({ length: 10 }, () => finding({ severity: "high" }));
    const guidance = buildNegotiationGuidance(1000000, manyHigh, noCosts, completeCompleteness);
    expect(guidance.discountPercentHigh).toBeLessThanOrEqual(0.32);
    expect(guidance.discountPercentLow).toBeLessThanOrEqual(0.2);
    expect(guidance.discountPercentHigh).toBeGreaterThan(guidance.discountPercentLow);
  });

  it("adds a small premium when the listing is missing information", () => {
    const missing: DataCompleteness = { completed: 5, total: 10, percentage: 50, missing: ["TRAMER kaydı"] };
    const withoutMissing = buildNegotiationGuidance(1000000, noFindings, noCosts, completeCompleteness);
    const withMissing = buildNegotiationGuidance(1000000, noFindings, noCosts, missing);
    expect(withMissing.discountPercentHigh).toBeGreaterThan(withoutMissing.discountPercentHigh);
  });

  it("includes high-cost signals and missing info in the negotiation reasons", () => {
    const costs: CostSignal[] = [{ item: "Lastik değişimi", level: "Yüksek" }];
    const missing: DataCompleteness = { completed: 5, total: 10, percentage: 50, missing: ["TRAMER kaydı"] };
    const guidance = buildNegotiationGuidance(
      1000000,
      [finding({ severity: "high", title: "Ağır hasar kaydı" })],
      costs,
      missing,
    );
    expect(guidance.reasons).toContain("Ağır hasar kaydı");
    expect(guidance.reasons).toContain("Lastik değişimi: Yüksek");
    expect(guidance.reasons.some((reason) => reason.startsWith("Eksik bilgi"))).toBe(true);
  });

  it("rounds suggested offers to the nearest 100 TL", () => {
    const guidance = buildNegotiationGuidance(987654, noFindings, noCosts, completeCompleteness);
    expect(guidance.suggestedOfferLow % 100).toBe(0);
    expect(guidance.suggestedOfferHigh % 100).toBe(0);
  });
});
