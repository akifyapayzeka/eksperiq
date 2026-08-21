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

function splitParts(value?: string): string[] {
  if (!value) return [];
  return value
    .split(/,|\n|;/)
    .map((part) => part.trim())
    .filter(Boolean);
}

type PartRisk = {
  level: "low" | "medium" | "high";
  label: string;
  parts: string[];
  explanation: string;
  recommendation: string;
};

function classifyChangedParts(value?: string): PartRisk[] {
  const parts = splitParts(value);
  const groups: PartRisk[] = [];
  const add = (risk: PartRisk) => {
    if (risk.parts.length) groups.push(risk);
  };

  add({
    level: "high",
    label: "Taşıyıcı/kritik gövde parçası",
    parts: parts.filter((part) => /tavan|direk|şasi|sasi|podye|marşpiyel|marşpiyel|marspiyel|panel/i.test(part)),
    explanation:
      "Tavan, direk, şasi, podye, marşpiyel veya panel işlem/değişimi aracın taşıyıcı güvenliği ve ağır kaza geçmişi açısından en hassas gruptur.",
    recommendation:
      "Bu parçalarda işlem varsa şasi ölçümü, airbag/emniyet kemeri kontrolü ve eski hasar fotoğrafları olmadan karar vermeyin.",
  });
  add({
    level: "high",
    label: "Kaput değişen",
    parts: parts.filter((part) => /kaput/i.test(part)),
    explanation:
      "Kaput değişimi ön taraftan alınmış darbeyle ilişkili olabilir; tek başına kesin ağır hasar demek değildir ama radyatör paneli, şasi ucu, far yuvaları ve airbag geçmişiyle birlikte incelenmelidir.",
    recommendation:
      "Kaput değişiminde ön panel, şasi uçları, podye, far bağlantıları ve airbag kayıtlarını ekspertizde özellikle kontrol ettirin.",
  });
  add({
    level: "medium",
    label: "Dış panel değişen",
    parts: parts.filter((part) => /kapı|kapi|çamurluk|camurluk|bagaj|bagaj kapağı|bagaj kapagi/i.test(part)),
    explanation:
      "Kapı, çamurluk veya bagaj kapağı değişimi her zaman aracı almaktan vazgeçme sebebi değildir; risk, direk/eşik/şasiye taşan işlem olup olmadığına bağlıdır.",
    recommendation:
      "Değişen dış panelde menteşe/cıvata izleri, direk-eşik geçişi, boya kalınlığı ve panel hizasını kontrol ettirin.",
  });
  add({
    level: "low",
    label: "Plastik/vida ile bağlı parça",
    parts: parts.filter((part) => /tampon|panjur|ayna|far|stop/i.test(part)),
    explanation:
      "Tampon, panjur, ayna, far veya stop gibi parçalar çoğu zaman plastik ya da vida ile bağlı parçalardır; tek başına ağır kaza göstergesi sayılmaz.",
    recommendation:
      "Yine de bağlantı ayakları, far yuvaları, park sensörü ve arka/ön panelde işlem izi olup olmadığını kontrol ettirin.",
  });

  const known = new Set(groups.flatMap((group) => group.parts));
  add({
    level: "medium",
    label: "Sınıflandırılamayan değişen parça",
    parts: parts.filter((part) => !known.has(part)),
    explanation:
      "Parça adı net sınıflandırılamadığı için risk seviyesi orta tutuldu; parçanın taşıyıcı yapıya yakınlığı belirleyicidir.",
    recommendation: "Parçanın tam konumunu, eski hasar fotoğrafını ve onarım faturasını satıcıdan isteyin.",
  });

  return groups;
}

function highestSeverity(groups: PartRisk[]): AnalysisFinding["severity"] {
  if (groups.some((group) => group.level === "high")) return "high";
  if (groups.some((group) => group.level === "medium")) return "medium";
  return "low";
}

function changedPartExplanation(groups: PartRisk[]): string {
  return groups
    .map((group) => `${group.label}: ${group.parts.join(", ")}. ${group.explanation}`)
    .join(" ");
}

function changedPartRecommendation(groups: PartRisk[]): string {
  return groups.map((group) => group.recommendation).join(" ");
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
  const replacedGroups = classifyChangedParts(input.replacedParts);
  if (input.paintedParts)
    findings.push({
      id: "painted-parts-declared",
      category: "Hasar",
      severity: "low",
      title: "Boyalı parça bilgisi var",
      explanation:
        `İlanda boyalı parça olarak ${input.paintedParts} belirtilmiş. Boya tek başına ağır hasar anlamına gelmez; parça, ölçüm ve onarım nedeni birlikte değerlendirilmelidir.`,
      recommendation: "Boya kalınlık ölçümünü tüm panellerde yaptırın ve boya nedenini satıcıdan yazılı sorun.",
    });
  if (input.localPaintedParts)
    findings.push({
      id: "local-painted-parts-declared",
      category: "Hasar",
      severity: "low",
      title: "Lokal boyalı parça bilgisi var",
      explanation:
        `İlanda lokal boyalı parça olarak ${input.localPaintedParts} belirtilmiş. Lokal boya çoğu zaman kozmetik olabilir; yine de darbe izi ve macun kalınlığı kontrol edilmelidir.`,
      recommendation: "Lokal boya olan bölgede boya kalınlığı, bağlantı vidaları ve panel hizasını kontrol ettirin.",
    });
  if (replacedCount === 1)
    findings.push({
      id: "single-replaced-part",
      category: "Hasar",
      severity: highestSeverity(replacedGroups),
      title: "Değişen parça bilgisi var",
      explanation: changedPartExplanation(replacedGroups),
      recommendation: changedPartRecommendation(replacedGroups),
    });
  if (replacedCount > 1)
    findings.push({
      id: "multiple-replaced",
      category: "Hasar",
      severity: replacedCount > 3 ? "high" : highestSeverity(replacedGroups),
      title: "Birden fazla değişen parça var",
      explanation:
        `İlanda değişen parçalar ${input.replacedParts} olarak belirtilmiş. ${changedPartExplanation(replacedGroups)}`,
      recommendation:
        `${changedPartRecommendation(replacedGroups)} Parça sayısı arttığı için hasarın tek olay mı, farklı zamanlarda küçük işlemler mi olduğunu yazılı sorun.`,
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
  if (/tampon/i.test(input.localPaintedParts ?? "") && !findings.some((finding) => finding.id === "local-painted-parts-declared"))
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
