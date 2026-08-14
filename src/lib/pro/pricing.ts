export type EksperIqPaidPlanId = "pro" | "proPlus";

export interface EksperIqPlanPricing {
  id: EksperIqPaidPlanId;
  name: string;
  productId: string;
  monthlyOperatingCostTry: number;
  monthlyPriceTry: number;
  yearlyPriceTry: number;
  includedAiPhotoAnalyses: number;
  notes: string;
}

const COST_MULTIPLE = 5;

function plan(input: Omit<EksperIqPlanPricing, "monthlyPriceTry" | "yearlyPriceTry">): EksperIqPlanPricing {
  const monthlyPriceTry = input.monthlyOperatingCostTry * COST_MULTIPLE;
  return {
    ...input,
    monthlyPriceTry,
    yearlyPriceTry: monthlyPriceTry * 12,
  };
}

export const EKSPERIQ_COST_MULTIPLE = COST_MULTIPLE;

export const EKSPERIQ_PLAN_PRICING: Record<EksperIqPaidPlanId, EksperIqPlanPricing> = {
  pro: plan({
    id: "pro",
    name: "EksperIQ Pro",
    productId: "com.eksperiq.app.pro.monthly",
    monthlyOperatingCostTry: 44,
    includedAiPhotoAnalyses: 50,
    notes:
      "Free model uzerine daha yuksek limit, PDF rapor ve kayitli analiz akislari. AI maliyeti ve temel altyapi payi dahil.",
  }),
  proPlus: plan({
    id: "proPlus",
    name: "EksperIQ Pro+",
    productId: "com.eksperiq.app.proplus.monthly",
    monthlyOperatingCostTry: 200,
    includedAiPhotoAnalyses: 200,
    notes:
      "Yogun kullanici icin daha guclu gorsel AI modeli, yuksek analiz limiti ve profesyonel rapor/export payi dahil.",
  }),
};

export function formatTry(amount: number): string {
  return `${amount.toLocaleString("tr-TR")} TL`;
}
