const STORAGE_KEY = "eksperiq:install-id";

function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Anonymous, device-local identifier used only to key AI rate limiting per
 * installation instead of per IP (which is unreliable behind shared/mobile
 * NAT). Never tied to a real account or sent anywhere except as a rate-limit
 * key, and the server only ever stores an HMAC hash of it — never this raw
 * value (see api/_lib/rate-limit.js).
 */
export function getInstallId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const existing = window.localStorage.getItem(STORAGE_KEY);
    if (existing) return existing;
    const id = generateId();
    window.localStorage.setItem(STORAGE_KEY, id);
    return id;
  } catch {
    return null;
  }
}
