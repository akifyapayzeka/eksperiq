import { createRequire } from "node:module";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const require = createRequire(import.meta.url);
const openrouter = require("../../api/_lib/openrouter.js") as {
  callOpenRouterChatCompletions: (options: {
    apiKey: string;
    model: string;
    messages: unknown[];
    responseFormat?: unknown;
    temperature: number;
    maxTokens: number;
    refererUrl: string;
    appName: string;
    timeoutMs?: number;
    maxRetries?: number;
  }) => Promise<{ ok: boolean; payload?: unknown; error?: string }>;
  hedgeCertainLanguage: (text: string) => string;
};

const baseOptions = {
  apiKey: "test-key",
  model: "openai/gpt-oss-20b:free",
  messages: [{ role: "user" as const, content: "test" }],
  temperature: 0.2,
  maxTokens: 100,
  refererUrl: "https://eksperiq.vercel.app",
  appName: "EksperIQ",
};

function okResponse(body: unknown) {
  return new Response(JSON.stringify(body), { status: 200 });
}

describe("callOpenRouterChatCompletions", () => {
  const previousEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...previousEnv };
    delete process.env.OPENROUTER_REQUIRE_ZDR;
  });

  afterEach(() => {
    process.env = { ...previousEnv };
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("always sends provider.data_collection = deny", async () => {
    const fetchMock = vi.fn<(input: string, init?: RequestInit) => Promise<Response>>(async () =>
      okResponse({ choices: [] }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await openrouter.callOpenRouterChatCompletions(baseOptions);

    const [, init] = fetchMock.mock.calls[0];
    const sentBody = JSON.parse(String(init?.body)) as { provider?: Record<string, unknown> };
    expect(sentBody.provider).toEqual({ data_collection: "deny" });
  });

  it("adds provider.zdr = true only when OPENROUTER_REQUIRE_ZDR is exactly \"true\"", async () => {
    process.env.OPENROUTER_REQUIRE_ZDR = "true";
    const fetchMock = vi.fn<(input: string, init?: RequestInit) => Promise<Response>>(async () =>
      okResponse({ choices: [] }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await openrouter.callOpenRouterChatCompletions(baseOptions);

    const [, init] = fetchMock.mock.calls[0];
    const sentBody = JSON.parse(String(init?.body)) as { provider?: Record<string, unknown> };
    expect(sentBody.provider).toEqual({ data_collection: "deny", zdr: true });
  });

  it("returns the parsed payload on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<(input: string, init?: RequestInit) => Promise<Response>>(async () =>
        okResponse({ choices: [{ message: { content: "hello" } }] }),
      ),
    );

    const result = await openrouter.callOpenRouterChatCompletions(baseOptions);

    expect(result).toEqual({ ok: true, payload: { choices: [{ message: { content: "hello" } }] } });
  });

  it("retries once on a 500 and succeeds on the second attempt", async () => {
    const fetchMock = vi
      .fn<(input: string, init?: RequestInit) => Promise<Response>>()
      .mockResolvedValueOnce(new Response("boom", { status: 500 }))
      .mockResolvedValueOnce(okResponse({ choices: [] }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await openrouter.callOpenRouterChatCompletions({ ...baseOptions, maxRetries: 1 });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.ok).toBe(true);
  });

  it("does not retry on a 400 client error — retrying would just fail identically again", async () => {
    const fetchMock = vi.fn<(input: string, init?: RequestInit) => Promise<Response>>(
      async () => new Response("bad request", { status: 400 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await openrouter.callOpenRouterChatCompletions({ ...baseOptions, maxRetries: 2 });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ ok: false, error: "OpenRouter isteği başarısız oldu: 400" });
  });

  it("gives up and reports an error after exhausting retries on repeated 5xx failures", async () => {
    const fetchMock = vi.fn<(input: string, init?: RequestInit) => Promise<Response>>(
      async () => new Response("boom", { status: 503 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await openrouter.callOpenRouterChatCompletions({ ...baseOptions, maxRetries: 1 });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ ok: false, error: "OpenRouter isteği başarısız oldu: 503" });
  });

  it("passes an abort signal so a hung upstream can never hang the caller past the timeout", async () => {
    const fetchMock = vi.fn<(input: string, init?: RequestInit) => Promise<Response>>(async () =>
      okResponse({ choices: [] }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await openrouter.callOpenRouterChatCompletions(baseOptions);

    const [, init] = fetchMock.mock.calls[0];
    expect(init?.signal).toBeInstanceOf(AbortSignal);
  });

  it("reports a network failure without throwing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<(input: string, init?: RequestInit) => Promise<Response>>(async () => {
        throw new Error("network down");
      }),
    );

    const result = await openrouter.callOpenRouterChatCompletions({ ...baseOptions, maxRetries: 0 });

    expect(result).toEqual({ ok: false, error: "OpenRouter isteğine ulaşılamadı." });
  });
});

describe("hedgeCertainLanguage", () => {
  it("softens Turkish absolute-certainty phrasing", () => {
    expect(openrouter.hedgeCertainLanguage("Bu araç kesinlikle hasarlıdır.")).not.toContain("kesinlikle");
    expect(openrouter.hedgeCertainLanguage("%100 hasarsız")).not.toContain("%100");
  });

  it("softens English absolute-certainty phrasing", () => {
    expect(openrouter.hedgeCertainLanguage("This is definitely damaged.")).toContain("possibly damaged");
  });

  it("passes through empty/non-string input unchanged", () => {
    expect(openrouter.hedgeCertainLanguage("")).toBe("");
  });
});
