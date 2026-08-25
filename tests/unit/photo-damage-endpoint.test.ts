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
  aiProviderConsent: true,
  images: [
    {
      name: "photo.jpg",
      mimeType: "image/jpeg",
      dataUrl: "data:image/jpeg;base64,AAAA",
    },
  ],
};

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

/** Routes fetch by URL: Upstash pipeline calls always pass the rate limit; everything else goes to the OpenRouter handler. */
function mockFetchAllowingRateLimit(openRouterResponse: unknown) {
  return vi.fn<(input: unknown, init?: RequestInit) => Promise<unknown>>(async (input) => {
    if (String(input).includes("upstash.example.com")) {
      return new Response(UPSTASH_ALLOW_RESPONSE, { status: 200 });
    }
    return openRouterResponse;
  });
}

describe("photo damage AI endpoint", () => {
  it("defaults to a named, reliable free vision model instead of the random openrouter/free router", () => {
    // openrouter/free randomly routes to any free model on OpenRouter, including
    // moderation/safety classifiers that don't support the strict JSON schema
    // this endpoint relies on and can return nonsense instead of an analysis.
    const withDefault = handler as unknown as { DEFAULT_VISION_MODEL: string };
    expect(withDefault.DEFAULT_VISION_MODEL).not.toBe("openrouter/free");
    expect(withDefault.DEFAULT_VISION_MODEL).toMatch(/:free$/);
  });

  it("keeps photo analysis on a free vision model even when old Pro override env vars exist", () => {
    const { resolveVisionModel, DEFAULT_VISION_MODEL } = handler as unknown as {
      resolveVisionModel: () => string;
      DEFAULT_VISION_MODEL: string;
    };
    const previousEnv = process.env;

    process.env = {
      ...previousEnv,
      EKSPERIQ_FORCE_PRO: "true",
      OPENROUTER_VISION_MODEL_PRO: "openai/gpt-4o-mini",
      EKSPERIQ_FORCE_PRO_PLUS: "true",
      OPENROUTER_VISION_MODEL_PRO_PLUS: "openai/gpt-4o",
    };
    delete process.env.OPENROUTER_VISION_MODEL;
    delete process.env.OPENROUTER_MODEL;
    expect(resolveVisionModel()).toBe(DEFAULT_VISION_MODEL);

    process.env = previousEnv;
  });

  it("uses a configured vision model only when it is explicitly a free OpenRouter model", () => {
    const { resolveVisionModel, DEFAULT_VISION_MODEL } = handler as unknown as {
      resolveVisionModel: () => string;
      DEFAULT_VISION_MODEL: string;
    };
    const previousEnv = process.env;

    process.env = { ...previousEnv, OPENROUTER_VISION_MODEL: "google/gemma-4-26b-a4b-it:free" };
    expect(resolveVisionModel()).toBe("google/gemma-4-26b-a4b-it:free");

    process.env = { ...previousEnv, OPENROUTER_VISION_MODEL: "openai/gpt-4o-mini" };
    expect(resolveVisionModel()).toBe(DEFAULT_VISION_MODEL);
    process.env = previousEnv;
  });

  it("does not treat the shared text listing model as a vision model", () => {
    const { resolveVisionModel, DEFAULT_VISION_MODEL } = handler as unknown as {
      resolveVisionModel: () => string;
      DEFAULT_VISION_MODEL: string;
    };
    const previousEnv = process.env;

    process.env = {
      ...previousEnv,
      OPENROUTER_MODEL: "openai/gpt-oss-20b:free",
    };
    delete process.env.OPENROUTER_VISION_MODEL;

    expect(resolveVisionModel()).toBe(DEFAULT_VISION_MODEL);

    process.env = previousEnv;
  });

  it("keeps a free-router vision fallback, then a paid last resort, after the named free model", () => {
    const {
      resolveVisionModelCandidates,
      DEFAULT_VISION_MODEL_CANDIDATES,
      FREE_ROUTER_FALLBACK_MODEL,
      PAID_FALLBACK_MODEL,
    } = handler as unknown as {
      resolveVisionModelCandidates: () => string[];
      DEFAULT_VISION_MODEL_CANDIDATES: string[];
      FREE_ROUTER_FALLBACK_MODEL: string;
      PAID_FALLBACK_MODEL: string;
    };
    const previousEnv = process.env;

    process.env = { ...previousEnv };
    delete process.env.OPENROUTER_VISION_MODEL;
    delete process.env.OPENROUTER_MODEL;
    delete process.env.OPENROUTER_VISION_FALLBACK_MODEL;
    delete process.env.OPENROUTER_DISABLE_PAID_PHOTO_FALLBACK;
    expect(resolveVisionModelCandidates()).toEqual([
      ...DEFAULT_VISION_MODEL_CANDIDATES,
      PAID_FALLBACK_MODEL,
      FREE_ROUTER_FALLBACK_MODEL,
    ]);
    expect(DEFAULT_VISION_MODEL_CANDIDATES.length).toBeGreaterThan(1);

    process.env = {
      ...previousEnv,
      OPENROUTER_VISION_MODEL: "google/gemma-4-26b-a4b-it:free",
      OPENROUTER_VISION_FALLBACK_MODEL: "qwen/qwen3.6-plus:free",
    };
    expect(resolveVisionModelCandidates()).toEqual([
      "google/gemma-4-26b-a4b-it:free",
      "qwen/qwen3.6-plus:free",
      ...DEFAULT_VISION_MODEL_CANDIDATES.filter((model) => model !== "google/gemma-4-26b-a4b-it:free"),
      PAID_FALLBACK_MODEL,
      FREE_ROUTER_FALLBACK_MODEL,
    ]);
    expect(
      resolveVisionModelCandidates().every(
        (model) => model === FREE_ROUTER_FALLBACK_MODEL || model === PAID_FALLBACK_MODEL || model.endsWith(":free"),
      ),
    ).toBe(true);

    process.env = {
      ...previousEnv,
      OPENROUTER_DISABLE_PAID_PHOTO_FALLBACK: "true",
    };
    expect(resolveVisionModelCandidates()).toEqual([...DEFAULT_VISION_MODEL_CANDIDATES, FREE_ROUTER_FALLBACK_MODEL]);

    process.env = previousEnv;
  });

  it("rejects an oversized combined image payload with 413 before calling OpenRouter", async () => {
    const oversizedDataUrl = `data:image/jpeg;base64,${"A".repeat(4_300_000)}`;
    const response = await callEndpoint(
      { aiProviderConsent: true, images: [{ name: "big.jpg", mimeType: "image/jpeg", dataUrl: oversizedDataUrl }] },
      { NEXT_PUBLIC_AI_PHOTO_DAMAGE_ENABLED: "true", OPENROUTER_API_KEY: "test-key" },
    );

    expect(response.statusCode).toBe(413);
    expect(response.body.error).toContain("çok büyük");
  });

  it("fails closed with 503 when the rate limiter is unavailable (no Upstash/hash secret configured)", async () => {
    const response = await callEndpoint(validBody, {
      NEXT_PUBLIC_AI_PHOTO_DAMAGE_ENABLED: "true",
      OPENROUTER_API_KEY: "test-key",
      // Deliberately no UPSTASH_* / RATE_LIMIT_HASH_SECRET — this must not fall back
      // to "no limit at all".
    });

    expect(response.statusCode).toBe(503);
  });

  it("stays disabled unless the photo AI flag is enabled", async () => {
    const response = await callEndpoint(validBody, {
      NEXT_PUBLIC_AI_PHOTO_DAMAGE_ENABLED: "false",
      OPENROUTER_API_KEY: "test-key",
    });

    expect(response.statusCode).toBe(429);
    expect(response.body.error).toBe("AI fotoğraf analizi şu anda kapalı.");
  });

  it("rejects requests that do not include explicit AI provider consent before calling OpenRouter", async () => {
    const withoutConsent: Partial<typeof validBody> = { ...validBody };
    delete withoutConsent.aiProviderConsent;
    const response = await callEndpoint(withoutConsent, {
      NEXT_PUBLIC_AI_PHOTO_DAMAGE_ENABLED: "true",
      OPENROUTER_API_KEY: "test-key",
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe("AI fotoğraf kontrolü için AI sağlayıcısına veri gönderimi onayı zorunludur.");
  });

  it("returns normalized non-vehicle analysis without findings", async () => {
    const fetchMock = mockFetchAllowingRateLimit({
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
      ...RATE_LIMIT_TEST_ENV,
      NEXT_PUBLIC_AI_PHOTO_DAMAGE_ENABLED: "true",
      OPENROUTER_API_KEY: "test-key",
      OPENROUTER_PHOTO_DAILY_REQUEST_LIMIT: "5",
    };
    const response = createResponse();

    await handler(createRequest(validBody), response);

    process.env = previousEnv;
    vi.unstubAllGlobals();
    const payload = JSON.parse(response.body) as { analysis: { isVehiclePhoto: boolean; findings: unknown[] } };
    const openRouterCall = fetchMock.mock.calls.find(([url]) => String(url).includes("openrouter.ai"));
    const requestBody = JSON.parse(String((openRouterCall?.[1] as RequestInit | undefined)?.body)) as {
      response_format?: { type?: string };
    };
    expect(response.statusCode).toBe(200);
    expect(payload.analysis.isVehiclePhoto).toBe(false);
    expect(payload.analysis.findings).toEqual([]);
    expect(requestBody.response_format?.type).toBe("json_schema");
  });

  it("treats a screenshot response as a non-vehicle photo with no findings", async () => {
    const fetchMock = mockFetchAllowingRateLimit({
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
      ...RATE_LIMIT_TEST_ENV,
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

  it("forces contradictory non-vehicle model responses to no findings", async () => {
    const fetchMock = mockFetchAllowingRateLimit({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                isVehiclePhoto: true,
                summary: "Bu bir telefon ekran görüntüsü, araç fotoğrafı değil.",
                findings: [
                  {
                    area: "Ön tampon",
                    signal: "Olası hasar",
                    confidence: "high",
                    explanation: "Model hatalı şekilde araç hasarı yorumu üretmiş.",
                    recommendation: "Ekspertizde kontrol ettirin.",
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
      ...RATE_LIMIT_TEST_ENV,
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

  it("accepts dashboard warning light photos as vehicle-related guidance", async () => {
    const fetchMock = mockFetchAllowingRateLimit({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                isVehiclePhoto: true,
                summary: "Gösterge panelinde sarı motor arıza lambası benzeri bir uyarı görünüyor.",
                findings: [
                  {
                    area: "Gösterge paneli",
                    signal: "Motor arıza lambası",
                    confidence: "medium",
                    explanation:
                      "Sarı motor arıza uyarısı emisyon, ateşleme veya sensör kaynaklı bir kontrol ihtiyacına işaret edebilir.",
                    recommendation:
                      "Araç sarsıntılı çalışıyorsa kullanmayın; değilse kısa sürede oto tamirci veya serviste OBD arıza kodu okutun.",
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
      ...RATE_LIMIT_TEST_ENV,
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
        isVehiclePhoto: boolean;
        disclaimer: string;
        findings: Array<{ area: string; signal: string; recommendation: string }>;
      };
    };
    const openRouterCall = fetchMock.mock.calls.find(([url]) => String(url).includes("openrouter.ai"));
    const requestBody = JSON.parse(String((openRouterCall?.[1] as RequestInit | undefined)?.body)) as {
      messages?: Array<{ content?: string | Array<{ text?: string }> }>;
    };
    const promptText = JSON.stringify(requestBody.messages);

    expect(response.statusCode).toBe(200);
    expect(payload.analysis.isVehiclePhoto).toBe(true);
    expect(payload.analysis.findings[0].area).toBe("Gösterge paneli");
    expect(payload.analysis.findings[0].signal).toBe("Motor arıza lambası");
    expect(payload.analysis.findings[0].recommendation).toContain("OBD");
    expect(payload.analysis.disclaimer).toContain("arıza tespiti değildir");
    expect(promptText).toContain("uyarı lambası");
    expect(promptText).toContain("OBD");
  });

  it("keeps a blurry close-up response low-confidence and hedged instead of a firm damage claim", async () => {
    const fetchMock = mockFetchAllowingRateLimit({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                isVehiclePhoto: true,
                summary: "Fotoğraf çok yakın çekim ve bulanık, bölge net anlaşılamıyor.",
                photoQuality: {
                  status: "poor",
                  issues: ["Fotoğraf bulanık ve fazla yakın çekilmiş."],
                  retakeTips: ["Aynı kapı panelini düz, sağ çapraz ve sol çapraz açıdan tekrar çekin."],
                },
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
      ...RATE_LIMIT_TEST_ENV,
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
        isVehiclePhoto: boolean;
        photoQuality: { status: string; issues: string[]; retakeTips: string[] };
        findings: Array<{ confidence: string; explanation: string }>;
      };
    };
    const openRouterCall = fetchMock.mock.calls.find(([url]) => String(url).includes("openrouter.ai"));
    const requestBody = JSON.parse(String((openRouterCall?.[1] as RequestInit | undefined)?.body)) as {
      response_format?: { json_schema?: { schema?: { required?: string[] } } };
      messages?: Array<{ content?: string | Array<{ text?: string }> }>;
    };
    const promptText = JSON.stringify(requestBody.messages);
    expect(response.statusCode).toBe(200);
    expect(payload.analysis.isVehiclePhoto).toBe(true);
    expect(payload.analysis.photoQuality.status).toBe("poor");
    expect(payload.analysis.photoQuality.issues[0]).toContain("bulanık");
    expect(payload.analysis.photoQuality.retakeTips[0]).toContain("çapraz");
    expect(payload.analysis.findings).toHaveLength(1);
    expect(payload.analysis.findings[0].confidence).toBe("low");
    expect(payload.analysis.findings[0].explanation.toLocaleLowerCase("tr-TR")).not.toContain("kesin");
    expect(requestBody.response_format?.json_schema?.schema?.required).toContain("photoQuality");
    expect(promptText).toContain("photoQuality");
    expect(promptText).toContain("Çizik");
  });

  it("softens absolute-certainty damage claims into hedged language", async () => {
    const fetchMock = mockFetchAllowingRateLimit({
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
      ...RATE_LIMIT_TEST_ENV,
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
    const fetchMock = mockFetchAllowingRateLimit({
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
      ...RATE_LIMIT_TEST_ENV,
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

  it("retries without strict response_format when a free vision model rejects JSON schema mode", async () => {
    const fetchMock = vi.fn<(input: unknown, init?: RequestInit) => Promise<Response>>(async (input, init) => {
      if (String(input).includes("upstash.example.com")) {
        return new Response(UPSTASH_ALLOW_RESPONSE, { status: 200 });
      }
      const body = JSON.parse(String(init?.body)) as { response_format?: unknown };
      if (body.response_format) {
        return new Response(JSON.stringify({ error: { message: "response_format unsupported" } }), { status: 400 });
      }
      return new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  isVehiclePhoto: true,
                  summary: "Fotoğrafta aracın ön kısmında kontrol gerektiren alanlar görünüyor.",
                  findings: [
                    {
                      area: "Ön bölüm",
                      signal: "Olası darbe izi",
                      confidence: "medium",
                      explanation: "Ön bölümde parça hizası ve yüzey görünümü kontrol gerektirebilir.",
                      recommendation: "Kaput, tampon ve şasi uçlarını ekspertizde kontrol ettirin.",
                    },
                  ],
                }),
              },
            },
          ],
        }),
        { status: 200 },
      );
    });
    vi.stubGlobal("fetch", fetchMock);
    const previousEnv = process.env;
    process.env = {
      ...previousEnv,
      ...RATE_LIMIT_TEST_ENV,
      NEXT_PUBLIC_AI_PHOTO_DAMAGE_ENABLED: "true",
      OPENROUTER_API_KEY: "test-key",
      OPENROUTER_PHOTO_DAILY_REQUEST_LIMIT: "5",
    };
    const response = createResponse();

    await handler(createRequest(validBody), response);

    process.env = previousEnv;
    vi.unstubAllGlobals();
    const openRouterCalls = fetchMock.mock.calls.filter(([input]) => !String(input).includes("upstash.example.com"));
    const payload = JSON.parse(response.body) as { analysis: { isVehiclePhoto: boolean; findings: unknown[] } };
    expect(response.statusCode).toBe(200);
    expect(openRouterCalls).toHaveLength(2);
    expect(openRouterCalls[0]?.[1]?.body).toContain("response_format");
    expect(openRouterCalls[1]?.[1]?.body).not.toContain("response_format");
    expect(payload.analysis.isVehiclePhoto).toBe(true);
    expect(payload.analysis.findings).toHaveLength(1);
  });

  it("tries the free-router fallback when the named vision model returns unreadable content", async () => {
    const fetchMock = vi.fn<(input: unknown, init?: RequestInit) => Promise<Response>>(async (input, init) => {
      if (String(input).includes("upstash.example.com")) {
        return new Response(UPSTASH_ALLOW_RESPONSE, { status: 200 });
      }
      const body = JSON.parse(String(init?.body)) as { model: string };
      if (body.model !== "openrouter/free") {
        return new Response(
          JSON.stringify({
            choices: [
              {
                message: {
                  content: "Bunu JSON olarak okuyamam.",
                },
              },
            ],
          }),
          { status: 200 },
        );
      }
      return new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  isVehiclePhoto: true,
                  summary: "Fotoğrafta aracın ön bölümünde olası kaza hasarı görünüyor.",
                  findings: [
                    {
                      area: "Ön bölüm",
                      signal: "Olası kaza hasarı",
                      confidence: "high",
                      explanation: "Kaput, tampon ve ön panel hizasında belirgin hasar sinyali olabilir.",
                      recommendation:
                        "Aracı çekiciyle ekspertize götürün; şasi ucu, podye, radyatör paneli ve airbag kayıtları kontrol edilmeli.",
                    },
                  ],
                }),
              },
            },
          ],
        }),
        { status: 200 },
      );
    });
    vi.stubGlobal("fetch", fetchMock);
    const previousEnv = process.env;
    process.env = {
      ...previousEnv,
      ...RATE_LIMIT_TEST_ENV,
      NEXT_PUBLIC_AI_PHOTO_DAMAGE_ENABLED: "true",
      OPENROUTER_API_KEY: "test-key",
      OPENROUTER_PHOTO_DAILY_REQUEST_LIMIT: "5",
    };
    const response = createResponse();

    await handler(createRequest(validBody), response);

    process.env = previousEnv;
    vi.unstubAllGlobals();
    const openRouterBodies = fetchMock.mock.calls
      .filter(([input]) => !String(input).includes("upstash.example.com"))
      .map(([, init]) => JSON.parse(String(init?.body)) as { model: string; response_format?: unknown });
    const payload = JSON.parse(response.body) as { model: string; analysis: { findings: unknown[] } };
    expect(response.statusCode).toBe(200);
    expect(openRouterBodies.map((body) => body.model)).toContain("openrouter/free");
    expect(openRouterBodies.slice(0, 2).map((body) => body.model)).toEqual([
      "google/gemma-4-26b-a4b-it:free",
      "google/gemma-4-26b-a4b-it:free",
    ]);
    expect(openRouterBodies.at(-1)?.response_format).toBeUndefined();
    expect(payload.model).toBe("openrouter/free");
    expect(payload.analysis.findings).toHaveLength(1);
  });

  it("turns useful plain-text vehicle damage responses into a low-confidence finding instead of failing", async () => {
    const fetchMock = mockFetchAllowingRateLimit({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content:
                "Ön tampon, sağ far çevresi ve ön panel hizasında olası kaza hasarı görünüyor. Kaput ve şasi uçları ekspertizde kontrol edilmeli.",
            },
          },
        ],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const previousEnv = process.env;
    process.env = {
      ...previousEnv,
      ...RATE_LIMIT_TEST_ENV,
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
        isVehiclePhoto: boolean;
        findings: Array<{ signal: string; confidence: string; recommendation: string }>;
      };
    };
    expect(response.statusCode).toBe(200);
    expect(payload.analysis.isVehiclePhoto).toBe(true);
    expect(payload.analysis.findings).toHaveLength(1);
    expect(payload.analysis.findings[0].signal).toContain("hasar");
    expect(payload.analysis.findings[0].confidence).toBe("low");
    expect(payload.analysis.findings[0].recommendation).toContain("ekspertiz");
  });

  it("reads alternate OpenRouter text block shapes", async () => {
    const fetchMock = mockFetchAllowingRateLimit({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: [
                {
                  type: "output_text",
                  output_text:
                    "Ön tampon ve sağ far çevresinde olası darbe izi görünüyor; ekspertizde ön panel ve şasi uçları kontrol edilmeli.",
                },
              ],
            },
          },
        ],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const previousEnv = process.env;
    process.env = {
      ...previousEnv,
      ...RATE_LIMIT_TEST_ENV,
      NEXT_PUBLIC_AI_PHOTO_DAMAGE_ENABLED: "true",
      OPENROUTER_API_KEY: "test-key",
      OPENROUTER_PHOTO_DAILY_REQUEST_LIMIT: "5",
    };
    const response = createResponse();

    await handler(createRequest(validBody), response);

    process.env = previousEnv;
    vi.unstubAllGlobals();
    const payload = JSON.parse(response.body) as {
      analysis: { isVehiclePhoto: boolean; findings: Array<{ signal: string }> };
    };
    expect(response.statusCode).toBe(200);
    expect(payload.analysis.isVehiclePhoto).toBe(true);
    expect(payload.analysis.findings[0].signal).toContain("hasar");
  });

  it("does not show model reasoning text or a fabricated specific area when falling back from an unstructured vision response", async () => {
    // Regression test: a real photo of a car with its entire front bumper
    // torn off was labeled "Ön sol bölüm: Olası uyarı ışığı" (possible
    // dashboard warning light) because the fallback used to keyword-match
    // "front-left"/"warning"-ish words straight out of this kind of leaked
    // reasoning text, producing a confident-sounding but fabricated,
    // unrelated finding. When the model's text is unusable reasoning/schema
    // noise like this, the fallback must stay honest about not having a
    // real localized reading instead of guessing one from stray words.
    const fetchMock = mockFetchAllowingRateLimit({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content:
                "Thinking Process:\\nAnalyze the request: image shows significant front-left damage. Strict JSON is required but unavailable.",
            },
          },
        ],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const previousEnv = process.env;
    process.env = {
      ...previousEnv,
      ...RATE_LIMIT_TEST_ENV,
      NEXT_PUBLIC_AI_PHOTO_DAMAGE_ENABLED: "true",
      OPENROUTER_API_KEY: "test-key",
      OPENROUTER_PHOTO_DAILY_REQUEST_LIMIT: "5",
    };
    const response = createResponse();

    await handler(createRequest(validBody), response);

    process.env = previousEnv;
    vi.unstubAllGlobals();
    const payload = JSON.parse(response.body) as {
      analysis: { summary: string; findings: Array<{ area: string; signal: string; explanation: string }> };
    };
    const combined = `${payload.analysis.summary} ${payload.analysis.findings[0]?.explanation ?? ""}`;
    expect(response.statusCode).toBe(200);
    expect(payload.analysis.findings[0]?.area).toBe("Görseldeki araç bölgesi");
    expect(payload.analysis.findings[0]?.signal).not.toBe("Olası uyarı ışığı");
    expect(combined).not.toMatch(/thinking process|strict json|analyze the request/i);
  });

  it("does not mark a photo as isVehiclePhoto=false when leaked reasoning merely recites the prompt's own non-vehicle vocabulary", async () => {
    // Regression test for a second, related live incident: the exact same
    // heavily-damaged-car photo, on a retry, came back "no vehicle detected
    // at all". The model's leaked "thinking" text correctly identified a
    // car with front-left collision damage, but later recited the system
    // prompt's own classification rules back to itself — including its
    // list of non-vehicle categories ("ekran görüntüsü, çizim, doküman,
    // oyuncak") — and that recitation, not any real judgment about the
    // photo, used to trip the no-vehicle keyword check.
    const fetchMock = mockFetchAllowingRateLimit({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content:
                "Thinking Process:\\n1. Analyze the request: Input is an image of a white car with significant front-left damage (collision damage).\\n" +
                "Key guidelines: Fotoğraf ekran görüntüsü, çizim, doküman, oyuncak veya araçla ilgisiz bir obje ise isVehiclePhoto=false döndür.\\n" +
                "Strict JSON is required but I am unable to produce it.",
            },
          },
        ],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const previousEnv = process.env;
    process.env = {
      ...previousEnv,
      ...RATE_LIMIT_TEST_ENV,
      NEXT_PUBLIC_AI_PHOTO_DAMAGE_ENABLED: "true",
      OPENROUTER_API_KEY: "test-key",
      OPENROUTER_PHOTO_DAILY_REQUEST_LIMIT: "5",
    };
    const response = createResponse();

    await handler(createRequest(validBody), response);

    process.env = previousEnv;
    vi.unstubAllGlobals();
    const payload = JSON.parse(response.body) as {
      analysis: { isVehiclePhoto: boolean; findings: Array<{ area: string }> };
    };
    expect(response.statusCode).toBe(200);
    expect(payload.analysis.isVehiclePhoto).toBe(true);
    expect(payload.analysis.findings.length).toBeGreaterThan(0);
  });

  it("overrides isVehiclePhoto=false when the model's own summary describes real vehicle damage", async () => {
    // Regression test for a third live incident: a clean, valid JSON
    // response (no reasoning leak, no schema failure) where the model set
    // isVehiclePhoto=false and returned an empty findings array, while its
    // own summary and photoQuality text clearly and specifically describe
    // real front-end collision damage on a vehicle. The app used to show
    // that accurate summary directly under a contradictory "araç tespit
    // edilemedi" banner with nothing in the findings list.
    const fetchMock = mockFetchAllowingRateLimit({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                isVehiclePhoto: false,
                summary:
                  "Ön gövdeye ait belirgin hasar mevcut; sağ ön taraf çarpışma etkisi gözlemleniyor; sürüş güvenliği için profesyonel kontrol ve tamir gerekebilir.",
                photoQuality: {
                  isUsable: true,
                  retakeTip: "Hasarlı ön sağ bölgeye daha yakından ve iyi ışıkta tekrar çekim yapın.",
                },
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
      ...RATE_LIMIT_TEST_ENV,
      NEXT_PUBLIC_AI_PHOTO_DAMAGE_ENABLED: "true",
      OPENROUTER_API_KEY: "test-key",
      OPENROUTER_PHOTO_DAILY_REQUEST_LIMIT: "5",
    };
    const response = createResponse();

    await handler(createRequest(validBody), response);

    process.env = previousEnv;
    vi.unstubAllGlobals();
    const payload = JSON.parse(response.body) as {
      analysis: { isVehiclePhoto: boolean; findings: Array<{ area: string; explanation: string }> };
    };
    expect(response.statusCode).toBe(200);
    expect(payload.analysis.isVehiclePhoto).toBe(true);
    expect(payload.analysis.findings.length).toBeGreaterThan(0);
  });

  it("retries without response_format when OpenRouter returns a 200 error payload for schema mode", async () => {
    const fetchMock = vi.fn<(input: unknown, init?: RequestInit) => Promise<Response>>(async (input, init) => {
      if (String(input).includes("upstash.example.com")) {
        return new Response(UPSTASH_ALLOW_RESPONSE, { status: 200 });
      }
      const body = JSON.parse(String(init?.body)) as { response_format?: unknown };
      if (body.response_format) {
        return new Response(JSON.stringify({ error: { message: "response_format schema is not supported" } }), {
          status: 200,
        });
      }
      return new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content:
                  "Ön kaput, tampon ve far çevresinde olası kaza hasarı görünüyor; kaporta ve şasi kontrolü yapılmalı.",
              },
            },
          ],
        }),
        { status: 200 },
      );
    });
    vi.stubGlobal("fetch", fetchMock);
    const previousEnv = process.env;
    process.env = {
      ...previousEnv,
      ...RATE_LIMIT_TEST_ENV,
      NEXT_PUBLIC_AI_PHOTO_DAMAGE_ENABLED: "true",
      OPENROUTER_API_KEY: "test-key",
      OPENROUTER_PHOTO_DAILY_REQUEST_LIMIT: "5",
    };
    const response = createResponse();

    await handler(createRequest(validBody), response);

    process.env = previousEnv;
    vi.unstubAllGlobals();
    const openRouterBodies = fetchMock.mock.calls
      .filter(([input]) => !String(input).includes("upstash.example.com"))
      .map(([, init]) => JSON.parse(String(init?.body)) as { response_format?: unknown });
    const payload = JSON.parse(response.body) as { analysis: { findings: unknown[] } };
    expect(response.statusCode).toBe(200);
    expect(openRouterBodies[0]?.response_format).toBeDefined();
    expect(openRouterBodies[1]?.response_format).toBeUndefined();
    expect(payload.analysis.findings).toHaveLength(1);
  });
});
