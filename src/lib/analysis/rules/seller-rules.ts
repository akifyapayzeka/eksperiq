import type { VehicleFormData } from "@/lib/schemas/vehicle";
import type { AnalysisFinding } from "../types";

export const CLAIM_PATTERNS = [
  "Acil satılık",
  "Masrafsız",
  "Hatasız",
  "Doktordan",
  "Öğretmenden",
  "İlk gelen alır",
  "Ekspertize açık",
  "Tramer yok",
  "Boyasız",
  "Değişensiz",
  "Alan dua eder",
  "Fiyat son",
  "Sadece ciddi alıcılar",
] as const;

const GARAGE_CLAIM_PATTERNS = ["Garaj arabası", "Kapalı garaj", "Garajda durdu", "Kapalı otopark"] as const;
const AMBIGUOUS_PHRASE_PATTERNS = [
  "Bana böyle söylendi",
  "Ben bilmiyorum",
  "Detay bilmiyorum",
  "Ufak tefek",
  "Yaşına göre",
  "Temizlik boyası",
  "Sorunsuz deniyor",
  "Kilometre orijinal deniyor",
] as const;

function normalize(value: string): string {
  return value
    .toLocaleLowerCase("tr-TR")
    .replaceAll("ı", "i")
    .replaceAll("ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("ş", "s")
    .replaceAll("ö", "o")
    .replaceAll("ç", "c")
    .replaceAll("İ", "i")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

export function detectedClaims(description: string): string[] {
  const text = normalize(description);
  return CLAIM_PATTERNS.filter((claim) => text.includes(normalize(claim)));
}

export function detectsGarageClaim(description: string): boolean {
  const text = normalize(description);
  return GARAGE_CLAIM_PATTERNS.some((claim) => text.includes(normalize(claim)));
}

export function detectedAmbiguousPhrases(description: string): string[] {
  const text = normalize(description);
  return AMBIGUOUS_PHRASE_PATTERNS.filter((phrase) => text.includes(normalize(phrase)));
}

export function sellerRules(input: VehicleFormData): AnalysisFinding[] {
  const findings: AnalysisFinding[] = [];

  if (input.hasCommercialHistory) {
    findings.push({
      id: "commercial-history",
      category: "Satıcı",
      severity: "high",
      title: "Aracın ticari (taksi/kiralık) geçmişi var",
      explanation:
        "Ticari veya kiralık kullanım, hususi kullanıma göre çok daha yüksek yıllık kilometre, ağır kullanım ve düzensiz bakım anlamına gelebilir; km ve yıpranma tutarsızlığı riski artar.",
      recommendation:
        "Ruhsat geçmişini (ticari plaka/taksi kaydı) ve servis geçmişini isteyin; km ile yaş/kullanım öyküsünün tutarlı olduğunu ekspertizle doğrulayın.",
    });
  }

  findings.push(...detectedClaims(input.sellerDescription).map<AnalysisFinding>((claim) => ({
    id: `claim-${normalize(claim).replaceAll(" ", "-")}`,
    category: "Satıcı",
    severity: claim === "Ekspertize açık" ? "low" : "medium",
    title: `"${claim}" ifadesi doğrulanmalı`,
    explanation:
      "Bu ifade tek başına olumsuzluk veya dolandırıcılık anlamına gelmez; yine de belge ve ekspertizle teyit edilmelidir.",
    recommendation: "İddiayı yazılı detay, fotoğraf, kayıt veya bağımsız ekspertizle doğrulayın.",
  })));

  if (detectsGarageClaim(input.sellerDescription)) {
    findings.push({
      id: "claim-garage-kept",
      category: "Satıcı",
      severity: "low",
      title: "Garaj kullanımı iddiası doğrulanmalı",
      explanation:
        "Garajda durduğu belirtilen araçlarda boya, plastik trim, güneş yanığı ve lastik durumu yine de fiziksel kontrol gerektirir.",
      recommendation: "Aracın boya, güneş yanığı, trim ve lastik durumunu ekspertizde ayrıca kontrol ettirin.",
    });
  }

  for (const phrase of detectedAmbiguousPhrases(input.sellerDescription)) {
    findings.push({
      id: `ambiguous-${normalize(phrase).replaceAll(" ", "-")}`,
      category: "Açıklama",
      severity: "medium",
      title: `"${phrase}" ifadesi netleştirilmeli`,
      explanation:
        "Belirsiz veya dolaylı anlatımlar tek başına olumsuzluk anlamına gelmez; ancak aracın geçmişini satıcının doğrudan belgeyle açıklaması gerekir.",
      recommendation:
        "Satıcıdan bu ifadenin hangi parça, kayıt, bakım veya ekspertiz bulgusuna dayandığını yazılı isteyin.",
    });
  }

  if (input.sellerDescription.length < 80) {
    findings.push({
      id: "short-description",
      category: "Açıklama",
      severity: "medium",
      title: "İlan açıklaması sınırlı",
      explanation: "Kısa açıklama araç geçmişini anlamak için yetersiz kalabilir.",
      recommendation: "Satıcıdan bakım, hasar ve evrak detaylarını madde madde isteyin.",
    });
  }
  return findings;
}
