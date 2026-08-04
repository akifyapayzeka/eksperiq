"use client";

import { LocalNotifications } from "@capacitor/local-notifications";
import type { ReminderRecord } from "@/lib/reminders/types";

export const NOTIFICATION_THRESHOLDS_DAYS = [30, 15] as const;
const NOTIFICATION_HOUR_LOCAL = 9;

function hashToInt32(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (Math.imul(31, hash) + value.charCodeAt(index)) | 0;
  }
  // Local notification ids must be a positive 32-bit int; 0 is avoided so a
  // falsy id can never be mistaken for "no id".
  return (hash === 0 ? 1 : Math.abs(hash)) % 2_147_483_647 || 1;
}

export function notificationIdFor(reminderId: string, thresholdDays: number): number {
  return hashToInt32(`${reminderId}:${thresholdDays}`);
}

function idsForReminder(reminderId: string): { id: number }[] {
  return NOTIFICATION_THRESHOLDS_DAYS.map((threshold) => ({ id: notificationIdFor(reminderId, threshold) }));
}

function scheduledDateFor(dueDate: string, thresholdDays: number): Date | null {
  const due = new Date(`${dueDate}T${String(NOTIFICATION_HOUR_LOCAL).padStart(2, "0")}:00:00`);
  if (Number.isNaN(due.getTime())) return null;
  return new Date(due.getTime() - thresholdDays * 24 * 60 * 60 * 1000);
}

function buildBody(reminder: ReminderRecord, thresholdDays: number): string {
  const daysLabel = thresholdDays === 0 ? "bugün" : `${thresholdDays} gün içinde`;
  const amountLabel = typeof reminder.amount === "number" ? ` (${reminder.amount.toLocaleString("tr-TR")} TL)` : "";
  return `${reminder.title} ${daysLabel} son tarihine ulaşıyor${amountLabel}.`;
}

export async function getNativeNotificationPermission(): Promise<"granted" | "denied" | "prompt"> {
  const status = await LocalNotifications.checkPermissions();
  if (status.display === "granted") return "granted";
  if (status.display === "denied") return "denied";
  return "prompt";
}

export async function requestNativeNotificationPermission(): Promise<boolean> {
  const status = await LocalNotifications.requestPermissions();
  return status.display === "granted";
}

export async function cancelReminderNotifications(reminderId: string): Promise<void> {
  await LocalNotifications.cancel({ notifications: idsForReminder(reminderId) });
}

export async function cancelAllReminderNotifications(reminderIds: string[]): Promise<void> {
  const notifications = reminderIds.flatMap((reminderId) => idsForReminder(reminderId));
  if (!notifications.length) return;
  await LocalNotifications.cancel({ notifications });
}

/**
 * Cancels every notification id every given reminder could own, then
 * re-schedules only the ones still in the future — this is the one code
 * path that (re)schedules native reminder notifications, so cancel-then-
 * reschedule on every sync is what guarantees no duplicates ever
 * accumulate, whether called after an add, an edit, or a due-date change.
 * Does nothing if permission hasn't been granted.
 */
export async function syncReminderNotifications(reminders: ReminderRecord[]): Promise<void> {
  const permission = await getNativeNotificationPermission();
  if (permission !== "granted") return;

  const toCancel = reminders.flatMap((reminder) => idsForReminder(reminder.id));
  if (toCancel.length) await LocalNotifications.cancel({ notifications: toCancel });

  const now = Date.now();
  const toSchedule = reminders.flatMap((reminder) =>
    NOTIFICATION_THRESHOLDS_DAYS.flatMap((threshold) => {
      const scheduledAt = scheduledDateFor(reminder.dueDate, threshold);
      if (!scheduledAt || scheduledAt.getTime() <= now) return [];
      return [
        {
          id: notificationIdFor(reminder.id, threshold),
          title: "EksperIQ hatırlatma",
          body: buildBody(reminder, threshold),
          schedule: { at: scheduledAt },
          extra: { url: "/bakim-odeme-takvimi" },
        },
      ];
    }),
  );

  if (toSchedule.length) await LocalNotifications.schedule({ notifications: toSchedule });
}
