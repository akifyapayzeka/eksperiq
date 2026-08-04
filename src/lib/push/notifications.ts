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

export async function syncNotifications(reminders: ReminderRecord[]): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    await syncReminderNotifications(reminders);
    return;
  }
  await syncRemindersToPush(reminders);
}

/** Native has no API to revoke a granted OS permission — clears pending notifications instead. */
export async function disableNotifications(reminders: ReminderRecord[]): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    await cancelAllReminderNotifications(reminders.map((reminder) => reminder.id));
    return;
  }
  await unsubscribeFromPush();
}

/** Web push has no client-scheduled per-reminder notification to cancel — the server cron owns that. */
export async function cancelNotificationsForDeletedReminder(reminderId: string): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    await cancelReminderNotifications(reminderId);
  }
}
