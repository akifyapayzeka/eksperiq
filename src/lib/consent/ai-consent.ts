"use client";

const AI_CONSENT_KEY = "eksperiq:ai-consent-accepted";

/**
 * Captured once at the sign-in/onboarding gate (KVKK + gizlilik + AI veri
 * işleme onayı) instead of re-asking on every AI screen. AI feature pages
 * still send aiProviderConsent:true with each request — this only controls
 * whether the UI needs to show its own consent checkbox first.
 */
export function hasAcceptedAiConsent(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(AI_CONSENT_KEY) === "true";
}

export function acceptAiConsent(): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AI_CONSENT_KEY, "true");
}
