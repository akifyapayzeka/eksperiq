import { expect, test, type Page } from "@playwright/test";
import { demoVehicleInput } from "../fixtures/demo-vehicle";

async function fillRequiredForm(page: Page) {
  await page.locator("#brand").selectOption(demoVehicleInput.brand);
  await page.locator("#model").selectOption(demoVehicleInput.model);
  await page.locator("#year").fill(String(demoVehicleInput.year));
  await page.locator("#fuelType").selectOption(demoVehicleInput.fuelType);
  await page.locator("#transmission").selectOption(demoVehicleInput.transmission);
  await page.locator("#mileage").fill(String(demoVehicleInput.mileage));
  await page.locator("#price").fill(String(demoVehicleInput.price));
  await page.locator("#city").selectOption(demoVehicleInput.city);
  await page.locator("#tramerAmount").fill(String(demoVehicleInput.tramerAmount));
  await page.locator('input[name="hasMaintenanceInvoices"]').check();
  await page.locator('input[name="hasExpertiseReport"]').check();
  await page.locator('input[name="hasSpareKey"]').check();
  await page.locator("#sellerDescription").fill(demoVehicleInput.sellerDescription);
}

test("garage entry opens vehicle record page", async ({ page }) => {
  await page.goto("/");
  const garageLink = page.getByRole("link", { name: "Garajı aç" });
  await expect(garageLink).toHaveAttribute("href", "/arac-saglik-karnesi");
  await Promise.all([page.waitForURL(/\/arac-saglik-karnesi$/), garageLink.click()]);
  await expect(page.getByRole("heading", { name: "Analiz, bakım ve notları tek ekranda tut" })).toBeVisible();
});

test("analysis list filters and search controls update results", async ({ page }) => {
  await page.goto("/analiz");
  await fillRequiredForm(page);
  await page.getByRole("button", { name: "Analiz oluştur" }).click();
  await expect(page).toHaveURL(/\/sonuc$/);

  await page.goto("/analizlerim");
  await expect(page.getByRole("heading", { name: "Analizlerim", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Toyota Corolla/ })).toBeVisible();

  await page.getByRole("button", { name: /Y.ksek Risk/ }).click();
  await expect(page.getByRole("button", { name: /Y.ksek Risk/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText(/e.le.en analiz bulunamad/)).toBeVisible();

  await page.getByLabel("Filtreleri temizle").click();
  await expect(page.getByRole("button", { name: /T.m/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("heading", { name: /Toyota Corolla/ })).toBeVisible();

  await page.locator("#analysis-search").fill("Renault");
  await expect(page.getByText(/e.le.en analiz bulunamad/)).toBeVisible();

  await page.getByLabel("Filtreleri temizle").click();
  await page.locator("#analysis-search").fill("Toyota");
  await expect(page.getByRole("heading", { name: /Toyota Corolla/ })).toBeVisible();
});
