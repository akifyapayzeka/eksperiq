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

export function riskLevel(score: number) {
  return RISK_LEVELS.find((level) => score >= level.min && score <= level.max) ?? RISK_LEVELS[RISK_LEVELS.length - 1];
}
