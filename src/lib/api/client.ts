import { Capacitor } from "@capacitor/core";
import { appConfig } from "@/lib/constants/app";
import { getInstallId } from "@/lib/api/install-id";

/**
 * Native (Capacitor) builds ship a static bundle with no same-origin server —
 * a relative /api/... request has nothing to resolve against and fails
 * silently. Resolve every API path against the production origin only on
 * native platforms; web/PWA keeps using relative paths unchanged.
 */
export function resolveApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (Capacitor.isNativePlatform()) {
    return `${appConfig.productionUrl}${normalizedPath}`;
  }
  return normalizedPath;
}

export function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const installId = getInstallId();
  const headers = new Headers(init.headers);
  if (installId) headers.set("X-EksperIQ-Install-Id", installId);
  return fetch(resolveApiUrl(path), { ...init, headers });
}
