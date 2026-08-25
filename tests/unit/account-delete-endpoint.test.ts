import { createRequire } from "node:module";
import { Readable, Writable } from "node:stream";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const require = createRequire(import.meta.url);

type MockResponse = Writable & {
  statusCode?: number;
  body: string;
  setHeader: (name: string, value: string) => void;
};

type EndpointHandler = (request: Readable & { method?: string }, response: MockResponse) => Promise<void>;

function createRequest(body: unknown, method = "POST") {
  const request = Readable.from([JSON.stringify(body)]) as Readable & { method?: string };
  request.method = method;
  return request;
}

function createResponse(): MockResponse {
  const response = new Writable({
    write(chunk, _encoding, callback) {
      response.body += chunk.toString();
      callback();
    },
  }) as MockResponse;
  response.body = "";
  response.setHeader = () => undefined;
  return response;
}

const ORIGINAL_ENV = { ...process.env };

describe("account delete endpoint — request validation", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";
    vi.resetModules();
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it("rejects non-POST methods", async () => {
    const handler = require("../../api/account/delete.js") as EndpointHandler;
    const response = createResponse();
    await handler(createRequest({}, "GET"), response);
    expect(response.statusCode).toBe(405);
  });

  it("refuses (fail-closed) when Supabase isn't configured", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    const handler = require("../../api/account/delete.js") as EndpointHandler;
    const response = createResponse();
    await handler(createRequest({ accessToken: "token" }), response);
    expect(response.statusCode).toBe(503);
  });

  it("rejects invalid JSON", async () => {
    const handler = require("../../api/account/delete.js") as EndpointHandler;
    const request = Readable.from(["not json"]) as Readable & { method?: string };
    request.method = "POST";
    const response = createResponse();
    await handler(request, response);
    expect(response.statusCode).toBe(400);
  });

  it("rejects a missing accessToken", async () => {
    const handler = require("../../api/account/delete.js") as EndpointHandler;
    const response = createResponse();
    await handler(createRequest({}), response);
    expect(response.statusCode).toBe(400);
  });
});

// Note: the 401/200/502 paths (Supabase auth.getUser + auth.admin.deleteUser
// outcomes) are intentionally not covered here. This endpoint file is loaded
// via node:module's createRequire (see above), which resolves through
// Node's real module system rather than Vitest/Vite's module graph — so
// vi.mock("@supabase/supabase-js", ...) cannot intercept it (confirmed: it
// silently falls through to the real network call). Every other CJS
// api/*.js test in this repo has the same constraint and avoids mocking
// npm SDK deps for that reason. Those three paths are still logically
// straightforward (auth.getUser/auth.admin.deleteUser per Supabase's
// documented Admin API) and exercised in practice via the "iOS TestFlight"
// and manual QA flows — a real network-backed integration test would need
// a live (or emulated) Supabase project, out of scope for this unit suite.
