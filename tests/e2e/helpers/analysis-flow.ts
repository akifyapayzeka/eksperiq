import type { Page } from "@playwright/test";

/**
 * `/analiz` now opens on an intent-choice screen ("Araç satın alacağım" vs.
 * "Kendi aracımı analiz edeceğim") instead of the manual-entry form directly.
 * Every test that needs the purchase-analysis form goes through this helper
 * instead of asserting on the form immediately after `page.goto("/analiz")`.
 */
export async function gotoAnalysisForm(page: Page): Promise<void> {
  await page.goto("/analiz");
  const paywallClose = page.getByRole("button", { name: "Kapat" });
  if (await paywallClose.isVisible().catch(() => false)) {
    await paywallClose.click();
  }
  await page.getByRole("button", { name: "Araç satın alacağım" }).click();
}
