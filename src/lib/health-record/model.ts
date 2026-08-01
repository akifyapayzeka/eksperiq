import type { HealthRecord } from "./types";

export type ScorePoint = {
  id: string;
  date: string;
  score: number;
};

export function scoreTrend(records: HealthRecord[]): ScorePoint[] {
  return records
    .filter((record): record is HealthRecord & { score: number } => typeof record.score === "number")
    .map((record) => ({ id: record.id, date: record.date, score: record.score }))
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}
