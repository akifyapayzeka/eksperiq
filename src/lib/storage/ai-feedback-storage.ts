"use client";

import { appConfig } from "@/lib/constants/app";

const aiNoteFeedbackKey = `${appConfig.storageKey}:ai-note-feedback`;
const validFeedbackValues = ["helpful", "needs-improvement"] as const;

export type AiNoteFeedback = (typeof validFeedbackValues)[number];

export function saveAiNoteFeedback(value: AiNoteFeedback): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(aiNoteFeedbackKey, value);
}

export function loadAiNoteFeedback(): AiNoteFeedback | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(aiNoteFeedbackKey);
  if (!raw) return null;
  if (validFeedbackValues.includes(raw as AiNoteFeedback)) return raw as AiNoteFeedback;
  sessionStorage.removeItem(aiNoteFeedbackKey);
  return null;
}

export function clearAiNoteFeedback(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(aiNoteFeedbackKey);
}
