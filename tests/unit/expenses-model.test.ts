import { describe, expect, it } from "vitest";
import { approximateCostPerKm, monthlyTotals, totalAmount, totalByCategory } from "@/lib/expenses/model";
import type { ExpenseRecord } from "@/lib/expenses/types";

function makeRecord(overrides: Partial<ExpenseRecord>): ExpenseRecord {
  return {
    id: "e1",
    category: "yakit",
    amount: 1000,
    date: "2026-08-01",
    createdAt: "2026-08-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("monthlyTotals", () => {
  it("sums amounts per month and fills months with no records as zero", () => {
    const records = [
      makeRecord({ id: "a", date: "2026-08-05", amount: 500 }),
      makeRecord({ id: "b", date: "2026-08-20", amount: 300 }),
      makeRecord({ id: "c", date: "2026-07-01", amount: 200 }),
    ];

    const totals = monthlyTotals(records, 3, new Date("2026-08-15T00:00:00"));
    expect(totals).toHaveLength(3);
    expect(totals.map((month) => month.monthKey)).toEqual(["2026-06", "2026-07", "2026-08"]);
    expect(totals.reduce((sum, month) => sum + month.total, 0)).toBe(1000);
    expect(totals.find((month) => month.monthKey === "2026-08")?.total).toBe(800);
    expect(totals.find((month) => month.monthKey === "2026-07")?.total).toBe(200);
    expect(totals.find((month) => month.monthKey === "2026-06")?.total).toBe(0);
  });
});

describe("totalByCategory", () => {
  it("groups totals by category", () => {
    const records = [
      makeRecord({ id: "a", category: "yakit", amount: 500 }),
      makeRecord({ id: "b", category: "bakim", amount: 300 }),
      makeRecord({ id: "c", category: "yakit", amount: 200 }),
    ];

    expect(totalByCategory(records)).toEqual({ yakit: 700, bakim: 300 });
  });
});

describe("totalAmount", () => {
  it("sums every record regardless of category", () => {
    const records = [makeRecord({ amount: 100 }), makeRecord({ id: "b", amount: 250 })];
    expect(totalAmount(records)).toBe(350);
  });
});

describe("approximateCostPerKm", () => {
  it("returns null when fewer than two odometer readings exist", () => {
    expect(approximateCostPerKm([makeRecord({ odometer: 1000 })])).toBeNull();
    expect(approximateCostPerKm([makeRecord({})])).toBeNull();
  });

  it("divides total spend by the odometer range once at least two readings exist", () => {
    const records = [
      makeRecord({ id: "a", amount: 1000, odometer: 10000 }),
      makeRecord({ id: "b", amount: 500, odometer: 10500 }),
      makeRecord({ id: "c", amount: 300 }),
    ];

    expect(approximateCostPerKm(records)).toBeCloseTo(1800 / 500, 5);
  });

  it("returns null when the odometer readings do not span any distance", () => {
    const records = [makeRecord({ id: "a", odometer: 5000 }), makeRecord({ id: "b", odometer: 5000 })];
    expect(approximateCostPerKm(records)).toBeNull();
  });
});
