import { RISK_LEVELS, SCORE_WEIGHTS } from "@/lib/constants/analysis";
import type { AnalysisFinding, ScoreBreakdown, ScoreCategory } from "./types";

const severityPenalty = {
  low: 2,
  medium: 5,
  high: 10,
} as const;

const categoryMap: Record<string, ScoreCategory> = {
  Hasar: "damageHistory",
  Bakım: "maintenance",
  Kilometre: "mileageAgeBalance",
  Açıklama: "descriptionTransparency",
  Evrak: "documentsExpertise",
  Satıcı: "sellerTrust",
};

export function emptyBreakdown(): ScoreBreakdown {
  return { ...SCORE_WEIGHTS };
}

export function scoreFindings(findings: AnalysisFinding[]): ScoreBreakdown {
  const scores = emptyBreakdown();
  for (const finding of findings) {
    const category = categoryMap[finding.category];
    if (!category) continue;
    scores[category] = Math.max(0, scores[category] - severityPenalty[finding.severity]);
  }
  return scores;
}

export function totalScore(breakdown: ScoreBreakdown): number {
  return Object.values(breakdown).reduce((sum, value) => sum + value, 0);
}

const DIKKATLI_INCELENMELI_FLOOR = 60;

/**
 * "Yüksek risk"/"Çok yüksek risk" are alarming, almost-never-buy labels —
 * they should only ever be shown when the listing actually has a real,
 * severe red flag (ağır hasar, şasi/podye, airbag, pert, komple boya vb.).
 * Without gating, a pile of unrelated low/medium findings across different
 * categories (a short description, a claim phrase, one missing document)
 * could drag the score into this band on a car with no serious issue at
 * all — which is exactly what made every report feel like "don't buy this"
 * regardless of what was actually wrong with it (2026-08-24). The numeric
 * score is left untouched for transparency; only the label/decision is
 * capped at "Dikkatli incelenmeli" when no finding actually earns worse.
 */
export function riskLevel(score: number, findings: AnalysisFinding[] = []) {
  const computed =
    RISK_LEVELS.find((level) => score >= level.min && score <= level.max) ?? RISK_LEVELS[RISK_LEVELS.length - 1];
  if (computed.min < DIKKATLI_INCELENMELI_FLOOR && !findings.some((finding) => finding.severity === "high")) {
    return RISK_LEVELS.find((level) => level.min === DIKKATLI_INCELENMELI_FLOOR) ?? computed;
  }
  return computed;
}
