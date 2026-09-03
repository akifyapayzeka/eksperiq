import type { EksperIqPlanPricing } from "./pricing";

export type BillingPeriod = "monthly" | "yearly";

/**
 * Paywall açıldığında yıllık plan seçili gelir. Sektör ölçümleri, varsayılanı
 * yıllık yapan uygulamalarda yıllık seçim oranının belirgin biçimde yükseldiğini
 * ve yıllık abonelerin 12 aylık yaşam boyu değerinin aylıklara göre kat kat
 * yüksek olduğunu gösteriyor (aylık planın erken iptal uçurumundan kaçınıldığı
 * için). Aylık plan kaldırılmadı, tek dokunuşla seçilebiliyor.
 */
export const DEFAULT_BILLING_PERIOD: BillingPeriod = "yearly";

/**
 * Yıllık planın aylık plana göre yüzde tasarrufu — pazarlama için seçilmiş bir
 * sayı değil, planın kendi fiyatlarından hesaplanıyor. Fiyat yapısı değişirse
 * gösterilen oran da kendiliğinden değişir (tests/unit/yearly-savings.test.ts
 * bu bağı kilitliyor).
 */
export function yearlySavingsPercent(plan: EksperIqPlanPricing): number {
  const twelveMonths = plan.monthlyPriceTry * 12;
  if (twelveMonths <= 0) return 0;
  return Math.round((1 - plan.yearlyPriceTry / twelveMonths) * 100);
}

/** Aynı tasarrufun "kaç ay bedava" karşılığı — tam sayı değilse 0 döner (yuvarlak iddia etmemek için). */
export function yearlyFreeMonths(plan: EksperIqPlanPricing): number {
  if (plan.monthlyPriceTry <= 0) return 0;
  const savedMonths = (plan.monthlyPriceTry * 12 - plan.yearlyPriceTry) / plan.monthlyPriceTry;
  return Number.isInteger(savedMonths) ? savedMonths : 0;
}
