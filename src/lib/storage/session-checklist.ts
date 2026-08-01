"use client";

export function createSessionChecklistStore(storageKey: string) {
  function save(items: string[]): void {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem(storageKey, JSON.stringify(items));
  }

  function load(validItems: string[]): string[] {
    if (typeof window === "undefined") return [];
    const raw = window.sessionStorage.getItem(storageKey);
    if (!raw) return [];
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      const valid = new Set(validItems);
      return parsed.filter((item): item is string => typeof item === "string" && valid.has(item));
    } catch {
      window.sessionStorage.removeItem(storageKey);
      return [];
    }
  }

  return { save, load };
}
