import { createRequire } from "node:module";
import { beforeEach, describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);

delete process.env.UPSTASH_REDIS_REST_URL;
delete process.env.UPSTASH_REDIS_REST_TOKEN;

const pushStore = require("../../api/_lib/push-store.js") as {
  saveSubscription: (input: {
    endpoint: string;
    subscription: unknown;
    reminders: Array<{ id: string; dueDate: string }>;
  }) => Promise<{ hash: string; store: string }>;
  getSubscriptionByHash: (hash: string) => Promise<unknown>;
  updateNotified: (hash: string, notified: unknown) => Promise<void>;
  removeSubscriptionByHash: (hash: string) => Promise<void>;
  removeSubscriptionByEndpoint: (endpoint: string) => Promise<void>;
  listSubscriptions: () => Promise<Array<{ hash: string }>>;
  hashEndpoint: (endpoint: string) => string;
};

function uniqueEndpoint(label: string): string {
  return `https://push.example.com/${label}-${Math.random().toString(36).slice(2, 10)}`;
}

describe("push-store (memory fallback)", () => {
  it("saves and retrieves a subscription by hash", async () => {
    const endpoint = uniqueEndpoint("save");
    const { hash, store } = await pushStore.saveSubscription({
      endpoint,
      subscription: { endpoint, keys: { p256dh: "p", auth: "a" } },
      reminders: [{ id: "r1", dueDate: "2026-09-01" }],
    });

    expect(store).toBe("memory");
    const record = (await pushStore.getSubscriptionByHash(hash)) as { reminders: unknown[] } | null;
    expect(record?.reminders).toEqual([{ id: "r1", dueDate: "2026-09-01" }]);
  });

  it("keeps a notified threshold marker when the reminder's due date is unchanged", async () => {
    const endpoint = uniqueEndpoint("keep-notified");
    const reminders = [{ id: "r1", dueDate: "2026-09-01" }];
    const { hash } = await pushStore.saveSubscription({
      endpoint,
      subscription: { endpoint, keys: { p256dh: "p", auth: "a" } },
      reminders,
    });

    await pushStore.updateNotified(hash, { r1: { dueDate: "2026-09-01", thresholds: [30] } });
    await pushStore.saveSubscription({
      endpoint,
      subscription: { endpoint, keys: { p256dh: "p", auth: "a" } },
      reminders,
    });

    const record = (await pushStore.getSubscriptionByHash(hash)) as {
      notified: Record<string, { thresholds: number[] }>;
    };
    expect(record.notified.r1.thresholds).toEqual([30]);
  });

  it("drops the notified marker once the reminder's due date changes", async () => {
    const endpoint = uniqueEndpoint("reset-notified");
    const { hash } = await pushStore.saveSubscription({
      endpoint,
      subscription: { endpoint, keys: { p256dh: "p", auth: "a" } },
      reminders: [{ id: "r1", dueDate: "2026-09-01" }],
    });
    await pushStore.updateNotified(hash, { r1: { dueDate: "2026-09-01", thresholds: [30] } });

    await pushStore.saveSubscription({
      endpoint,
      subscription: { endpoint, keys: { p256dh: "p", auth: "a" } },
      reminders: [{ id: "r1", dueDate: "2026-10-15" }],
    });

    const record = (await pushStore.getSubscriptionByHash(hash)) as { notified: Record<string, unknown> };
    expect(record.notified.r1).toBeUndefined();
  });

  it("drops the notified marker once the reminder is removed entirely", async () => {
    const endpoint = uniqueEndpoint("drop-removed");
    const { hash } = await pushStore.saveSubscription({
      endpoint,
      subscription: { endpoint, keys: { p256dh: "p", auth: "a" } },
      reminders: [{ id: "r1", dueDate: "2026-09-01" }],
    });
    await pushStore.updateNotified(hash, { r1: { dueDate: "2026-09-01", thresholds: [30] } });

    await pushStore.saveSubscription({
      endpoint,
      subscription: { endpoint, keys: { p256dh: "p", auth: "a" } },
      reminders: [],
    });

    const record = (await pushStore.getSubscriptionByHash(hash)) as { notified: Record<string, unknown> };
    expect(record.notified).toEqual({});
  });

  it("removes a subscription so it no longer appears in listings", async () => {
    const endpoint = uniqueEndpoint("remove");
    await pushStore.saveSubscription({
      endpoint,
      subscription: { endpoint, keys: { p256dh: "p", auth: "a" } },
      reminders: [],
    });

    await pushStore.removeSubscriptionByEndpoint(endpoint);

    const hash = pushStore.hashEndpoint(endpoint);
    expect(await pushStore.getSubscriptionByHash(hash)).toBeNull();
    const all = await pushStore.listSubscriptions();
    expect(all.some((record) => record.hash === hash)).toBe(false);
  });
});

describe("push-store beforeEach guard", () => {
  beforeEach(() => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  it("has no Upstash config so it always exercises the memory path", () => {
    expect(pushStore.hashEndpoint("https://example.com/a")).toHaveLength(32);
  });
});
