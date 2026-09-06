import { describe, expect, it } from "vitest";
import { EKSPERIQ_PLAN_PRICING } from "@/lib/pro/pricing";
import {
  BILLING_PERIODS,
  DEFAULT_BILLING_PERIOD,
  productIdForPeriod,
  weeklyToMonthlyCostRatio,
  yearlyFreeMonths,
  yearlySavingsPercent,
} from "@/lib/pro/billing-period";
import { ALL_PRODUCT_IDS } from "@/lib/pro/subscription-manager";

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

describe("haftalık plan", () => {
  it("kısa taahhüt birim başına pahalıdır — aylık plan anlamsızlaşmaz", () => {
    for (const plan of Object.values(EKSPERIQ_PLAN_PRICING)) {
      // Dört hafta kullanmak, aylık plandan belirgin biçimde pahalıya gelmeli;
      // aksi halde herkes haftalığa geçer ve aylık/yıllık planların anlamı kalmaz.
      expect(weeklyToMonthlyCostRatio(plan)).toBeGreaterThan(1);
      expect(plan.weeklyPriceTry).toBeLessThan(plan.monthlyPriceTry);
    }
  });

  it("Pro haftalık 75 TL, dört haftası aylığın 2 katı", () => {
    const pro = EKSPERIQ_PLAN_PRICING.pro;
    expect(pro.weeklyPriceTry).toBe(75);
    expect(weeklyToMonthlyCostRatio(pro)).toBe(2);
  });

  it("her dönem için ayrı bir App Store ürün kimliği vardır", () => {
    for (const plan of Object.values(EKSPERIQ_PLAN_PRICING)) {
      const ids = BILLING_PERIODS.map((period) => productIdForPeriod(plan, period));
      expect(new Set(ids).size).toBe(BILLING_PERIODS.length);
      for (const id of ids) expect(ALL_PRODUCT_IDS).toContain(id);
    }
  });
});
