import { describe, expect, it } from "vitest";
import { mileageAnswer, mileageSummarySentence } from "@/lib/analysis/mileage-summary";
import type { MileageEvaluation } from "@/lib/analysis/types";

/**
 * Rapor ekranı, yıllık ortalama kullanımı hesaplayamadığı durumlarda bile
 * (kilometre girilmemiş ya da model yılı ilandan okunamamış) "yıllık ortalama
 * kullanım yaklaşık 0 km" ve yer tutucu yıldan türeyen bir "araç yaşı"
 * yazıyordu. 0 km, ölçülmüş bir değer gibi görünüyor.
 */

function evaluation(overrides: Partial<MileageEvaluation> = {}): MileageEvaluation {
  return { vehicleAge: 6, annualMileage: 18000, label: "Normal aralık", ...overrides };
}

describe("kilometre özeti — hesaplanamayan değerleri 0 diye göstermez", () => {
  it("yıllık kullanım hesaplanamadığında sayı uydurmaz", () => {
    const summary = mileageSummarySentence(evaluation({ annualMileage: 0, label: "Bilgi yetersiz" }));
    expect(summary).not.toContain("0 km");
    expect(summary).toContain("hesaplanamadı");
  });

  it("hesaplanamadığında uydurulmuş araç yaşını da yazmaz", () => {
    const summary = mileageSummarySentence(evaluation({ vehicleAge: 1, annualMileage: 0, label: "Bilgi yetersiz" }));
    expect(summary).not.toContain("1 yıl");
  });

  it("soru-cevap kartı da aynı şekilde dürüst kalır", () => {
    const answer = mileageAnswer(evaluation({ annualMileage: 0, label: "Bilgi yetersiz" }));
    expect(answer).toContain("Bilgi yetersiz");
    expect(answer).not.toContain("0 km");
  });

  it("gerçek değer varken normal cümleyi kurar", () => {
    expect(mileageSummarySentence(evaluation())).toContain("18.000 km");
    expect(mileageSummarySentence(evaluation())).toContain("6 yıl");
    expect(mileageAnswer(evaluation())).toContain("18.000 km");
  });
});
