import { apiFetch } from "@/lib/api/client";
import { getCurrentPosition } from "@/lib/geo/current-position";

export type LocateCityResult =
  | { ok: true; city: string }
  | { ok: false; reason: "permission-denied" | "unavailable" | "not-found" | "network-error" };

/** Konum izni ister, alınırsa şehre çevirir. Şehri bulamazsa/izin verilmezse net bir sebep döner. */
export async function locateCity(): Promise<LocateCityResult> {
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
      `/api/geo/reverse-geocode?lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}`,
    );
    if (!response.ok) return { ok: false, reason: "network-error" };
    const payload = (await response.json()) as { city?: string | null };
    if (!payload.city) return { ok: false, reason: "not-found" };
    return { ok: true, city: payload.city };
  } catch {
    return { ok: false, reason: "network-error" };
  }
}
