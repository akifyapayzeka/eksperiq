import { afterEach, describe, expect, it, vi } from "vitest";
import { loadAnalysis, saveAnalysis } from "@/lib/storage/analysis-storage";
import type { AnalysisResult } from "@/lib/analysis/types";

/**
 * İlan içe aktarmada araç fotoğrafları base64 data URL olarak analizin içinde
 * saklanıyor; birkaç fotoğraf megabaytlarca yer tutuyor ve sessionStorage
 * kotası (~5 MB) gerçekten dolabiliyor. Eskiden `saveAnalysis` korumasız
 * `sessionStorage.setItem` çağırıyordu: kota dolduğunda fonksiyon fırlatıyor,
 * çağıran akış (kota sayacı + /sonuc yönlendirmesi) hiç çalışmıyordu — yani
 * kullanıcı "Analiz oluştur"a basıyor ve hiçbir şey olmuyordu, hata da
 * görmüyordu.
 */

function analysisFixture(): AnalysisResult {
  return {
    totalScore: 72,
    riskLabel: "Dikkatli incelenmeli",
    findings: [],
    knownIssues: [],
    completeness: { percentage: 80, filled: 8, total: 10, missing: [] },
    listingImageData: [{ url: "https://example.com/a.jpg", dataUrl: "data:image/jpeg;base64,AAAA" }],
  } as unknown as AnalysisResult;
}

function makeQuotaError(): Error {
  const error = new Error("QuotaExceededError");
  error.name = "QuotaExceededError";
  return error;
}

afterEach(() => {
  vi.restoreAllMocks();
  sessionStorage.clear();
  localStorage.clear();
});

describe("saveAnalysis — depolama kotası dolduğunda", () => {
  it("fırlatmaz, sonucu bildirir", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw makeQuotaError();
    });

    expect(() => saveAnalysis(analysisFixture())).not.toThrow();
    expect(saveAnalysis(analysisFixture()).stored).toBe(false);
  });

  it("fotoğraflar sığmıyorsa analizi fotoğrafsız kurtarır", () => {
    const original = Storage.prototype.setItem;
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key: string, value: string) {
      // Gerçek kota davranışının taklidi: büyük yazım reddedilir, küçük geçer.
      if (value.length > 200) throw makeQuotaError();
      return original.call(this, key, value);
    });

    const outcome = saveAnalysis(analysisFixture());

    expect(outcome.stored).toBe(true);
    expect(outcome.droppedImages).toBe(true);
    const loaded = loadAnalysis();
    expect(loaded).not.toBeNull();
    expect(loaded?.listingImageData ?? []).toHaveLength(0);
  });

  it("kota sorunu yokken normal kaydeder ve fotoğrafları korur", () => {
    const outcome = saveAnalysis(analysisFixture());

    expect(outcome.stored).toBe(true);
    expect(outcome.droppedImages).toBe(false);
    expect(loadAnalysis()?.listingImageData).toHaveLength(1);
  });
});
