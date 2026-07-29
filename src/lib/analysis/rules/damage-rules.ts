import { HIGH_TRAMER_AMOUNT } from "@/lib/constants/analysis";
import type { VehicleFormData } from "@/lib/schemas/vehicle";
import type { AnalysisFinding } from "../types";

function partCount(value?: string): number {
  if (!value) return 0;
  return value
    .split(/,|\n|;/)
    .map((part) => part.trim())
    .filter(Boolean).length;
}

export function damageRules(input: VehicleFormData): AnalysisFinding[] {
  const findings: AnalysisFinding[] = [];
  if (input.hasHeavyDamage)
    findings.push({
      id: "heavy-damage",
      category: "Hasar",
      severity: "high",
      title: "Ağır hasar kaydı belirtilmiş",
      explanation: "Ağır hasar kaydı aracın güvenlik, değer ve satılabilirlik riskini artırır.",
      recommendation: "Hasar tarihini, kapsamını ve onarım belgelerini bağımsız ekspertizde doğrulayın.",
    });
  if (input.hasChassisRepair)
    findings.push({
      id: "chassis-repair",
      category: "Hasar",
      severity: "high",
      title: "Şasi veya podye işlemi var",
      explanation: "Taşıyıcı yapıdaki işlem kritik güvenlik riski doğurabilir.",
      recommendation: "Şasi, podye, direk ve tavanı özellikle kontrol ettirin.",
    });
  if (/aç|degis|değiş|patla/i.test(input.airbagStatus ?? ""))
    findings.push({
      id: "airbag",
      category: "Hasar",
      severity: "high",
      title: "Airbag müdahalesi iddiası var",
      explanation: "Airbag açılması veya değişimi ciddi kaza geçmişine işaret edebilir.",
      recommendation: "Airbag sistemi ve emniyet kemerlerini arıza taramasıyla doğrulayın.",
    });
  if (input.hasTotalLossHistory)
    findings.push({
      id: "total-loss",
      category: "Hasar",
      severity: "high",
      title: "Pert geçmişi belirtilmiş",
      explanation: "Pert geçmişi değer, sigorta ve güvenlik açısından yüksek öncelikli kontroldür.",
      recommendation: "Resmî kayıtları ve onarım kalitesini uzmanla inceleyin.",
    });
  const replacedCount = partCount(input.replacedParts);
  if (replacedCount > 1)
    findings.push({
      id: "multiple-replaced",
      category: "Hasar",
      severity: replacedCount > 3 ? "high" : "medium",
      title: "Birden fazla değişen parça var",
      explanation: "Değişen parça sayısı arttıkça kaza kapsamını anlamak önem kazanır.",
      recommendation: "Parça listesini, fotoğrafları ve onarım faturasını isteyin.",
    });
  if (input.tramerAmount >= HIGH_TRAMER_AMOUNT && input.sellerDescription.length < 80)
    findings.push({
      id: "tramer-unexplained",
      category: "Hasar",
      severity: "medium",
      title: "Tramer tutarı açıklaması sınırlı",
      explanation: "Yüksek tramer tutarının hangi parçalarla ilgili olduğu net değil.",
      recommendation: "Tramer detay belgesini ve hasar açıklamasını satıcıdan isteyin.",
    });
  if (!input.paintedParts && !input.replacedParts && !input.localPaintedParts && !input.tramerAmount)
    findings.push({
      id: "damage-empty",
      category: "Açıklama",
      severity: "medium",
      title: "Hasar bilgileri boş bırakılmış",
      explanation: "Hasar alanlarının boş olması aracın hasarsız olduğunu göstermez.",
      recommendation: "Boya, değişen ve tramer detaylarını yazılı olarak isteyin.",
    });
  if (/tampon/i.test(input.localPaintedParts ?? "") && findings.length === 0)
    findings.push({
      id: "bumper-local-paint",
      category: "Hasar",
      severity: "low",
      title: "Lokal tampon boyası belirtilmiş",
      explanation: "Tampon boyası tek başına ağır risk anlamına gelmez; yine de ölçüm yapılmalıdır.",
      recommendation: "Boya kalınlık ölçümünde tüm gövdeyi kontrol ettirin.",
    });
  return findings;
}
