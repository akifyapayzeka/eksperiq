import { Readable } from "node:stream";
import type { IncomingMessage, ServerResponse } from "node:http";
import { describe, expect, it } from "vitest";
import handler from "../../api/ai/analysis-note";

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
});
