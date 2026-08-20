const BLOCKED_IMAGE_PATTERN =
  /(?:^|[/?&_.-])(sprite|icon|logo|favicon|avatar|blank|placeholder|missing|badge|category|attribute|emoji|loader|loading|spinner|banner|campaign|advert|ads?|social|facebook|twitter|instagram|whatsapp|app-store|google-play|wrench|sparkle|percent|percentage)(?:[/?&_.-]|$)/i;

const VEHICLE_IMAGE_PATTERN =
  /(shbdn\.com\/photos|sahibinden\.com\/.*(?:photo|image|classified)|arabam\.com\/.*(?:listing|photo|image|vehicle|classified)|arabam\.io|vehicle|car|auto|photo|image|classified|listing)/i;

function normalizedImageUrl(rawUrl: string): string | null {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return null;
  }
}

function isLikelyVehicleImage(url: string): boolean {
  const lower = url.toLocaleLowerCase("tr-TR");
  if (BLOCKED_IMAGE_PATTERN.test(lower)) return false;
  if (!/\.(?:jpe?g|png|webp)(?:\?|$)/i.test(lower) && !VEHICLE_IMAGE_PATTERN.test(lower)) return false;
  return (
    VEHICLE_IMAGE_PATTERN.test(lower) || /(?:\/|%2f)(?:x5_|big_|large_|photo|image|listing|classified)/i.test(lower)
  );
}

export function filterListingImageUrls(images: string[], limit = 20): string[] {
  const seen = new Set<string>();
  const filtered: string[] = [];

  for (const rawUrl of images) {
    if (typeof rawUrl !== "string") continue;
    const normalized = normalizedImageUrl(rawUrl.trim());
    if (!normalized || seen.has(normalized) || !isLikelyVehicleImage(normalized)) continue;
    seen.add(normalized);
    filtered.push(normalized);
    if (filtered.length >= limit) break;
  }

  return filtered;
}
