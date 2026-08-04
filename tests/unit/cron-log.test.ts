import { createRequire } from "node:module";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const modulePath = "../../api/_lib/cron-log.js";

function freshCronLog() {
  delete require.cache[require.resolve(modulePath)];
  return require(modulePath) as {
    recordCronRun: (entry: Record<string, unknown>) => Promise<void>;
    getLastCronRun: () => Promise<Record<string, unknown> | null>;
  };
}

const cronLog = freshCronLog();

describe("cron-log (memory fallback)", () => {
  beforeEach(() => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    delete process.env.UPSTASH_REDIS_REST_KV_REST_API_URL;
    delete process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN;
  });

  afterEach(() => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  it("records and retrieves the last run, stamped with a recordedAt timestamp", async () => {
    await cronLog.recordCronRun({ success: true, checked: 3, sent: 2, removed: 0, subscriptions: 1 });

    const last = await cronLog.getLastCronRun();
    expect(last).toMatchObject({ success: true, checked: 3, sent: 2, removed: 0, subscriptions: 1 });
    expect(typeof last?.recordedAt).toBe("string");
  });

  it("overwrites the previous run with the latest one", async () => {
    await cronLog.recordCronRun({ success: true, checked: 1, sent: 1, removed: 0, subscriptions: 1 });
    await cronLog.recordCronRun({ success: false, error: "Bildirim kayıtları okunamadı." });

    const last = await cronLog.getLastCronRun();
    expect(last).toMatchObject({ success: false, error: "Bildirim kayıtları okunamadı." });
  });

  it("returns null when nothing has been recorded yet", async () => {
    const fresh = freshCronLog();
    expect(await fresh.getLastCronRun()).toBeNull();
  });
});
