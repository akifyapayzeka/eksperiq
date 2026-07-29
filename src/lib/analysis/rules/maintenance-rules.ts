import { HIGH_MILEAGE_TIMING_HISTORY_KM, INSPECTION_SOON_DAYS } from "@/lib/constants/analysis";
import type { VehicleFormData } from "@/lib/schemas/vehicle";
import type { AnalysisFinding } from "../types";

function daysUntil(date?: string): number | null {
  if (!date) return null;
  const target = new Date(`${date}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  return Math.ceil((target.getTime() - Date.now()) / 86400000);
}

export function maintenanceRules(input: VehicleFormData): AnalysisFinding[] {
  const findings: AnalysisFinding[] = [];
  if (!input.hasMaintenanceInvoices)
    findings.push({
      id: "no-invoices",
      category: "Bakım",
      severity: "medium",
      title: "Bakım faturası yok",
      explanation: "Bakım geçmişi belgeyle doğrulanamıyor.",
      recommendation: "Servis kayıtlarını veya fatura görsellerini isteyin.",
    });
  if (!input.lastMaintenanceDate)
    findings.push({
      id: "no-last-maintenance",
      category: "Bakım",
      severity: "medium",
      title: "Son bakım tarihi bilinmiyor",
      explanation: "Yakın dönemde bakım masrafı çıkabilir.",
      recommendation: "Son bakımın tarihini, kilometresini ve kapsamını sorun.",
    });
  if (!input.timingBeltInfo && input.mileage >= HIGH_MILEAGE_TIMING_HISTORY_KM)
    findings.push({
      id: "timing-history-unknown-high-mileage",
      category: "Bakım",
      severity: "medium",
      title: "Triger veya zincir geçmişi netleştirilmeli",
      explanation:
        "Araç yüksek kilometrede olduğu için triger veya zincir bakım geçmişinin belirsiz kalması yakın masraf ve mekanik risk doğurabilir.",
      recommendation: "Motor tipine göre triger/zincir bakım geçmişini fatura veya servis kaydıyla doğrulayın.",
    });
  else if (!input.timingBeltInfo)
    findings.push({
      id: "timing-unknown",
      category: "Bakım",
      severity: "medium",
      title: "Triger bilgisi yok",
      explanation: "Triger veya zincir durumu motor tipine göre kritik olabilir.",
      recommendation: "Motor tipine göre triger/zincir kontrolünü ekspertize ekleyin.",
    });
  if (!input.transmissionMaintenanceInfo)
    findings.push({
      id: "gearbox-unknown",
      category: "Bakım",
      severity: "medium",
      title: "Şanzıman bakım bilgisi yok",
      explanation: "Özellikle otomatik şanzımanda bakım geçmişi önemlidir.",
      recommendation: "Şanzıman yağ bakımını ve test sürüşünü kontrol ettirin.",
    });
  if (/kötü|zayıf|bitik/i.test(input.tireStatus ?? ""))
    findings.push({
      id: "bad-tires",
      category: "Bakım",
      severity: "medium",
      title: "Lastik durumu masraf çıkarabilir",
      explanation: "Lastikler yakın dönemde değişim gerektirebilir.",
      recommendation: "Diş derinliği ve üretim tarihini kontrol edin.",
    });
  const inspectionDays = daysUntil(input.inspectionEndDate);
  if (inspectionDays !== null && inspectionDays <= INSPECTION_SOON_DAYS)
    findings.push({
      id: "inspection-soon",
      category: "Evrak",
      severity: "medium",
      title: "Muayene tarihi yakın",
      explanation: "Yakın muayene ek masraf ve kusur riski doğurabilir.",
      recommendation: "Muayene öncesi kusur çıkarabilecek kalemleri ekspertizde kontrol edin.",
    });
  if (/var/i.test(input.lpgStatus ?? "") && !input.lpgRegistered)
    findings.push({
      id: "lpg-not-registered",
      category: "Evrak",
      severity: "high",
      title: "LPG ruhsata işli değil",
      explanation: "Ruhsata işli olmayan LPG yasal ve muayene riski oluşturur.",
      recommendation: "Ruhsat kaydını görmeden ilerlemeyin.",
    });
  if (!input.hasSpareKey)
    findings.push({
      id: "no-spare-key",
      category: "Bakım",
      severity: "low",
      title: "Yedek anahtar yok",
      explanation: "Yedek anahtar eksikliği ek maliyet oluşturabilir.",
      recommendation: "Anahtar maliyetini ve immobilizer durumunu kontrol edin.",
    });
  return findings;
}
