/**
 * Small, dependency-free theme preference helper. Not part of the business
 * logic layer (analysis/storage/vehicles) — purely a UI/design-system concern,
 * so it lives outside `src/lib/storage/`.
 *
 * "system" means: no explicit choice stored, follow prefers-color-scheme.
 * "light" / "dark" stamp `data-theme` on <html> so CSS can win either way.
 */
export type ThemePreference = "system" | "light" | "dark";

const STORAGE_KEY = "eksperiq:theme-preference";

export function readThemePreference(): ThemePreference {
  if (typeof window === "undefined") return "system";
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw === "light" || raw === "dark" ? raw : "system";
}

export function writeThemePreference(preference: ThemePreference): void {
  if (typeof window === "undefined") return;
  if (preference === "system") {
    window.localStorage.removeItem(STORAGE_KEY);
  } else {
    window.localStorage.setItem(STORAGE_KEY, preference);
  }
  applyThemePreference(preference);
}

export function applyThemePreference(preference: ThemePreference): void {
  if (typeof document === "undefined") return;
  if (preference === "system") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", preference);
  }
}

/**
 * Inline, synchronous script string injected via next/script
 * strategy="beforeInteractive" so the correct theme is set before first
 * paint (no flash). Kept as a plain string (not React state) on purpose —
 * this runs before hydration and must not depend on React's lifecycle.
 */
export const themeInitScript = `
(function () {
  try {
    var stored = window.localStorage.getItem("${STORAGE_KEY}");
    if (stored === "light" || stored === "dark") {
      document.documentElement.setAttribute("data-theme", stored);
    }
  } catch (e) {}
})();
`;
