"use client";

/**
 * Varsayilan olarak oturumluk. `persistent: true` verilen listeler
 * `localStorage`'a yaziliyor: kullanicinin araç başında doldurdugu bir liste,
 * iOS uygulamayi bellek icin sonlandirdiginda kaybolmamali. Kalici yapilan
 * her liste ayni anda data-management/keys.ts'te de dogru tarafa
 * tasinmali — yoksa yedege girmez ve "tum verilerimi sil" onu yanlis
 * depodan silmeye calisir.
 */
export function createSessionChecklistStore(storageKey: string, options: { persistent?: boolean } = {}) {
  function storage(): Storage {
    return options.persistent ? window.localStorage : window.sessionStorage;
  }

  function save(items: string[]): void {
    if (typeof window === "undefined") return;
    storage().setItem(storageKey, JSON.stringify(items));
  }

  function load(validItems: string[]): string[] {
    if (typeof window === "undefined") return [];
    const raw = storage().getItem(storageKey);
    if (!raw) return [];
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      const valid = new Set(validItems);
      return parsed.filter((item): item is string => typeof item === "string" && valid.has(item));
    } catch {
      storage().removeItem(storageKey);
      return [];
    }
  }

  return { save, load };
}
