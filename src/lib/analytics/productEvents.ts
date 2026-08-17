"use client";

import { appConfig } from "@/lib/constants/app";

const MAX_EVENTS = 250;

export type ProductEventName =
  | "analysis_created"
  | "comparison_entry_added"
  | "photo_damage_analysis_saved"
  | "expense_record_saved"
  | "reminder_saved"
  | "data_exported";

export type ProductEventPayload = Record<string, boolean | number | string | null>;

export type ProductEvent = {
  id: string;
  name: ProductEventName;
  createdAt: string;
  payload: ProductEventPayload;
};

function createEventId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `event-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function isProductEvent(value: unknown): value is ProductEvent {
  if (typeof value !== "object" || value === null) return false;
  const event = value as Record<string, unknown>;
  return (
    typeof event.id === "string" &&
    typeof event.name === "string" &&
    typeof event.createdAt === "string" &&
    typeof event.payload === "object" &&
    event.payload !== null &&
    !Array.isArray(event.payload)
  );
}

export function loadProductEvents(): ProductEvent[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(appConfig.productEventsStorageKey);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isProductEvent);
  } catch {
    window.localStorage.removeItem(appConfig.productEventsStorageKey);
    return [];
  }
}

export function recordProductEvent(name: ProductEventName, payload: ProductEventPayload = {}): void {
  if (typeof window === "undefined") return;
  const event: ProductEvent = {
    id: createEventId(),
    name,
    createdAt: new Date().toISOString(),
    payload,
  };
  try {
    window.localStorage.setItem(
      appConfig.productEventsStorageKey,
      JSON.stringify([event, ...loadProductEvents()].slice(0, MAX_EVENTS)),
    );
  } catch {
    // Product metrics must never block the user's actual workflow.
  }
}
