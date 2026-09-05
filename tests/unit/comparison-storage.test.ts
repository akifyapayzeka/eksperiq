import { beforeEach, describe, expect, it } from "vitest";
import {
  addToComparison,
  clearComparison,
  loadComparisonEntries,
  removeFromComparison,
} from "@/lib/storage/comparison-storage";
import { MAX_COMPARISON_ENTRIES } from "@/lib/comparison/types";
import type { AnalysisResult } from "@/lib/analysis/types";

/**
 * Karşılaştırma modülü en fazla 3 analiz tutuyor ve amacı FARKLI ilanları yan
 * yana koymak. `addToComparison` her çağrıda yeni bir rastgele id üretip
 * ekliyordu; aynı analizi iki kez eklemek — kullanıcının çift dokunması ya da
 * listeye geri dönüp tekrar basması yeterli — aynı aracı iki satır olarak
 * yazıyor ve üç kontenjandan ikisini yiyordu. Karşılaştırma ekranı da aynı
 * aracı kendisiyle kıyaslıyordu. Analizler `generatedAt` ile birebir
 * ayrıldığı için mükerrer ekleme artık sessizce yok sayılıyor.
 */

function analysisFixture(overrides: Partial<AnalysisResult> = {}): AnalysisResult {
  return {
    input: { year: 2020, brand: "Toyota", model: "Corolla" },
    totalScore: 72,
    riskLabel: "Dikkatli incelenmeli",
    generatedAt: "2026-01-01T10:00:00.000Z",
    ...overrides,
  } as unknown as AnalysisResult;
}

beforeEach(() => {
  clearComparison();
});

describe("karşılaştırma listesi", () => {
  it("aynı analiz iki kez eklenemez — kontenjan boşa harcanmaz", () => {
    const analysis = analysisFixture();

    expect(addToComparison(analysis)).toEqual({ ok: true });
    expect(addToComparison(analysis)).toEqual({ ok: false, reason: "duplicate" });

    expect(loadComparisonEntries()).toHaveLength(1);
  });

  it("farklı analizler ayrı satır olarak eklenir", () => {
    addToComparison(analysisFixture());
    addToComparison(analysisFixture({ generatedAt: "2026-01-02T10:00:00.000Z" }));

    expect(loadComparisonEntries()).toHaveLength(2);
  });

  it("üç farklı analizden sonra liste dolar", () => {
    for (let index = 0; index < MAX_COMPARISON_ENTRIES; index += 1) {
      const result = addToComparison(analysisFixture({ generatedAt: `2026-01-0${index + 1}T10:00:00.000Z` }));
      expect(result).toEqual({ ok: true });
    }

    expect(addToComparison(analysisFixture({ generatedAt: "2026-02-01T10:00:00.000Z" }))).toEqual({
      ok: false,
      reason: "full",
    });
  });

  it("silinen bir analiz yeniden eklenebilir", () => {
    const analysis = analysisFixture();
    addToComparison(analysis);
    const [entry] = loadComparisonEntries();

    removeFromComparison(entry.id);

    expect(addToComparison(analysis)).toEqual({ ok: true });
    expect(loadComparisonEntries()).toHaveLength(1);
  });
});
