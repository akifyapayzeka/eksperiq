import { expect, test, type Page } from "@playwright/test";
import path from "node:path";
import { demoVehicleInput } from "../fixtures/demo-vehicle";
import { stubClipboard } from "./helpers/clipboard";

const vehiclePhotoFixturePath = path.join(__dirname, "..", "fixtures", "large-photo.jpg");

async function fillRequiredForm(page: Page) {
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

async function selectVehiclePhoto(page: Page) {
  await page.locator('input[type="file"]').setInputFiles(vehiclePhotoFixturePath);
  await expect(page.getByText("1 fotoğraf seçildi.")).toBeVisible();
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
  await selectVehiclePhoto(page);
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
  await expect(page.getByRole("link", { name: "Bakım ve Ödeme Takvimi'ne git" })).toHaveAttribute(
    "href",
    "/bakim-odeme-takvimi",
  );

  await page.goto("/arac-saglik-karnesi");
  // The default vehicle is hydrated asynchronously (a requestAnimationFrame
  // after mount) — filling and submitting the form before that lands can
  // silently no-op addRecord()'s `if (!selectedVehicleId) return;` guard.
  await expect(page.getByLabel("Araç seç")).not.toHaveValue("");
  await page.getByLabel("Başlık").fill("90 bin km bakımı");
  await page.getByRole("button", { name: "Kaydı ekle" }).click();
  await expect(page.getByRole("heading", { name: "90 bin km bakımı" })).toBeVisible();

  await page.goto("/arac-deger-takibi");
  const askingPriceInput = page.getByLabel("İncelenen ilan fiyatı");
  await askingPriceInput.fill("");
  await askingPriceInput.pressSequentially("1500000");
  await expect(askingPriceInput).toHaveValue("1500000");
  await expect(page.getByText(/piyasa aralığının üzerinde/)).toBeVisible();
  const sampleCountInput = page.getByLabel("Benzer ilan sayısı");
  await sampleCountInput.fill("");
  await sampleCountInput.pressSequentially("1");
  await expect(sampleCountInput).toHaveValue("1");
  await expect(page.getByText(/güvenilirliği düşüktür/)).toBeVisible();
});

