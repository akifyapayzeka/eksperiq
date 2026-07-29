import { describe, expect, it } from "vitest";
import { getDailyUsage, incrementDailyUsage, resetDailyUsageForTests } from "@/lib/ai/daily-counter";

describe("daily counter", () => {
  it("counts usage per day and key", () => {
    resetDailyUsageForTests();
    const firstDay = new Date("2026-07-29T10:00:00.000Z");
    const secondDay = new Date("2026-07-30T10:00:00.000Z");

    expect(getDailyUsage("ai-note", firstDay)).toBe(0);
    expect(incrementDailyUsage("ai-note", firstDay)).toBe(1);
    expect(incrementDailyUsage("ai-note", firstDay)).toBe(2);
    expect(getDailyUsage("ai-note", firstDay)).toBe(2);
    expect(getDailyUsage("ai-note", secondDay)).toBe(0);
  });
});
