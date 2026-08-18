import { apiFetch } from "@/lib/api/client";
import { getCurrentPosition } from "@/lib/geo/current-position";
import type { NearbyPlace, PlaceCategory } from "./types";

export type NearbySearchResult =
  | { ok: true; places: NearbyPlace[] }
  | { ok: false; reason: "permission-denied" | "unavailable" | "network-error" | "not-configured" | "rate-limited" };

/** Konum izni ister, alınırsa kategoriye göre en yakın gerçek firmaları getirir. Fiyat asla döndürmez. */
export async function searchNearbyPlaces(category: PlaceCategory): Promise<NearbySearchResult> {
  let position: GeolocationPosition;
  try {
    position = await getCurrentPosition();
  } catch (error) {
    if (error instanceof GeolocationPositionError && error.code === error.PERMISSION_DENIED) {
      return { ok: false, reason: "permission-denied" };
    }
    return { ok: false, reason: "unavailable" };
  }

  try {
    const { latitude, longitude } = position.coords;
    const response = await apiFetch(
      `/api/places/nearby?lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}&category=${category}`,
    );
    if (response.status === 503) return { ok: false, reason: "not-configured" };
    if (response.status === 429) return { ok: false, reason: "rate-limited" };
    if (!response.ok) return { ok: false, reason: "network-error" };
    const payload = (await response.json()) as { places?: NearbyPlace[] };
    return { ok: true, places: payload.places ?? [] };
  } catch {
    return { ok: false, reason: "network-error" };
  }
}
