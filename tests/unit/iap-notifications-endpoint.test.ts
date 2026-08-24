import { createRequire } from "node:module";
import { Readable, Writable } from "node:stream";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);

type MockResponse = Writable & {
  statusCode?: number;
  body: string;
  setHeader: (name: string, value: string) => void;
};

type EndpointHandler = (request: Readable & { method?: string }, response: MockResponse) => Promise<void>;

const notificationsModule = require("../../api/iap/notifications.js") as EndpointHandler & {
  buildEntitlementRecord: (
    notification: Record<string, unknown>,
    transactionInfo: Record<string, unknown>,
    renewalInfo: Record<string, unknown> | null,
  ) => Record<string, unknown>;
};
const notificationsHandler = notificationsModule;

function createRequest(body: unknown, method = "POST") {
  const request = Readable.from([typeof body === "string" ? body : JSON.stringify(body)]) as Readable & {
    method?: string;
  };
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

/**
 * This endpoint can only genuinely succeed against a real App Store Server
 * Notification, signed by Apple's private key over an x5c chain rooted at
 * Apple's real production root — nothing this environment can fabricate
 * (see tests/unit/apple-jws.test.ts for why, and what *can* be proven about
 * the underlying JWS verification). These tests cover the fail-closed and
 * rejection paths only.
 */
describe("iap notifications endpoint", () => {
  const originalFlag = process.env.APPLE_APP_STORE_NOTIFICATIONS_ENABLED;

  beforeEach(() => {
    delete process.env.APPLE_APP_STORE_NOTIFICATIONS_ENABLED;
  });

  afterEach(() => {
    if (originalFlag === undefined) delete process.env.APPLE_APP_STORE_NOTIFICATIONS_ENABLED;
    else process.env.APPLE_APP_STORE_NOTIFICATIONS_ENABLED = originalFlag;
  });

  it("fails closed (503) when the feature flag is not set", async () => {
    const response = createResponse();
    await notificationsHandler(createRequest({ signedPayload: "whatever" }), response);
    expect(response.statusCode).toBe(503);
  });

  it("fails closed (503) even with a body, when the flag is explicitly false", async () => {
    process.env.APPLE_APP_STORE_NOTIFICATIONS_ENABLED = "false";
    const response = createResponse();
    await notificationsHandler(createRequest({ signedPayload: "whatever" }), response);
    expect(response.statusCode).toBe(503);
  });

  it("rejects non-POST methods", async () => {
    process.env.APPLE_APP_STORE_NOTIFICATIONS_ENABLED = "true";
    const response = createResponse();
    await notificationsHandler(createRequest({}, "GET"), response);
    expect(response.statusCode).toBe(405);
  });

  it("rejects invalid JSON", async () => {
    process.env.APPLE_APP_STORE_NOTIFICATIONS_ENABLED = "true";
    const response = createResponse();
    await notificationsHandler(createRequest("not json"), response);
    expect(response.statusCode).toBe(400);
  });

  it("rejects a body with no signedPayload", async () => {
    process.env.APPLE_APP_STORE_NOTIFICATIONS_ENABLED = "true";
    const response = createResponse();
    await notificationsHandler(createRequest({}), response);
    expect(response.statusCode).toBe(400);
  });

  it("rejects a signedPayload that isn't a real Apple-signed JWS, without leaking why", async () => {
    process.env.APPLE_APP_STORE_NOTIFICATIONS_ENABLED = "true";
    const response = createResponse();
    await notificationsHandler(createRequest({ signedPayload: "not.a.jws" }), response);
    expect(response.statusCode).toBe(401);
    const parsed = JSON.parse(response.body) as { error: string };
    expect(parsed.error).toBe("Could not verify signedPayload.");
  });
});

/**
 * buildEntitlementRecord is the pure "what do we store" transform, extracted
 * specifically so this behavior (environment tagging, refund/expire/renew
 * state derivation) can be verified without a real or synthetic Apple
 * signature — the handler-level tests above can only cover the fail-closed
 * paths for that reason.
 */
describe("notifications buildEntitlementRecord", () => {
  const { buildEntitlementRecord } = notificationsModule;

  it("tags a Production notification's environment from the outer envelope", () => {
    const record = buildEntitlementRecord(
      { data: { environment: "Production" }, notificationType: "DID_RENEW", notificationUUID: "uuid-1" },
      { productId: "com.eksperiq.app.pro.monthly", originalTransactionId: "1", expiresDate: Date.now() + 100_000 },
      null,
    );
    expect(record.environment).toBe("Production");
    expect(record.state).toBe("pro");
    expect(record.notificationUUID).toBe("uuid-1");
  });

  it("tags a Sandbox notification's environment without rejecting it (Apple sends both to the same webhook)", () => {
    const record = buildEntitlementRecord(
      { data: { environment: "Sandbox" }, notificationType: "SUBSCRIBED" },
      { productId: "com.eksperiq.app.pro.monthly", originalTransactionId: "1", expiresDate: Date.now() + 100_000 },
      null,
    );
    expect(record.environment).toBe("Sandbox");
  });

  it("marks a refunded/revoked transaction as revoked even while still within its paid period", () => {
    const record = buildEntitlementRecord(
      { data: { environment: "Production" }, notificationType: "REFUND" },
      {
        productId: "com.eksperiq.app.pro.monthly",
        originalTransactionId: "1",
        expiresDate: Date.now() + 100_000,
        revocationDate: Date.now(),
      },
      null,
    );
    expect(record.state).toBe("revoked");
  });

  it("resolves gracePeriod from renewalInfo once the transaction itself has expired", () => {
    const record = buildEntitlementRecord(
      { data: { environment: "Production" }, notificationType: "DID_FAIL_TO_RENEW", subtype: "GRACE_PERIOD" },
      { productId: "com.eksperiq.app.pro.monthly", originalTransactionId: "1", expiresDate: Date.now() - 1_000 },
      { gracePeriodExpiresDate: Date.now() + 100_000 },
    );
    expect(record.state).toBe("gracePeriod");
  });

  it("resolves expired when there is no renewal grace/retry window left", () => {
    const record = buildEntitlementRecord(
      { data: { environment: "Production" }, notificationType: "EXPIRED" },
      { productId: "com.eksperiq.app.pro.monthly", originalTransactionId: "1", expiresDate: Date.now() - 1_000 },
      { autoRenewStatus: 0 },
    );
    expect(record.state).toBe("expired");
  });

  it("produces the identical record for the same signed payload processed twice (idempotent overwrite)", () => {
    const notification = { data: { environment: "Production" }, notificationType: "DID_RENEW", notificationUUID: "u" };
    const transactionInfo = {
      productId: "com.eksperiq.app.pro.monthly",
      originalTransactionId: "1",
      expiresDate: 1_700_000_000_000,
    };
    const first = buildEntitlementRecord(notification, transactionInfo, null);
    const second = buildEntitlementRecord(notification, transactionInfo, null);
    expect({ ...first, updatedAt: null }).toEqual({ ...second, updatedAt: null });
  });
});
