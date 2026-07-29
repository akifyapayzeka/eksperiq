import type { ConfidenceLevel, PhotoDamageSignal, VehiclePhotoArea } from "./types";

export const PHOTO_DAMAGE_PROBABILITY_LIMITS = {
  min: 0,
  max: 100,
  mediumConfidenceMin: 40,
  highConfidenceMin: 70,
} as const;

export const vehiclePhotoAreas: VehiclePhotoArea[] = [
  "front-bumper",
  "rear-bumper",
  "right-fender",
  "left-fender",
  "doors",
  "hood",
  "trunk-lid",
  "roof",
  "headlights",
  "tail-lights",
  "wheels",
  "tires",
  "windows",
];

export const photoDamageSignals: PhotoDamageSignal[] = [
  "dent",
  "scratch",
  "paint-crack",
  "color-mismatch",
  "panel-misalignment",
  "headlight-replacement",
  "rust",
  "crack",
  "broken-part",
];

export const photoDamageDisclaimer =
  "Fotoğraf analizi kesin hasar tespiti veya garanti değildir; yalnızca olası bulguları olasılık ve güven seviyesiyle karar desteği olarak sunar.";

export function normalizeProbability(probability: number): number {
  if (!Number.isFinite(probability)) {
    return PHOTO_DAMAGE_PROBABILITY_LIMITS.min;
  }

  return Math.min(
    PHOTO_DAMAGE_PROBABILITY_LIMITS.max,
    Math.max(PHOTO_DAMAGE_PROBABILITY_LIMITS.min, Math.round(probability)),
  );
}

export function confidenceFromProbability(probability: number): ConfidenceLevel {
  const normalizedProbability = normalizeProbability(probability);

  if (normalizedProbability >= PHOTO_DAMAGE_PROBABILITY_LIMITS.highConfidenceMin) {
    return "high";
  }

  if (normalizedProbability >= PHOTO_DAMAGE_PROBABILITY_LIMITS.mediumConfidenceMin) {
    return "medium";
  }

  return "low";
}
