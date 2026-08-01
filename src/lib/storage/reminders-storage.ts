"use client";

import { appConfig } from "@/lib/constants/app";
import { advanceIfPast } from "@/lib/reminders/model";
import type { ReminderRecord } from "@/lib/reminders/types";

function isReminderRecord(value: unknown): value is ReminderRecord {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.category === "string" &&
    typeof record.title === "string" &&
    typeof record.dueDate === "string" &&
    typeof record.recurrence === "string" &&
    Array.isArray(record.history) &&
    typeof record.createdAt === "string"
  );
}

function readRaw(): ReminderRecord[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(appConfig.remindersStorageKey);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isReminderRecord);
  } catch {
    window.localStorage.removeItem(appConfig.remindersStorageKey);
    return [];
  }
}

function writeRaw(records: ReminderRecord[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(appConfig.remindersStorageKey, JSON.stringify(records));
}

export function loadReminders(): ReminderRecord[] {
  const stored = readRaw();
  const now = new Date();
  const advanced = stored.map((record) => advanceIfPast(record, now));
  const changed = advanced.some((record, index) => record !== stored[index]);
  if (changed) writeRaw(advanced);
  return advanced;
}

export function upsertReminder(record: ReminderRecord): ReminderRecord[] {
  const current = readRaw();
  const index = current.findIndex((item) => item.id === record.id);
  const next = index === -1 ? [...current, record] : current.map((item, i) => (i === index ? record : item));
  writeRaw(next);
  return next;
}

export function deleteReminder(id: string): ReminderRecord[] {
  const next = readRaw().filter((item) => item.id !== id);
  writeRaw(next);
  return next;
}

export function createReminderId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `reminder-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
