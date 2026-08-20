"use client";

import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { apiFetch } from "@/lib/api/client";
import type { AnalysisResult } from "@/lib/analysis/types";
import { BUYER_EDUCATION_NOTES } from "@/lib/analysis/buyer-education";

export type PdfShareOutcome = "shared" | "downloaded" | "failed";

function buildReportPayload(result: AnalysisResult) {
  return {
    year: result.input.year,
    brand: result.input.brand,
    model: result.input.model,
    mileage: result.input.mileage,
    price: result.input.price,
    city: result.input.city,
    totalScore: result.totalScore,
    riskLabel: result.riskLabel,
    decision: result.decision,
    priorityActions: result.priorityActions,
    findings: result.findings,
    sellerQuestions: result.sellerQuestions,
    inspectionFocus: result.inspectionFocus,
    buyerEducation: BUYER_EDUCATION_NOTES,
  };
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = "";
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

async function fetchReportPdfBytes(result: AnalysisResult): Promise<ArrayBuffer | null> {
  try {
    const response = await apiFetch("/api/report/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildReportPayload(result)),
    });
    if (!response.ok) return null;
    return await response.arrayBuffer();
  } catch {
    return null;
  }
}

/**
 * Generates the branded PDF report (logo, score, findings — see
 * api/report/pdf.js) and hands it to the OS share sheet on native, or
 * triggers a browser download on web. Replaces the previous plain-text
 * share: a shared https:// link auto-expands into an unwanted preview card
 * in Messages/WhatsApp, and a real report file is a better artifact anyway.
 */
export async function shareReportPdf(result: AnalysisResult): Promise<PdfShareOutcome> {
  const bytes = await fetchReportPdfBytes(result);
  if (!bytes) return "failed";

  const fileName = `eksperiq-rapor-${Date.now()}.pdf`;

  if (Capacitor.isNativePlatform()) {
    try {
      const written = await Filesystem.writeFile({
        path: fileName,
        data: arrayBufferToBase64(bytes),
        directory: Directory.Cache,
      });
      // Guard against a stalled native bridge call the same way shareContent
      // does — the share sheet must never leave the button looking dead.
      await Promise.race([
        Share.share({ title: "EksperIQ araç analiz raporu", files: [written.uri] }),
        new Promise((_resolve, reject) => window.setTimeout(() => reject(new Error("share-timeout")), 8000)),
      ]);
      return "shared";
    } catch {
      return "failed";
    }
  }

  try {
    const blob = new Blob([bytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
    return "downloaded";
  } catch {
    return "failed";
  }
}
