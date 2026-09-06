import { describe, expect, it } from "vitest";
import { EXPECTED_GROUP_LEVEL, PLAN_GROUP_LEVEL, expectedGroupLevel } from "../../scripts/lib/subscription-levels.mjs";
import { EKSPERIQ_PLAN_PRICING } from "@/lib/pro/pricing";
import { BILLING_PERIODS, productIdForPeriod } from "@/lib/pro/billing-period";
import { ALL_PRODUCT_IDS } from "@/lib/pro/subscription-manager";

/**
 * App Store'da "Subscription Level" yükseltme/düşürme yönünü belirler: level 1
 * en üst kademe, üst kademeye geçiş anında uygulanır, alt kademeye geçiş dönem
 * sonuna ertelenir. Haftalık ürünler App Store Connect'te yanlış level'la
 * (Pro haftalık=3, Pro+ haftalık=4) oluşturulmuştu; bu haliyle Pro abonesi Pro+
 * satın aldığında Apple bunu "düşürme" sayıp geçişi erteliyordu — kullanıcı
 * ödediği şeyi hemen alamıyordu. Kontrol betiği bunu yalnızca WARNING olarak
 * yazıp yeşil geçiyordu; artık kapıyı kırmızıya çeviriyor. Bu test de politikayı
 * uygulamanın kendi ürün listesine bağlar: yeni bir dönem/paket eklendiğinde
 * level tablosuna girmeyi unutmak burada patlar.
 */

/** Tanımsız level'ı sessizce geçirmemek için: bilinmeyen ürün testi patlatır. */
function levelOf(productId: string): number {
  const level = expectedGroupLevel(productId);
  if (typeof level !== "number") throw new Error(`${productId} icin beklenen level tanimli degil`);
  return level;
}

describe("abonelik grubu level politikası", () => {
  it("uygulamanın sattığı her ürünün beklenen bir level'ı vardır", () => {
    for (const productId of ALL_PRODUCT_IDS) {
      expect(expectedGroupLevel(productId), productId).toBeTypeOf("number");
    }
    expect(Object.keys(EXPECTED_GROUP_LEVEL).sort()).toEqual([...ALL_PRODUCT_IDS].sort());
  });

  it("aynı paketin bütün dönemleri aynı level'dadır — dönem değişimi anında geçmeli", () => {
    for (const plan of Object.values(EKSPERIQ_PLAN_PRICING)) {
      const levels = BILLING_PERIODS.map((period) => levelOf(productIdForPeriod(plan, period)));
      expect(new Set(levels).size, `${plan.id} dönemleri farklı level'da`).toBe(1);
    }
  });

  it("Pro+ her zaman Pro'nun üstündedir (daha küçük level = daha üst kademe)", () => {
    expect(PLAN_GROUP_LEVEL.proPlus).toBeLessThan(PLAN_GROUP_LEVEL.pro);
    for (const period of BILLING_PERIODS) {
      const proPlus = levelOf(productIdForPeriod(EKSPERIQ_PLAN_PRICING.proPlus, period));
      const pro = levelOf(productIdForPeriod(EKSPERIQ_PLAN_PRICING.pro, period));
      expect(proPlus, `${period}: Pro+ level Pro'nun altında`).toBeLessThan(pro);
    }
  });

  it("daha pahalı paket daha üst kademededir", () => {
    const { pro, proPlus } = EKSPERIQ_PLAN_PRICING;
    expect(proPlus.monthlyPriceTry).toBeGreaterThan(pro.monthlyPriceTry);
    expect(levelOf(proPlus.monthlyProductId)).toBeLessThan(levelOf(pro.monthlyProductId));
  });
});
