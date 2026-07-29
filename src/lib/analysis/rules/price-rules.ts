import { HIGH_TRAMER_PRICE_RATIO, MEDIUM_TRAMER_PRICE_RATIO } from "@/lib/constants/analysis";
import type { VehicleFormData } from "@/lib/schemas/vehicle";
import type { AnalysisFinding } from "../types";

export function priceRules(input: VehicleFormData): AnalysisFinding[] {
  const findings: AnalysisFinding[] = [];
  if (input.price <= 0 || input.tramerAmount <= 0) return findings;

  const tramerRatio = input.tramerAmount / input.price;

  if (tramerRatio >= HIGH_TRAMER_PRICE_RATIO) {
    findings.push({
      id: "high-tramer-price-ratio",
      category: "Hasar",
      severity: "high",
      title: "Tramer tutarı ilan fiyatına göre çok yüksek",
      explanation:
        "Tramer tutarı aracın ilan fiyatının önemli bir bölümüne denk geliyor. Bu oran, hasarın kapsamını anlamayı daha kritik hale getirir.",
      recommendation:
        "Hasar tarihlerini, parça listesini, onarım faturasını ve bağımsız ekspertiz bulgularını birlikte değerlendirin.",
    });
    return findings;
  }

  if (tramerRatio >= MEDIUM_TRAMER_PRICE_RATIO) {
    findings.push({
      id: "medium-tramer-price-ratio",
      category: "Hasar",
      severity: "medium",
      title: "Tramer tutarı fiyatla birlikte incelenmeli",
      explanation:
        "Tramer tutarı ilan fiyatına göre dikkat çekici seviyede. Tek başına karar verdirmez, ancak hasar detayı görülmeden yorumlanmamalıdır.",
      recommendation: "Tramer detay belgesini isteyin ve hasar tutarını değişen/boyalı parça listesiyle karşılaştırın.",
    });
  }

  return findings;
}
