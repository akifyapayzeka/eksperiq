import { describe, expect, it } from "vitest";
import { EKSPERIQ_PLAN_PRICING } from "@/lib/pro/pricing";
import { DEFAULT_BILLING_PERIOD, yearlyFreeMonths, yearlySavingsPercent } from "@/lib/pro/billing-period";

/**
 * Paywall'da yıllık planın avantajı hiç sayıyla söylenmiyordu ("Yıllık
 * (indirimli)") ve varsayılan seçim aylıktı. Buradaki tasarruf iddiası
 * uydurma bir pazarlama rakamı değil, pricing.ts'in kendi tanımından
 * (yıllık = 10 aylık ödeme) türetiliyor; bu test iddianın gerçek fiyatlarla
 * tutarlı kalmasını kilitler — fiyat yapısı değişirse burada kırılır.
 */

describe("yıllık plan avantajı", () => {
  it("tasarruf oranı gerçek fiyatlardan hesaplanır, sabit yazılmaz", () => {
    for (const plan of Object.values(EKSPERIQ_PLAN_PRICING)) {
      const twelveMonths = plan.monthlyPriceTry * 12;
      const expected = Math.round((1 - plan.yearlyPriceTry / twelveMonths) * 100);
      expect(yearlySavingsPercent(plan)).toBe(expected);
    }
  });

  it("Pro için tasarruf %17 ve 2 ay bedavaya denk gelir", () => {
    const pro = EKSPERIQ_PLAN_PRICING.pro;
    expect(yearlySavingsPercent(pro)).toBe(17);
    expect(yearlyFreeMonths(pro)).toBe(2);
  });

  it("her iki pakette de yıllık, 12 aylık ödemeden ucuzdur", () => {
    for (const plan of Object.values(EKSPERIQ_PLAN_PRICING)) {
      expect(plan.yearlyPriceTry).toBeLessThan(plan.monthlyPriceTry * 12);
      expect(yearlySavingsPercent(plan)).toBeGreaterThan(0);
    }
  });

  it("paywall varsayılanı yıllıktır", () => {
    expect(DEFAULT_BILLING_PERIOD).toBe("yearly");
  });
});
