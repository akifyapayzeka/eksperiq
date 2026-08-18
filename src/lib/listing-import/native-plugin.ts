"use client";

import { registerPlugin } from "@capacitor/core";

export interface EksperIQListingFetchPluginInterface {
  /** Loads url in an off-screen WKWebView on-device and returns a JSON string of extracted page data. */
  fetchListingPage(options: { url: string }): Promise<{ pageDataJson: string }>;
}

/** Bridges to ios/App/App/Plugins/EksperIQListingFetchPlugin.swift. Native-only — see importListing(). */
export const EksperIQListingFetchPlugin = registerPlugin<EksperIQListingFetchPluginInterface>(
  "EksperIQListingFetch",
);
