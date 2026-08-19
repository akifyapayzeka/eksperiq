"use client";

import { useSyncExternalStore } from "react";
import type { ImportStage } from "./import-listing";
import type { ListingImportResult } from "./types";

export type ImportSessionStatus = "idle" | "loading" | "success" | "error";

export type ImportSession = {
  url: string;
  status: ImportSessionStatus;
  stage: ImportStage | null;
  /** When `stage` last changed — drives the smooth simulated progress percentage (see progress.ts). */
  stageStartedAt: string | null;
  errorMessage: string;
  errorDetail: string;
  result: ListingImportResult | null;
};

const initialSession: ImportSession = {
  url: "",
  status: "idle",
  stage: null,
  stageStartedAt: null,
  errorMessage: "",
  errorDetail: "",
  result: null,
};

/**
 * Module-level (not React state) so an in-progress import survives client-side
 * navigation between tabs/pages — it only resets when the app process itself
 * restarts, which clears this module along with the rest of the JS heap.
 */
let session: ImportSession = initialSession;
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

export function getImportSession(): ImportSession {
  return session;
}

export function setImportSession(patch: Partial<ImportSession>): void {
  session = { ...session, ...patch };
  emit();
}

export function resetImportSession(): void {
  session = initialSession;
  emit();
}

function subscribeImportSession(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useImportSession(): ImportSession {
  return useSyncExternalStore(subscribeImportSession, getImportSession, () => initialSession);
}
