import { describe, expect, it } from "vitest";
import { riskBucket } from "@/lib/analysis/risk-bucket";

describe("riskBucket", () => {
  it("classifies scores at and above 80 as low risk (good)", () => {
    expect(riskBucket(100)).toBe("low");
    expect(riskBucket(80)).toBe("low");
  });

  it("classifies scores from 60 up to (not including) 80 as medium risk", () => {
    expect(riskBucket(79)).toBe("medium");
    expect(riskBucket(60)).toBe("medium");
  });

  it("classifies scores below 60 as high risk (bad)", () => {
    expect(riskBucket(59)).toBe("high");
    expect(riskBucket(0)).toBe("high");
  });

  it("never has a fourth band — regression guard against reintroducing a separate 40-point cutoff", () => {
    const buckets = new Set(Array.from({ length: 101 }, (_, score) => riskBucket(score)));
    expect(buckets).toEqual(new Set(["low", "medium", "high"]));
  });
});
