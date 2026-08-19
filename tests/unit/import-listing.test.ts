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
