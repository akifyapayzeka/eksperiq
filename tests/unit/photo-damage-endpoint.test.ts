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
  response.setHeader = (name: string, value: string) => {
    response.headers[name] = value;
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
    expect(response.statusCode).toBe(200);
    expect(payload.analysis.isVehiclePhoto).toBe(false);
    expect(payload.analysis.findings).toEqual([]);
  });
});
