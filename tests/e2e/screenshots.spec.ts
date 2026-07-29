import { mkdir } from "node:fs/promises";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { demoVehicleInput } from "../fixtures/demo-vehicle";

const screenshotDir = path.join("test-results", "screenshots");
const screenshotOnlyCss = `
  nextjs-portal,
  [data-nextjs-toast],
  [data-nextjs-devtools-button] {
    display: none !important;
  }
`;

async function prepareScreenshotPage(page: Page) {
  await page.addStyleTag({ content: screenshotOnlyCss });
}

function requiredSelectValue(value: string | undefined, fieldName: string) {
  if (!value) {
    throw new Error(`${fieldName} demo degeri eksik.`);
  }

  return value;
}

async function fillDemoVehicle(page: Page) {
  for (const [name, value] of Object.entries({
    brand: demoVehicleInput.brand,
    model: demoVehicleInput.model,
    year: String(demoVehicleInput.year),
    trim: demoVehicleInput.trim,
    mileage: String(demoVehicleInput.mileage),
    price: String(demoVehicleInput.price),
    city: demoVehicleInput.city,
    engineSize: demoVehicleInput.engineSize,
    enginePower: demoVehicleInput.enginePower,
    listingUrl: demoVehicleInput.listingUrl,
    tramerAmount: String(demoVehicleInput.tramerAmount),
    paintedParts: demoVehicleInput.paintedParts,
    replacedParts: demoVehicleInput.replacedParts,
    localPaintedParts: demoVehicleInput.localPaintedParts,
    lastMaintenanceDate: demoVehicleInput.lastMaintenanceDate,
    timingBeltInfo: demoVehicleInput.timingBeltInfo,
    transmissionMaintenanceInfo: demoVehicleInput.transmissionMaintenanceInfo,
    inspectionEndDate: demoVehicleInput.inspectionEndDate,
    sellerDescription: demoVehicleInput.sellerDescription,
  })) {
    if (value) await page.locator(`[name="${name}"]`).fill(value);
  }

  await page.locator('[name="fuelType"]').selectOption(demoVehicleInput.fuelType);
  await page.locator('[name="transmission"]').selectOption(demoVehicleInput.transmission);
  await page.locator('[name="bodyType"]').selectOption(requiredSelectValue(demoVehicleInput.bodyType, "bodyType"));
  await page
    .locator('[name="drivetrain"]')
    .selectOption(requiredSelectValue(demoVehicleInput.drivetrain, "drivetrain"));
  await page.locator('[name="ownerInfo"]').selectOption(requiredSelectValue(demoVehicleInput.ownerInfo, "ownerInfo"));
  await page
    .locator('[name="tradeStatus"]')
    .selectOption(requiredSelectValue(demoVehicleInput.tradeStatus, "tradeStatus"));
  await page
    .locator('[name="airbagStatus"]')
    .selectOption(requiredSelectValue(demoVehicleInput.airbagStatus, "airbagStatus"));
  await page
    .locator('[name="batteryStatus"]')
    .selectOption(requiredSelectValue(demoVehicleInput.batteryStatus, "batteryStatus"));
  await page
    .locator('[name="tireStatus"]')
    .selectOption(requiredSelectValue(demoVehicleInput.tireStatus, "tireStatus"));
  await page.locator('[name="lpgStatus"]').selectOption(requiredSelectValue(demoVehicleInput.lpgStatus, "lpgStatus"));
  await page.locator('[name="hasMaintenanceInvoices"]').check();
  await page.locator('[name="hasExpertiseReport"]').check();
  await page.locator('[name="hasSpareKey"]').check();
}

test("captures release screenshots", async ({ page }, testInfo) => {
  await mkdir(screenshotDir, { recursive: true });
  const prefix = testInfo.project.name;

  await page.goto("/");
  await prepareScreenshotPage(page);
  await expect(page.getByRole("heading", { name: "Araç ilanını daha bilinçli değerlendir." })).toBeVisible();
  await page.screenshot({ fullPage: true, path: path.join(screenshotDir, `${prefix}-home.png`) });

  await page.goto("/analiz");
  await prepareScreenshotPage(page);
  await fillDemoVehicle(page);
  await page.screenshot({ fullPage: true, path: path.join(screenshotDir, `${prefix}-analysis-form.png`) });

  await page.getByRole("button", { name: "Analiz oluştur" }).click();
  await expect(page).toHaveURL(/\/sonuc$/);
  await prepareScreenshotPage(page);
  await expect(page.getByText("Araç Risk Skoru")).toBeVisible();
  await page.screenshot({ fullPage: true, path: path.join(screenshotDir, `${prefix}-result.png`) });

  await page.goto("/analizlerim");
  await prepareScreenshotPage(page);
  await expect(page.getByRole("heading", { name: "Analizlerim" })).toBeVisible();
  await page.screenshot({ fullPage: true, path: path.join(screenshotDir, `${prefix}-my-analyses.png`) });

  await page.goto("/offline");
  await prepareScreenshotPage(page);
  await expect(page.getByRole("heading", { name: "Bağlantı gerekiyor" })).toBeVisible();
  await page.screenshot({ fullPage: true, path: path.join(screenshotDir, `${prefix}-offline.png`) });
});
