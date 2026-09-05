import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getPushState, subscribeToPush, syncRemindersToPush, unsubscribeFromPush } from "@/lib/push/client";
import type { ReminderRecord } from "@/lib/reminders/types";

const reminders: ReminderRecord[] = [
  {
    id: "r1",
    category: "muayene",
    title: "Muayene",
    dueDate: "2026-09-01",
    recurrence: "none",
    history: [],
    createdAt: new Date().toISOString(),
  },
];

function stubServiceWorker(subscription: unknown) {
  const registration = {
    pushManager: {
      getSubscription: vi.fn(async () => subscription),
      subscribe: vi.fn(async () => subscription),
    },
  };
  vi.stubGlobal("navigator", {
    ...navigator,
    serviceWorker: {
      getRegistration: vi.fn(async () => registration),
      register: vi.fn(async () => registration),
      ready: Promise.resolve(registration),
    },
    // Some browsers expose PushManager on window rather than navigator; kept for isPushSupported checks below.
  });
  vi.stubGlobal("PushManager", function PushManager() {});
  return registration;
}

describe("push client", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = "test-public-key";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    delete process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  });

  it("reports not-configured when no VAPID key is set", async () => {
    delete process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    stubServiceWorker(null);
    expect(await getPushState()).toBe("not-configured");
  });

  it("resolves even when the browser's unsubscribe() call rejects", async () => {
    const subscription = {
      endpoint: "https://push.example.com/a",
      toJSON: () => ({ endpoint: "https://push.example.com/a", keys: { p256dh: "p", auth: "a" } }),
      unsubscribe: vi.fn(async () => {
        throw new Error("boom");
      }),
    };
    stubServiceWorker(subscription);
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 })),
    );

    await expect(unsubscribeFromPush()).resolves.toEqual({ serverDeleted: true });
    expect(subscription.unsubscribe).toHaveBeenCalled();
  });

  it("still notifies the server to remove the subscription when unsubscribe() rejects", async () => {
    const subscription = {
      endpoint: "https://push.example.com/b",
      toJSON: () => ({ endpoint: "https://push.example.com/b", keys: { p256dh: "p", auth: "a" } }),
      unsubscribe: vi.fn(async () => {
        throw new Error("boom");
      }),
    };
    stubServiceWorker(subscription);
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await unsubscribeFromPush();

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/push/unsubscribe",
      expect.objectContaining({ body: JSON.stringify({ endpoint: "https://push.example.com/b" }) }),
    );
    expect(result).toEqual({ serverDeleted: true });
  });

  it("reports serverDeleted: false when the server request fails", async () => {
    const subscription = {
      endpoint: "https://push.example.com/c",
      toJSON: () => ({ endpoint: "https://push.example.com/c", keys: { p256dh: "p", auth: "a" } }),
      unsubscribe: vi.fn(async () => undefined),
    };
    stubServiceWorker(subscription);
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ error: "boom" }), { status: 500 })),
    );

    await expect(unsubscribeFromPush()).resolves.toEqual({ serverDeleted: false });
  });

  it("does nothing when there is no active subscription", async () => {
    stubServiceWorker(null);
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(unsubscribeFromPush()).resolves.toEqual({ serverDeleted: true });
    await syncRemindersToPush(reminders);

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("subscribes and posts reminders to the server", async () => {
    const subscription = {
      endpoint: "https://push.example.com/c",
      toJSON: () => ({ endpoint: "https://push.example.com/c", keys: { p256dh: "p", auth: "a" } }),
    };
    stubServiceWorker(null);
    const registration = stubServiceWorker(null);
    registration.pushManager.getSubscription = vi.fn(async () => null);
    registration.pushManager.subscribe = vi.fn(async () => subscription);
    vi.stubGlobal("Notification", { requestPermission: vi.fn(async () => "granted"), permission: "default" });
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await subscribeToPush(reminders);

    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/push/subscribe",
      expect.objectContaining({
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          reminders: [{ id: "r1", title: "Muayene", dueDate: "2026-09-01", category: "muayene", amount: undefined }],
        }),
      }),
    );
  });
});

/**
 * Kullanıcı bildirimleri açtıktan sonra eklediği her hatırlatma sunucuya
 * gönderilmek zorunda: bildirimi 30/15 gün kala gönderen şey sunucudaki cron
 * ve o yalnızca kendisine ulaşan kayıtları biliyor. `syncRemindersToPush`
 * isteğin sonucunu HİÇ kontrol etmiyordu — `response.ok` bakılmıyordu (fetch
 * 500'de reddetmez, çözümlenir) ve ağ hatası `.catch(() => undefined)` ile
 * yutuluyordu. Sonuç: MTV/sigorta/muayene hatırlatması kaydedilmiş görünüyor,
 * kullanıcı bildirim bekliyor ve o bildirim hiç gelmiyor — parası yanabilir.
 * Artık sonuç dürüstçe raporlanıyor.
 */
describe("hatırlatma senkronizasyonu sonucu dürüstçe raporlanır", () => {
  beforeEach(() => {
    stubServiceWorker({
      endpoint: "https://push.example.com/c",
      toJSON: () => ({ endpoint: "https://push.example.com/c", keys: { p256dh: "p", auth: "a" } }),
    });
  });

  it("sunucu 200 dönerse senkron başarılı sayılır", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("{}", { status: 200 })),
    );
    await expect(syncRemindersToPush(reminders)).resolves.toEqual({ synced: true });
  });

  it("sunucu 500 dönerse başarı denmez", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("boom", { status: 500 })),
    );
    await expect(syncRemindersToPush(reminders)).resolves.toEqual({ synced: false });
  });

  it("ağ hatası yutulmaz", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("offline");
      }),
    );
    await expect(syncRemindersToPush(reminders)).resolves.toEqual({ synced: false });
  });

  it("aktif abonelik yoksa gönderilecek bir şey yok, bu bir hata değil", async () => {
    stubServiceWorker(null);
    vi.stubGlobal("fetch", vi.fn());
    await expect(syncRemindersToPush(reminders)).resolves.toEqual({ synced: true });
  });
});
