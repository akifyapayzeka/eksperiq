import { INSPECTION_SOON_DAYS } from "@/lib/constants/analysis";

export type InspectionStatus = "unknown" | "expired" | "soon" | "later";

/**
 * Muayene bitiş tarihine kalan gün. Bugün biten muayene 0 döner (o gün hâlâ
 * geçerli); dün biten -1. Geçersiz/boş tarih null.
 */
export function daysUntilInspectionEnd(date: string | undefined, now: Date = new Date()): number | null {
  if (!date) return null;
  const target = new Date(`${date}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  const startOfTarget = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
  const startOfNow = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.round((startOfTarget - startOfNow) / 86_400_000);
}

/**
 * Süresi geçmiş muayene ile yaklaşan muayene ayrı durumlardır ve bu ayrımı
 * tek yerde yapıyoruz: daha önce iki ayrı çağrı noktası (maintenance-rules ve
 * recommendations) kendi eşiğini uyguluyordu ve ikisi de negatif günü
 * "yakın"a katıyordu — süresi 8 ay önce dolmuş bir muayene, 20 gün sonra
 * dolacak olanla aynı mesajı veriyordu.
 */
export function inspectionStatus(date: string | undefined, now: Date = new Date()): InspectionStatus {
  const days = daysUntilInspectionEnd(date, now);
  if (days === null) return "unknown";
  if (days < 0) return "expired";
  if (days <= INSPECTION_SOON_DAYS) return "soon";
  return "later";
}
