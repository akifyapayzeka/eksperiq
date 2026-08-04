import { Readable } from "node:stream";
import type { IncomingMessage, ServerResponse } from "node:http";
import { describe, expect, it, vi } from "vitest";
import handler from "../../api/ai/analysis-note";

const RATE_LIMIT_TEST_ENV = {
  UPSTASH_REDIS_REST_URL: "https://upstash.example.com",
  UPSTASH_REDIS_REST_TOKEN: "test-upstash-token",
  RATE_LIMIT_HASH_SECRET: "test-hash-secret",
};

const UPSTASH_ALLOW_RESPONSE = JSON.stringify([
  { result: 1 },
  { result: "OK" },
  { result: 1 },
  { result: "OK" },
  { result: 1 },
  { result: "OK" },
]);

const sampleInput = {
  vehicleLabel: "2020 Toyota Corolla",
  totalScore: 72,
  riskLabel: "Dikkatli incelenmeli",
  decision: "Ekspertiz ve belge kontrolü şart",
  findings: [{ severity: "medium", title: "Tramer detayı", explanation: "Tramer açıklaması kontrol edilmeli." }],
};

type MockResponse = ServerResponse & {
  body: string;
  headers: Record<string, string | number | readonly string[]>;
};

function createRequest(method: string, body?: unknown): IncomingMessage {
  const chunks = body === undefined ? [] : [JSON.stringify(body)];
  const request = Readable.from(chunks) as IncomingMessage;
  request.method = method;
  return request;
}

function createResponse(): MockResponse {
  const response = {
    statusCode: 200,
    headers: {} as Record<string, string | number | readonly string[]>,
    body: "",
    setHeader(name: string, value: string | number | readonly string[]) {
      this.headers[name] = value;
      return this;
    },
    end(chunk?: unknown) {
      if (typeof chunk === "string") this.body += chunk;
      return this;
    },
  };

  return response as MockResponse;
}

describe("analysis note endpoint", () => {
  it("defaults to a named, reliable free model instead of the random openrouter/free router", () => {
    // openrouter/free randomly routes to any free model on OpenRouter, including
    // moderation/safety classifiers (e.g. nvidia/nemotron-3.5-content-safety:free)
    // that return nonsense like "User Safety: safe" instead of a real note.
    expect(handler.DEFAULT_OPENROUTER_MODEL).not.toBe("openrouter/free");
    expect(handler.DEFAULT_OPENROUTER_MODEL).toMatch(/:free$/);
  });

  it("allows only POST", async () => {
    const response = createResponse();

    await handler(createRequest("GET"), response);

    expect(response.statusCode).toBe(405);
    expect(JSON.parse(response.body)).toEqual({ error: "Yalnızca POST desteklenir." });
  });

  it("does not call AI when feature flag is disabled", async () => {
    const previousFlag = process.env.NEXT_PUBLIC_AI_ANALYSIS_NOTE_ENABLED;
    const previousKey = process.env.OPENROUTER_API_KEY;
    process.env.NEXT_PUBLIC_AI_ANALYSIS_NOTE_ENABLED = "false";
    process.env.OPENROUTER_API_KEY = "test-key";

    const response = createResponse();
    await handler(
      createRequest("POST", {
        vehicleLabel: "2020 Toyota Corolla",
        totalScore: 72,
        riskLabel: "Dikkatli incelenmeli",
        decision: "Ekspertiz ve belge kontrolü şart",
        findings: [{ severity: "medium", title: "Tramer detayı", explanation: "Tramer açıklaması kontrol edilmeli." }],
      }),
      response,
    );

    process.env.NEXT_PUBLIC_AI_ANALYSIS_NOTE_ENABLED = previousFlag;
    process.env.OPENROUTER_API_KEY = previousKey;

    expect(response.statusCode).toBe(429);
    expect(JSON.parse(response.body)).toEqual({
      error: "AI karar destek notu şu anda kapalı.",
      remaining: 20,
    });
  });

  it("fails closed with 503 when the rate limiter is unavailable (no Upstash/hash secret configured)", async () => {
    const previousEnv = process.env;
    process.env = {
      ...previousEnv,
      NEXT_PUBLIC_AI_ANALYSIS_NOTE_ENABLED: "true",
      OPENROUTER_API_KEY: "test-key",
    };
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    delete process.env.UPSTASH_REDIS_REST_KV_REST_API_URL;
    delete process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN;
    delete process.env.RATE_LIMIT_HASH_SECRET;

    const response = createResponse();
    await handler(
      createRequest("POST", {
        vehicleLabel: "2020 Toyota Corolla",
        totalScore: 72,
        riskLabel: "Dikkatli incelenmeli",
        decision: "Ekspertiz ve belge kontrolü şart",
        findings: [{ severity: "medium", title: "Tramer detayı", explanation: "Tramer açıklaması kontrol edilmeli." }],
      }),
      response,
    );

    process.env = previousEnv;

    expect(response.statusCode).toBe(503);
    expect(JSON.parse(response.body)).toEqual({
      error: "AI kullanım limiti şu anda doğrulanamadı. Kural tabanlı raporu kullanabilirsiniz.",
    });
  });

  it("returns a note end-to-end and hedges any absolute-certainty language OpenRouter returns", async () => {
    const fetchMock = vi.fn<(input: unknown, init?: RequestInit) => Promise<Response>>(async (input) => {
      if (String(input).includes("upstash.example.com")) {
        return new Response(UPSTASH_ALLOW_RESPONSE, { status: 200 });
      }
      return new Response(
        JSON.stringify({
          choices: [{ message: { content: "Bu araç kesinlikle hasarsızdır, %100 güvenle alınabilir." } }],
        }),
        { status: 200 },
      );
    });
    vi.stubGlobal("fetch", fetchMock);

    const previousEnv = process.env;
    process.env = {
      ...previousEnv,
      ...RATE_LIMIT_TEST_ENV,
      NEXT_PUBLIC_AI_ANALYSIS_NOTE_ENABLED: "true",
      OPENROUTER_API_KEY: "test-key",
    };

    const response = createResponse();
    await handler(createRequest("POST", sampleInput), response);

    process.env = previousEnv;
    vi.unstubAllGlobals();

    expect(response.statusCode).toBe(200);
    const payload = JSON.parse(response.body) as { note: string; model: string; remaining: number };
    expect(payload.note).not.toContain("kesinlikle");
    expect(payload.note).not.toContain("%100");

    const openRouterCall = fetchMock.mock.calls.find(([url]) => String(url).includes("openrouter.ai"));
    const requestBody = JSON.parse(String((openRouterCall?.[1] as RequestInit | undefined)?.body)) as {
      provider?: Record<string, unknown>;
    };
    expect(requestBody.provider).toEqual({ data_collection: "deny" });
  });
});
