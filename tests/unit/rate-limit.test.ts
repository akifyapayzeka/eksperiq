import { createRequire } from "node:module";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const require = createRequire(import.meta.url);
const rateLimit = require("../../api/_lib/rate-limit.js") as {
  checkRateLimit: (
    request: { headers: Record<string, string | undefined>; socket?: { remoteAddress?: string } },
    options: {
      usageKey: string;
      burstLimit: number;
      burstWindowSeconds: number;
      dailyLimitPerIdentity: number;
      globalDailyLimit: number;
    },
  ) => Promise<{ ok: boolean; reason?: string; remaining: number }>;
};

const baseOptions = {
  usageKey: "test-endpoint",
  burstLimit: 5,
  burstWindowSeconds: 60,
  dailyLimitPerIdentity: 4,
  globalDailyLimit: 20,
};

function upstashResponse(incrCounts: [number, number, number]) {
  return new Response(
    JSON.stringify([
      { result: incrCounts[0] },
      { result: "OK" },
      { result: incrCounts[1] },
      { result: "OK" },
      { result: incrCounts[2] },
      { result: "OK" },
    ]),
    { status: 200 },
  );
}

function requestWith(headers: Record<string, string | undefined>) {
  return { headers, socket: { remoteAddress: "203.0.113.5" } };
}

describe("checkRateLimit", () => {
  const previousEnv = { ...process.env };

  beforeEach(() => {
    process.env = {
      ...previousEnv,
      UPSTASH_REDIS_REST_URL: "https://upstash.example.com",
      UPSTASH_REDIS_REST_TOKEN: "test-token",
      RATE_LIMIT_HASH_SECRET: "test-secret",
    };
  });

  afterEach(() => {
    process.env = { ...previousEnv };
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("fails closed when Upstash is not configured", async () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;

    const result = await rateLimit.checkRateLimit(requestWith({}), baseOptions);

    expect(result).toEqual({ ok: false, reason: "unavailable", remaining: 0 });
  });

  it("fails closed when RATE_LIMIT_HASH_SECRET is not configured, even with Upstash set", async () => {
    delete process.env.RATE_LIMIT_HASH_SECRET;

    const result = await rateLimit.checkRateLimit(requestWith({}), baseOptions);

    expect(result).toEqual({ ok: false, reason: "unavailable", remaining: 0 });
  });

  it("fails closed when the Upstash pipeline call throws", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<(input: unknown, init?: RequestInit) => Promise<Response>>(
        async () => new Response("boom", { status: 500 }),
      ),
    );

    const result = await rateLimit.checkRateLimit(requestWith({}), baseOptions);

    expect(result).toEqual({ ok: false, reason: "unavailable", remaining: 0 });
  });

  it("allows a request under every limit and reports the global remaining budget", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<(input: unknown, init?: RequestInit) => Promise<Response>>(async () => upstashResponse([1, 1, 3])),
    );

    const result = await rateLimit.checkRateLimit(requestWith({}), baseOptions);

    expect(result).toEqual({ ok: true, remaining: 17 });
  });

  it("rejects with reason burst once the short-window count exceeds burstLimit", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<(input: unknown, init?: RequestInit) => Promise<Response>>(async () => upstashResponse([6, 1, 6])),
    );

    const result = await rateLimit.checkRateLimit(requestWith({}), baseOptions);

    expect(result).toEqual({ ok: false, reason: "burst", remaining: 0 });
  });

  it("rejects with reason daily once the per-identity daily count exceeds dailyLimitPerIdentity", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<(input: unknown, init?: RequestInit) => Promise<Response>>(async () => upstashResponse([2, 5, 5])),
    );

    const result = await rateLimit.checkRateLimit(requestWith({}), baseOptions);

    expect(result).toEqual({ ok: false, reason: "daily", remaining: 0 });
  });

  it("rejects with reason global once the whole-app daily count exceeds globalDailyLimit", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<(input: unknown, init?: RequestInit) => Promise<Response>>(async () => upstashResponse([2, 2, 21])),
    );

    const result = await rateLimit.checkRateLimit(requestWith({}), baseOptions);

    expect(result).toEqual({ ok: false, reason: "global", remaining: 0 });
  });

  it("never sends the raw IP or install id to Upstash — only an HMAC hash", async () => {
    const fetchMock = vi.fn<(input: unknown, init?: RequestInit) => Promise<Response>>(async () =>
      upstashResponse([1, 1, 1]),
    );
    vi.stubGlobal("fetch", fetchMock);

    await rateLimit.checkRateLimit(
      requestWith({ "x-forwarded-for": "198.51.100.42", "x-eksperiq-install-id": "install-abc-123" }),
      baseOptions,
    );

    const [, requestInit] = fetchMock.mock.calls[0];
    const sentBody = String(requestInit?.body);

    expect(sentBody).not.toContain("198.51.100.42");
    expect(sentBody).not.toContain("install-abc-123");
    expect(sentBody).toMatch(/eksperiq:ratelimit:test-endpoint:burst:[0-9a-f]{32}/);
  });

  it("keys the identity by install id when present, falling back to IP otherwise", async () => {
    const byInstallId = vi.fn<(input: unknown, init?: RequestInit) => Promise<Response>>(async () =>
      upstashResponse([1, 1, 1]),
    );
    vi.stubGlobal("fetch", byInstallId);
    await rateLimit.checkRateLimit(
      requestWith({ "x-forwarded-for": "198.51.100.42", "x-eksperiq-install-id": "install-abc-123" }),
      baseOptions,
    );
    const bodyWithInstallId = String(byInstallId.mock.calls[0][1]?.body);

    const byIpOnly = vi.fn<(input: unknown, init?: RequestInit) => Promise<Response>>(async () =>
      upstashResponse([1, 1, 1]),
    );
    vi.stubGlobal("fetch", byIpOnly);
    await rateLimit.checkRateLimit(requestWith({ "x-forwarded-for": "198.51.100.42" }), baseOptions);
    const bodyWithIpOnly = String(byIpOnly.mock.calls[0][1]?.body);

    // Different identity inputs (install id vs. IP-only) must hash to different keys.
    expect(bodyWithInstallId).not.toBe(bodyWithIpOnly);
  });
});
