import { Readable, Writable } from "node:stream";
import { createRequire } from "node:module";
import { describe, expect, it, vi } from "vitest";

type MockResponse = Writable & {
  statusCode?: number;
  headers: Record<string, string>;
  body: string;
  setHeader: (name: string, value: string) => void;
};

type EndpointHandler = (request: Readable & { method?: string }, response: MockResponse) => Promise<void>;

const require = createRequire(import.meta.url);
const handler = require("../../api/ai/photo-damage.js") as EndpointHandler;

function createRequest(body: unknown) {
  const request = Readable.from([JSON.stringify(body)]) as Readable & { method?: string };
  request.method = "POST";
  return request;
}

function createResponse(): MockResponse {
  const response = new Writable({
    write(chunk, _encoding, callback) {
      response.body += chunk.toString();
      callback();
    },
  }) as MockResponse;
  response.headers = {};
  response.body = "";
  response.setHeader = (name: string, value) => {
    response.headers[name] = String(value);
  };
  return response;
}

async function callEndpoint(body: unknown, env: Record<string, string> = {}) {
  const previousEnv = process.env;
  vi.stubGlobal("fetch", vi.fn());
  process.env = { ...previousEnv, ...env };
  const response = createResponse();
  await handler(createRequest(body), response);
  process.env = previousEnv;
  vi.unstubAllGlobals();
  return {
    statusCode: response.statusCode,
    body: JSON.parse(response.body) as Record<string, unknown>,
  };
}

const validBody = {
  images: [
    {
      name: "photo.jpg",
      mimeType: "image/jpeg",
      dataUrl: "data:image/jpeg;base64,AAAA",
    },
  ],
};

