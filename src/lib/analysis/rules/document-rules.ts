import type { VehicleFormData } from "@/lib/schemas/vehicle";
import type { AnalysisFinding } from "../types";

export function missingInformation(input: VehicleFormData): string[] {
  const missing: string[] = [
    "Şasi numarasının son 6 hanesi",
    "Tramer detay belgesi",
    "Rehin veya haciz bilgisi",
    "Kilometre geçmişi",
  ];
  if (!input.hasExpertiseReport) missing.push("Ekspertiz raporu");
  if (!input.hasMaintenanceInvoices) missing.push("Bakım faturası");
  if (!input.inspectionEndDate) missing.push("Muayene bilgisi");
  if (!input.tireStatus) missing.push("Lastik üretim tarihi");
  if (!input.hasSpareKey) missing.push("Yedek anahtar");
  if (!input.ownerInfo) missing.push("Ruhsat sahibinin kim olduğu");
  return missing;
}

export function documentRules(input: VehicleFormData): AnalysisFinding[] {
  const findings: AnalysisFinding[] = [];
  if (!input.hasExpertiseReport)
    findings.push({
      id: "no-expertise",
      category: "Evrak",
      severity: "medium",
      title: "Ekspertiz raporu yok",
      explanation: "Mevcut bilgiler bağımsız kontrolle desteklenmiyor.",
      recommendation: "Kendi seçeceğiniz ekspertiz firmasında kontrol yaptırın.",
    });
  for (const item of missingInformation(input)) {
    findings.push({
      id: `missing-${item.toLocaleLowerCase("tr-TR").replaceAll(" ", "-")}`,
      category: "Evrak",
      severity: "low",
      title: `${item} istenmeli`,
      explanation: "Bu bilgi satın alma öncesi doğrulama için önemlidir.",
      recommendation: "Satıcıdan bu bilgiyi belge veya kayıtla paylaşmasını isteyin.",
    });
  }
  return findings;
}
