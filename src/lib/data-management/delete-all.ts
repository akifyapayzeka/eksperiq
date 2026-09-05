"use client";

import { disableNotifications } from "@/lib/push/notifications";
import { loadReminders } from "@/lib/storage/reminders-storage";
import { clearAllThumbnails } from "@/lib/photo-analysis/indexed-db";
import {
  EXPORTABLE_STORAGE_KEYS,
  EPHEMERAL_SESSION_STORAGE_KEYS,
  DEVICE_IDENTITY_LOCAL_STORAGE_KEYS,
  RESET_ONLY_LOCAL_STORAGE_KEYS,
} from "./keys";

async function clearCacheStorage(): Promise<void> {
  if (typeof caches === "undefined") return;
  try {
    const names = await caches.keys();
    await Promise.all(names.map((name) => caches.delete(name)));
  } catch {
    // Best-effort — a stuck cache entry isn't worth failing the whole reset over.
  }
}

export type DeleteAllResult = { serverDeleted: boolean };

/**
 * Wipes every trace of the user's data, both on this device and, where a
 * server copy exists, on the server:
 *  - localStorage (all exportable records + the anonymous install id)
 *  - sessionStorage (current analysis session + all in-session checklists)
 *  - IndexedDB (photo thumbnails)
 *  - Cache Storage (offline/PWA asset caches)
 *  - the push subscription on the server (web) / all scheduled local
 *    notifications (native) — see src/lib/push/notifications.ts
 *
 * The on-device wipe below always runs and always succeeds (it's synchronous
 * storage removal) regardless of the server call's outcome — deleting the
 * device copy must never be held hostage to network availability. The
 * returned `serverDeleted` flag tells the caller whether the server-side
 * copy was actually confirmed removed, so the UI can say so honestly instead
 * of implying a guaranteed success it can't back up.
 */
export async function deleteAllLocalData(): Promise<DeleteAllResult> {
  const reminders = typeof window !== "undefined" ? loadReminders() : [];
  const notificationResult = await disableNotifications(reminders).catch(() => ({ serverDeleted: false }));
  await clearAllThumbnails();
  await clearCacheStorage();

  if (typeof window === "undefined") return notificationResult;

  for (const storageKey of Object.values(EXPORTABLE_STORAGE_KEYS)) {
    window.localStorage.removeItem(storageKey);
  }
  for (const storageKey of DEVICE_IDENTITY_LOCAL_STORAGE_KEYS) {
    window.localStorage.removeItem(storageKey);
  }
  for (const storageKey of RESET_ONLY_LOCAL_STORAGE_KEYS) {
    window.localStorage.removeItem(storageKey);
  }
  for (const storageKey of EPHEMERAL_SESSION_STORAGE_KEYS) {
    window.sessionStorage.removeItem(storageKey);
  }

  return notificationResult;
}
