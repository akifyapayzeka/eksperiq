import { describe, expect, it } from "vitest";
import { decideAiUsage, parseDailyLimit } from "@/lib/ai/usage-guard";
import { isAiAnalysisNoteEnabled } from "@/lib/ai/feature-flags";

describe("ai usage guard", () => {
  it("blocks requests when feature flag is disabled", () => {
    expect(
      decideAiUsage({
        isConfigured: true,
        isFeatureEnabled: false,
        usedToday: 0,
        dailyLimit: 5,
      }),
    ).toEqual({
      allowed: false,
      reason: "AI karar destek notu şu anda kapalı.",
      remaining: 5,
    });
  });

  it("blocks requests after daily limit", () => {
    expect(
      decideAiUsage({
        isConfigured: true,
        isFeatureEnabled: true,
        usedToday: 5,
        dailyLimit: 5,
      }),
    ).toEqual({
      allowed: false,
      reason: "Günlük AI deneme limiti doldu.",
      remaining: 0,
    });
  });

  it("allows requests when configured, enabled, and under limit", () => {
    expect(
      decideAiUsage({
        isConfigured: true,
        isFeatureEnabled: true,
        usedToday: 2,
        dailyLimit: 5,
      }),
    ).toEqual({
      allowed: true,
      remaining: 3,
    });
  });

  it("parses daily limits and feature flag safely", () => {
    expect(parseDailyLimit("8")).toBe(8);
    expect(parseDailyLimit("bad", 3)).toBe(3);
    expect(isAiAnalysisNoteEnabled({ NODE_ENV: "test", NEXT_PUBLIC_AI_ANALYSIS_NOTE_ENABLED: "true" })).toBe(true);
  });
});
