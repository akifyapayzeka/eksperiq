import { expect, test } from "@playwright/test";
import { demoVehicleInput } from "../fixtures/demo-vehicle";

async function fillRequiredForm(page: import("@playwright/test").Page) {
  await page.getByLabel("Marka").selectOption(demoVehicleInput.brand);
  await page.locator("#model").selectOption(demoVehicleInput.model);
  await page.getByLabel("Model yılı").fill(String(demoVehicleInput.year));
  await page.getByLabel("Yakıt türü").selectOption(demoVehicleInput.fuelType);
  await page.getByLabel("Vites türü").selectOption(demoVehicleInput.transmission);
  await page.getByLabel("Kilometre").fill(String(demoVehicleInput.mileage));
  await page.getByLabel("İstenen fiyat").fill(String(demoVehicleInput.price));
  await page.getByLabel("Şehir").selectOption(demoVehicleInput.city);
  await page.getByLabel("Satıcı açıklaması veya araç notu").fill(demoVehicleInput.sellerDescription);
}

test("module cards open usable assistant tools", async ({ page }) => {
  await page.route("**/api/ai/photo-damage", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        analysis: {
          isVehiclePhoto: true,
          summary: "Fotoğrafta araç ön bölgesi görünüyor.",
          findings: [
            {
              id: "ai-photo-1",
              area: "Ön tampon",
              signal: "Çizik",
              confidence: "medium",
              explanation: "Ön tampon bölgesinde çizik benzeri yüzey izi seçiliyor.",
              recommendation: "Boya kalınlığı ve tampon bağlantı noktalarını ekspertizde kontrol ettirin.",
            },
          ],
          disclaimer: "Bu AI fotoğraf kontrolü kesin hasar tespiti değildir.",
        },
        remaining: 9,
      }),
    });
  });

  await page.goto("/moduller");

  await page.locator('a[href="/fotograf-hasar"]').click();
  await expect(page).toHaveURL(/\/fotograf-hasar$/);
  await expect(page.getByRole("button", { name: "Bulguyu ekle" })).toBeDisabled();
  await page.locator('input[type="file"]').setInputFiles({
    name: "arac-on-tampon.jpg",
    mimeType: "image/jpeg",
    buffer: Buffer.from("fake-image"),
  });
  await page.getByLabel("Fotoğrafta araç veya araç parçası görünüyor").check();
  await page.getByLabel("Bölge").selectOption("Ön tampon");
  await page.getByLabel("Bulgu").selectOption("Çizik");
  await page.getByLabel("Güven seviyesi").selectOption("Orta olasılık");
  await page.getByRole("button", { name: "Bulguyu ekle" }).click();
  await expect(page.getByText("Ön tampon: Çizik")).toBeVisible();
  await page.getByRole("button", { name: "AI ile fotoğrafı analiz et" }).click();
  await expect(page.getByText("AI fotoğraf kontrolü tamamlandı. Bugün kalan hak: 9")).toBeVisible();
  await expect(page.getByText("Ön tampon: Çizik")).toHaveCount(2);

  await page.goto("/bakim-takibi");
  await page.getByLabel("Güncel kilometre").fill("98000");
  await expect(page.getByText("Yakın kontrol").first()).toBeVisible();

  await page.goto("/arac-saglik-karnesi");
  await page.getByLabel("Başlık").fill("90 bin km bakımı");
  await page.getByRole("button", { name: "Kaydı ekle" }).click();
  await expect(page.getByRole("heading", { name: "90 bin km bakımı" })).toBeVisible();

  await page.goto("/arac-deger-takibi");
  await page.getByLabel("İncelenen ilan fiyatı").fill("1500000");
  await expect(page.getByText(/piyasa aralığının üzerinde/)).toBeVisible();
});

test("report action buttons show visible feedback", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: "http://127.0.0.1:3000" });
  await page.goto("/analiz");
  await fillRequiredForm(page);
  await page.getByRole("button", { name: "Analiz oluştur" }).click();
  await expect(page).toHaveURL(/\/sonuc$/);

  await page.getByRole("button", { name: "Soruları kopyala" }).click();
  await expect(page.getByText("Satıcı soruları panoya kopyalandı.")).toBeVisible();

  await page.getByRole("button", { name: "Raporu yazdır" }).click();
  await expect(page.getByText(/Yazdırma penceresi açıldı/)).toBeVisible();
});

test("photo damage tool refuses non-vehicle photos", async ({ page }) => {
  await page.goto("/fotograf-hasar");
  await page.locator('input[type="file"]').setInputFiles({
    name: "yumurta.jpg",
    mimeType: "image/jpeg",
    buffer: Buffer.from("fake-egg-image"),
  });
  await page.getByLabel("Araç görünmüyor veya emin değilim").check();
  await expect(page.getByText("Araç görünmeyen fotoğraflar için hasar bulgusu oluşturulmaz.")).toBeVisible();
  await expect(page.getByText("Araç görünmüyor seçildiği için AI hasar analizi kapatıldı.")).toBeVisible();
  await expect(page.getByRole("button", { name: "AI ile fotoğrafı analiz et" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Bulguyu ekle" })).toBeDisabled();
  await expect(page.getByText("Ön tampon: Çizik")).toHaveCount(0);
});
