import type { MileageEvaluation } from "./types";

/**
 * Kilometre özet cümlesi. İki ekranda (soru-cevap kartı ve rapor detayı)
 * aynı cümle kuruluyordu ve ikisi de veriyi okumadan konuşuyordu: kilometre
 * girilmemişse ya da model yılı ilandan okunamamışsa yıllık ortalama
 * hesaplanamaz, ama ekran yine de "yıllık ortalama kullanım yaklaşık 0 km"
 * ve uydurulmuş bir "araç yaşı" yazıyordu. Hesaplanamayan bir değeri 0 diye
 * göstermek, kullanıcıya gerçek bir ölçüm gibi görünür.
 */
export function mileageSummarySentence(mileage: MileageEvaluation): string {
  if (mileage.annualMileage <= 0) {
    return "Model yılı veya kilometre bilgisi eksik olduğu için yıllık ortalama kullanım hesaplanamadı.";
  }
  return `Araç yaşı yaklaşık ${mileage.vehicleAge} yıl, yıllık ortalama kullanım yaklaşık ${mileage.annualMileage.toLocaleString("tr-TR")} km. Bu değerler yalnızca genel referanstır.`;
}

/** Soru-cevap kartındaki "Km normal mi?" cevabı — aynı dürüstlük kuralıyla. */
export function mileageAnswer(mileage: MileageEvaluation): string {
  if (mileage.annualMileage <= 0) {
    return `${mileage.label}. Model yılı veya kilometre bilgisi eksik olduğu için yıllık ortalama kullanım hesaplanamadı.`;
  }
  return `${mileage.label}. Yıllık yaklaşık ${mileage.annualMileage.toLocaleString("tr-TR")} km kullanım görünüyor.`;
}
