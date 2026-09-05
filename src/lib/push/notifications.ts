"use client";

import { Capacitor } from "@capacitor/core";
import type { ReminderRecord } from "@/lib/reminders/types";
import {
  getPushState,
  subscribeToPush,
  syncRemindersToPush,
  unsubscribeFromPush,
  type PushSupportState,
} from "@/lib/push/client";
import {
  cancelAllReminderNotifications,
  cancelReminderNotifications,
  getNativeNotificationPermission,
  requestNativeNotificationPermission,
  syncReminderNotifications,
} from "@/lib/push/native";

export type NotificationState = PushSupportState;

/**
 * Web/PWA keeps using the existing Web Push + server cron system unchanged.
 * Native (Capacitor iOS/Android) has no same-origin push server relationship
 * and instead schedules reminders as on-device local notifications — this
 * module is the single call site the UI uses, so callers never branch on
 * platform themselves.
 */
export async function getNotificationState(): Promise<NotificationState> {
  if (Capacitor.isNativePlatform()) {
    const permission = await getNativeNotificationPermission();
    if (permission === "granted") return "subscribed";
    if (permission === "denied") return "denied";
    return "unsubscribed";
  }
  return getPushState();
}

export async function enableNotifications(reminders: ReminderRecord[]): Promise<{ ok: boolean; error?: string }> {
  if (Capacitor.isNativePlatform()) {
    const granted = await requestNativeNotificationPermission();
    if (!granted) return { ok: false, error: "Bildirim izni verilmedi." };
    await syncReminderNotifications(reminders);
    return { ok: true };
  }
  return subscribeToPush(reminders);
}

/**
 * `synced: false` yalnizca web push tarafinda anlamli: yerel (native)
 * planlama cihazda yapiliyor, sunucuya gonderilecek bir sey yok.
 */
export async function syncNotifications(reminders: ReminderRecord[]): Promise<{ synced: boolean }> {
  if (Capacitor.isNativePlatform()) {
    await syncReminderNotifications(reminders);
    return { synced: true };
  }
  return syncRemindersToPush(reminders);
}

/**
 * Native has no API to revoke a granted OS permission — clears pending
 * notifications instead. `serverDeleted` is always true on native since
 * there is no server-side subscription copy to begin with; on the web it
 * reflects whether the server actually confirmed the deletion (see
 * unsubscribeFromPush) so callers can tell the user honestly rather than
 * assuming success.
 */
export async function disableNotifications(reminders: ReminderRecord[]): Promise<{ serverDeleted: boolean }> {
  if (Capacitor.isNativePlatform()) {
    await cancelAllReminderNotifications(reminders.map((reminder) => reminder.id));
    return { serverDeleted: true };
  }
  return unsubscribeFromPush();
}

/** Web push has no client-scheduled per-reminder notification to cancel — the server cron owns that. */
export async function cancelNotificationsForDeletedReminder(reminderId: string): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    await cancelReminderNotifications(reminderId);
  }
}
