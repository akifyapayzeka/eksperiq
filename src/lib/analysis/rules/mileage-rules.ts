import { CURRENT_YEAR, MILEAGE_BANDS } from "@/lib/constants/analysis";
import type { VehicleFormData } from "@/lib/schemas/vehicle";
import type { AnalysisFinding, MileageEvaluation } from "../types";

export function evaluateMileage(input: VehicleFormData): MileageEvaluation {
  // Model yılı ilandan okunamadıysa elimizdeki yıl bir yer tutucu: yaşa
  // bölünen kilometre gerçek bir yıllık ortalama değil, uydurulmuş bir sayı
  // olur (ve "çok yüksek kullanım" gibi yüksek önemli sahte bulgu doğurur).
  if (input.yearIsEstimated || input.mileage <= 0) {
    return { vehicleAge: Math.max(1, CURRENT_YEAR - input.year + 1), annualMileage: 0, label: "Bilgi yetersiz" };
  }
  const vehicleAge = Math.max(1, CURRENT_YEAR - input.year + 1);
  const annualMileage = Math.round(input.mileage / vehicleAge);
  let label = "Normal aralık";
  if (annualMileage < MILEAGE_BANDS.veryLowMax) label = "Çok düşük yıllık kilometre";
  if (annualMileage > MILEAGE_BANDS.normalMax) label = "Yüksek kullanım";
  if (annualMileage > MILEAGE_BANDS.highMax) label = "Çok yüksek kullanım";
  return { vehicleAge, annualMileage, label };
}

export function mileageRules(input: VehicleFormData): AnalysisFinding[] {
  if (input.yearIsEstimated || input.mileage <= 0) return [];
  const mileage = evaluateMileage(input);
  if (mileage.annualMileage < MILEAGE_BANDS.veryLowMax) {
    return [
      {
        id: "very-low-mileage",
        category: "Kilometre",
        severity: "medium",
        title: "Yıllık kilometre çok düşük görünüyor",
        explanation:
          "Bu tek başına olumsuz değildir; ancak kilometre geçmişi servis ve muayene kayıtlarıyla doğrulanmalıdır.",
        recommendation: "TÜVTÜRK ve servis kilometre kayıtlarını satıcıdan isteyin.",
      },
    ];
  }
  if (mileage.annualMileage > MILEAGE_BANDS.highMax) {
    return [
      {
        id: "very-high-mileage",
        category: "Kilometre",
        severity: "high",
        title: "Yıllık kilometre çok yüksek kullanım gösteriyor",
        explanation: "Genel referanslara göre araç yoğun kullanılmış olabilir.",
        recommendation: "Motor, şanzıman, alt takım ve servis geçmişini detaylı kontrol ettirin.",
      },
    ];
  }
  if (mileage.annualMileage > MILEAGE_BANDS.normalMax) {
    return [
      {
        id: "high-mileage",
        category: "Kilometre",
        severity: "medium",
        title: "Yıllık kilometre yüksek",
        explanation: "Araç yaşına göre ortalamanın üzerinde kullanılmış olabilir.",
        recommendation: "Bakım sıklığını ve ağır bakım geçmişini belgeyle doğrulayın.",
      },
    ];
  }
  return [];
}
