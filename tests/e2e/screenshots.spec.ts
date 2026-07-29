import { mkdir } from "node:fs/promises";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { demoVehicleInput } from "../fixtures/demo-vehicle";

const screenshotDir = path.join("test-results", "screenshots");

async function fillDemoVehicle(page: Page) {
  for (const [name, value] of Object.entries({
    brand: demoVehicleInput.brand,
    model: demoVehicleInput.model,
    year: String(demoVehicleInput.year),
    trim: demoVehicleInput.trim,
    mileage: String(demoVehicleInput.mileage),
    price: String(demoVehicleInput.price),
    city: demoVehicleInput.city,
    bodyType: demoVehicleInput.bodyType,
    engineSize: demoVehicleInput.engineSize,
    enginePower: demoVehicleInput.enginePower,
    drivetrain: demoVehicleInput.drivetrain,
    ownerInfo: demoVehicleInput.ownerInfo,
    tradeStatus: demoVehicleInput.tradeStatus,
    listingUrl: demoVehicleInput.listingUrl,
    tramerAmount: String(demoVehicleInput.tramerAmount),
    paintedParts: demoVehicleInput.paintedParts,
    replacedParts: demoVehicleInput.replacedParts,
    localPaintedParts: demoVehicleInput.localPaintedParts,
    airbagStatus: demoVehicleInput.airbagStatus,
    lastMaintenanceDate: demoVehicleInput.lastMaintenanceDate,
    timingBeltInfo: demoVehicleInput.timingBeltInfo,
    transmissionMaintenanceInfo: demoVehicleInput.transmissionMaintenanceInfo,
    batteryStatus: demoVehicleInput.batteryStatus,
    tireStatus: demoVehicleInput.tireStatus,
    inspectionEndDate: demoVehicleInput.inspectionEndDate,
    lpgStatus: demoVehicleInput.lpgStatus,
    sellerDescription: demoVehicleInput.sellerDescription,
  })) {
    if (value) await page.locator(`[name="${name}"]`).fill(value);
  }

  await page.locator('[name="fuelType"]').selectOption(demoVehicleInput.fuelType);
  await page.locator('[name="transmission"]').selectOption(demoVehicleInput.transmission);
  await page.locator('[name="hasMaintenanceInvoices"]').check();
  await page.locator('[name="hasExpertiseReport"]').check();
  await page.locator('[name="hasSpareKey"]').check();
}

test("captures release screenshots", async ({ page }, testInfo) => {
  await mkdir(screenshotDir, { recursive: true });
  const prefix = testInfo.project.name;

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Araç ilanını daha bilinçli değerlendir." })).toBeVisible();
  await page.screenshot({ fullPage: true, path: path.join(screenshotDir, `${prefix}-home.png`) });

  await page.goto("/analiz");
  await fillDemoVehicle(page);
  await page.screenshot({ fullPage: true, path: path.join(screenshotDir, `${prefix}-analysis-form.png`) });

  await page.getByRole("button", { name: "Analiz oluştur" }).click();
  await expect(page).toHaveURL(/\/sonuc$/);
  await expect(page.getByText("Araç Risk Skoru")).toBeVisible();
  await page.screenshot({ fullPage: true, path: path.join(screenshotDir, `${prefix}-result.png`) });

  await page.goto("/offline");
  await expect(page.getByRole("heading", { name: "Bağlantı gerekiyor" })).toBeVisible();
  await page.screenshot({ fullPage: true, path: path.join(screenshotDir, `${prefix}-offline.png`) });
});
