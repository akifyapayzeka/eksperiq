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

/**
 * `/sonuc` raporu sekmelere bölünmüş ("Alıcı Kararı", "Özet", "Riskler",
 * "Alım Planı", "Araç/Fotolar", "Kontrol Listesi"). Aktif olmayan panel
 * `hidden` sınıfıyla duruyor: içindeki başlık DOM'da VAR ama görünmüyor, bu
 * yüzden `toBeVisible()` "hidden" diye düşüyor. Bir bölüme ait iddiadan önce
 * o sekme açılmalı.
 */
export async function openReportTab(page: Page, name: string): Promise<void> {
  await page.getByRole("tab", { name, exact: true }).click();
}
