import { appConfig } from "@/lib/constants/app";
import type { AnalysisResult } from "./types";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}

function numbered(items: string[]): string {
  return items.map((item, index) => `${index + 1}. ${item}`).join("\n");
}

export function formatAnalysisSummary(result: AnalysisResult): string {
  const vehicle = `${result.input.brand} ${result.input.model} ${result.input.year}`;
  const actions = result.priorityActions.map((action) => `${action.title} Neden: ${action.reason}`);
  const risks = result.findings.slice(0, 5).map((finding) => `${finding.title}: ${finding.recommendation}`);
  const questions = result.sellerQuestions.slice(0, 8);

  return [
    `${appConfig.name} ikinci el araç ilanı karar desteği`,
    "",
    `Araç: ${vehicle}`,
    `Kilometre: ${result.input.mileage.toLocaleString("tr-TR")} km`,
    `İlan fiyatı: ${formatCurrency(result.input.price)}`,
    result.input.city ? `Şehir: ${result.input.city}` : "",
    result.input.listingUrl ? `İlan referansı: ${result.input.listingUrl}` : "",
    "",
    `Risk skoru: ${result.totalScore} / 100`,
    `Sonuç: ${result.riskLabel}`,
    `Kısa karar özeti: ${result.decision}`,
    `Bilgi doluluğu: ${result.completeness.completed} / ${result.completeness.total} (${result.completeness.percentage}%)`,
    result.completeness.missing.length
      ? `Eksik görünen bilgiler: ${result.completeness.missing.slice(0, 8).join(", ")}`
      : "",
    "",
    "Öncelikli ilk aksiyonlar:",
    actions.length ? numbered(actions) : "Öncelikli aksiyon üretilemedi; belge ve ekspertiz kontrolüyle ilerleyin.",
    "",
    "Öne çıkan riskler:",
    risks.length ? numbered(risks) : "Belirgin risk üretilemedi; yine de belge ve ekspertiz kontrolü önerilir.",
    "",
    "Satıcıya ilk sorular:",
    questions.length ? numbered(questions) : "Soru üretilemedi.",
    "",
    appConfig.disclaimer,
  ]
    .filter((line) => line !== "")
    .join("\n");
}