describe("photo damage AI endpoint", () => {
  it("defaults to a named, reliable free vision model instead of the random openrouter/free router", () => {
    // openrouter/free randomly routes to any free model on OpenRouter, including
    // moderation/safety classifiers that don't support the strict JSON schema
    // this endpoint relies on and can return nonsense instead of an analysis.
    const withDefault = handler as unknown as { DEFAULT_VISION_MODEL: string };
    expect(withDefault.DEFAULT_VISION_MODEL).not.toBe("openrouter/free");
    expect(withDefault.DEFAULT_VISION_MODEL).toMatch(/:free$/);
  });

  it('only uses the pro vision model when EKSPERIQ_FORCE_PRO is exactly "true"', () => {
    const { resolveVisionModel } = handler as unknown as { resolveVisionModel: () => string };
    const previousEnv = process.env;

    process.env = {
      ...previousEnv,
      EKSPERIQ_FORCE_PRO: "true",
      OPENROUTER_VISION_MODEL_PRO: "openai/gpt-4o-mini",
    };
    expect(resolveVisionModel()).toBe("openai/gpt-4o-mini");

    // A regular client can never set this server-only env var, but if it were
    // ever anything other than the exact string "true" (unset, "false", "1",
    // a stray client-supplied value, etc.), the paid model must never be used.
    for (const value of [undefined, "false", "1", "TRUE", ""]) {
      process.env = {
        ...previousEnv,
        ...(value === undefined ? {} : { EKSPERIQ_FORCE_PRO: value }),
        OPENROUTER_VISION_MODEL_PRO: "openai/gpt-4o-mini",
      };
      delete process.env.OPENROUTER_VISION_MODEL;
      delete process.env.OPENROUTER_MODEL;
      expect(resolveVisionModel()).not.toBe("openai/gpt-4o-mini");
    }

    process.env = previousEnv;
  });

  it("falls back to the normal free model when EKSPERIQ_FORCE_PRO is set but no pro model is configured", () => {
    const { resolveVisionModel, DEFAULT_VISION_MODEL } = handler as unknown as {
      resolveVisionModel: () => string;
      DEFAULT_VISION_MODEL: string;
    };
    const previousEnv = process.env;

    process.env = { ...previousEnv, EKSPERIQ_FORCE_PRO: "true" };
    delete process.env.OPENROUTER_VISION_MODEL_PRO;
    delete process.env.OPENROUTER_VISION_MODEL;
    delete process.env.OPENROUTER_MODEL;

    expect(resolveVisionModel()).toBe(DEFAULT_VISION_MODEL);
    process.env = previousEnv;
  });

  it('only uses the pro+ vision model when EKSPERIQ_FORCE_PRO_PLUS is exactly "true"', () => {
    const { resolveVisionModel } = handler as unknown as { resolveVisionModel: () => string };
    const previousEnv = process.env;

    process.env = {
      ...previousEnv,
      EKSPERIQ_FORCE_PRO_PLUS: "true",
      OPENROUTER_VISION_MODEL_PRO_PLUS: "openai/gpt-4o",
    };
    expect(resolveVisionModel()).toBe("openai/gpt-4o");

    // Same server-only guarantee as EKSPERIQ_FORCE_PRO: a regular client can
    // never set this env var, but if it were ever anything other than the
    // exact string "true", the pro+ model must never be used.
    for (const value of [undefined, "false", "1", "TRUE", ""]) {
      process.env = {
        ...previousEnv,
        ...(value === undefined ? {} : { EKSPERIQ_FORCE_PRO_PLUS: value }),
        OPENROUTER_VISION_MODEL_PRO_PLUS: "openai/gpt-4o",
      };
      delete process.env.EKSPERIQ_FORCE_PRO;
      delete process.env.OPENROUTER_VISION_MODEL_PRO;
      delete process.env.OPENROUTER_VISION_MODEL;
      delete process.env.OPENROUTER_MODEL;
      expect(resolveVisionModel()).not.toBe("openai/gpt-4o");
    }

    process.env = previousEnv;
  });

  it("falls back to the normal free model when EKSPERIQ_FORCE_PRO_PLUS is set but no pro+ model is configured", () => {
    const { resolveVisionModel, DEFAULT_VISION_MODEL } = handler as unknown as {
      resolveVisionModel: () => string;
      DEFAULT_VISION_MODEL: string;
    };
    const previousEnv = process.env;

    process.env = { ...previousEnv, EKSPERIQ_FORCE_PRO_PLUS: "true" };
    delete process.env.OPENROUTER_VISION_MODEL_PRO_PLUS;
    delete process.env.EKSPERIQ_FORCE_PRO;
    delete process.env.OPENROUTER_VISION_MODEL_PRO;
    delete process.env.OPENROUTER_VISION_MODEL;
    delete process.env.OPENROUTER_MODEL;

    expect(resolveVisionModel()).toBe(DEFAULT_VISION_MODEL);
    process.env = previousEnv;
  });

  it("prefers the pro+ model over the pro model when both tiers are forced on", () => {
    const { resolveVisionModel } = handler as unknown as { resolveVisionModel: () => string };
    const previousEnv = process.env;

    process.env = {
      ...previousEnv,
      EKSPERIQ_FORCE_PRO: "true",
      OPENROUTER_VISION_MODEL_PRO: "openai/gpt-4o-mini",
      EKSPERIQ_FORCE_PRO_PLUS: "true",
      OPENROUTER_VISION_MODEL_PRO_PLUS: "openai/gpt-4o",
    };
    expect(resolveVisionModel()).toBe("openai/gpt-4o");

    process.env = previousEnv;
  });

  it("stays disabled unless the photo AI flag is enabled", async () => {
    const response = await callEndpoint(validBody, {
      NEXT_PUBLIC_AI_PHOTO_DAMAGE_ENABLED: "false",
      OPENROUTER_API_KEY: "test-key",
    });

    expect(response.statusCode).toBe(429);
    expect(response.body.error).toBe("AI fotoğraf analizi şu anda kapalı.");
  });

  it("returns normalized non-vehicle analysis without findings", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                isVehiclePhoto: false,
                summary: "Fotoğrafta yumurta görünüyor.",
                findings: [],
              }),
            },
          },
        ],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const previousEnv = process.env;
    process.env = {
      ...previousEnv,
      NEXT_PUBLIC_AI_PHOTO_DAMAGE_ENABLED: "true",
      OPENROUTER_API_KEY: "test-key",
      OPENROUTER_PHOTO_DAILY_REQUEST_LIMIT: "5",
    };
    const response = createResponse();

    await handler(createRequest(validBody), response);

    process.env = previousEnv;
    vi.unstubAllGlobals();
    const payload = JSON.parse(response.body) as { analysis: { isVehiclePhoto: boolean; findings: unknown[] } };
    const requestBody = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body)) as {
      response_format?: { type?: string };
    };
    expect(response.statusCode).toBe(200);
    expect(payload.analysis.isVehiclePhoto).toBe(false);
    expect(payload.analysis.findings).toEqual([]);
    expect(requestBody.response_format?.type).toBe("json_schema");
  });

  it("treats a screenshot response as a non-vehicle photo with no findings", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                isVehiclePhoto: false,
                summary: "Bu bir telefon ekran görüntüsü, araç görünmüyor.",
                findings: [],
              }),
            },
          },
        ],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const previousEnv = process.env;
    process.env = {
      ...previousEnv,
      NEXT_PUBLIC_AI_PHOTO_DAMAGE_ENABLED: "true",
      OPENROUTER_API_KEY: "test-key",
      OPENROUTER_PHOTO_DAILY_REQUEST_LIMIT: "5",
    };
    const response = createResponse();

    await handler(createRequest(validBody), response);

    process.env = previousEnv;
    vi.unstubAllGlobals();
    const payload = JSON.parse(response.body) as { analysis: { isVehiclePhoto: boolean; findings: unknown[] } };
    expect(response.statusCode).toBe(200);
    expect(payload.analysis.isVehiclePhoto).toBe(false);
    expect(payload.analysis.findings).toEqual([]);
  });

  it("keeps a blurry close-up response low-confidence and hedged instead of a firm damage claim", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                isVehiclePhoto: true,
                summary: "Fotoğraf çok yakın çekim ve bulanık, bölge net anlaşılamıyor.",
                findings: [
                  {
                    area: "Kapı paneli",
                    signal: "Çizik",
                    confidence: "low",
                    explanation: "Yakın ve bulanık çekim nedeniyle yüzeydeki iz kesin olarak değerlendirilemiyor.",
                    recommendation: "Daha net ve uzak bir fotoğrafla veya ekspertizde tekrar kontrol ettirin.",
                  },
                ],
              }),
            },
          },
        ],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const previousEnv = process.env;
    process.env = {
      ...previousEnv,
      NEXT_PUBLIC_AI_PHOTO_DAMAGE_ENABLED: "true",
      OPENROUTER_API_KEY: "test-key",
      OPENROUTER_PHOTO_DAILY_REQUEST_LIMIT: "5",
    };
    const response = createResponse();

    await handler(createRequest(validBody), response);

    process.env = previousEnv;
    vi.unstubAllGlobals();
    const payload = JSON.parse(response.body) as {
      analysis: { isVehiclePhoto: boolean; findings: Array<{ confidence: string; explanation: string }> };
    };
    expect(response.statusCode).toBe(200);
    expect(payload.analysis.isVehiclePhoto).toBe(true);
    expect(payload.analysis.findings).toHaveLength(1);
    expect(payload.analysis.findings[0].confidence).toBe("low");
    expect(payload.analysis.findings[0].explanation.toLocaleLowerCase("tr-TR")).not.toContain("kesin");
  });

  it("softens absolute-certainty damage claims into hedged language", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                isVehiclePhoto: true,
                summary: "Bu araç kesinlikle hasarlıdır.",
                findings: [
                  {
                    area: "Ön çamurluk",
                    signal: "Göçük",
                    confidence: "high",
                    explanation: "Bu panel kesinlikle hasar görmüş ve definitely damaged.",
                    recommendation: "Kesin olarak parça değişimi yapılmalı.",
                  },
                ],
              }),
            },
          },
        ],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const previousEnv = process.env;
    process.env = {
      ...previousEnv,
      NEXT_PUBLIC_AI_PHOTO_DAMAGE_ENABLED: "true",
      OPENROUTER_API_KEY: "test-key",
      OPENROUTER_PHOTO_DAILY_REQUEST_LIMIT: "5",
    };
    const response = createResponse();

    await handler(createRequest(validBody), response);

    process.env = previousEnv;
    vi.unstubAllGlobals();
    const payload = JSON.parse(response.body) as {
      analysis: {
        summary: string;
        findings: Array<{ explanation: string; recommendation: string }>;
      };
    };
    const combinedText =
      payload.analysis.summary + payload.analysis.findings.map((f) => `${f.explanation} ${f.recommendation}`).join(" ");
    const lowered = combinedText.toLocaleLowerCase("tr-TR");
    expect(lowered).not.toContain("kesinlikle");
    expect(lowered).not.toContain("kesin ");
    expect(lowered).not.toContain("definitely");
  });

  it("accepts vehicle responses that report no visible damage without signal fields", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                isVehiclePhoto: true,
                summary: "Fotoğrafta araç var, görünür hasar sinyali yok.",
                findings: [
                  {
                    area: "Ön tampon",
                    confidence: "high",
                    explanation: "No visible damage or scratches are detected.",
                    recommendation: "No action required.",
                  },
                ],
              }),
            },
          },
        ],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const previousEnv = process.env;
    process.env = {
      ...previousEnv,
      NEXT_PUBLIC_AI_PHOTO_DAMAGE_ENABLED: "true",
      OPENROUTER_API_KEY: "test-key",
      OPENROUTER_PHOTO_DAILY_REQUEST_LIMIT: "5",
    };
    const response = createResponse();

    await handler(createRequest(validBody), response);

    process.env = previousEnv;
    vi.unstubAllGlobals();
    const payload = JSON.parse(response.body) as { analysis: { isVehiclePhoto: boolean; findings: unknown[] } };
    expect(response.statusCode).toBe(200);
    expect(payload.analysis.isVehiclePhoto).toBe(true);
    expect(payload.analysis.findings).toEqual([]);
  });
});
