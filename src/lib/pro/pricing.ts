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
  includedAiPhotoAnalyses: number;
  notes: string;
}

const PRO_COST_MULTIPLE = 5;
const PRO_PLUS_COST_MULTIPLE = 8;
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
      includedAiPhotoAnalyses: 50,
      notes:
        "Free model uzerine daha yuksek limit, PDF rapor ve kayitli analiz akislari. Fotograf hasar kontrolunde en guclu modelin bir altindaki gorsel AI modeli kullanilir. AI maliyeti ve temel altyapi payi dahil.",
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
      includedAiPhotoAnalyses: 200,
      notes:
        "Yogun kullanici icin fotograf hasar kontrolunde en guclu gorsel AI modeli, yuksek analiz limiti ve profesyonel rapor/export payi dahil.",
    },
    PRO_PLUS_COST_MULTIPLE,
  ),
};

export function formatTry(amount: number): string {
  return `${amount.toLocaleString("tr-TR")} TL`;
}
