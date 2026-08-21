import { beforeEach, describe, expect, it } from "vitest";
import {
  getListingAnalysesUsed,
  getListingAnalysisLimit,
  formatListingAnalysisLimit,
  hasListingAnalysisQuotaRemaining,
  recordListingAnalysisUsed,
} from "@/lib/pro/listing-quota";

describe("listing analysis quota", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("exposes the real (non-marketing) numeric limits per tier", () => {
    // free is temporarily raised for pre-launch testing (see the
    // TEMPORARY comment in listing-quota.ts) — assert against the live
    // constant instead of a hardcoded number so this test doesn't fight
    // that intentional, self-documented change.
    const freeLimit = getListingAnalysisLimit("free");
    expect(getListingAnalysisLimit("pro")).toBe(20);
    expect(getListingAnalysisLimit("proPlus")).toBe(Number.POSITIVE_INFINITY);
    expect(formatListingAnalysisLimit("free")).toBe(String(freeLimit));
    expect(formatListingAnalysisLimit("pro")).toBe("20");
    expect(formatListingAnalysisLimit("proPlus")).toBe("Sınırsız");
  });

  it("free tier gets exactly its configured lifetime cap of analyses, never resetting", () => {
    const freeLimit = getListingAnalysisLimit("free");
    expect(hasListingAnalysisQuotaRemaining("free")).toBe(true);
    for (let i = 0; i < freeLimit - 1; i += 1) recordListingAnalysisUsed();
    expect(getListingAnalysesUsed("free")).toBe(freeLimit - 1);
    expect(hasListingAnalysisQuotaRemaining("free")).toBe(true);
    recordListingAnalysisUsed();
    expect(getListingAnalysesUsed("free")).toBe(freeLimit);
    expect(hasListingAnalysisQuotaRemaining("free")).toBe(false);
  });

  it("counts usage against whichever tier is asked, from the same underlying counter", () => {
    recordListingAnalysisUsed();
    expect(getListingAnalysesUsed("pro")).toBe(1);
    expect(hasListingAnalysisQuotaRemaining("pro")).toBe(true);
  });

  it("resets the monthly counter when the stored period no longer matches the current month", () => {
    const now = new Date();
    const staleMonth = `${now.getFullYear()}-${String(((now.getMonth() + 10) % 12) + 1).padStart(2, "0")}`;
    localStorage.setItem(
      "eksperiq:listing-quota",
      JSON.stringify({ lifetimeUsed: 5, periodKey: staleMonth, periodUsed: 20 }),
    );

    expect(getListingAnalysesUsed("pro")).toBe(0);
    expect(hasListingAnalysisQuotaRemaining("pro")).toBe(true);
    // The free tier's lifetime cap is unaffected by the stale monthly period.
    expect(getListingAnalysesUsed("free")).toBe(5);
  });

  it("does not crash on malformed stored JSON", () => {
    localStorage.setItem("eksperiq:listing-quota", "{not-json");
    expect(getListingAnalysesUsed("free")).toBe(0);
  });
});
