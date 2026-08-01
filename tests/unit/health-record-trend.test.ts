import { describe, expect, it } from "vitest";
import { scoreTrend } from "@/lib/health-record/model";
import type { HealthRecord } from "@/lib/health-record/types";

function makeRecord(overrides: Partial<HealthRecord>): HealthRecord {
  return {
    id: "r1",
    type: "Sağlık Skoru",
    title: "Analiz skoru",
    detail: "",
    date: "2026-08-01",
    createdAt: "2026-08-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("scoreTrend", () => {
  it("excludes records without a score", () => {
    const records = [makeRecord({ id: "a", score: 70 }), makeRecord({ id: "b", score: undefined })];
    expect(scoreTrend(records)).toEqual([{ date: "2026-08-01", score: 70 }]);
  });

  it("sorts points chronologically regardless of input order", () => {
    const records = [
      makeRecord({ id: "a", date: "2026-08-10", score: 60 }),
      makeRecord({ id: "b", date: "2026-06-01", score: 40 }),
      makeRecord({ id: "c", date: "2026-07-15", score: 55 }),
    ];

    expect(scoreTrend(records)).toEqual([
      { date: "2026-06-01", score: 40 },
      { date: "2026-07-15", score: 55 },
      { date: "2026-08-10", score: 60 },
    ]);
  });

  it("returns an empty list when there are no scored records", () => {
    expect(scoreTrend([makeRecord({ score: undefined })])).toEqual([]);
  });
});
