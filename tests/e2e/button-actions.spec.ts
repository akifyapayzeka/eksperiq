import { expect, test, type Page } from "@playwright/test";
import { demoVehicleInput } from "../fixtures/demo-vehicle";
import { gotoAnalysisForm } from "./helpers/analysis-flow";

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
  await garageLink.click();
  await expect(page).toHaveURL(/\/arac-saglik-karnesi$/);
  // Sayfanın ilk landmark başlığı; eski metin ("Analiz, bakım ve notları tek
  // ekranda tut") bu ekranda hiç bulunmuyor.
  await expect(page.locator("#vehicle-section-title")).toBeVisible();
});

test("analysis list filters and search controls update results", async ({ page }) => {
  await gotoAnalysisForm(page);
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

/**
 * "Verilerim" bölümü uzun süre koda yazılmış ama hiçbir ekrana bağlanmamıştı:
 * `deleteAllLocalData` / `exportDataAsJson` / `getStorageUsageSummary`
 * yazılmış ve birim testleri varken onları çağıran bileşen silinmişti — yani
 * kullanıcının verisini toptan silmesinin veya yedeklemesinin hiçbir yolu
 * yoktu. Birim testleri bunu göremezdi (fonksiyonlar tek tek çalışıyordu);
 * ekrana bağlı olduğunu ancak buradaki gibi bir uçtan uca test görür.
 */
test("profildeki Verilerim bölümü gerçekten çalışır", async ({ page }) => {
  await page.goto("/profil");
  await expect(page.getByRole("heading", { name: "Verilerim" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Verilerimi dışa aktar" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Yedeği geri yükle" })).toBeVisible();

  // Yanlislikla tek dokunusla silinmesin: onay yazilmadan buton kapali.
  const deleteButton = page.getByRole("button", { name: "Tüm verilerimi sil" });
  await expect(deleteButton).toBeDisabled();
  await page.getByLabel("Onay").fill("SİL");
  await expect(deleteButton).toBeEnabled();

  await deleteButton.click();
  await expect(page.getByText(/verileriniz bu cihazdan silindi/i)).toBeVisible();
});
