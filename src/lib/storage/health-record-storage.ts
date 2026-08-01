"use client";

import { appConfig } from "@/lib/constants/app";
import type { HealthRecord } from "@/lib/health-record/types";

function isHealthRecord(value: unknown): value is HealthRecord {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.type === "string" &&
    typeof record.title === "string" &&
    typeof record.date === "string" &&
    typeof record.createdAt === "string"
  );
}

function readRaw(): HealthRecord[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(appConfig.healthRecordStorageKey);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isHealthRecord);
  } catch {
    window.localStorage.removeItem(appConfig.healthRecordStorageKey);
    return [];
  }
}

function writeRaw(records: HealthRecord[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(appConfig.healthRecordStorageKey, JSON.stringify(records));
}

export function loadHealthRecords(): HealthRecord[] {
  return readRaw();
}

export function upsertHealthRecord(record: HealthRecord): HealthRecord[] {
  const current = readRaw();
  const index = current.findIndex((item) => item.id === record.id);
  const next = index === -1 ? [...current, record] : current.map((item, i) => (i === index ? record : item));
  writeRaw(next);
  return next;
}

export function deleteHealthRecord(id: string): HealthRecord[] {
  const next = readRaw().filter((item) => item.id !== id);
  writeRaw(next);
  return next;
}

export function createHealthRecordId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `health-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
