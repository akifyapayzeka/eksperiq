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
    expect(getListingAnalysisLimit("free")).toBe(3);
    expect(getListingAnalysisLimit("pro")).toBe(20);
    expect(getListingAnalysisLimit("proPlus")).toBe(Number.POSITIVE_INFINITY);
    expect(formatListingAnalysisLimit("free")).toBe("3");
    expect(formatListingAnalysisLimit("pro")).toBe("20");
    expect(formatListingAnalysisLimit("proPlus")).toBe("Sınırsız");
  });

  it("her ücretli paket ücretsizden kesinlikle daha fazlasını verir", () => {
    // Bu değişmez olmadan, ücretsiz limiti geçici olarak yükseltilmiş bir
    // sürüm sessizce yayına çıkabiliyordu: paywall ücretsiz kartta "1000",
    // Pro kartında "20" gösteriyordu — yani ücretli paket ücretsizden az
    // görünüyordu ve ücretsiz kullanıcı paywall'a hiç çarpmıyordu.
    // Eski test limiti canlı sabitten okuduğu için bunu yakalayamıyordu.
    const free = getListingAnalysisLimit("free");
    const pro = getListingAnalysisLimit("pro");
    const proPlus = getListingAnalysisLimit("proPlus");

    expect(free).toBeLessThan(pro);
    expect(pro).toBeLessThan(proPlus);
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
