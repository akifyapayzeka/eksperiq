"use client";

import { Capacitor } from "@capacitor/core";
import { getInstallId } from "@/lib/api/install-id";
import { EksperIQListingFetchPlugin } from "./native-plugin";
import { detectListingSource } from "./url";
import type { ListingImportOutcome, ListingImportResult } from "./types";

export type ImportStage = "checking-url" | "opening-page" | "normalizing" | "done";

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
 * see EksperIQListingFetchPlugin.swift for why) and normalizes the
 * extracted text into vehicle form fields. Both the page fetch AND the
 * AI-normalize call happen natively in one continuous background-task-
 * wrapped operation (see the Swift plugin) so briefly backgrounding the app
 * mid-import doesn't cut it off — a local notification fires if it finishes
 * while the app isn't in the foreground.
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

  // The Swift plugin emits "progress" events as it moves through the
  // single native call below (opening-page -> normalizing -> done), so the
  // UI's progress indicator reflects what's actually happening natively
  // instead of guessing.
  const listener = await EksperIQListingFetchPlugin.addListener("progress", (event: { stage?: ImportStage }) => {
    if (event.stage) onStage?.(event.stage);
  });

  let pageData: ExtractedPageData;
  let importHttpStatus: number;
  let importResponseJson: string;
  try {
    const result = await EksperIQListingFetchPlugin.fetchListingPage({
      url: detected.url,
      source: detected.source,
      installId: getInstallId(),
    });
    pageData = JSON.parse(result.pageDataJson) as ExtractedPageData;
    importHttpStatus = result.importHttpStatus;
    importResponseJson = result.importResponseJson;
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    console.error("[listing-import] fetchListingPage failed:", detail);
    return { ok: false, reason: "fetch-failed", detail };
  } finally {
    await listener.remove();
  }

  if (!pageData.bodyText || pageData.bodyText.trim().length < 80) {
    return { ok: false, reason: "blocked" };
  }

  if (importHttpStatus === 429) return { ok: false, reason: "rate-limited" };

  let payload: ListingImportApiResponse;
  try {
    payload = JSON.parse(importResponseJson) as ListingImportApiResponse;
  } catch {
    return { ok: false, reason: "ai-failed" };
  }
  if (importHttpStatus !== 200 || !payload.result) return { ok: false, reason: "ai-failed" };

  onStage?.("done");
  return { ok: true, result: { ...payload.result, images: pageData.images } };
}
