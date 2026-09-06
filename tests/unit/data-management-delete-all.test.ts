import { afterEach, describe, expect, it, vi } from "vitest";
import {
  EXPORTABLE_STORAGE_KEYS,
  EPHEMERAL_SESSION_STORAGE_KEYS,
  DEVICE_IDENTITY_LOCAL_STORAGE_KEYS,
} from "@/lib/data-management/keys";

const disableNotifications = vi.fn<(reminders: unknown) => Promise<{ serverDeleted: boolean }>>(async () => ({
  serverDeleted: true,
}));
vi.mock("@/lib/push/notifications", () => ({
  disableNotifications: (reminders: unknown) => disableNotifications(reminders),
}));

const loadReminders = vi.fn(() => []);
vi.mock("@/lib/storage/reminders-storage", () => ({
  loadReminders: () => loadReminders(),
}));

const clearAllThumbnails = vi.fn(async () => undefined);
vi.mock("@/lib/photo-analysis/indexed-db", () => ({
  clearAllThumbnails: () => clearAllThumbnails(),
}));

describe("deleteAllLocalData", () => {
  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("clears every exportable, ephemeral, and device-identity storage key", async () => {
    for (const storageKey of Object.values(EXPORTABLE_STORAGE_KEYS)) {
      localStorage.setItem(storageKey, JSON.stringify([{ id: "x" }]));
    }
    for (const storageKey of DEVICE_IDENTITY_LOCAL_STORAGE_KEYS) {
      localStorage.setItem(storageKey, "some-id");
    }
    for (const storageKey of EPHEMERAL_SESSION_STORAGE_KEYS) {
      sessionStorage.setItem(storageKey, "value");
    }

    const { deleteAllLocalData } = await import("@/lib/data-management/delete-all");
    await deleteAllLocalData();

    for (const storageKey of Object.values(EXPORTABLE_STORAGE_KEYS)) {
      expect(localStorage.getItem(storageKey)).toBeNull();
    }
    for (const storageKey of DEVICE_IDENTITY_LOCAL_STORAGE_KEYS) {
      expect(localStorage.getItem(storageKey)).toBeNull();
    }
    for (const storageKey of EPHEMERAL_SESSION_STORAGE_KEYS) {
      expect(sessionStorage.getItem(storageKey)).toBeNull();
    }
  });

  it("does not touch unrelated localStorage keys outside the known set", async () => {
    localStorage.setItem("some-other-app:unrelated", "keep-me");

    const { deleteAllLocalData } = await import("@/lib/data-management/delete-all");
    await deleteAllLocalData();

    expect(localStorage.getItem("some-other-app:unrelated")).toBe("keep-me");
  });

  it("disables notifications (server-side unsubscribe / native cancel) before wiping storage", async () => {
    const { deleteAllLocalData } = await import("@/lib/data-management/delete-all");
    await deleteAllLocalData();

    expect(disableNotifications).toHaveBeenCalled();
  });

  it("clears IndexedDB thumbnails", async () => {
    const { deleteAllLocalData } = await import("@/lib/data-management/delete-all");
    await deleteAllLocalData();

    expect(clearAllThumbnails).toHaveBeenCalled();
  });

  it("clears Cache Storage entries when the Cache API is available", async () => {
    const deleteMock = vi.fn(async () => true);
    vi.stubGlobal("caches", { keys: vi.fn(async () => ["v1", "v2"]), delete: deleteMock });

    const { deleteAllLocalData } = await import("@/lib/data-management/delete-all");
    await deleteAllLocalData();

    expect(deleteMock).toHaveBeenCalledWith("v1");
    expect(deleteMock).toHaveBeenCalledWith("v2");
  });

  it("does not throw when notifications fail to disable, and honestly reports serverDeleted: false", async () => {
    disableNotifications.mockRejectedValueOnce(new Error("boom"));

    const { deleteAllLocalData } = await import("@/lib/data-management/delete-all");
    await expect(deleteAllLocalData()).resolves.toEqual({ serverDeleted: false });
  });

  it("reports serverDeleted: false when the notification layer reports it explicitly", async () => {
    disableNotifications.mockResolvedValueOnce({ serverDeleted: false });

    const { deleteAllLocalData } = await import("@/lib/data-management/delete-all");
    await expect(deleteAllLocalData()).resolves.toEqual({ serverDeleted: false });
  });
});

/**
 * "Tüm verilerimi sil" artık gerçek bir ekrana bağlı (Profil > Verilerim) ve
 * kullanıcıya "Tüm verileriniz bu cihazdan silindi." diyor. O cümlenin doğru
 * olması için silme süpürgesinin gerçekten HER kullanıcı verisini kapsaması
 * gerekiyor — ama iki localStorage anahtarı hiçbir listede değildi:
 * davranış olayları (`eksperiq:product-events`) ve AI onay kaydı
 * (`eksperiq:ai-consent-accepted`). Kullanıcı "hepsini sil" diyor, cihazda
 * davranış geçmişi kalıyordu.
 *
 * Aynı testin ikinci yarısı bunun TERSİNİ kilitliyor: ücretsiz paket kotası
 * (`eksperiq:listing-quota`) silinMEmeli. Silinirse "Tüm verilerimi sil"
 * butonu ücretsiz analiz hakkını sıfırlamanın yolu olur — yani ödeme
 * duvarını atlatan bir kapı.
 */
describe("silme süpürgesinin kapsamı", () => {
  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("davranış olaylarını ve AI onayını da siler", async () => {
    localStorage.setItem("eksperiq:product-events", JSON.stringify([{ id: "e1", name: "analysis_created" }]));
    localStorage.setItem("eksperiq:ai-consent-accepted", "true");

    const { deleteAllLocalData } = await import("@/lib/data-management/delete-all");
    await deleteAllLocalData();

    expect(localStorage.getItem("eksperiq:product-events")).toBeNull();
    expect(localStorage.getItem("eksperiq:ai-consent-accepted")).toBeNull();
  });

  it("ücretsiz paket kotasını SİLMEZ — silme butonu kota sıfırlama yolu olmamalı", async () => {
    localStorage.setItem("eksperiq:listing-quota", JSON.stringify({ used: 3 }));

    const { deleteAllLocalData } = await import("@/lib/data-management/delete-all");
    await deleteAllLocalData();

    expect(localStorage.getItem("eksperiq:listing-quota")).not.toBeNull();
  });
});
