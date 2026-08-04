import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReminderRecord } from "@/lib/reminders/types";

const checkPermissions = vi.fn();
const requestPermissions = vi.fn();
const cancel = vi.fn();
const schedule = vi.fn();

vi.mock("@capacitor/local-notifications", () => ({
  LocalNotifications: {
    checkPermissions: () => checkPermissions(),
    requestPermissions: () => requestPermissions(),
    cancel: (options: unknown) => cancel(options),
    schedule: (options: unknown) => schedule(options),
  },
}));

function reminder(overrides: Partial<ReminderRecord> = {}): ReminderRecord {
  return {
    id: "r1",
    category: "muayene",
    title: "Muayene",
    dueDate: "2026-09-01",
    recurrence: "none",
    history: [],
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("push/native", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-01T00:00:00Z"));
    checkPermissions.mockReset();
    requestPermissions.mockReset();
    cancel.mockReset();
    schedule.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetModules();
  });

  it("notificationIdFor is deterministic and differs by threshold", async () => {
    const { notificationIdFor } = await import("@/lib/push/native");
    const id30a = notificationIdFor("reminder-abc", 30);
    const id30b = notificationIdFor("reminder-abc", 30);
    const id15 = notificationIdFor("reminder-abc", 15);

    expect(id30a).toBe(id30b);
    expect(id30a).not.toBe(id15);
    expect(Number.isInteger(id30a)).toBe(true);
    expect(id30a).toBeGreaterThan(0);
    expect(id30a).toBeLessThanOrEqual(2_147_483_647);
  });

  it("maps checkPermissions display states to granted/denied/prompt", async () => {
    const { getNativeNotificationPermission } = await import("@/lib/push/native");

    checkPermissions.mockResolvedValueOnce({ display: "granted" });
    expect(await getNativeNotificationPermission()).toBe("granted");

    checkPermissions.mockResolvedValueOnce({ display: "denied" });
    expect(await getNativeNotificationPermission()).toBe("denied");

    checkPermissions.mockResolvedValueOnce({ display: "prompt" });
    expect(await getNativeNotificationPermission()).toBe("prompt");
  });

  it("requestNativeNotificationPermission resolves true only when granted", async () => {
    const { requestNativeNotificationPermission } = await import("@/lib/push/native");

    requestPermissions.mockResolvedValueOnce({ display: "granted" });
    expect(await requestNativeNotificationPermission()).toBe(true);

    requestPermissions.mockResolvedValueOnce({ display: "denied" });
    expect(await requestNativeNotificationPermission()).toBe(false);
  });

  it("cancelReminderNotifications cancels both threshold ids for that reminder", async () => {
    const { cancelReminderNotifications, notificationIdFor } = await import("@/lib/push/native");

    await cancelReminderNotifications("reminder-abc");

    expect(cancel).toHaveBeenCalledWith({
      notifications: [{ id: notificationIdFor("reminder-abc", 30) }, { id: notificationIdFor("reminder-abc", 15) }],
    });
  });

  it("cancelAllReminderNotifications does nothing for an empty list", async () => {
    const { cancelAllReminderNotifications } = await import("@/lib/push/native");
    await cancelAllReminderNotifications([]);
    expect(cancel).not.toHaveBeenCalled();
  });

  it("syncReminderNotifications does nothing without granted permission", async () => {
    checkPermissions.mockResolvedValue({ display: "prompt" });
    const { syncReminderNotifications } = await import("@/lib/push/native");

    await syncReminderNotifications([reminder()]);

    expect(cancel).not.toHaveBeenCalled();
    expect(schedule).not.toHaveBeenCalled();
  });

  it("cancels existing ids and schedules only future thresholds, skipping ones already in the past", async () => {
    checkPermissions.mockResolvedValue({ display: "granted" });
    const { syncReminderNotifications, notificationIdFor } = await import("@/lib/push/native");

    // "now" is 2026-08-01. dueDate is 2026-08-10: the 30-day-before mark (2026-07-11)
    // is already in the past, only the 15-day mark (2026-07-26) is also past... let's
    // pick a dueDate far enough out that only the 30-day threshold is still future.
    await syncReminderNotifications([reminder({ dueDate: "2026-08-20" })]);

    expect(cancel).toHaveBeenCalledWith({
      notifications: [{ id: notificationIdFor("r1", 30) }, { id: notificationIdFor("r1", 15) }],
    });

    const scheduledCall = schedule.mock.calls[0]?.[0] as {
      notifications: Array<{ id: number; schedule: { at: Date } }>;
    };
    // 2026-08-20 minus 30 days = 2026-07-21 (past "now" of 2026-08-01)... still past.
    // minus 15 days = 2026-08-05 (future) — only this one should be scheduled.
    expect(scheduledCall.notifications).toHaveLength(1);
    expect(scheduledCall.notifications[0].id).toBe(notificationIdFor("r1", 15));
  });

  it("schedules nothing when every threshold for every reminder is already in the past", async () => {
    checkPermissions.mockResolvedValue({ display: "granted" });
    const { syncReminderNotifications } = await import("@/lib/push/native");

    await syncReminderNotifications([reminder({ dueDate: "2026-08-02" })]);

    expect(schedule).not.toHaveBeenCalled();
  });

  it("builds a title/body that mirrors the web push cron wording, including the TL amount", async () => {
    checkPermissions.mockResolvedValue({ display: "granted" });
    const { syncReminderNotifications } = await import("@/lib/push/native");

    await syncReminderNotifications([reminder({ dueDate: "2026-08-20", amount: 1500, title: "Kasko" })]);

    const scheduledCall = schedule.mock.calls[0]?.[0] as {
      notifications: Array<{ title: string; body: string; extra: { url: string } }>;
    };
    const [notification] = scheduledCall.notifications;
    expect(notification.title).toBe("EksperIQ hatırlatma");
    expect(notification.body).toBe("Kasko 15 gün içinde son tarihine ulaşıyor (1.500 TL).");
    expect(notification.extra.url).toBe("/bakim-odeme-takvimi");
  });
});
