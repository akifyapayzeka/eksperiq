import { Readable, Writable } from "node:stream";
import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);

delete process.env.UPSTASH_REDIS_REST_URL;
delete process.env.UPSTASH_REDIS_REST_TOKEN;

type MockResponse = Writable & {
  statusCode?: number;
  body: string;
  setHeader: (name: string, value: string) => void;
};

type EndpointHandler = (request: Readable & { method?: string }, response: MockResponse) => Promise<void>;

const subscribeHandler = require("../../api/push/subscribe.js") as EndpointHandler;
const unsubscribeHandler = require("../../api/push/unsubscribe.js") as EndpointHandler;
const pushStore = require("../../api/_lib/push-store.js") as {
  getSubscriptionByHash: (hash: string) => Promise<unknown>;
  hashEndpoint: (endpoint: string) => string;
};

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

function uniqueEndpoint(label: string): string {
  return `https://push.example.com/${label}-${Math.random().toString(36).slice(2, 10)}`;
}

const validSubscription = (endpoint: string) => ({
  endpoint,
  keys: { p256dh: "a-valid-looking-p256dh-key", auth: "a-valid-auth-secret" },
});

describe("push subscribe endpoint", () => {
  it("rejects non-POST methods", async () => {
    const response = createResponse();
    await subscribeHandler(createRequest({}, "GET"), response);
    expect(response.statusCode).toBe(405);
  });

  it("rejects invalid JSON", async () => {
    const request = Readable.from(["not json"]) as Readable & { method?: string };
    request.method = "POST";
    const response = createResponse();
    await subscribeHandler(request, response);
    expect(response.statusCode).toBe(400);
  });

  it("rejects a payload with an invalid subscription", async () => {
    const response = createResponse();
    await subscribeHandler(createRequest({ subscription: { endpoint: "" }, reminders: [] }), response);
    expect(response.statusCode).toBe(400);
  });

  it("rejects a reminder with a malformed due date", async () => {
    const endpoint = uniqueEndpoint("bad-date");
    const response = createResponse();
    await subscribeHandler(
      createRequest({
        subscription: validSubscription(endpoint),
        reminders: [{ id: "r1", title: "MTV", dueDate: "01-09-2026", category: "mtv" }],
      }),
      response,
    );
    expect(response.statusCode).toBe(400);
  });

  it("accepts a valid subscription and reminders and persists them", async () => {
    const endpoint = uniqueEndpoint("valid");
    const response = createResponse();
    await subscribeHandler(
      createRequest({
        subscription: validSubscription(endpoint),
        reminders: [{ id: "r1", title: "MTV 1. taksit", dueDate: "2026-09-01", category: "mtv", amount: 4200 }],
      }),
      response,
    );

    expect(response.statusCode).toBe(200);
    const hash = pushStore.hashEndpoint(endpoint);
    const stored = (await pushStore.getSubscriptionByHash(hash)) as { reminders: unknown[] };
    expect(stored.reminders).toEqual([
      { id: "r1", title: "MTV 1. taksit", dueDate: "2026-09-01", category: "mtv", amount: 4200 },
    ]);
  });
});

describe("push unsubscribe endpoint", () => {
  it("rejects non-POST methods", async () => {
    const response = createResponse();
    await unsubscribeHandler(createRequest({}, "GET"), response);
    expect(response.statusCode).toBe(405);
  });

  it("rejects a missing endpoint", async () => {
    const response = createResponse();
    await unsubscribeHandler(createRequest({}), response);
    expect(response.statusCode).toBe(400);
  });

  it("removes a previously stored subscription", async () => {
    const endpoint = uniqueEndpoint("to-remove");
    await subscribeHandler(
      createRequest({ subscription: validSubscription(endpoint), reminders: [] }),
      createResponse(),
    );

    const response = createResponse();
    await unsubscribeHandler(createRequest({ endpoint }), response);
    expect(response.statusCode).toBe(200);

    const hash = pushStore.hashEndpoint(endpoint);
    expect(await pushStore.getSubscriptionByHash(hash)).toBeNull();
  });
});
