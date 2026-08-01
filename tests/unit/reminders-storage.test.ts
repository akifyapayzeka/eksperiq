import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createReminderId, deleteReminder, loadReminders, upsertReminder } from "@/lib/storage/reminders-storage";
import type { ReminderRecord } from "@/lib/reminders/types";

describe("reminders storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("adds and loads a reminder", () => {
    const record: ReminderRecord = {
      id: createReminderId(),
      category: "muayene",
      title: "Muayene",
      dueDate: "2026-09-01",
      recurrence: "none",
      history: [],
      createdAt: new Date().toISOString(),
    };

    upsertReminder(record);

    expect(loadReminders()).toEqual([record]);
  });

  it("removes a reminder", () => {
    const record: ReminderRecord = {
      id: createReminderId(),
      category: "bakim",
      title: "Bakım",
      dueDate: "2026-09-01",
      recurrence: "none",
      history: [],
      createdAt: new Date().toISOString(),
    };

    upsertReminder(record);
    deleteReminder(record.id);

    expect(loadReminders()).toEqual([]);
  });

  it("rolls a recurring reminder's due date forward and persists the change so it is not lost on next load", () => {
    const record: ReminderRecord = {
      id: createReminderId(),
      category: "mtv",
      title: "MTV 1. taksit",
      dueDate: "2026-01-31",
      recurrence: "yearly",
      history: [],
      createdAt: "2026-01-01T00:00:00.000Z",
    };
    upsertReminder(record);

    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 1));

    const advanced = loadReminders();
    expect(advanced).toHaveLength(1);
    expect(advanced[0].dueDate).toBe("2027-01-31");
    expect(advanced[0].history).toEqual([{ date: "2026-01-31", amount: undefined }]);

    vi.useRealTimers();
    const reloaded = loadReminders();
    expect(reloaded[0].dueDate).toBe("2027-01-31");
  });
});
