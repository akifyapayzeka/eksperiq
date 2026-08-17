"use client";

import { Capacitor } from "@capacitor/core";
import { InAppReview } from "@capacitor-community/in-app-review";
import { Share } from "@capacitor/share";
import { appConfig } from "@/lib/constants/app";

export type ShareRequest = { title: string; text: string };
export type ShareOutcome = "shared" | "copied" | "failed";

let didRequestStoreReview = false;

async function copyToClipboardFallback(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the legacy fallback below
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "true");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    document.body.removeChild(textarea);
    return copied;
  } catch {
    return false;
  }
}

/**
 * Native builds have no meaningful window.location.origin (it's an internal
 * capacitor://localhost or file:// URL, not something worth sharing) and no
 * navigator.share — @capacitor/share opens the native OS share sheet instead,
 * always pointing at the real production URL from central config. Web/PWA
 * keeps its existing navigator.share (falling back to clipboard) behavior,
 * using window.location.origin as before.
 */
export async function shareContent(request: ShareRequest): Promise<ShareOutcome> {
  if (Capacitor.isNativePlatform()) {
    try {
      await Share.share({
        title: request.title,
        text: request.text,
        url: appConfig.productionUrl,
      });
      void requestStoreReviewAfterPositiveAction();
      return "shared";
    } catch {
      const copied = await copyToClipboardFallback(request.text);
      return copied ? "copied" : "failed";
    }
  }

  try {
    if (navigator.share) {
      await navigator.share({ title: request.title, text: request.text, url: window.location.origin });
      return "shared";
    }
  } catch {
    return "failed";
  }

  const copied = await copyToClipboardFallback(request.text);
  return copied ? "copied" : "failed";
}

async function requestStoreReviewAfterPositiveAction(): Promise<void> {
  if (didRequestStoreReview) return;
  didRequestStoreReview = true;

  try {
    await InAppReview.requestReview();
  } catch {
    // Store review prompts are best-effort and must not interrupt report sharing.
  }
}
