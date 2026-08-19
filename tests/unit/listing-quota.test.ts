import { beforeEach, describe, expect, it } from "vitest";
import {
  getListingAnalysesUsed,
  getListingAnalysisLimit,
  hasListingAnalysisQuotaRemaining,
  recordListingAnalysisUsed,
} from "@/lib/pro/listing-quota";

describe("listing analysis quota", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("exposes the real (non-marketing) numeric limits per tier", () => {
    expect(getListingAnalysisLimit("free")).toBe(3);
    expect(getListingAnalysisLimit("pro")).toBe(20);
    expect(getListingAnalysisLimit("proPlus")).toBe(50);
  });

  it("free tier gets exactly 3 lifetime analyses, never resetting", () => {
    expect(hasListingAnalysisQuotaRemaining("free")).toBe(true);
    recordListingAnalysisUsed();
    recordListingAnalysisUsed();
    expect(getListingAnalysesUsed("free")).toBe(2);
    expect(hasListingAnalysisQuotaRemaining("free")).toBe(true);
    recordListingAnalysisUsed();
    expect(getListingAnalysesUsed("free")).toBe(3);
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
