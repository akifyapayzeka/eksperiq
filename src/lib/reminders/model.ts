import type { ReminderCategory, ReminderRecord, ReminderRecurrence, ReminderUrgency } from "./types";

export const URGENT_WINDOW_DAYS = 15;
export const UPCOMING_WINDOW_DAYS = 30;
const MAX_HISTORY_ENTRIES = 5;

function parseIsoDate(value: string): Date {
  return new Date(`${value}T00:00:00`);
}

function formatIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function daysUntil(dueDate: string, now: Date = new Date()): number {
  const target = parseIsoDate(dueDate);
  if (Number.isNaN(target.getTime())) return Number.POSITIVE_INFINITY;
  return Math.round((startOfDay(target).getTime() - startOfDay(now).getTime()) / 86_400_000);
}

export function urgencyOf(days: number): ReminderUrgency {
  if (days < 0) return "overdue";
  if (days <= URGENT_WINDOW_DAYS) return "urgent";
  if (days <= UPCOMING_WINDOW_DAYS) return "upcoming";
  return "later";
}

export function sortByUrgency(records: ReminderRecord[], now: Date = new Date()): ReminderRecord[] {
  return [...records].sort((a, b) => daysUntil(a.dueDate, now) - daysUntil(b.dueDate, now));
}

function addInterval(date: Date, recurrence: Exclude<ReminderRecurrence, "none">): Date {
  const next = new Date(date);
  next.setMonth(next.getMonth() + (recurrence === "yearly" ? 12 : 6));
  return next;
}

export function advanceIfPast(record: ReminderRecord, now: Date = new Date()): ReminderRecord {
  if (record.recurrence === "none") return record;
  if (daysUntil(record.dueDate, now) >= 0) return record;

  const history = [...record.history];
  let nextDue = parseIsoDate(record.dueDate);

  while (daysUntil(formatIsoDate(nextDue), now) < 0) {
    history.unshift({ date: formatIsoDate(nextDue), amount: record.amount });
    nextDue = addInterval(nextDue, record.recurrence);
  }

  return {
    ...record,
    dueDate: formatIsoDate(nextDue),
    amount: undefined,
    history: history.slice(0, MAX_HISTORY_ENTRIES),
  };
}

export function crossesNotificationThreshold(daysBefore: number, thresholdDays: number): boolean {
  return daysBefore === thresholdDays;
}

const mtvDefaults = [
  { label: "MTV 1. taksit", month: 0, day: 31 },
  { label: "MTV 2. taksit", month: 6, day: 31 },
] as const;

export function defaultMtvReminders(now: Date = new Date()): Array<{
  title: string;
  category: ReminderCategory;
  dueDate: string;
}> {
  return mtvDefaults.map(({ label, month, day }) => {
    let year = now.getFullYear();
    let candidate = new Date(year, month, day);
    if (startOfDay(candidate).getTime() < startOfDay(now).getTime()) {
      year += 1;
      candidate = new Date(year, month, day);
    }
    return {
      title: label,
      category: "mtv" as const,
      dueDate: formatIsoDate(candidate),
    };
  });
}
