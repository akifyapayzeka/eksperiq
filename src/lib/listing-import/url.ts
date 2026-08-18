import type { ListingSource } from "./types";

/** Starting allowlist per owner decision — only sources actually wired up to an adapter, not "any URL". */
const SUPPORTED_LISTING_HOSTS: Record<string, ListingSource> = {
  "sahibinden.com": "sahibinden",
  "www.sahibinden.com": "sahibinden",
  "shbd.io": "sahibinden",
  "www.shbd.io": "sahibinden",
  "arabam.com": "arabam",
  "www.arabam.com": "arabam",
};

export type ListingSourceCheck = { ok: true; source: ListingSource; url: string } | { ok: false };

export function detectListingSource(rawUrl: string): ListingSourceCheck {
  let url: URL;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    return { ok: false };
  }
  if (url.protocol !== "https:") return { ok: false };
  const source = SUPPORTED_LISTING_HOSTS[url.hostname.toLowerCase()];
  if (!source) return { ok: false };
  return { ok: true, source, url: url.toString() };
}

/** Loosely pulls the first https URL out of arbitrary pasted text (e.g. a whole share-sheet message, not just a bare link). */
export function extractFirstHttpsUrl(text: string): string | null {
  const match = text.match(/https:\/\/\S+/i);
  return match ? match[0].replace(/[)\]}"'.,]+$/, "") : null;
}
