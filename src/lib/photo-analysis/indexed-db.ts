"use client";

const DB_NAME = "eksperiq-photo-analysis";
const DB_VERSION = 1;
const STORE_NAME = "thumbnails";

function isIndexedDbAvailable(): boolean {
  return typeof window !== "undefined" && "indexedDB" in window && window.indexedDB !== undefined;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB açılamadı."));
  });
}

export type ThumbnailWriteResult = { ok: true } | { ok: false; reason: "quota-exceeded" | "unavailable" };

/**
 * Photo thumbnails (base64 data URLs) are large enough to blow through
 * localStorage's ~5-10MB quota within a handful of saved analyses — they
 * live in IndexedDB instead, keyed by the same id as the (small) metadata
 * record that stays in localStorage (see storage/photo-analysis-storage.ts).
 */
export async function saveThumbnails(id: string, thumbnails: string[]): Promise<ThumbnailWriteResult> {
  if (!isIndexedDbAvailable()) return { ok: false, reason: "unavailable" };
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).put(thumbnails, id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
    return { ok: true };
  } catch (error) {
    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      return { ok: false, reason: "quota-exceeded" };
    }
    return { ok: false, reason: "unavailable" };
  }
}

export async function loadThumbnails(id: string): Promise<string[]> {
  if (!isIndexedDbAvailable()) return [];
  try {
    const db = await openDatabase();
    const result = await new Promise<string[]>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const request = tx.objectStore(STORE_NAME).get(id);
      request.onsuccess = () => resolve(Array.isArray(request.result) ? (request.result as string[]) : []);
      request.onerror = () => reject(request.error);
    });
    db.close();
    return result;
  } catch {
    return [];
  }
}

export async function deleteThumbnails(id: string): Promise<void> {
  if (!isIndexedDbAvailable()) return;
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    // Best-effort — a stale orphaned thumbnail entry is not worth crashing over.
  }
}

/** Used by the "delete all data" flow (src/lib/data-management/delete-all.ts). */
export async function clearAllThumbnails(): Promise<void> {
  if (!isIndexedDbAvailable()) return;
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    // Best-effort.
  }
}
