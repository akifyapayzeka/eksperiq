import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * Regression guardrails from the FireVibe UI integration pass:
 * - no lingering FireVibe mock remote-image domain
 * - no "Yakında" (coming soon) label on any active-module surface
 *
 * These complement scripts/check-safe-claims.mjs and
 * scripts/check-sensitive-data.mjs, which cover a different phrase set.
 *
 * Note: the app now has real Supabase accounts for Pro/Pro+ subscription
 * management (src/lib/auth/auth-context.tsx) — "Çıkış yap" is expected UI
 * copy, not a regression, so the older no-accounts guardrail was removed.
 */

const SRC_ROOT = join(process.cwd(), "src");

function collectFiles(entry: string, extensions: Set<string>): string[] {
  const stats = statSync(entry);
  if (stats.isFile()) {
    return extensions.has(entry.slice(entry.lastIndexOf("."))) ? [entry] : [];
  }
  if (stats.isDirectory()) {
    return readdirSync(entry).flatMap((child) => collectFiles(join(entry, child), extensions));
  }
  return [];
}

const sourceFiles = collectFiles(SRC_ROOT, new Set([".ts", ".tsx"]));

describe("UI copy guardrails", () => {
  it("never references the FireVibe export's remote mock image domain", () => {
    const offenders = sourceFiles.filter((file) => readFileSync(file, "utf-8").includes("supabase.co"));
    expect(offenders).toEqual([]);
  });

  it('never shows "Yakında" (coming soon) anywhere in the active app', () => {
    const offenders = sourceFiles
      .filter((file) => !file.endsWith(".test.ts") && !file.endsWith(".test.tsx"))
      .filter((file) => readFileSync(file, "utf-8").includes("Yakında"));
    expect(offenders).toEqual([]);
  });

  it("every product module in the registry is active (no planned/coming-soon modules)", async () => {
    const { productModules } = await import("@/lib/modules/registry");
    for (const productModule of productModules) {
      expect(productModule.status).toBe("active");
    }
  });
});
