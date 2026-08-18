"use client";

import { Capacitor } from "@capacitor/core";
import { apiFetch } from "@/lib/api/client";
import { EksperIQListingFetchPlugin } from "./native-plugin";
import { detectListingSource } from "./url";
import type { ListingImportOutcome, ListingImportResult } from "./types";

export type ImportStage = "checking-url" | "opening-page" | "extracting" | "normalizing" | "done";

type ExtractedPageData = {
  title: string;
  ogTitle: string;
  ogDescription: string;
  bodyText: string;
  jsonLd: string[];
  images: string[];
  finalUrl: string;
};

type ListingImportApiResponse = {
  result?: Omit<ListingImportResult, "images">;
  error?: string;
};

/**
 * Loads the URL on the user's own device (WKWebView, not a server fetch —
 * see EksperIQListingFetchPlugin.swift for why) and sends the extracted
 * text to /api/ai/listing-import to normalize into vehicle form fields.
 */
export async function importListingFromUrl(
  rawUrl: string,
  onStage?: (stage: ImportStage) => void,
): Promise<ListingImportOutcome> {
  onStage?.("checking-url");
  const detected = detectListingSource(rawUrl);
  if (!detected.ok) return { ok: false, reason: "invalid-url" };

  if (!Capacitor.isNativePlatform()) {
    return { ok: false, reason: "unsupported-platform" };
  }

  onStage?.("opening-page");
  let pageData: ExtractedPageData;
  try {
    const { pageDataJson } = await EksperIQListingFetchPlugin.fetchListingPage({ url: detected.url });
    pageData = JSON.parse(pageDataJson) as ExtractedPageData;
  } catch {
    return { ok: false, reason: "fetch-failed" };
  }

  if (!pageData.bodyText || pageData.bodyText.trim().length < 80) {
    return { ok: false, reason: "blocked" };
  }

  onStage?.("extracting");
  try {
    onStage?.("normalizing");
    const response = await apiFetch("/api/ai/listing-import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        aiProviderConsent: true,
        source: detected.source,
        url: pageData.finalUrl || detected.url,
        title: pageData.title,
        ogTitle: pageData.ogTitle,
        ogDescription: pageData.ogDescription,
        bodyText: pageData.bodyText,
        jsonLd: pageData.jsonLd,
      }),
    });

    if (response.status === 429) return { ok: false, reason: "rate-limited" };
    const payload = (await response.json()) as ListingImportApiResponse;
    if (!response.ok || !payload.result) return { ok: false, reason: "ai-failed" };

    onStage?.("done");
    return { ok: true, result: { ...payload.result, images: pageData.images } };
  } catch {
    return { ok: false, reason: "ai-failed" };
  }
}
