import type { SubscriptionTier } from "./tier";

/**
 * PDF rapor çıktısı Pro/Pro+ özelliğidir. İki gerçek sebep:
 *
 * 1) pricing.ts bu özelliği zaten Pro'nun içeriği olarak sayıyordu ("PDF
 *    rapor") ama kodda hiçbir tier kontrolü yoktu — vaat ile davranış
 *    ayrışmıştı.
 * 2) PDF sunucuda üretiliyor (api/report/pdf.js: gömülü fontlar, ilan
 *    fotoğraflarının rapora basılması), yani her çıktı ölçülebilir bir
 *    işletme maliyeti. Ücretsiz ve sınırsız verilen tek maliyetli özellikti.
 *
 * Ücretsiz paket kısıtlanmıyor: rapor ekranda tamamen görünür kalıyor ve
 * metin özeti panoya kopyalanabiliyor. Kapıya takılan yalnızca PDF çıktısı.
 */
export function canExportReportPdf(tier: SubscriptionTier): boolean {
  return tier !== "free";
}

/** Kapı açıldığında gösterilen paywall metni — ücretsiz alternatifi de söyler. */
export const PDF_EXPORT_PAYWALL_COPY = {
  headline: "PDF rapor Pro ile",
  description:
    "Raporu PDF olarak kaydetmek ve paylaşmak Pro ve Pro+ paketlerinde. Raporun tamamını ekranda okumaya ve metin özetini panoya kopyalamaya ücretsiz devam edebilirsiniz.",
  dismissLabel: "Şimdilik metin özetini kullan",
} as const;
