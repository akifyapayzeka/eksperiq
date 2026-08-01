"use client";

import { appConfig } from "@/lib/constants/app";

export function saveTestDriveChecklist(items: string[]): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(appConfig.testDriveChecklistStorageKey, JSON.stringify(items));
}

export function loadTestDriveChecklist(validItems: string[]): string[] {
  if (typeof window === "undefined") return [];
  const raw = window.sessionStorage.getItem(appConfig.testDriveChecklistStorageKey);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const valid = new Set(validItems);
    return parsed.filter((item): item is string => typeof item === "string" && valid.has(item));
  } catch {
    window.sessionStorage.removeItem(appConfig.testDriveChecklistStorageKey);
    return [];
  }
}
