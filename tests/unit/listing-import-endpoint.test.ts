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
const handler = require("../../api/ai/listing-import.js") as EndpointHandler;

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
  source: "sahibinden",
  url: "https://shbd.io/s/example",
  title: "2020 Toyota Corolla",
  ogTitle: "2020 Toyota Corolla",
  ogDescription: "Temiz araç",
  bodyText: "Bu ilan sayfasinin gorunur metni buraya yazilir ve en az kirk karakter olmalidir.",
  jsonLd: [],
};

async function callEndpoint(body: unknown, fetchMock: ReturnType<typeof vi.fn>) {
  vi.stubGlobal("fetch", fetchMock);
  const previousEnv = process.env;
  process.env = {
    ...previousEnv,
    ...RATE_LIMIT_TEST_ENV,
    NEXT_PUBLIC_LISTING_IMPORT_ENABLED: "true",
    OPENROUTER_API_KEY: "test-key",
  };

  const response = createResponse();
  await handler(createRequest(body), response);

  process.env = previousEnv;
  vi.unstubAllGlobals();
  return { statusCode: response.statusCode, body: JSON.parse(response.body) as Record<string, unknown> };
}

describe("listing import AI endpoint", () => {
  // Regression test: some models (especially free-tier ones) return the
  // extracted fields flattened at the top level instead of nested under a
  // `fields` key the strict JSON schema asked for — this was observed live
  // for a Cloudflare-blocked page, where the model correctly reported the
  // block in `warnings` but the response was thrown away as unparseable
  // because of the shape mismatch, hiding a genuinely useful diagnosis.
  it("accepts a flattened top-level fields shape instead of failing as unparseable", async () => {
    const flatModelResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              brand: null,
              model: null,
              trim: null,
              year: null,
              fuelType: null,
              transmission: null,
              mileage: null,
              price: null,
              city: null,
              bodyType: null,
              engineSize: null,
              enginePower: null,
              drivetrain: null,
              ownerInfo: null,
              tradeStatus: null,
              airbagStatus: null,
              lpgStatus: null,
              hasHeavyDamage: null,
              hasChassisRepair: null,
              hasSpareKey: null,
              sellerDescription: null,
              lowConfidenceFields: [],
              warnings: ["Sayfa bir araç ilanına benzemiyor, Cloudflare doğrulama sayfası."],
            }),
          },
        },
      ],
    };
    const fetchMock = mockFetchAllowingRateLimit(new Response(JSON.stringify(flatModelResponse), { status: 200 }));

    const { statusCode, body } = await callEndpoint(validBody, fetchMock);

    expect(statusCode).toBe(200);
    const result = body.result as { fields: Record<string, unknown>; warnings: string[] };
    expect(result.fields.brand).toBeNull();
    expect(result.warnings).toContain("Sayfa bir araç ilanına benzemiyor, Cloudflare doğrulama sayfası.");
  });

  it("still fails when the response has neither a fields wrapper nor any known field key", async () => {
    const garbageResponse = {
      choices: [{ message: { content: JSON.stringify({ unrelated: "nonsense" }) } }],
    };
    const fetchMock = mockFetchAllowingRateLimit(new Response(JSON.stringify(garbageResponse), { status: 200 }));

    const { statusCode, body } = await callEndpoint(validBody, fetchMock);

    expect(statusCode).toBe(502);
    expect(body.error).toBe("İlan bilgisi işlenemedi.");
  });

  it("fills seller description, city, engine power and local paint from page text when the model misses them", async () => {
    const modelResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              title: "2020 Opel Astra 1.4",
              fields: {
                brand: "Opel",
                model: "Astra",
                year: 2020,
                trim: null,
                fuelType: "Benzin",
                transmission: "Otomatik",
                mileage: 87000,
                price: 1125000,
                city: null,
                bodyType: "Hatchback",
                engineSize: "1.4",
                enginePower: null,
                drivetrain: null,
                ownerInfo: "Galeriden satış",
                tradeStatus: null,
                tramerAmount: null,
                paintedParts: null,
                replacedParts: null,
                localPaintedParts: null,
                airbagStatus: null,
                lpgStatus: null,
                hasHeavyDamage: null,
                hasChassisRepair: null,
                hasTotalLossHistory: null,
                hasExpertiseReport: null,
                lpgRegistered: null,
                hasSpareKey: null,
                hasMaintenanceInvoices: null,
                lastMaintenanceDate: null,
                timingBeltInfo: null,
                transmissionMaintenanceInfo: null,
                batteryStatus: null,
                tireStatus: null,
                inspectionEndDate: null,
                sellerDescription: null,
              },
              lowConfidenceFields: [],
              missingFields: ["sellerDescription", "city", "enginePower", "localPaintedParts", "hasHeavyDamage"],
              warnings: [],
            }),
          },
        },
      ],
    };
    const bodyWithDescription = {
      ...validBody,
      bodyText: [
        "İlan Açıklaması",
        "ŞENTÜRK OTOMOTİV E HOŞ GELDİNİZ",
        "ARAÇLARIMIZ İSTEDİĞİNİZ EXPERTİZ E USTAYA AÇIKTIR",
        "SOL ÖN ÇAMURLUK LOKAL BOYA HARİCİ",
        "HATASIZ BOYASIZ",
        "HASAR KAYITSIZ",
        "ARAÇ 2020 ÖZEL SERİ ÜRETİMDİR",
        "PSA DEĞİL",
        "GENERAL MOTOR 145 HP DİR",
        "Konum",
        "Samsun / İlkadım",
      ].join("\n"),
    };
    const fetchMock = mockFetchAllowingRateLimit(new Response(JSON.stringify(modelResponse), { status: 200 }));

    const { statusCode, body } = await callEndpoint(bodyWithDescription, fetchMock);

    expect(statusCode).toBe(200);
    const result = body.result as { fields: Record<string, unknown>; missingFields: string[] };
    expect(result.fields.sellerDescription).toContain("ŞENTÜRK OTOMOTİV");
    expect(result.fields.city).toBe("Samsun");
    expect(result.fields.enginePower).toBe("145 HP");
    expect(result.fields.localPaintedParts).toBe("Sol ön çamurluk");
    expect(result.fields.hasHeavyDamage).toBe(false);
    expect(result.missingFields).not.toContain("sellerDescription");
    expect(result.missingFields).not.toContain("city");
  });
});
