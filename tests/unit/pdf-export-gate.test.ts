import { describe, expect, it } from "vitest";
import { canExportReportPdf, PDF_EXPORT_PAYWALL_COPY } from "@/lib/pro/pdf-export-gate";

/**
 * PDF raporu sunucuda üretiliyor (api/report/pdf.js: font yükleme, ilan
 * fotoğraflarını gömme) — yani her çıktı gerçek bir işletme maliyeti.
 * src/lib/pro/pricing.ts bu özelliği zaten Pro'nun içeriği olarak sayıyordu
 * ("PDF rapor") ama kodda hiçbir yerde tier kontrolü yoktu: ücretsiz
 * kullanıcı sınırsız PDF alabiliyordu. Vaat ile davranış burada ayrışıyordu.
 *
 * Ücretsiz kullanıcı raporun tamamını ekranda görmeye ve metin özetini
 * panoya kopyalamaya devam ediyor; kapıya takılan yalnızca PDF çıktısı.
 */

describe("PDF çıktısı — paket kapısı", () => {
  it("ücretsiz pakette PDF çıktısı vermez", () => {
    expect(canExportReportPdf("free")).toBe(false);
  });

  it("Pro ve Pro+ pakette PDF çıktısı verir", () => {
    expect(canExportReportPdf("pro")).toBe(true);
    expect(canExportReportPdf("proPlus")).toBe(true);
  });

  it("kapı metni kullanıcıya neyin ücretsiz kaldığını söyler", () => {
    // Kılavuzun "ölü/yanıltıcı arayüz" kuralı: kapı, kullanıcıyı çıkmaza
    // sokmamalı — elindeki ücretsiz alternatifi (metin özeti) söylemeli.
    expect(PDF_EXPORT_PAYWALL_COPY.description).toContain("özet");
    expect(PDF_EXPORT_PAYWALL_COPY.headline.length).toBeGreaterThan(0);
    expect(PDF_EXPORT_PAYWALL_COPY.dismissLabel.length).toBeGreaterThan(0);
  });
});
