import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const isNativePlatform = vi.fn(() => false);

vi.mock("@capacitor/core", () => ({
  Capacitor: {
    isNativePlatform: () => isNativePlatform(),
  },
}));

describe("resolveApiUrl", () => {
  beforeEach(() => {
    isNativePlatform.mockReturnValue(false);
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("keeps relative paths on the web so the existing same-origin behavior is unchanged", async () => {
    const { resolveApiUrl } = await import("@/lib/api/client");
    expect(resolveApiUrl("/api/ai/photo-damage")).toBe("/api/ai/photo-damage");
    expect(resolveApiUrl("api/push/subscribe")).toBe("/api/push/subscribe");
  });

  it("resolves to the production origin on native platforms, since a relative path has no server to hit", async () => {
    isNativePlatform.mockReturnValue(true);
    const { resolveApiUrl } = await import("@/lib/api/client");
    expect(resolveApiUrl("/api/ai/photo-damage")).toBe("https://eksperiq.vercel.app/api/ai/photo-damage");
  });

  it("apiFetch calls fetch with the resolved URL", async () => {
    isNativePlatform.mockReturnValue(true);
    const fetchMock = vi.fn(async () => new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const { apiFetch } = await import("@/lib/api/client");
    await apiFetch("/api/cron/check-reminders", { method: "POST" });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://eksperiq.vercel.app/api/cron/check-reminders",
      expect.objectContaining({ method: "POST" }),
    );
    vi.unstubAllGlobals();
  });
});
