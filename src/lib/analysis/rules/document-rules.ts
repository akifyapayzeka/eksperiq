import type { VehicleFormData } from "@/lib/schemas/vehicle";
import type { AnalysisFinding } from "../types";

const PROXY_SALE_PATTERNS = [
  "vekalet",
  "vekaleten",
  "başkası adına",
  "babamın",
  "annemin",
  "abimin",
  "kardeşimin",
  "arkadaşımın",
  "galeri adına",
  "ruhsat sahibi değilim",
] as const;

export function detectsOwnerOrProxySaleRisk(input: Pick<VehicleFormData, "ownerInfo" | "sellerDescription">): boolean {
  const text = `${input.ownerInfo ?? ""} ${input.sellerDescription ?? ""}`.toLocaleLowerCase("tr-TR");
  if (!input.ownerInfo?.trim()) return true;
  return PROXY_SALE_PATTERNS.some((pattern) => text.includes(pattern));
}

export function missingInformation(input: VehicleFormData): string[] {
  // Şasi son 6 hane / tramer detay belgesi / rehin-haciz bilgisi / kilometre
  // geçmişi used to be added here unconditionally, regardless of input —
  // there is no form field that could ever satisfy them, so every single
  // analysis (even a fully-documented one) took a guaranteed -8 point hit on
  // the 10-point documentsExpertise budget before any real gap was even
  // considered. This was a direct cause of listings with no real red flags
  // still landing in "Yüksek risk"/"Dikkatli incelenmeli" (2026-08-24). They
  // are already covered as standard buyer questions in questions.ts
  // (BASE_QUESTIONS) — asking the seller is the right place for them, not
  // penalizing this specific listing for something no listing could provide.
  const missing: string[] = [];
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
  if (detectsOwnerOrProxySaleRisk(input))
    findings.push({
      id: "owner-proxy-sale-verification",
      category: "Evrak",
      severity: "medium",
      title: "Ruhsat sahibi ve satış yetkisi doğrulanmalı",
      explanation:
        "Ruhsat sahibi belirsizse veya satış vekaletle yapılacaksa noter öncesinde satış yetkisi ve borç/rehin durumu ayrıca doğrulanmalıdır.",
      recommendation:
        "Ruhsat sahibi, vekalet geçerliliği, rehin, haciz ve borç durumunu resmi kayıtlarla kontrol edin.",
    });
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
