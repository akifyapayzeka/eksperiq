import { createRequire } from "node:module";
import { Readable, Writable } from "node:stream";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);

type MockResponse = Writable & {
  statusCode?: number;
  body: string;
  setHeader: (name: string, value: string) => void;
};

type EndpointHandler = (
  request: Readable & { method?: string; headers?: Record<string, string> },
  response: MockResponse,
) => Promise<void>;

const entitlementHandler = require("../../api/iap/entitlement.js") as EndpointHandler;

function createRequest(body: unknown, method = "POST", headers: Record<string, string> = {}) {
  const request = Readable.from([typeof body === "string" ? body : JSON.stringify(body)]) as Readable & {
    method?: string;
    headers?: Record<string, string>;
  };
  request.method = method;
  request.headers = headers;
  return request;
}

function createResponse(): MockResponse {
  const headers: Record<string, string> = {};
  const response = new Writable({
    write(chunk, _encoding, callback) {
      response.body += chunk.toString();
      callback();
    },
  }) as MockResponse;
  response.body = "";
  response.setHeader = (name: string, value: string) => {
    headers[name] = value;
  };
  (response as unknown as { headers: Record<string, string> }).headers = headers;
  return response;
}

/**
 * Like tests/unit/iap-notifications-endpoint.test.ts, this can only ever
 * genuinely succeed against a real Apple-signed transaction JWS, which does
 * not exist without a real App Store Connect sandbox purchase. These tests
 * cover the fail-closed, CORS, and rejection paths.
 */
describe("iap entitlement endpoint", () => {
  const originalEnabled = process.env.APPLE_IAP_ENTITLEMENT_ENABLED;
  const originalSecret = process.env.STOREKIT_ENTITLEMENT_TOKEN_SECRET;

  beforeEach(() => {
    delete process.env.APPLE_IAP_ENTITLEMENT_ENABLED;
    delete process.env.STOREKIT_ENTITLEMENT_TOKEN_SECRET;
  });

  afterEach(() => {
    if (originalEnabled === undefined) delete process.env.APPLE_IAP_ENTITLEMENT_ENABLED;
    else process.env.APPLE_IAP_ENTITLEMENT_ENABLED = originalEnabled;
    if (originalSecret === undefined) delete process.env.STOREKIT_ENTITLEMENT_TOKEN_SECRET;
    else process.env.STOREKIT_ENTITLEMENT_TOKEN_SECRET = originalSecret;
  });

  it("fails closed (503) with neither the flag nor a secret configured", async () => {
    const response = createResponse();
    await entitlementHandler(createRequest({ signedTransactionInfo: "whatever" }), response);
    expect(response.statusCode).toBe(503);
  });

  it("fails closed (503) when the flag is on but no signing secret is configured", async () => {
    process.env.APPLE_IAP_ENTITLEMENT_ENABLED = "true";
    const response = createResponse();
    await entitlementHandler(createRequest({ signedTransactionInfo: "whatever" }), response);
    expect(response.statusCode).toBe(503);
  });

  it("fails closed (503) when a secret exists but the flag is off", async () => {
    process.env.STOREKIT_ENTITLEMENT_TOKEN_SECRET = "test-secret";
    const response = createResponse();
    await entitlementHandler(createRequest({ signedTransactionInfo: "whatever" }), response);
    expect(response.statusCode).toBe(503);
  });

  it("handles an OPTIONS preflight from the native app origin without requiring configuration", async () => {
    const response = createResponse();
    await entitlementHandler(createRequest(null, "OPTIONS", { origin: "capacitor://localhost" }), response);
    expect(response.statusCode).toBe(204);
  });

  it("rejects non-POST methods once configured", async () => {
    process.env.APPLE_IAP_ENTITLEMENT_ENABLED = "true";
    process.env.STOREKIT_ENTITLEMENT_TOKEN_SECRET = "test-secret";
    const response = createResponse();
    await entitlementHandler(createRequest({}, "GET"), response);
    expect(response.statusCode).toBe(405);
  });

  it("rejects invalid JSON", async () => {
    process.env.APPLE_IAP_ENTITLEMENT_ENABLED = "true";
    process.env.STOREKIT_ENTITLEMENT_TOKEN_SECRET = "test-secret";
    const response = createResponse();
    await entitlementHandler(createRequest("not json"), response);
    expect(response.statusCode).toBe(400);
  });

  it("rejects a body with no signedTransactionInfo", async () => {
    process.env.APPLE_IAP_ENTITLEMENT_ENABLED = "true";
    process.env.STOREKIT_ENTITLEMENT_TOKEN_SECRET = "test-secret";
    const response = createResponse();
    await entitlementHandler(createRequest({}), response);
    expect(response.statusCode).toBe(400);
  });

  it("rejects a signedTransactionInfo that isn't a real Apple-signed JWS, without leaking why", async () => {
    process.env.APPLE_IAP_ENTITLEMENT_ENABLED = "true";
    process.env.STOREKIT_ENTITLEMENT_TOKEN_SECRET = "test-secret";
    const response = createResponse();
    await entitlementHandler(createRequest({ signedTransactionInfo: "not.a.jws" }), response);
    expect(response.statusCode).toBe(401);
    const parsed = JSON.parse(response.body) as { error: string };
    expect(parsed.error).toBe("Could not verify signedTransactionInfo.");
  });
});
