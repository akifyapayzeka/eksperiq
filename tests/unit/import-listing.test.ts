import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const isNativePlatform = vi.fn(() => true);
vi.mock("@capacitor/core", () => ({
  Capacitor: { isNativePlatform: () => isNativePlatform() },
}));

const addListener = vi.fn();
const fetchListingPage = vi.fn();
vi.mock("@/lib/listing-import/native-plugin", () => ({
  EksperIQListingFetchPlugin: {
    addListener: (...args: unknown[]) => addListener(...args),
    fetchListingPage: (...args: unknown[]) => fetchListingPage(...args),
  },
}));

vi.mock("@/lib/api/install-id", () => ({
  getInstallId: () => "test-install-id",
}));

const SUPPORTED_URL = "https://sahibinden.com/ilan/123";

describe("importListingFromUrl", () => {
  beforeEach(() => {
    isNativePlatform.mockReturnValue(true);
    addListener.mockReset();
    fetchListingPage.mockReset();
    vi.resetModules();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("rejects an unsupported host before ever touching the native plugin", async () => {
    const { importListingFromUrl } = await import("@/lib/listing-import/import-listing");
    const outcome = await importListingFromUrl("https://example.com/car");
    expect(outcome).toEqual({ ok: false, reason: "invalid-url" });
    expect(addListener).not.toHaveBeenCalled();
  });

  it("resolves to unsupported-platform on the web without calling the plugin", async () => {
    isNativePlatform.mockReturnValue(false);
    const { importListingFromUrl } = await import("@/lib/listing-import/import-listing");
    const outcome = await importListingFromUrl(SUPPORTED_URL);
    expect(outcome).toEqual({ ok: false, reason: "unsupported-platform" });
    expect(addListener).not.toHaveBeenCalled();
  });

  it("fails fast (not after the client timeout) when the native fetch itself rejects", async () => {
    const remove = vi.fn().mockResolvedValue(undefined);
    addListener.mockResolvedValue({ remove });
    fetchListingPage.mockRejectedValue(new Error("native boom"));

    const { importListingFromUrl } = await import("@/lib/listing-import/import-listing");
    const outcome = await importListingFromUrl(SUPPORTED_URL);

    expect(outcome).toEqual({ ok: false, reason: "fetch-failed", detail: "native boom" });
    expect(remove).toHaveBeenCalled();
  });

  it("times out from the JS side if the native call never settles at all", async () => {
    // Simulates the reported production hang: addListener() (or the native
    // call it precedes) never resolves, so nothing native-side would ever
    // reject either — the only thing that can end this is the client-side
    // backstop timeout added specifically for this case.
    addListener.mockReturnValue(new Promise(() => {}));

    const { importListingFromUrl } = await import("@/lib/listing-import/import-listing");
    const onStage = vi.fn();
    const outcomePromise = importListingFromUrl(SUPPORTED_URL, onStage);

    await vi.advanceTimersByTimeAsync(65_000);
    const outcome = await outcomePromise;

    expect(outcome.ok).toBe(false);
    expect(outcome).toMatchObject({ reason: "fetch-failed" });
    expect(onStage).toHaveBeenCalledWith("checking-url");
    expect(onStage).not.toHaveBeenCalledWith("opening-page");
  });

  it("recovers via visibilitychange when the timer itself was throttled by backgrounding", async () => {
    // A plain setTimeout can be paused for as long as the WKWebView is
    // backgrounded, which is exactly when a stuck native call is most
    // likely to be waited out. Simulate that: the wall clock jumps past
    // the deadline (vi.setSystemTime, unlike advanceTimersByTime, does not
    // run any due callbacks), so only the visibilitychange re-check —not
    // the timer— can end this.
    addListener.mockReturnValue(new Promise(() => {}));
    const { importListingFromUrl } = await import("@/lib/listing-import/import-listing");

    const outcomePromise = importListingFromUrl(SUPPORTED_URL);

    vi.setSystemTime(Date.now() + 120_000);
    Object.defineProperty(document, "visibilityState", { value: "visible", configurable: true });
    document.dispatchEvent(new Event("visibilitychange"));

    const outcome = await outcomePromise;
    expect(outcome.ok).toBe(false);
  });

  it("retries once when the first attempt reads a Cloudflare/security page, and returns the real result", async () => {
    function fetchResult(warnings: string[], bodyText = "x".repeat(100)) {
      return {
        pageDataJson: JSON.stringify({
          title: "t",
          ogTitle: "",
          ogDescription: "",
          bodyText,
          jsonLd: [],
          images: [],
          finalUrl: SUPPORTED_URL,
        }),
        importHttpStatus: 200,
        importResponseJson: JSON.stringify({
          result: { title: "t", fields: {}, lowConfidenceFields: [], missingFields: [], warnings },
        }),
      };
    }

    addListener.mockResolvedValue({ remove: vi.fn().mockResolvedValue(undefined) });
    fetchListingPage
      .mockResolvedValueOnce(fetchResult(["Sayfa bir araç ilanı değil, güvenlik doğrulaması (Cloudflare) sayfasıdır."]))
      .mockResolvedValueOnce(fetchResult([]));

    const { importListingFromUrl } = await import("@/lib/listing-import/import-listing");
    const outcome = await importListingFromUrl(SUPPORTED_URL);

    expect(fetchListingPage).toHaveBeenCalledTimes(2);
    expect(outcome.ok).toBe(true);
    if (outcome.ok) expect(outcome.result.warnings).toEqual([]);
  });

  it("retries once on a too-short (likely blocked) page, then gives up if the retry is blocked too", async () => {
    addListener.mockResolvedValue({ remove: vi.fn().mockResolvedValue(undefined) });
    fetchListingPage.mockResolvedValue({
      pageDataJson: JSON.stringify({
        title: "",
        ogTitle: "",
        ogDescription: "",
        bodyText: "short",
        jsonLd: [],
        images: [],
        finalUrl: SUPPORTED_URL,
      }),
      importHttpStatus: 200,
      importResponseJson: "",
    });

    const { importListingFromUrl } = await import("@/lib/listing-import/import-listing");
    const outcome = await importListingFromUrl(SUPPORTED_URL);

    expect(fetchListingPage).toHaveBeenCalledTimes(2);
    expect(outcome).toEqual({ ok: false, reason: "blocked" });
  });

  it("still attempts fetchListingPage even when addListener() never settles", async () => {
    // The actual production root cause: @capacitor/core's addListenerNative
    // has a real bug where a rejected native addListener() call resolves to
    // a promise that never settles at all (see import-listing.ts's
    // addProgressListener comment). If fetchListingPage() only ran after
    // awaiting addListener() directly, the real network call would never
    // even be attempted — exactly what production traces showed. Racing
    // addListener() against its own short timeout means fetchListingPage()
    // must still fire well before the 65s outer deadline.
    addListener.mockReturnValue(new Promise(() => {}));
    fetchListingPage.mockResolvedValue({
      pageDataJson: JSON.stringify({
        title: "t",
        ogTitle: "",
        ogDescription: "",
        bodyText: "x".repeat(100),
        jsonLd: [],
        images: [],
        finalUrl: SUPPORTED_URL,
      }),
      importHttpStatus: 200,
      importResponseJson: JSON.stringify({
        result: { title: "t", fields: {}, lowConfidenceFields: [], missingFields: [], warnings: [] },
      }),
    });

    const { importListingFromUrl } = await import("@/lib/listing-import/import-listing");
    const outcomePromise = importListingFromUrl(SUPPORTED_URL);

    await vi.advanceTimersByTimeAsync(5_000);
    const outcome = await outcomePromise;

    expect(fetchListingPage).toHaveBeenCalled();
    expect(outcome.ok).toBe(true);
  });

  it("does not time out for an import that finishes well within the limit", async () => {
    const remove = vi.fn().mockResolvedValue(undefined);
    addListener.mockResolvedValue({ remove });
    fetchListingPage.mockResolvedValue({
      pageDataJson: JSON.stringify({
        title: "t",
        ogTitle: "",
        ogDescription: "",
        bodyText: "x".repeat(100),
        jsonLd: [],
        images: [],
        finalUrl: SUPPORTED_URL,
      }),
      importHttpStatus: 200,
      importResponseJson: JSON.stringify({
        result: {
          title: "t",
          fields: {},
          lowConfidenceFields: [],
          missingFields: [],
          warnings: [],
        },
      }),
    });

    const { importListingFromUrl } = await import("@/lib/listing-import/import-listing");
    const outcome = await importListingFromUrl(SUPPORTED_URL);

    expect(outcome.ok).toBe(true);
  });
});
