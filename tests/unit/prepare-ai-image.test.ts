import { afterEach, describe, expect, it, vi } from "vitest";
import { MAX_AI_UPLOAD_PAYLOAD_BYTES, prepareAiImages } from "@/lib/photo-analysis/prepare-ai-image";

// jsdom has no real image decoder — a plain `new Image()` never fires
// onload/onerror on its own — so decode failure is simulated by stubbing
// Image to reject, and success is simulated by stubbing it to resolve plus
// stubbing canvas.getContext (jsdom's is null by default). Real pixel
// compression can't be exercised headlessly here (same gap as the existing
// downscale-image.ts helper); this covers the contract prepareAiImages must
// uphold regardless: it never throws, and every file is accounted for.
describe("prepareAiImages", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("exposes a sane payload budget", () => {
    expect(MAX_AI_UPLOAD_PAYLOAD_BYTES).toBeGreaterThan(1_000_000);
    expect(MAX_AI_UPLOAD_PAYLOAD_BYTES).toBeLessThanOrEqual(4_000_000);
  });

  it("returns an empty result for an empty file list", async () => {
    const result = await prepareAiImages([]);
    expect(result).toEqual({ images: [], skippedCount: 0 });
  });

  it("never throws and reports files it couldn't decode as skipped", async () => {
    class FailingImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(_value: string) {
        queueMicrotask(() => this.onerror?.());
      }
    }
    vi.stubGlobal("Image", FailingImage);

    const file = new File([new Uint8Array([1, 2, 3])], "not-really-an-image.jpg", { type: "image/jpeg" });
    const result = await prepareAiImages([file]);

    expect(result.images).toEqual([]);
    expect(result.skippedCount).toBe(1);
  });

  it("skips a file when canvas 2D context is unavailable instead of throwing", async () => {
    class DecodableImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      naturalWidth = 800;
      naturalHeight = 600;
      set src(_value: string) {
        queueMicrotask(() => this.onload?.());
      }
    }
    vi.stubGlobal("Image", DecodableImage);
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);

    const file = new File([new Uint8Array([1, 2, 3])], "photo.jpg", { type: "image/jpeg" });
    const result = await prepareAiImages([file]);

    expect(result.images).toEqual([]);
    expect(result.skippedCount).toBe(1);
  });
});
