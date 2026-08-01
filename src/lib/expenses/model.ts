import type { ExpenseCategory, ExpenseRecord } from "./types";

export type MonthlyTotal = {
  monthKey: string;
  label: string;
  total: number;
};

const monthLabels = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

export function monthKey(dateIso: string): string {
  return dateIso.slice(0, 7);
}

function monthLabel(key: string): string {
  const [year, month] = key.split("-");
  const monthIndex = Number.parseInt(month ?? "1", 10) - 1;
  return `${monthLabels[monthIndex] ?? month} ${year?.slice(2)}`;
}

export function monthlyTotals(records: ExpenseRecord[], monthsBack = 12, now: Date = new Date()): MonthlyTotal[] {
  const keys: string[] = [];
  for (let i = monthsBack - 1; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`);
  }

  const totalsByKey = new Map<string, number>();
  for (const record of records) {
    const key = monthKey(record.date);
    totalsByKey.set(key, (totalsByKey.get(key) ?? 0) + record.amount);
  }

  return keys.map((key) => ({
    monthKey: key,
    label: monthLabel(key),
    total: totalsByKey.get(key) ?? 0,
  }));
}

export function totalByCategory(records: ExpenseRecord[]): Partial<Record<ExpenseCategory, number>> {
  const totals: Partial<Record<ExpenseCategory, number>> = {};
  for (const record of records) {
    totals[record.category] = (totals[record.category] ?? 0) + record.amount;
  }
  return totals;
}

export function totalAmount(records: ExpenseRecord[]): number {
  return records.reduce((sum, record) => sum + record.amount, 0);
}

export function approximateCostPerKm(records: ExpenseRecord[]): number | null {
  const odometerReadings = records
    .map((record) => record.odometer)
    .filter((value): value is number => typeof value === "number");

  if (odometerReadings.length < 2) return null;

  const distance = Math.max(...odometerReadings) - Math.min(...odometerReadings);
  if (distance <= 0) return null;

  return totalAmount(records) / distance;
}