test("health record entries persist across reloads and build a score trend", async ({ page }) => {
  await page.goto("/arac-saglik-karnesi");
  // See the matching comment on the "module cards open usable assistant
  // tools" test above — the default vehicle hydrates asynchronously.
  await expect(page.getByLabel("Araç seç")).not.toHaveValue("");

  await page.getByLabel("Tür").selectOption("Sağlık Skoru");
  await page.getByLabel("Başlık").fill("İlk kontrol");
  await page.getByLabel("Tarih", { exact: true }).fill("2026-06-01");
  await page.getByLabel("Skor (opsiyonel, 0-100)").fill("60");
  await page.getByRole("button", { name: "Kaydı ekle" }).click();
  await expect(page.getByRole("heading", { name: "İlk kontrol" })).toBeVisible();

  await page.getByLabel("Başlık").fill("İkinci kontrol");
  await page.getByLabel("Tarih", { exact: true }).fill("2026-08-01");
  await page.getByLabel("Skor (opsiyonel, 0-100)").fill("80");
  await page.getByRole("button", { name: "Kaydı ekle" }).click();

  await expect(page.getByRole("heading", { name: "Sağlık skoru trendi" })).toBeVisible();
  await expect(page.getByRole("img", { name: "Zaman içinde sağlık skoru trendi" })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("heading", { name: "İlk kontrol" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "İkinci kontrol" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Sağlık skoru trendi" })).toBeVisible();

  await page.locator("article", { hasText: "İlk kontrol" }).getByRole("button", { name: "Sil" }).click();
  await page.reload();
  await expect(page.getByRole("heading", { name: "İlk kontrol" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "İkinci kontrol" })).toBeVisible();

  await page.getByRole("button", { name: "Araç ekle" }).click();
  await page.getByLabel("Araç adı").fill("İkinci Arabam");
  await page.getByRole("button", { name: "Ekle", exact: true }).click();
  await expect(page.getByRole("heading", { name: "İkinci kontrol" })).toHaveCount(0);
  await expect(page.getByText("Henüz kayıt eklenmedi.")).toBeVisible();

  await page.locator("#vehicle-switcher-select").selectOption({ label: "Aracım" });
  await expect(page.getByRole("heading", { name: "İkinci kontrol" })).toBeVisible();
});

test("report action buttons show visible feedback", async ({ page }) => {
  await stubClipboard(page);
  await page.goto("/analiz");
  await fillRequiredForm(page);
  await page.getByRole("button", { name: "Analiz oluştur" }).click();
  await expect(page).toHaveURL(/\/sonuc$/);

  await page.getByRole("button", { name: "Soruları kopyala" }).click();
  await expect(page.getByText("Satıcı soruları panoya kopyalandı.")).toBeVisible();

  await page.getByRole("button", { name: "Raporu yazdır" }).click();
  await expect(page.getByText(/Yazdırma penceresi açıldı/)).toBeVisible();
});

test("comparison page lists analyses added from the result screen and enforces the 3-entry cap", async ({ page }) => {
  test.setTimeout(60000);

  async function createAndAddAnalysis(price: string) {
    await page.goto("/analiz");
    await fillRequiredForm(page);
    await page.getByLabel("İstenen fiyat").fill(price);
    await page.getByRole("button", { name: "Analiz oluştur" }).click();
    await expect(page).toHaveURL(/\/sonuc$/);
    await page.getByRole("button", { name: "Karşılaştırmaya ekle" }).click();
  }

  await createAndAddAnalysis("1200000");
  await expect(page.getByText("İlan karşılaştırma listesine eklendi.")).toBeVisible();

  await createAndAddAnalysis("1350000");
  await createAndAddAnalysis("1450000");

  await page.goto("/karsilastirma");
  await expect(page.getByRole("cell", { name: "1.200.000 TL" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "1.350.000 TL" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "1.450.000 TL" })).toBeVisible();

  await createAndAddAnalysis("1500000");
  await expect(
    page.getByText("Karşılaştırma listesi dolu (en fazla 3 ilan). Karşılaştırma sayfasından bir kaydı kaldırın."),
  ).toBeVisible();

  await page.goto("/karsilastirma");
  await page
    .getByRole("button", { name: /karşılaştırmadan kaldır/ })
    .first()
    .click();
  await expect(page.getByRole("cell", { name: "1.200.000 TL" })).toHaveCount(0);
});

test("clicking 'Karşılaştırmaya ekle' twice on the same result only adds one entry", async ({ page }) => {
  await page.goto("/analiz");
  await fillRequiredForm(page);
  await page.getByLabel("İstenen fiyat").fill("999000");
  await page.getByRole("button", { name: "Analiz oluştur" }).click();
  await expect(page).toHaveURL(/\/sonuc$/);

  await page.getByRole("button", { name: "Karşılaştırmaya ekle" }).click();
  await expect(page.getByRole("button", { name: "Karşılaştırmaya eklendi" })).toBeDisabled();

  await page.goto("/karsilastirma");
  await expect(page.getByRole("cell", { name: "999.000 TL" })).toHaveCount(1);
});

test("maintenance and payment calendar tracks upcoming dates and syncs to the garage widget", async ({ page }) => {
  await page.goto("/bakim-odeme-takvimi");

  await expect(page.getByRole("heading", { name: "Bildirimler" })).toBeVisible();

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

  await page.goto("/bakim-odeme-takvimi");
  await page.reload();
  await expect(page.getByText("MTV 1. taksit")).toBeVisible();
  await expect(page.getByText("MTV 2. taksit")).toBeVisible();
});

test("maintenance calendar keeps a separate reminder list per vehicle", async ({ page }) => {
  await page.goto("/bakim-odeme-takvimi");

  await page.getByRole("button", { name: "MTV taksitlerini ekle (Ocak/Temmuz)" }).click();
  await expect(page.getByText("MTV 1. taksit")).toBeVisible();

  await page.getByRole("button", { name: "Araç ekle" }).click();
  await page.getByLabel("Araç adı").fill("İkinci Arabam");
  await page.getByRole("button", { name: "Ekle", exact: true }).click();

  await expect(page.getByText("MTV 1. taksit")).toHaveCount(0);
  await expect(page.getByText("Henüz takip edilen tarih yok.")).toBeVisible();

  await page.locator("#vehicle-switcher-select").selectOption({ label: "Aracım" });
  await expect(page.getByText("MTV 1. taksit")).toBeVisible();

  await page.reload();
  await expect(page.locator("#vehicle-switcher-select option")).toHaveCount(2);
  await expect(page.getByText("MTV 1. taksit")).toBeVisible();
});

test("maintenance calendar cancels an in-progress edit when the vehicle changes", async ({ page }) => {
  await page.goto("/bakim-odeme-takvimi");

  const form = page.locator("section", { has: page.getByRole("heading", { name: "Kayıt ekle" }) });
  await expect(form.getByLabel("Başlık")).toHaveValue("MTV taksiti");
  await form.getByLabel("Tür").selectOption("muayene");
  await form.getByLabel("Başlık").fill("");
  await form.getByLabel("Başlık").pressSequentially("Aracım muayenesi");
  await form.getByLabel("Son tarih").fill("2026-12-01");
  await expect(form.getByLabel("Başlık")).toHaveValue("Aracım muayenesi");
  await expect(form.getByLabel("Son tarih")).toHaveValue("2026-12-01");
  await page.getByRole("button", { name: "Kaydı ekle", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Aracım muayenesi" })).toBeVisible();
  await page.getByText("Düzenle", { exact: true }).click();
  await expect(page.getByRole("heading", { name: "Kaydı düzenle" })).toBeVisible();

  await page.getByRole("button", { name: "Araç ekle" }).click();
  await page.getByLabel("Araç adı").fill("İkinci Arabam");
  await page.getByRole("button", { name: "Ekle", exact: true }).click();

  await expect(page.getByRole("heading", { name: "Kayıt ekle" })).toBeVisible();
  await expect(page.getByLabel("Başlık")).toHaveValue("MTV taksiti");
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

test("sale preparation checklist persists checked items within the session", async ({ page }) => {
  await page.goto("/satis-hazirligi");
  await expect(page.getByText("0/10", { exact: true })).toBeVisible();

  await page.getByLabel("Son bakım faturalarını hazırla").check();
  await page.getByLabel("Yedek anahtarı bul").check();
  await expect(page.getByText("2/10", { exact: true })).toBeVisible();

  await page.reload();
  await expect(page.getByText("2/10", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Son bakım faturalarını hazırla")).toBeChecked();
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
  await page.getByLabel("Tutar (TL)").pressSequentially("1000");
  await page.getByLabel("Tarih").fill("2026-08-01");
  await page.getByLabel("Kilometre (opsiyonel)").fill("10000");
  await page.getByRole("button", { name: "Gideri kaydet" }).click();
  await expect(page.getByText("Gider eklendi.")).toBeVisible();

  await page.getByLabel("Tür").selectOption("bakim");
  await page.getByLabel("Tutar (TL)").pressSequentially("500");
  await page.getByLabel("Tarih").fill("2026-08-15");
  await page.getByLabel("Kilometre (opsiyonel)").fill("10500");
  await page.getByRole("button", { name: "Gideri kaydet" }).click();

  await expect(page.getByText("Toplam gider").locator("..").getByText("1.500 TL")).toBeVisible();
  await expect(page.getByText("3 TL/km")).toBeVisible();
  const categorySection = page.locator("section", { hasText: "Kategoriye göre toplam" });
  await expect(categorySection.getByText("Yakıt", { exact: true })).toBeVisible();
  await expect(categorySection.getByText("Bakım", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Araç ekle" }).click();
  await page.getByLabel("Araç adı").fill("İkinci Arabam");
  await page.getByRole("button", { name: "Ekle", exact: true }).click();
  await expect(page.getByText("Henüz gider eklenmedi.")).toBeVisible();

  await page.locator("#vehicle-switcher-select").selectOption({ label: "Aracım" });
  await expect(page.getByText("Toplam gider").locator("..").getByText("1.500 TL")).toBeVisible();
});

test("photo damage tool refuses non-vehicle photos via the AI's own check", async ({ page }) => {
  await page.route("**/api/ai/photo-damage", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        analysis: {
          isVehiclePhoto: false,
          summary: "Fotoğrafta araç veya araç parçası tespit edilemedi.",
          findings: [],
          disclaimer: "Bu AI fotoğraf kontrolü kesin hasar tespiti değildir.",
        },
        remaining: 9,
      }),
    });
  });

  await page.goto("/fotograf-hasar");
  await selectVehiclePhoto(page);
  await page.getByRole("button", { name: "AI ile fotoğrafı analiz et" }).click();
  await expect(
    page.getByText("AI bu görselde araç veya araç parçası güvenle tespit edemedi. Hasar bulgusu oluşturulmadı."),
  ).toBeVisible();
  await expect(page.getByText("Ön tampon: Çizik")).toHaveCount(0);
});

test("saved photo analysis appears in Analizlerim", async ({ page }) => {
  await page.goto("/fotograf-hasar");
  await selectVehiclePhoto(page);
  await page.getByLabel("Bölge").selectOption("Ön tampon");
  await page.getByLabel("Bulgu").selectOption("Çizik");
  await page.getByLabel("Güven seviyesi").selectOption("Orta olasılık");
  await page.getByRole("button", { name: "Bulguyu ekle" }).click();
  await expect(page.getByText("Ön tampon: Çizik")).toBeVisible();

  await expect(page.getByRole("button", { name: "Analizi kaydet" })).toBeEnabled();
  await page.getByRole("button", { name: "Analizi kaydet" }).click();
  await expect(page.getByText("Analiz kaydedildi. Analizlerim sayfasında görebilirsiniz.")).toBeVisible();

  await page.goto("/analizlerim");
  await expect(page.getByRole("heading", { name: "Fotoğraf analizlerim" })).toBeVisible();
  await expect(page.getByText("Ön tampon: Çizik")).toBeVisible();
  await expect(page.getByText("Henüz kaydedilmiş fotoğraf analizi yok.")).toHaveCount(0);

  await page.getByRole("button", { name: "Sil" }).click();
  await expect(page.getByText("Henüz kaydedilmiş fotoğraf analizi yok.")).toBeVisible();
});
