import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReminderRecord } from "@/lib/reminders/types";

const isNativePlatform = vi.fn(() => false);
vi.mock("@capacitor/core", () => ({
  Capacitor: { isNativePlatform: () => isNativePlatform() },
}));

const getPushState = vi.fn();
const subscribeToPush = vi.fn();
const syncRemindersToPush = vi.fn();
const unsubscribeFromPush = vi.fn();
vi.mock("@/lib/push/client", () => ({
  getPushState: () => getPushState(),
  subscribeToPush: (reminders: unknown) => subscribeToPush(reminders),
  syncRemindersToPush: (reminders: unknown) => syncRemindersToPush(reminders),
  unsubscribeFromPush: () => unsubscribeFromPush(),
}));

const getNativeNotificationPermission = vi.fn();
const requestNativeNotificationPermission = vi.fn();
const syncReminderNotifications = vi.fn();
const cancelReminderNotifications = vi.fn();
const cancelAllReminderNotifications = vi.fn();
vi.mock("@/lib/push/native", () => ({
  getNativeNotificationPermission: () => getNativeNotificationPermission(),
  requestNativeNotificationPermission: () => requestNativeNotificationPermission(),
  syncReminderNotifications: (reminders: unknown) => syncReminderNotifications(reminders),
  cancelReminderNotifications: (id: string) => cancelReminderNotifications(id),
  cancelAllReminderNotifications: (ids: string[]) => cancelAllReminderNotifications(ids),
}));

function reminder(id: string): ReminderRecord {
  return {
    id,
    category: "muayene",
    title: "Muayene",
    dueDate: "2026-09-01",
    recurrence: "none",
    history: [],
    createdAt: "2026-08-01T00:00:00.000Z",
  };
}

describe("push/notifications facade", () => {
  beforeEach(() => {
    isNativePlatform.mockReturnValue(false);
    for (const mock of [
      getPushState,
      subscribeToPush,
      syncRemindersToPush,
      unsubscribeFromPush,
      getNativeNotificationPermission,
      requestNativeNotificationPermission,
      syncReminderNotifications,
      cancelReminderNotifications,
      cancelAllReminderNotifications,
    ]) {
      mock.mockReset();
    }
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("getNotificationState delegates to web push on the web", async () => {
    getPushState.mockResolvedValue("subscribed");
    const { getNotificationState } = await import("@/lib/push/notifications");

    expect(await getNotificationState()).toBe("subscribed");
    expect(getPushState).toHaveBeenCalled();
    expect(getNativeNotificationPermission).not.toHaveBeenCalled();
  });

  it("getNotificationState maps native permission states instead of calling web push", async () => {
    isNativePlatform.mockReturnValue(true);
    getNativeNotificationPermission.mockResolvedValue("granted");
    const { getNotificationState } = await import("@/lib/push/notifications");

    expect(await getNotificationState()).toBe("subscribed");
    expect(getPushState).not.toHaveBeenCalled();

    getNativeNotificationPermission.mockResolvedValue("denied");
    vi.resetModules();
    const reloaded = await import("@/lib/push/notifications");
    expect(await reloaded.getNotificationState()).toBe("denied");
  });

  it("enableNotifications requests native permission and syncs, without touching web push", async () => {
    isNativePlatform.mockReturnValue(true);
    requestNativeNotificationPermission.mockResolvedValue(true);
    const { enableNotifications } = await import("@/lib/push/notifications");

    const result = await enableNotifications([reminder("r1")]);

    expect(result).toEqual({ ok: true });
    expect(syncReminderNotifications).toHaveBeenCalledWith([reminder("r1")]);
    expect(subscribeToPush).not.toHaveBeenCalled();
  });

  it("enableNotifications reports failure when native permission is refused", async () => {
    isNativePlatform.mockReturnValue(true);
    requestNativeNotificationPermission.mockResolvedValue(false);
    const { enableNotifications } = await import("@/lib/push/notifications");

    const result = await enableNotifications([reminder("r1")]);

    expect(result).toEqual({ ok: false, error: "Bildirim izni verilmedi." });
    expect(syncReminderNotifications).not.toHaveBeenCalled();
  });

  it("enableNotifications delegates to Web Push subscription on the web", async () => {
    subscribeToPush.mockResolvedValue({ ok: true });
    const { enableNotifications } = await import("@/lib/push/notifications");

    await enableNotifications([reminder("r1")]);

    expect(subscribeToPush).toHaveBeenCalledWith([reminder("r1")]);
    expect(requestNativeNotificationPermission).not.toHaveBeenCalled();
  });

  it("disableNotifications cancels all native notifications instead of calling unsubscribeFromPush", async () => {
    isNativePlatform.mockReturnValue(true);
    const { disableNotifications } = await import("@/lib/push/notifications");

    await disableNotifications([reminder("r1"), reminder("r2")]);

    expect(cancelAllReminderNotifications).toHaveBeenCalledWith(["r1", "r2"]);
    expect(unsubscribeFromPush).not.toHaveBeenCalled();
  });

  it("disableNotifications calls unsubscribeFromPush on the web", async () => {
    const { disableNotifications } = await import("@/lib/push/notifications");

    await disableNotifications([reminder("r1")]);

    expect(unsubscribeFromPush).toHaveBeenCalled();
    expect(cancelAllReminderNotifications).not.toHaveBeenCalled();
  });

  it("cancelNotificationsForDeletedReminder cancels the native notification but is a no-op on web", async () => {
    const { cancelNotificationsForDeletedReminder } = await import("@/lib/push/notifications");
    await cancelNotificationsForDeletedReminder("r1");
    expect(cancelReminderNotifications).not.toHaveBeenCalled();

    isNativePlatform.mockReturnValue(true);
    vi.resetModules();
    const reloaded = await import("@/lib/push/notifications");
    await reloaded.cancelNotificationsForDeletedReminder("r1");
    expect(cancelReminderNotifications).toHaveBeenCalledWith("r1");
  });
});
