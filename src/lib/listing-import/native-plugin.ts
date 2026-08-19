"use client";

import { registerPlugin, type Plugin } from "@capacitor/core";

export interface EksperIQListingFetchPluginInterface extends Plugin {
  /**
   * Loads url in an off-screen WKWebView on-device, extracts page text, and
   * (natively, so it survives brief backgrounding) posts it to
   * /api/ai/listing-import to normalize into form fields.
   */
  fetchListingPage(options: { url: string; source: string; installId: string | null }): Promise<{
    pageDataJson: string;
    importHttpStatus: number;
    importResponseJson: string;
  }>;
}

/** Bridges to ios/App/App/Plugins/EksperIQListingFetchPlugin.swift. Native-only — see importListing(). */
export const EksperIQListingFetchPlugin = registerPlugin<EksperIQListingFetchPluginInterface>(
  "EksperIQListingFetch",
);
