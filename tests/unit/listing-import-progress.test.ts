import { describe, expect, it } from "vitest";
import { computeDisplayPercent } from "@/lib/listing-import/progress";

describe("computeDisplayPercent", () => {
  it("is 0 when there is no active stage", () => {
    expect(computeDisplayPercent(null, null, Date.now())).toBe(0);
  });

  it("is 100 as soon as the done stage is reached", () => {
    expect(computeDisplayPercent("done", new Date().toISOString(), Date.now())).toBe(100);
  });

  it("starts at each stage's floor the instant it begins", () => {
    const startedAt = new Date().toISOString();
    expect(computeDisplayPercent("checking-url", startedAt, new Date(startedAt).getTime())).toBe(1);
    expect(computeDisplayPercent("opening-page", startedAt, new Date(startedAt).getTime())).toBe(8);
    expect(computeDisplayPercent("normalizing", startedAt, new Date(startedAt).getTime())).toBe(72);
  });

  it("keeps easing upward the longer a stage takes, without ever reaching its ceiling", () => {
    const start = Date.now();
    const startedAt = new Date(start).toISOString();

    const at5s = computeDisplayPercent("opening-page", startedAt, start + 5_000);
    const at12s = computeDisplayPercent("opening-page", startedAt, start + 12_000);
    const at20s = computeDisplayPercent("opening-page", startedAt, start + 20_000);

    expect(at5s).toBeGreaterThan(8);
    expect(at12s).toBeGreaterThan(at5s);
    expect(at20s).toBeGreaterThan(at12s);
    expect(at20s).toBeLessThan(72);
  });

  it("keeps the long AI-normalizing stage moving past the old 95 percent plateau", () => {
    const start = Date.now();
    const startedAt = new Date(start).toISOString();

    const at60s = computeDisplayPercent("normalizing", startedAt, start + 60_000);
    const at120s = computeDisplayPercent("normalizing", startedAt, start + 120_000);

    expect(at60s).toBeGreaterThan(95);
    expect(at120s).toBeGreaterThanOrEqual(at60s);
    expect(at120s).toBeLessThanOrEqual(99);
  });

  it("falls back to the stage floor if stageStartedAt is missing", () => {
    expect(computeDisplayPercent("opening-page", null, Date.now())).toBe(8);
  });
});
