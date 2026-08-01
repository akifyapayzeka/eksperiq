import { expect, test } from "@playwright/test";

test("module cards open usable assistant tools", async ({ page }) => {
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
  await page.getByRole("button", { name: "Örnek ilanla doldur" }).click();
  await expect(page.getByText("Örnek ilan dolduruldu.")).toBeVisible();
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
  await expect(page.getByRole("button", { name: "Bulguyu ekle" })).toBeDisabled();
  await expect(page.getByText("Ön tampon: Çizik")).toHaveCount(0);
});
