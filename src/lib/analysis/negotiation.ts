import type { AnalysisFinding, CostSignal, DataCompleteness, NegotiationGuidance } from "./types";

/**
 * Durum bazlı pazarlık payı — piyasa karşılaştırması değil. Her ağırlık
 * "bu bulgu genelde ne kadarlık bir pazarlık gerekçesi sayılır" sorusuna
 * kaba bir yanıt verir; kesin bir formül değildir, bu yüzden aralık her
 * zaman bir alt/üst sınır olarak sunulur, tek bir sayı olarak değil.
 */
const BASE_LOW = 0.03;
const BASE_HIGH = 0.06;
const HIGH_FINDING_STEP = 0.04;
const MEDIUM_FINDING_STEP = 0.02;
const LOW_FINDING_STEP = 0.005;
const MAX_LOW_FINDINGS_COUNTED = 3;
const COST_HIGH_STEP = 0.03;
const COST_MEDIUM_STEP = 0.015;
const MISSING_INFO_FLAT = 0.01;
const MAX_DISCOUNT_LOW = 0.2;
const MAX_DISCOUNT_HIGH = 0.32;
const MIN_SPREAD = 0.02;

function clampPercent(value: number, max: number): number {
  return Math.min(Math.max(value, 0), max);
}

function roundToNearest100(value: number): number {
  return Math.round(value / 100) * 100;
}

function buildReasons(findings: AnalysisFinding[], costs: CostSignal[], completeness: DataCompleteness): string[] {
  const reasons = [
    ...findings
      .filter((finding) => finding.severity !== "low")
      .slice(0, 3)
      .map((finding) => finding.title),
    ...costs
      .filter((cost) => cost.level !== "Düşük" && cost.level !== "Yakın tarihli")
      .slice(0, 2)
      .map((cost) => `${cost.item}: ${cost.level}`),
  ];
  if (completeness.missing.length) {
    reasons.push(`Eksik bilgi: ${completeness.missing.slice(0, 3).join(", ")}`);
  }
  return Array.from(new Set(reasons)).slice(0, 6);
}

export function buildNegotiationGuidance(
  listingPrice: number,
  findings: AnalysisFinding[],
  costs: CostSignal[],
  completeness: DataCompleteness,
): NegotiationGuidance {
  const highCount = findings.filter((finding) => finding.severity === "high").length;
  const mediumCount = findings.filter((finding) => finding.severity === "medium").length;
  const lowCount = Math.min(findings.filter((finding) => finding.severity === "low").length, MAX_LOW_FINDINGS_COUNTED);
  const costHighCount = costs.filter((cost) => cost.level === "Yüksek").length;
  const costMediumCount = costs.filter((cost) => cost.level === "Orta").length;
  const hasMissingInfo = completeness.missing.length > 0;

  let low =
    BASE_LOW +
    highCount * HIGH_FINDING_STEP * 0.5 +
    mediumCount * MEDIUM_FINDING_STEP * 0.5 +
    costHighCount * COST_HIGH_STEP * 0.5 +
    costMediumCount * COST_MEDIUM_STEP * 0.5 +
    (hasMissingInfo ? MISSING_INFO_FLAT * 0.5 : 0);

  let high =
    BASE_HIGH +
    highCount * HIGH_FINDING_STEP +
    mediumCount * MEDIUM_FINDING_STEP +
    lowCount * LOW_FINDING_STEP +
    costHighCount * COST_HIGH_STEP +
    costMediumCount * COST_MEDIUM_STEP +
    (hasMissingInfo ? MISSING_INFO_FLAT : 0);

  low = clampPercent(low, MAX_DISCOUNT_LOW);
  high = clampPercent(Math.max(high, low + MIN_SPREAD), MAX_DISCOUNT_HIGH);

  const price = listingPrice > 0 ? listingPrice : 0;
  const suggestedOfferLow = price > 0 ? roundToNearest100(price * (1 - high)) : 0;
  const suggestedOfferHigh = price > 0 ? roundToNearest100(price * (1 - low)) : 0;

  return {
    listingPrice: price,
    discountPercentLow: low,
    discountPercentHigh: high,
    suggestedOfferLow,
    suggestedOfferHigh,
    reasons: buildReasons(findings, costs, completeness),
  };
}
