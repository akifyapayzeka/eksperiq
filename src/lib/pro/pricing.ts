export type EksperIqPaidPlanId = "pro" | "proPlus";

export interface EksperIqPlanPricing {
  id: EksperIqPaidPlanId;
  name: string;
  /** App Store Connect subscription product id for the weekly period. */
  weeklyProductId: string;
  /** App Store Connect subscription product id for the monthly period. */
  monthlyProductId: string;
  /** App Store Connect subscription product id for the yearly period. */
  yearlyProductId: string;
  monthlyOperatingCostTry: number;
  weeklyPriceTry: number;
  monthlyPriceTry: number;
  yearlyPriceTry: number;
  notes: string;
}

const PRO_COST_MULTIPLE = 5;
// Aynı kar marjı Pro ile Pro+ arasında tutarlı olsun diye Pro ile aynı çarpan
// kullanılıyor — Pro+ zaten kendi (daha yüksek) işletme maliyeti üzerinden
// hesaplandığı için fiyatı otomatik olarak daha yüksek çıkıyor.
const PRO_PLUS_COST_MULTIPLE = PRO_COST_MULTIPLE;
// Yillik plan aylik fiyatin 12 kati yerine 10 kati: ~%17 indirim (2 ay bedava mantigi).
const YEARLY_MONTHS_EQUIVALENT = 10;
/**
 * Haftalık plan, araç arayan kullanıcının gerçek kullanım süresine göre var:
 * insanlar araba bakarken 1-2 hafta yoğun kullanıp bırakıyor, bir yıl boyunca
 * her ay ödemek istemiyor. Kısa taahhüt birim başına PAHALI olmalı, yoksa
 * aylık plan anlamsızlaşır: haftalık = aylığın yarısı, yani dört hafta
 * kullanmak aylık plandan belirgin biçimde pahalıya gelir ve uzun kullanacak
 * kullanıcı doğal olarak aylığa/yıllığa yönelir.
 */
const WEEKLY_MONTH_FRACTION = 0.5;

function plan(
  input: Omit<EksperIqPlanPricing, "weeklyPriceTry" | "monthlyPriceTry" | "yearlyPriceTry">,
  costMultiple: number,
): EksperIqPlanPricing {
  const monthlyPriceTry = input.monthlyOperatingCostTry * costMultiple;
  return {
    ...input,
    weeklyPriceTry: monthlyPriceTry * WEEKLY_MONTH_FRACTION,
    monthlyPriceTry,
    yearlyPriceTry: monthlyPriceTry * YEARLY_MONTHS_EQUIVALENT,
  };
}

export const EKSPERIQ_PRO_COST_MULTIPLE = PRO_COST_MULTIPLE;
export const EKSPERIQ_PRO_PLUS_COST_MULTIPLE = PRO_PLUS_COST_MULTIPLE;

export const EKSPERIQ_PLAN_PRICING: Record<EksperIqPaidPlanId, EksperIqPlanPricing> = {
  pro: plan(
    {
      id: "pro",
      name: "EksperIQ Pro",
      weeklyProductId: "com.eksperiq.app.pro.weekly",
      monthlyProductId: "com.eksperiq.app.pro.monthly",
      yearlyProductId: "com.eksperiq.app.pro.yearly",
      monthlyOperatingCostTry: 30,
      notes: "Aylik 20 arac analizi (ilan linki veya elle giris), PDF rapor ve kayitli analiz akislari.",
    },
    PRO_COST_MULTIPLE,
  ),
  proPlus: plan(
    {
      id: "proPlus",
      name: "EksperIQ Pro+",
      weeklyProductId: "com.eksperiq.app.proplus.weekly",
      monthlyProductId: "com.eksperiq.app.proplus.monthly",
      yearlyProductId: "com.eksperiq.app.proplus.yearly",
      monthlyOperatingCostTry: 80,
      notes:
        "Yogun kullanici icin sinirsiz arac analizi (ilan linki veya elle giris), profesyonel rapor/export payi ve kayitli analiz akislari.",
    },
    PRO_PLUS_COST_MULTIPLE,
  ),
};

export function formatTry(amount: number): string {
  return `${amount.toLocaleString("tr-TR")} TL`;
}
