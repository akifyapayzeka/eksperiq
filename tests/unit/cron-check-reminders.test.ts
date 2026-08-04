import { Writable } from "node:stream";
import { createRequire } from "node:module";
import { afterEach, describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);

type CronHandler = ((request: { headers: Record<string, string> }, response: MockResponse) => Promise<void>) & {
  daysUntil: (dueDate: string, now: Date) => number | null;
  buildNotificationPayload: (
    reminder: { title: string; amount?: number },
    days: number,
  ) => { title: string; body: string; url: string };
  isAuthorized: (request: { headers: Record<string, string> }) => boolean;
  NOTIFICATION_THRESHOLDS: number[];
  nextThresholdToNotify: (
    reminder: { id: string; dueDate: string },
    days: number,
    notified: Record<string, { dueDate: string; thresholds: number[] }>,
  ) => { threshold: number | undefined; relevantThresholds: number[] };
};

type MockResponse = Writable & {
  statusCode?: number;
  body: string;
  setHeader: (name: string, value: string) => void;
};

const cron = require("../../api/cron/check-reminders.js") as CronHandler;

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

describe("daysUntil", () => {
  const now = new Date("2026-08-01T09:00:00");

  it("computes whole-day differences regardless of time of day", () => {
    expect(cron.daysUntil("2026-08-31", now)).toBe(30);
    expect(cron.daysUntil("2026-08-16", now)).toBe(15);
    expect(cron.daysUntil("2026-08-01", now)).toBe(0);
    expect(cron.daysUntil("2026-07-20", now)).toBe(-12);
  });

  it("returns null for an unparsable date", () => {
    expect(cron.daysUntil("not-a-date", now)).toBeNull();
  });
});

describe("buildNotificationPayload", () => {
  it("includes the amount when present", () => {
    const payload = cron.buildNotificationPayload({ title: "MTV 1. taksit", amount: 4200 }, 30);
    expect(payload.title).toBe("EksperIQ hatırlatma");
    expect(payload.body).toContain("MTV 1. taksit");
    expect(payload.body).toContain("30 gün içinde");
    expect(payload.body).toContain("4.200 TL");
    expect(payload.url).toBe("/bakim-odeme-takvimi");
  });

  it("omits the amount when it is not set", () => {
    const payload = cron.buildNotificationPayload({ title: "Muayene" }, 15);
    expect(payload.body).toBe("Muayene 15 gün içinde son tarihine ulaşıyor.");
  });

  it("says 'bugün' when the due date is today", () => {
    const payload = cron.buildNotificationPayload({ title: "Kasko yenileme" }, 0);
    expect(payload.body).toContain("bugün");
  });
});

describe("notification thresholds", () => {
  it("fires at 30 and 15 days before the due date", () => {
    expect(cron.NOTIFICATION_THRESHOLDS).toEqual([30, 15]);
  });
});

describe("nextThresholdToNotify", () => {
  const reminder = { id: "reminder-1", dueDate: "2027-01-31" };

  it("matches an unnotified threshold for a reminder with no history", () => {
    const result = cron.nextThresholdToNotify(reminder, 30, {});
    expect(result.threshold).toBe(30);
    expect(result.relevantThresholds).toEqual([]);
  });

  it("skips a threshold already notified for the same due date", () => {
    const notified = { "reminder-1": { dueDate: "2027-01-31", thresholds: [30] } };
    const result = cron.nextThresholdToNotify(reminder, 30, notified);
    expect(result.threshold).toBeUndefined();
  });

  it("re-notifies for a recurring reminder whose due date advanced to a new cycle", () => {
    // Last year's cycle already used up both thresholds.
    const notified = { "reminder-1": { dueDate: "2026-01-31", thresholds: [30, 15] } };
    const result = cron.nextThresholdToNotify(reminder, 30, notified);
    expect(result.threshold).toBe(30);
    expect(result.relevantThresholds).toEqual([]);
  });
});

describe("isAuthorized", () => {
  afterEach(() => {
    delete process.env.CRON_SECRET;
  });

  it("fails closed — rejects every request when no secret is configured", () => {
    delete process.env.CRON_SECRET;
    expect(cron.isAuthorized({ headers: {} })).toBe(false);
    expect(cron.isAuthorized({ headers: { authorization: "Bearer anything" } })).toBe(false);
  });

  it("rejects requests with a missing or wrong bearer token when a secret is configured", () => {
    process.env.CRON_SECRET = "topsecret";
    expect(cron.isAuthorized({ headers: {} })).toBe(false);
    expect(cron.isAuthorized({ headers: { authorization: "Bearer wrong" } })).toBe(false);
  });

  it("allows requests with the matching bearer token", () => {
    process.env.CRON_SECRET = "topsecret";
    expect(cron.isAuthorized({ headers: { authorization: "Bearer topsecret" } })).toBe(true);
  });
});

describe("check-reminders handler", () => {
  afterEach(() => {
    delete process.env.CRON_SECRET;
    delete process.env.VAPID_PUBLIC_KEY;
    delete process.env.VAPID_PRIVATE_KEY;
  });

  it("returns 401 when the cron secret does not match", async () => {
    process.env.CRON_SECRET = "topsecret";
    const response = createResponse();
    await cron({ headers: { authorization: "Bearer wrong" } }, response);
    expect(response.statusCode).toBe(401);
  });

  it("skips sending when VAPID keys are not configured", async () => {
    process.env.CRON_SECRET = "topsecret";
    delete process.env.VAPID_PUBLIC_KEY;
    delete process.env.VAPID_PRIVATE_KEY;
    const response = createResponse();
    await cron({ headers: { authorization: "Bearer topsecret" } }, response);
    expect(response.statusCode).toBe(200);
    const payload = JSON.parse(response.body) as { skipped?: boolean };
    expect(payload.skipped).toBe(true);
  });
});
