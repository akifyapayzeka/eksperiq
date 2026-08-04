"use client";

import type { ReminderRecord } from "@/lib/reminders/types";
import { apiFetch } from "@/lib/api/client";
import { urlBase64ToUint8Array } from "./vapid";

export type PushSupportState = "unsupported" | "not-configured" | "denied" | "unsubscribed" | "subscribed";

function isPushSupported(): boolean {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window;
}

function getVapidPublicKey(): string | null {
  const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  return key && key.trim() ? key.trim() : null;
}

function toApiReminders(reminders: ReminderRecord[]) {
  return reminders.map((reminder) => ({
    id: reminder.id,
    title: reminder.title,
    dueDate: reminder.dueDate,
    category: reminder.category,
    amount: reminder.amount,
  }));
}

export async function getPushState(): Promise<PushSupportState> {
  if (!isPushSupported()) return "unsupported";
  if (!getVapidPublicKey()) return "not-configured";
  if (Notification.permission === "denied") return "denied";

  const registration = await navigator.serviceWorker.getRegistration();
  const subscription = await registration?.pushManager.getSubscription();
  return subscription ? "subscribed" : "unsubscribed";
}

export async function subscribeToPush(reminders: ReminderRecord[]): Promise<{ ok: boolean; error?: string }> {
  if (!isPushSupported()) return { ok: false, error: "Bu tarayıcı bildirim desteklemiyor." };

  const vapidPublicKey = getVapidPublicKey();
  if (!vapidPublicKey) return { ok: false, error: "Bildirim servisi henüz yapılandırılmadı." };

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return { ok: false, error: "Bildirim izni verilmedi." };

  const registration = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });
  }

  try {
    const response = await apiFetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscription: subscription.toJSON(), reminders: toApiReminders(reminders) }),
    });
    if (!response.ok) return { ok: false, error: "Bildirim kaydı sunucuya iletilemedi." };
  } catch {
    return { ok: false, error: "Bildirim kaydı sunucuya iletilemedi." };
  }

  return { ok: true };
}

export async function syncRemindersToPush(reminders: ReminderRecord[]): Promise<void> {
  if (!isPushSupported()) return;

  const registration = await navigator.serviceWorker.getRegistration();
  const subscription = await registration?.pushManager.getSubscription();
  if (!subscription) return;

  await apiFetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subscription: subscription.toJSON(), reminders: toApiReminders(reminders) }),
  }).catch(() => undefined);
}

/**
 * Always unsubscribes the browser's own push registration first (that part
 * cannot silently fail the caller). `serverDeleted` reports whether the
 * server-side subscription record was actually confirmed removed, so
 * callers can tell the user honestly instead of assuming success — a failed
 * request here leaves a copy that only clears itself via the 90-day TTL
 * (see api/_lib/push-store.js), not immediately.
 */
export async function unsubscribeFromPush(): Promise<{ serverDeleted: boolean }> {
  if (!isPushSupported()) return { serverDeleted: true };

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    const subscription = await registration?.pushManager.getSubscription();
    if (!subscription) return { serverDeleted: true };

    const endpoint = subscription.endpoint;
    await subscription.unsubscribe().catch(() => undefined);
    try {
      const response = await apiFetch("/api/push/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint }),
      });
      return { serverDeleted: response.ok };
    } catch {
      return { serverDeleted: false };
    }
  } catch {
    // Best effort: never leave the caller's UI stuck on a rejected promise.
    return { serverDeleted: false };
  }
}
