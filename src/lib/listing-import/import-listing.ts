"use client";

import { Capacitor } from "@capacitor/core";
import { apiFetch } from "@/lib/api/client";
import { getInstallId } from "@/lib/api/install-id";
import { EksperIQListingFetchPlugin } from "./native-plugin";
import { detectListingSource, type ListingSourceCheck } from "./url";
import type { ListingImportOutcome, ListingImportResult } from "./types";

/**
 * TEMPORARY: a reported production hang has no trace at all in
 * api/ai/listing-import's own logs, and there's no way to get real device
 * console logs to see where it actually stalls. Fires a small, best-effort,
 * fire-and-forget ping to api/debug/listing-import-trace.js at each stage
 * boundary — never awaited, never throws, and never affects the real
 * outcome. Delete both this and that endpoint once the hang is root-caused.
 */
function trace(step: string, detail?: string): void {
  void apiFetch("/api/debug/listing-import-trace", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ step, detail }),
  }).catch(() => {});
}

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
 * The native side has its own timeouts (35s to open the page, 20s for the
 * AI-normalize call — see EksperIQListingFetchPlugin.swift), but nothing on
 * the JS side ever bounded the wait for those to fire. If anything before
 * or around them hangs instead of rejecting — e.g. the addListener() call
 * below, or the native call silently never invoking its completion handler
 * — the UI was stuck on the progress bar indefinitely with no way out. This
 * caps the whole operation from the JS side as a backstop, independent of
 * whatever the native timeouts do or don't do.
 */
const CLIENT_HARD_TIMEOUT_MS = 65_000;

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
  trace("js-start");
  onStage?.("checking-url");
  const detected = detectListingSource(rawUrl);
  if (!detected.ok) return { ok: false, reason: "invalid-url" };

  if (!Capacitor.isNativePlatform()) {
    return { ok: false, reason: "unsupported-platform" };
  }
  trace("js-native-confirmed");

  let timedOut = false;
  const guardedOnStage = (stage: ImportStage) => {
    // Ignore any stage event that arrives after the client timeout already
    // resolved the race below — the native call may still finish late, but
    // the UI has already moved on to an error state by then.
    if (!timedOut) onStage?.(stage);
  };

  const deadline = Date.now() + CLIENT_HARD_TIMEOUT_MS;
  const timeoutOutcome: ListingImportOutcome = {
    ok: false,
    reason: "fetch-failed",
    detail: "İşlem 65 saniyeden uzun sürdüğü için durduruldu.",
  };

  let resolveTimeout: (outcome: ListingImportOutcome) => void = () => {};
  const timeoutPromise = new Promise<ListingImportOutcome>((resolve) => {
    resolveTimeout = resolve;
  });
  const timer = setTimeout(() => {
    trace("js-client-timeout", "resolved via setTimeout");
    resolveTimeout(timeoutOutcome);
  }, CLIENT_HARD_TIMEOUT_MS);

  // A plain setTimeout can be throttled or paused for as long as the
  // WKWebView is backgrounded — exactly the situation most likely to
  // coincide with a slow or stuck native call, since that's often when
  // someone switches away to wait. Re-checking the wall-clock deadline on
  // return-to-foreground means a throttled timer can't leave this hanging
  // well past when it should already have given up.
  function onVisible() {
    if (document.visibilityState === "visible" && Date.now() >= deadline) {
      trace("js-client-timeout", "resolved via visibilitychange");
      resolveTimeout(timeoutOutcome);
    }
  }
  document.addEventListener("visibilitychange", onVisible);

  try {
    const outcome = await Promise.race([runNativeImport(detected, guardedOnStage), timeoutPromise]);
    if (outcome === timeoutOutcome) timedOut = true;
    return outcome;
  } finally {
    clearTimeout(timer);
    document.removeEventListener("visibilitychange", onVisible);
  }
}

async function runNativeImport(
  detected: Extract<ListingSourceCheck, { ok: true }>,
  onStage: (stage: ImportStage) => void,
): Promise<ListingImportOutcome> {
  // The Swift plugin emits "progress" events as it moves through the
  // single native call below (opening-page -> normalizing -> done), so the
  // UI's progress indicator reflects what's actually happening natively
  // instead of guessing.
  trace("js-before-add-listener");
  const listener = await EksperIQListingFetchPlugin.addListener("progress", (event: { stage?: ImportStage }) => {
    if (event.stage) onStage(event.stage);
  });
  trace("js-after-add-listener");

  let pageData: ExtractedPageData;
  let importHttpStatus: number;
  let importResponseJson: string;
  try {
    trace("js-before-fetch");
    const result = await EksperIQListingFetchPlugin.fetchListingPage({
      url: detected.url,
      source: detected.source,
      installId: getInstallId(),
    });
    trace("js-after-fetch-ok");
    pageData = JSON.parse(result.pageDataJson) as ExtractedPageData;
    importHttpStatus = result.importHttpStatus;
    importResponseJson = result.importResponseJson;
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    console.error("[listing-import] fetchListingPage failed:", detail);
    trace("js-after-fetch-error", detail.slice(0, 300));
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

  onStage("done");
  return { ok: true, result: { ...payload.result, images: pageData.images } };
}
