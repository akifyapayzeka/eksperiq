import { beforeEach, describe, expect, it, vi } from "vitest";
import { resetDailyUsageForTests } from "@/lib/ai/daily-counter";
import { reserveDailyAiUsage } from "@/lib/ai/usage-store";

describe("usage store", () => {
  beforeEach(() => {
    resetDailyUsageForTests();
  });

  it("uses memory fallback when Upstash env is missing", async () => {
    const date = new Date("2026-07-29T10:00:00.000Z");

    const env = {} as NodeJS.ProcessEnv;

    const first = await reserveDailyAiUsage("analysis-note", 2, { env, date });
    const second = await reserveDailyAiUsage("analysis-note", 2, { env, date });
    const third = await reserveDailyAiUsage("analysis-note", 2, { env, date });

    expect(first).toMatchObject({ allowed: true, remaining: 1, used: 1, store: "memory" });
    expect(second).toMatchObject({ allowed: true, remaining: 0, used: 2, store: "memory" });
    expect(third).toMatchObject({
      allowed: false,
      remaining: 0,
      used: 2,
      store: "memory",
      reason: "Günlük AI deneme limiti doldu.",
    });
  });

  it("reserves usage with Upstash REST pipeline when env is configured", async () => {
    const fetcher = vi.fn(async () => Response.json([{ result: 1 }, { result: 1 }]));
    const result = await reserveDailyAiUsage("analysis-note", 20, {
      env: {
        UPSTASH_REDIS_REST_URL: "https://example-upstash",
        UPSTASH_REDIS_REST_TOKEN: "test-token",
      } as unknown as NodeJS.ProcessEnv,
      fetcher,
      date: new Date("2026-07-29T10:00:00.000Z"),
    });

    expect(result).toMatchObject({ allowed: true, remaining: 19, used: 1, store: "upstash" });
    expect(fetcher).toHaveBeenCalledWith(
      "https://example-upstash/pipeline",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer test-token",
          "Content-Type": "application/json",
        }) as HeadersInit,
        body: JSON.stringify([
          ["INCR", "eksperiq:ai:analysis-note:2026-07-29"],
          ["EXPIRE", "eksperiq:ai:analysis-note:2026-07-29", 172800],
        ]),
      }),
    );
  });

  it("blocks Upstash reservations over the daily limit", async () => {
    const fetcher = vi.fn(async () => Response.json([{ result: 21 }, { result: 1 }]));
    const result = await reserveDailyAiUsage("analysis-note", 20, {
      env: {
        UPSTASH_REDIS_REST_URL: "https://example-upstash",
        UPSTASH_REDIS_REST_TOKEN: "test-token",
      } as unknown as NodeJS.ProcessEnv,
      fetcher,
      date: new Date("2026-07-29T10:00:00.000Z"),
    });

    expect(result).toMatchObject({
      allowed: false,
      remaining: 0,
      used: 21,
      store: "upstash",
      reason: "Günlük AI deneme limiti doldu.",
    });
  });
});
