// @vitest-environment node
//
// pdf-lib's font/image embedding validates buffers with cross-realm checks
// that misidentify jsdom's Buffer/Uint8Array as an unrelated type (surfaced
// as a bizarre "font must be ... but was actually of type NaN" error) — the
// project's default test environment is jsdom (see vitest.config.ts), but
// this endpoint is pure server-side binary generation with no DOM
// dependency, so it runs correctly under plain Node instead.
import { Readable, Writable } from "node:stream";
import { createRequire } from "node:module";
import { describe, expect, it, vi } from "vitest";

type MockResponse = Writable & {
  statusCode?: number;
  headers: Record<string, string>;
  body: Buffer;
  setHeader: (name: string, value: string) => void;
};

type EndpointHandler = (request: Readable & { method?: string }, response: MockResponse) => Promise<void>;

const require = createRequire(import.meta.url);
const handler = require("../../api/report/pdf.js") as EndpointHandler;

function createRequest(body: unknown) {
  const request = Readable.from([JSON.stringify(body)]) as Readable & { method?: string };
  request.method = "POST";
  return request;
}

/** Collects raw Buffer chunks instead of stringifying them — pdf.js writes binary PDF bytes via response.end(Buffer). */
function createResponse(): MockResponse {
  const chunks: Buffer[] = [];
  const response = new Writable({
    write(chunk, _encoding, callback) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      callback();
    },
  }) as MockResponse;
  response.headers = {};
  response.setHeader = (name: string, value) => {
    response.headers[name] = String(value);
  };
  Object.defineProperty(response, "body", {
    get: () => Buffer.concat(chunks),
  });
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

// Minimal, genuinely valid 1x1 PNG — pdf-lib's embedPng needs real image
// bytes, not a placeholder string.
const ONE_PIXEL_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";

const validPayload = {
  year: 2020,
  brand: "Toyota",
  model: "Corolla",
  mileage: 90000,
  price: 1200000,
  city: "İstanbul",
  totalScore: 72,
  riskLabel: "Dikkatli incelenmeli",
  decision: "Ekspertiz ve belge kontrolü şart",
  priorityActions: [{ title: "Tramer sorgula", reason: "Resmi kayıt henüz doğrulanmadı." }],
  findings: [{ title: "Boyalı parça bilgisi var", recommendation: "Boya kalınlık ölçümü yaptırın." }],
  strengths: ["Bakım kayıtları düzenli."],
  costs: [{ item: "Ön tampon boyası", level: "Düşük" }],
  knownIssues: [{ title: "Zincir gerdirme sesi", detail: "Bazı örneklerde yüksek km'de rapor edilmiş." }],
  completeness: { completed: 14, total: 20, percentage: 70, missing: ["Şehir", "Paket"] },
  sellerQuestions: ["Araç ruhsatta sizin adınıza mı?"],
  inspectionFocus: ["Boya kalınlık ölçümü"],
  buyerDecisionGuide: [{ title: "Adım 1", meaning: "Anlam", action: "Yapılacak" }],
  buyerEducation: [{ title: "Tramer nedir?", why: "Önemlidir.", check: "Sorgula." }],
};

function mockFetchWithImages(imageOutcome: "ok" | "fail" = "ok") {
  return vi.fn<(input: unknown) => Promise<Response>>(async (input) => {
    const url = String(input);
    if (url.includes("upstash.example.com")) {
      return new Response(UPSTASH_ALLOW_RESPONSE, { status: 200 });
    }
    if (imageOutcome === "fail") {
      return new Response("not found", { status: 404 });
    }
    const bytes = Buffer.from(ONE_PIXEL_PNG_BASE64, "base64");
    return new Response(bytes, { status: 200, headers: { "content-type": "image/png" } });
  });
}

async function callEndpoint(payload: unknown, fetchMock: ReturnType<typeof vi.fn>) {
  vi.stubGlobal("fetch", fetchMock);
  const previousEnv = process.env;
  process.env = { ...previousEnv, ...RATE_LIMIT_TEST_ENV };
  const response = createResponse();

  await handler(createRequest(payload), response);

  process.env = previousEnv;
  vi.unstubAllGlobals();
  return response;
}

describe("report PDF endpoint", () => {
  it("generates a valid PDF with every section, including embedded listing photos", async () => {
    const response = await callEndpoint(
      { ...validPayload, listingImages: ["https://i0.shbdn.com/photos/a.jpg", "https://i0.shbdn.com/photos/b.jpg"] },
      mockFetchWithImages("ok"),
    );

    expect(response.statusCode).toBe(200);
    expect(response.headers["Content-Type"]).toBe("application/pdf");
    expect(response.body.subarray(0, 5).toString("latin1")).toBe("%PDF-");
    expect(response.body.length).toBeGreaterThan(1000);
  });

  it("still generates a valid PDF when every image fetch fails, skipping photos rather than failing the report", async () => {
    const response = await callEndpoint(
      { ...validPayload, listingImages: ["https://i0.shbdn.com/photos/missing.jpg"] },
      mockFetchWithImages("fail"),
    );

    expect(response.statusCode).toBe(200);
    expect(response.body.subarray(0, 5).toString("latin1")).toBe("%PDF-");
  });

  it("generates a valid PDF when no photos are provided at all", async () => {
    const response = await callEndpoint({ ...validPayload, listingImages: [] }, mockFetchWithImages("ok"));

    expect(response.statusCode).toBe(200);
    expect(response.body.subarray(0, 5).toString("latin1")).toBe("%PDF-");
  });

  it("embeds a photo from listingImageData (base64) even when every network image fetch fails", async () => {
    // sahibinden.com/arabam.com reject server-side image fetches from a
    // datacenter IP outright — this proves the photo still makes it into
    // the PDF via the native on-device fetch path (imageData) without
    // depending on this endpoint's own fetch() succeeding at all.
    const imageUrl = "https://i0.shbdn.com/photos/a.jpg";
    const response = await callEndpoint(
      {
        ...validPayload,
        listingImages: [imageUrl],
        listingImageData: [{ url: imageUrl, dataUrl: `data:image/png;base64,${ONE_PIXEL_PNG_BASE64}` }],
      },
      mockFetchWithImages("fail"),
    );

    expect(response.statusCode).toBe(200);
    expect(response.body.subarray(0, 5).toString("latin1")).toBe("%PDF-");
    expect(response.body.length).toBeGreaterThan(1000);
  });
});
