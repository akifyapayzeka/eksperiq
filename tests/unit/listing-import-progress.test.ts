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
    expect(computeDisplayPercent("normalizing", startedAt, new Date(startedAt).getTime())).toBe(70);
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
    expect(at20s).toBeLessThan(70);
  });

  it("falls back to the stage floor if stageStartedAt is missing", () => {
    expect(computeDisplayPercent("opening-page", null, Date.now())).toBe(8);
  });

  it("continues from the previous stage's shown percent instead of jumping to the new stage's floor", () => {
    // Reported symptom: opening-page finishes quickly (easing had only
    // reached ~25%) and normalizing begins — its configured floor is 70,
    // which would otherwise show as a jarring jump from 25% straight to
    // 70%. Passing the last-shown percent keeps it continuous.
    const startedAt = new Date().toISOString();
    const atStart = computeDisplayPercent("normalizing", startedAt, new Date(startedAt).getTime(), 25);
    expect(atStart).toBe(25);
    expect(atStart).toBeLessThan(70);
  });

  it("still eases toward the new stage's ceiling when continuing from a lower percent", () => {
    const start = Date.now();
    const startedAt = new Date(start).toISOString();
    const at3s = computeDisplayPercent("normalizing", startedAt, start + 3_000, 25);
    expect(at3s).toBeGreaterThan(25);
    expect(at3s).toBeLessThan(95);
  });
});
