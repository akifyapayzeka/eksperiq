"use client";

import type { SubscriptionTier } from "./tier";

const STORAGE_KEY = "eksperiq:listing-quota";

/**
 * Free is a lifetime cap (never resets, so it can't be reset by simply
 * waiting a month) — Pro and Pro+ are monthly caps. These are the real,
 * enforced numbers; the paywall shows Pro/Pro+ as multipliers ("5x"/"10x")
 * instead of these figures — see src/components/paywall/paywall-plans.tsx.
 */
const LISTING_ANALYSIS_LIMIT: Record<SubscriptionTier, number> = {
  free: 3,
  pro: 20,
  proPlus: 50,
};

type QuotaRecord = {
  /** Lifetime count — only the free tier's limit is checked against this. */
  lifetimeUsed: number;
  /** Current billing-period key ("YYYY-MM") the counter below applies to. */
  periodKey: string;
  /** Count within periodKey — only Pro/Pro+ limits are checked against this. */
  periodUsed: number;
};

function currentPeriodKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function readRecord(): QuotaRecord {
  if (typeof window === "undefined") return { lifetimeUsed: 0, periodKey: currentPeriodKey(), periodUsed: 0 };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { lifetimeUsed: 0, periodKey: currentPeriodKey(), periodUsed: 0 };
    const parsed = JSON.parse(raw) as Partial<QuotaRecord>;
    return {
      lifetimeUsed: typeof parsed.lifetimeUsed === "number" ? parsed.lifetimeUsed : 0,
      periodKey: typeof parsed.periodKey === "string" ? parsed.periodKey : currentPeriodKey(),
      periodUsed: typeof parsed.periodUsed === "number" ? parsed.periodUsed : 0,
    };
  } catch {
    return { lifetimeUsed: 0, periodKey: currentPeriodKey(), periodUsed: 0 };
  }
}

function writeRecord(record: QuotaRecord): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
}

export function getListingAnalysisLimit(tier: SubscriptionTier): number {
  return LISTING_ANALYSIS_LIMIT[tier];
}

/** How many listing analyses count against the given tier's limit right now. */
export function getListingAnalysesUsed(tier: SubscriptionTier): number {
  const record = readRecord();
  if (tier === "free") return record.lifetimeUsed;
  return record.periodKey === currentPeriodKey() ? record.periodUsed : 0;
}

export function hasListingAnalysisQuotaRemaining(tier: SubscriptionTier): boolean {
  return getListingAnalysesUsed(tier) < getListingAnalysisLimit(tier);
}

/** Call once a listing analysis has actually been produced (not on every form open/attempt). */
export function recordListingAnalysisUsed(): void {
  const record = readRecord();
  const period = currentPeriodKey();
  writeRecord({
    lifetimeUsed: record.lifetimeUsed + 1,
    periodKey: period,
    periodUsed: (record.periodKey === period ? record.periodUsed : 0) + 1,
  });
}
