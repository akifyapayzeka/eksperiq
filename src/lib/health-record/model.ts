import type { HealthRecord } from "./types";

export type ScorePoint = {
  date: string;
  score: number;
};

export function scoreTrend(records: HealthRecord[]): ScorePoint[] {
  return records
    .filter((record): record is HealthRecord & { score: number } => typeof record.score === "number")
    .map((record) => ({ date: record.date, score: record.score }))
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}
