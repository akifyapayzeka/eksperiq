"use client";

import { disableNotifications } from "@/lib/push/notifications";
import { loadReminders } from "@/lib/storage/reminders-storage";
import { clearAllThumbnails } from "@/lib/photo-analysis/indexed-db";
import { EXPORTABLE_STORAGE_KEYS, EPHEMERAL_SESSION_STORAGE_KEYS, DEVICE_IDENTITY_LOCAL_STORAGE_KEYS } from "./keys";

async function clearCacheStorage(): Promise<void> {
  if (typeof caches === "undefined") return;
  try {
    const names = await caches.keys();
    await Promise.all(names.map((name) => caches.delete(name)));
  } catch {
    // Best-effort — a stuck cache entry isn't worth failing the whole reset over.
  }
}

/**
 * Wipes every trace of the user's data, both on this device and, where a
 * server copy exists, on the server:
 *  - localStorage (all exportable records + the anonymous install id)
 *  - sessionStorage (current analysis session + all in-session checklists)
 *  - IndexedDB (photo thumbnails)
 *  - Cache Storage (offline/PWA asset caches)
 *  - the push subscription on the server (web) / all scheduled local
 *    notifications (native) — see src/lib/push/notifications.ts
 */
export async function deleteAllLocalData(): Promise<void> {
  const reminders = typeof window !== "undefined" ? loadReminders() : [];
  await disableNotifications(reminders).catch(() => undefined);
  await clearAllThumbnails();
  await clearCacheStorage();

  if (typeof window === "undefined") return;

  for (const storageKey of Object.values(EXPORTABLE_STORAGE_KEYS)) {
    window.localStorage.removeItem(storageKey);
  }
  for (const storageKey of DEVICE_IDENTITY_LOCAL_STORAGE_KEYS) {
    window.localStorage.removeItem(storageKey);
  }
  for (const storageKey of EPHEMERAL_SESSION_STORAGE_KEYS) {
    window.sessionStorage.removeItem(storageKey);
  }
}
