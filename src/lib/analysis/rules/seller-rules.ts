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

export function sellerRules(input: VehicleFormData): AnalysisFinding[] {
  const findings = detectedClaims(input.sellerDescription).map<AnalysisFinding>((claim) => ({
    id: `claim-${normalize(claim).replaceAll(" ", "-")}`,
    category: "Satıcı",
    severity: claim === "Ekspertize açık" ? "low" : "medium",
    title: `"${claim}" ifadesi doğrulanmalı`,
    explanation:
      "Bu ifade tek başına olumsuzluk veya dolandırıcılık anlamına gelmez; yine de belge ve ekspertizle teyit edilmelidir.",
    recommendation: "İddiayı yazılı detay, fotoğraf, kayıt veya bağımsız ekspertizle doğrulayın.",
  }));

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
