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
const handler = require("../../api/ai/listing-photo-evidence.js") as EndpointHandler;

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

function mockFetchAllowingRateLimit(openRouterResponse: unknown) {
  return vi.fn<(input: unknown, init?: RequestInit) => Promise<unknown>>(async (input) => {
    if (String(input).includes("upstash.example.com")) {
      return new Response(UPSTASH_ALLOW_RESPONSE, { status: 200 });
    }
    return openRouterResponse;
  });
}

const validBody = {
  aiProviderConsent: true,
  imageUrls: [
    "https://i0.shbdn.com/photos/11/22/33/x5_vehicle.jpg",
    "https://i0.shbdn.com/photos/11/22/33/x5_expertise-report.jpg",
  ],
  context: {
    title: "2021 Renault Clio",
    sellerDescription: "Temiz aile aracı.",
  },
};

describe("listing photo evidence endpoint", () => {
  it("extracts document evidence from listing photos and keeps document indexes", async () => {
    const fetchMock = mockFetchAllowingRateLimit({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                hasEvidence: true,
                documentImageIndexes: [1],
                documentTypes: ["Ekspertiz raporu"],
                evidenceSummary: "Ekspertiz görselinde ön tampon değişen, sağ ön kapı boyalı görünüyor.",
                fields: {
                  tramerAmount: 18000,
                  paintedParts: "Sağ ön kapı",
                  replacedParts: "Ön tampon",
                  localPaintedParts: null,
                  airbagStatus: null,
                  hasHeavyDamage: false,
                  hasChassisRepair: null,
                  hasTotalLossHistory: null,
                  hasExpertiseReport: true,
                  hasMaintenanceInvoices: true,
                  lastMaintenanceDate: null,
                  timingBeltInfo: null,
                  transmissionMaintenanceInfo: null,
                  batteryStatus: null,
                  tireStatus: null,
                  inspectionEndDate: null,
                  sellerDescriptionAppend:
                    "Ekspertiz fotoğrafında ön tampon değişen, sağ ön kapı boyalı ve 18.000 TL tramer görünüyor.",
                },
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
      NEXT_PUBLIC_LISTING_IMPORT_ENABLED: "true",
      OPENROUTER_API_KEY: "test-key",
    };
    const response = createResponse();

    await handler(createRequest(validBody), response);

    process.env = previousEnv;
    vi.unstubAllGlobals();
    const payload = JSON.parse(response.body) as {
      analysis: { hasEvidence: boolean; documentImageIndexes: number[]; fields: { tramerAmount: number } };
    };
    const openRouterCall = fetchMock.mock.calls.find(([url]) => String(url).includes("openrouter.ai"));
    const requestBody = JSON.parse(String((openRouterCall?.[1] as RequestInit | undefined)?.body)) as {
      response_format?: { type?: string };
      messages?: unknown;
    };
    const promptText = JSON.stringify(requestBody.messages);

    expect(response.statusCode).toBe(200);
    expect(payload.analysis.hasEvidence).toBe(true);
    expect(payload.analysis.documentImageIndexes).toEqual([1]);
    expect(payload.analysis.fields.tramerAmount).toBe(18000);
    expect(requestBody.response_format?.type).toBe("json_schema");
    expect(promptText).toContain("tramer");
    expect(promptText).toContain("Ekspertiz");
  });

  it("rejects requests without AI provider consent", async () => {
    const previousEnv = process.env;
    process.env = {
      ...previousEnv,
      NEXT_PUBLIC_LISTING_IMPORT_ENABLED: "true",
    };
    const response = createResponse();
    await handler(createRequest({ ...validBody, aiProviderConsent: false }), response);
    process.env = previousEnv;

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body).error).toContain("onayı zorunludur");
  });
});
