import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const isNativePlatform = vi.fn(() => false);
const shareMock = vi.fn<(options: { title?: string; text?: string; url?: string }) => Promise<void>>(
  async () => undefined,
);

vi.mock("@capacitor/core", () => ({
  Capacitor: {
    isNativePlatform: () => isNativePlatform(),
  },
}));

vi.mock("@capacitor/share", () => ({
  Share: {
    share: (options: { title?: string; text?: string; url?: string }) => shareMock(options),
  },
}));

describe("shareContent", () => {
  beforeEach(() => {
    isNativePlatform.mockReturnValue(false);
    shareMock.mockClear();
    shareMock.mockResolvedValue(undefined);
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("uses the native OS share sheet with the production URL when running on a native platform", async () => {
    isNativePlatform.mockReturnValue(true);
    const { shareContent } = await import("@/lib/share/share");

    const outcome = await shareContent({ title: "EksperIQ araç analiz özeti", text: "özet metni" });

    expect(outcome).toBe("shared");
    expect(shareMock).toHaveBeenCalledWith({
      title: "EksperIQ araç analiz özeti",
      text: "özet metni",
      url: "https://eksperiq.vercel.app",
    });
  });

  it("falls back to clipboard copy when the native share sheet fails", async () => {
    isNativePlatform.mockReturnValue(true);
    shareMock.mockRejectedValueOnce(new Error("cancelled"));
    const writeText = vi.fn(async () => undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });

    const { shareContent } = await import("@/lib/share/share");
    const outcome = await shareContent({ title: "t", text: "özet" });

    expect(outcome).toBe("copied");
    expect(writeText).toHaveBeenCalledWith("özet");
  });

  it("uses navigator.share with window.location.origin on the web, unchanged from prior behavior", async () => {
    const shareSpy = vi.fn(async () => undefined);
    vi.stubGlobal("navigator", { share: shareSpy, clipboard: { writeText: vi.fn(async () => undefined) } });

    const { shareContent } = await import("@/lib/share/share");
    const outcome = await shareContent({ title: "EksperIQ araç analiz özeti", text: "özet metni" });

    expect(outcome).toBe("shared");
    expect(shareSpy).toHaveBeenCalledWith({
      title: "EksperIQ araç analiz özeti",
      text: "özet metni",
      url: window.location.origin,
    });
    expect(shareMock).not.toHaveBeenCalled();
  });

  it("falls back to clipboard copy on the web when navigator.share is unavailable", async () => {
    const writeText = vi.fn(async () => undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });

    const { shareContent } = await import("@/lib/share/share");
    const outcome = await shareContent({ title: "t", text: "özet" });

    expect(outcome).toBe("copied");
    expect(writeText).toHaveBeenCalledWith("özet");
  });

  it("reports failed when both share and clipboard copy are unavailable", async () => {
    vi.stubGlobal("navigator", {});
    vi.stubGlobal("document", {
      createElement: () => {
        throw new Error("no document in this fallback path");
      },
    });

    const { shareContent } = await import("@/lib/share/share");
    const outcome = await shareContent({ title: "t", text: "özet" });

    expect(outcome).toBe("failed");
  });
});
