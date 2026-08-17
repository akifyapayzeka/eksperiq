"use client";

import { appConfig } from "@/lib/constants/app";
import { recordProductEvent } from "@/lib/analytics/productEvents";
import type { ExpenseRecord } from "@/lib/expenses/types";

function isExpenseRecord(value: unknown): value is ExpenseRecord {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.category === "string" &&
    typeof record.amount === "number" &&
    typeof record.date === "string" &&
    typeof record.createdAt === "string"
  );
}

function readRaw(): ExpenseRecord[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(appConfig.expensesStorageKey);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isExpenseRecord);
  } catch {
    window.localStorage.removeItem(appConfig.expensesStorageKey);
    return [];
  }
}

function writeRaw(records: ExpenseRecord[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(appConfig.expensesStorageKey, JSON.stringify(records));
}

export function loadExpenses(): ExpenseRecord[] {
  return readRaw();
}

export function upsertExpense(record: ExpenseRecord): ExpenseRecord[] {
  const current = readRaw();
  const index = current.findIndex((item) => item.id === record.id);
  const next = index === -1 ? [...current, record] : current.map((item, i) => (i === index ? record : item));
  writeRaw(next);
  recordProductEvent("expense_record_saved", {
    category: record.category,
    hasOdometer: typeof record.odometer === "number",
    hasVehicle: typeof record.vehicleId === "string",
  });
  return next;
}

export function deleteExpense(id: string): ExpenseRecord[] {
  const next = readRaw().filter((item) => item.id !== id);
  writeRaw(next);
  return next;
}

export function createExpenseId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `expense-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
