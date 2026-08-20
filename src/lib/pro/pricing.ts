export type EksperIqPaidPlanId = "pro" | "proPlus";

export interface EksperIqPlanPricing {
  id: EksperIqPaidPlanId;
  name: string;
  /** App Store Connect subscription product id for the monthly period. */
  monthlyProductId: string;
  /** App Store Connect subscription product id for the yearly period. */
  yearlyProductId: string;
  monthlyOperatingCostTry: number;
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

function plan(
  input: Omit<EksperIqPlanPricing, "monthlyPriceTry" | "yearlyPriceTry">,
  costMultiple: number,
): EksperIqPlanPricing {
  const monthlyPriceTry = input.monthlyOperatingCostTry * costMultiple;
  return {
    ...input,
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
      monthlyProductId: "com.eksperiq.app.pro.monthly",
      yearlyProductId: "com.eksperiq.app.pro.yearly",
      monthlyOperatingCostTry: 44,
      notes:
        "Aylik 20 ilan linki analizi, PDF rapor ve kayitli analiz akislari. Fotograf hasar kontrolu tum planlarda ayni ucretsiz gorsel AI modeliyle sunulur.",
    },
    PRO_COST_MULTIPLE,
  ),
  proPlus: plan(
    {
      id: "proPlus",
      name: "EksperIQ Pro+",
      monthlyProductId: "com.eksperiq.app.proplus.monthly",
      yearlyProductId: "com.eksperiq.app.proplus.yearly",
      monthlyOperatingCostTry: 200,
      notes:
        "Yogun kullanici icin sinirsiz ilan linki analizi, profesyonel rapor/export payi ve kayitli analiz akislari. Fotograf hasar kontrolu tum planlarda ayni ucretsiz gorsel AI modeliyle sunulur.",
    },
    PRO_PLUS_COST_MULTIPLE,
  ),
};

export function formatTry(amount: number): string {
  return `${amount.toLocaleString("tr-TR")} TL`;
}
