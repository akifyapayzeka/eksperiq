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

test("maintenance and payment calendar tracks upcoming dates and syncs to the garage widget", async ({ page }) => {
  await page.goto("/bakim-odeme-takvimi");

  await expect(page.getByText("Bildirim servisi henüz yapılandırılmadı.")).toBeVisible();

  await page.getByRole("button", { name: "MTV taksitlerini ekle (Ocak/Temmuz)" }).click();
  await expect(page.getByText("MTV 1. taksit")).toBeVisible();
  await expect(page.getByText("MTV 2. taksit")).toBeVisible();

  await page.getByLabel("Tür").selectOption("muayene");
  await page.getByLabel("Başlık").fill("Araç muayenesi");
  const nearDate = new Date();
  nearDate.setDate(nearDate.getDate() + 10);
  await page.getByLabel("Son tarih").fill(nearDate.toISOString().slice(0, 10));
  await page.getByLabel("Tutar (opsiyonel, TL)").fill("1200");
  await page.getByRole("button", { name: "Kaydı ekle", exact: true }).click();

  await expect(page.getByText("Araç muayenesi")).toBeVisible();
  await expect(page.getByText("1.200 TL", { exact: false })).toBeVisible();
  await expect(page.getByText("10 gün kaldı")).toBeVisible();

  await page.goto("/arac-saglik-karnesi");
  await expect(page.getByText("Araç muayenesi")).toBeVisible();
  await expect(page.getByText("10 gün kaldı")).toBeVisible();
});

test("test drive checklist tracks progress and persists within the session", async ({ page }) => {
  await page.goto("/test-surusu-kontrol");
  await expect(page.getByRole("heading", { name: "Tamamlanan: 0 / 18" })).toBeVisible();

  await page.getByLabel("Motoru soğukken çalıştırdım (satıcı önceden çalıştırmamış olmalı)").check();
  await page.getByLabel("Fren pedalının hissini ve düz durup durmadığını kontrol ettim").check();
  await expect(page.getByRole("heading", { name: "Tamamlanan: 2 / 18" })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("heading", { name: "Tamamlanan: 2 / 18" })).toBeVisible();
  await expect(page.getByLabel("Motoru soğukken çalıştırdım (satıcı önceden çalıştırmamış olmalı)")).toBeChecked();
});

test("official lookup guide tracks which sources the user has checked", async ({ page }) => {
  await page.goto("/resmi-sorgu-rehberi");
  await expect(page.getByRole("heading", { name: "Kontrol ettiklerim: 0 / 6" })).toBeVisible();

  await page.locator("label", { hasText: "Hasar/TRAMER kaydı" }).locator('input[type="checkbox"]').check();
  await expect(page.getByRole("heading", { name: "Kontrol ettiklerim: 1 / 6" })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("heading", { name: "Kontrol ettiklerim: 1 / 6" })).toBeVisible();
  await expect(
    page.locator("label", { hasText: "Hasar/TRAMER kaydı" }).locator('input[type="checkbox"]'),
  ).toBeChecked();
});

test("expense ledger tracks totals and computes an approximate cost per km", async ({ page }) => {
  await page.goto("/gider-defteri");
  await expect(page.getByText("Bilgi yetersiz")).toBeVisible();

  await page.getByLabel("Tür").selectOption("yakit");
  await page.getByLabel("Tutar (TL)").fill("1000");
  await page.getByLabel("Tarih").fill("2026-08-01");
  await page.getByLabel("Kilometre (opsiyonel)").fill("10000");
  await page.getByRole("button", { name: "Gideri kaydet" }).click();
  await expect(page.getByText("Gider eklendi.")).toBeVisible();

  await page.getByLabel("Tür").selectOption("bakim");
  await page.getByLabel("Tutar (TL)").fill("500");
  await page.getByLabel("Tarih").fill("2026-08-15");
  await page.getByLabel("Kilometre (opsiyonel)").fill("10500");
  await page.getByRole("button", { name: "Gideri kaydet" }).click();

  await expect(page.getByText("Toplam gider").locator("..").getByText("1.500 TL")).toBeVisible();
  await expect(page.getByText("3 TL/km")).toBeVisible();
  const categorySection = page.locator("section", { hasText: "Kategoriye göre toplam" });
  await expect(categorySection.getByText("Yakıt", { exact: true })).toBeVisible();
  await expect(categorySection.getByText("Bakım", { exact: true })).toBeVisible();
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
