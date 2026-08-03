export type RiskBucket = "high" | "medium" | "low";

export function riskBucket(score: number): RiskBucket {
  if (score >= 80) return "low";
  if (score >= 60) return "medium";
  return "high";
}
