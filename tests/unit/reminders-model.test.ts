import { describe, expect, it } from "vitest";
import { advanceIfPast, daysUntil, defaultMtvReminders, sortByUrgency, urgencyOf } from "@/lib/reminders/model";
import type { ReminderRecord } from "@/lib/reminders/types";

function isoDaysFromNow(days: number, now: Date): string {
  const date = new Date(now);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function makeRecord(overrides: Partial<ReminderRecord>): ReminderRecord {
  return {
    id: "r1",
    category: "mtv",
    title: "MTV 1. taksit",
    dueDate: "2026-01-31",
    recurrence: "none",
    history: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("daysUntil", () => {
  const now = new Date("2026-08-01T12:00:00");

  it("returns 0 for today", () => {
    expect(daysUntil("2026-08-01", now)).toBe(0);
  });

  it("returns a positive count for future dates", () => {
    expect(daysUntil("2026-08-16", now)).toBe(15);
  });

  it("returns a negative count for past dates", () => {
    expect(daysUntil("2026-07-20", now)).toBe(-12);
  });
});

describe("urgencyOf", () => {
  it("classifies boundaries correctly", () => {
    expect(urgencyOf(-1)).toBe("overdue");
    expect(urgencyOf(0)).toBe("urgent");
    expect(urgencyOf(15)).toBe("urgent");
    expect(urgencyOf(16)).toBe("upcoming");
    expect(urgencyOf(30)).toBe("upcoming");
    expect(urgencyOf(31)).toBe("later");
  });
});

describe("sortByUrgency", () => {
  it("orders records from most overdue/soonest to furthest away", () => {
    const now = new Date("2026-08-01T12:00:00");
    const records = [
      makeRecord({ id: "far", dueDate: isoDaysFromNow(60, now) }),
      makeRecord({ id: "overdue", dueDate: isoDaysFromNow(-5, now) }),
      makeRecord({ id: "soon", dueDate: isoDaysFromNow(10, now) }),
    ];

    expect(sortByUrgency(records, now).map((r) => r.id)).toEqual(["overdue", "soon", "far"]);
  });
});

describe("advanceIfPast", () => {
  const now = new Date("2026-08-01T12:00:00");

  it("leaves non-recurring past-due records untouched", () => {
    const record = makeRecord({ recurrence: "none", dueDate: "2026-01-31", amount: 5000 });
    expect(advanceIfPast(record, now)).toEqual(record);
  });

  it("rolls a yearly reminder forward one year and archives the old amount", () => {
    const record = makeRecord({ recurrence: "yearly", dueDate: "2026-01-31", amount: 5000, history: [] });
    const result = advanceIfPast(record, now);

    expect(result.dueDate).toBe("2027-01-31");
    expect(result.amount).toBeUndefined();
    expect(result.history).toEqual([{ date: "2026-01-31", amount: 5000 }]);
  });

  it("rolls a semiannual reminder through multiple missed cycles", () => {
    const record = makeRecord({ recurrence: "semiannual", dueDate: "2025-01-31", amount: 2000, history: [] });
    const result = advanceIfPast(record, now);

    expect(daysUntil(result.dueDate, now)).toBeGreaterThanOrEqual(0);
    expect(result.history.length).toBeGreaterThan(1);
    expect(result.amount).toBeUndefined();
  });

  it("does not touch reminders that are still in the future", () => {
    const record = makeRecord({ recurrence: "yearly", dueDate: isoDaysFromNow(10, now), amount: 3000 });
    expect(advanceIfPast(record, now)).toEqual(record);
  });
});

describe("defaultMtvReminders", () => {
  it("picks this year's installment dates when they are still upcoming", () => {
    const now = new Date("2026-01-01T00:00:00");
    const reminders = defaultMtvReminders(now);

    expect(reminders).toEqual([
      { title: "MTV 1. taksit", category: "mtv", dueDate: "2026-01-31" },
      { title: "MTV 2. taksit", category: "mtv", dueDate: "2026-07-31" },
    ]);
  });

  it("rolls the first installment to next year once its date has passed", () => {
    const now = new Date("2026-08-01T00:00:00");
    const reminders = defaultMtvReminders(now);

    expect(reminders[0]?.dueDate).toBe("2027-01-31");
    expect(reminders[1]?.dueDate).toBe("2027-07-31");
  });
});
