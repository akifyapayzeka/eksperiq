import { expect, test, type Page } from "@playwright/test";
import { demoVehicleInput } from "../fixtures/demo-vehicle";

async function fillRequiredForm(page: Page) {
  await page.getByLabel("Marka").fill(demoVehicleInput.brand);
  await page.getByLabel("Model", { exact: true }).fill(demoVehicleInput.model);
  await page.getByLabel("Model yılı").fill(String(demoVehicleInput.year));
  await page.getByLabel("Yakıt türü").selectOption(demoVehicleInput.fuelType);
  await page.getByLabel("Vites türü").selectOption(demoVehicleInput.transmission);
  await page.getByLabel("Kilometre").fill(String(demoVehicleInput.mileage));
  await page.getByLabel("İlan fiyatı").fill(String(demoVehicleInput.price));
  await page.getByLabel("Şehir").selectOption(demoVehicleInput.city);
  await page.getByLabel("Tramer tutarı").fill(String(demoVehicleInput.tramerAmount));
  await page.getByLabel("Bakım faturaları var").check();
  await page.getByLabel("Ekspertiz raporu var").check();
  await page.getByLabel("Yedek anahtar var").check();
  await page.getByLabel("İlan açıklaması").fill(demoVehicleInput.sellerDescription);
}

test("home to analysis form", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Ücretsiz analiz et" }).click();
  await expect(page).toHaveURL(/\/analiz$/);
  await expect(page.getByRole("heading", { name: "Araç ilanı analizi" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Form ilerlemesi" })).toBeVisible();
  await expect(page.getByRole("progressbar", { name: "Zorunlu alan ilerlemesi" })).toHaveAttribute(
    "aria-valuenow",
    "0",
  );
  await expect(page.getByRole("navigation", { name: "Analiz formu bölümleri" })).toBeVisible();
  await page.getByRole("link", { name: "Açıklama" }).click();
  await expect(page).toHaveURL(/#seller-description$/);
  await expect(page.getByRole("heading", { name: "Satıcı açıklaması" })).toBeVisible();
});

test("mobile bottom navigation opens app actions", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Mobile bottom navigation is only visible on small screens.");

  await page.goto("/");
  const mobileNav = page.getByRole("navigation", { name: "Mobil alt menü" });
  await expect(mobileNav).toBeVisible();
  await expect(mobileNav.getByRole("link", { name: "Profil" })).toBeVisible();
  await expect(mobileNav.getByRole("link", { name: "Yeni Analiz" })).toBeVisible();
  await expect(mobileNav.getByRole("link", { name: "Analiz Raporu" })).toBeVisible();
  await expect(mobileNav.getByRole("link", { name: "Uzmanlık Kontrol" })).toBeVisible();

  await mobileNav.getByRole("link", { name: "Profil" }).click();
  await expect(page).toHaveURL(/\/profil$/);
  await expect(page.getByRole("heading", { name: "EksperIQ hesabı olmadan kullanılabilir." })).toBeVisible();

  await page.getByRole("navigation", { name: "Mobil alt menü" }).getByRole("link", { name: "Yeni Analiz" }).click();
  await expect(page).toHaveURL(/\/analiz$/);
  await expect(page.getByRole("heading", { name: "Araç ilanı analizi" })).toBeVisible();

  await page.getByRole("navigation", { name: "Mobil alt menü" }).getByRole("link", { name: "Analiz Raporu" }).click();
  await expect(page).toHaveURL(/\/analizlerim$/);
  await expect(page.getByRole("heading", { name: "Analizlerim" })).toBeVisible();

  await page
    .getByRole("navigation", { name: "Mobil alt menü" })
    .getByRole("link", { name: "Uzmanlık Kontrol" })
    .click();
  await expect(page).toHaveURL(/\/kontrol-listesi$/);
  await expect(page.getByRole("heading", { name: "Satın alma öncesi son kontroller" })).toBeVisible();
});

test("shows validation errors", async ({ page }) => {
  await page.goto("/analiz");
  await page.getByRole("button", { name: "Analiz oluştur" }).click();
  await expect(page.getByText("Marka zorunludur.")).toBeVisible();
  await expect(page.getByText("İlan açıklaması en az 20 karakter olmalı.")).toBeVisible();
});

test("fills form with demo listing", async ({ page }) => {
  await page.goto("/analiz");
  await page.getByRole("button", { name: "Örnek ilanla doldur" }).click();
  await expect(page.getByLabel("Marka")).toHaveValue(demoVehicleInput.brand);
  await expect(page.getByLabel("Model", { exact: true })).toHaveValue(demoVehicleInput.model);
  await expect(page.getByRole("progressbar", { name: "Zorunlu alan ilerlemesi" })).toHaveAttribute(
    "aria-valuenow",
    "9",
  );
});

test("uses select controls for fixed-choice vehicle details", async ({ page }) => {
  await page.goto("/analiz");

  const selectLabels = [
    "Kasa tipi",
    "Şehir",
    "Çekiş tipi",
    "Ruhsat sahibi bilgisi",
    "Takas durumu",
    "Airbag durumu",
    "Akü durumu",
    "Lastik durumu",
    "LPG durumu",
  ];

  for (const label of selectLabels) {
    await expect(page.getByLabel(label)).toHaveJSProperty("tagName", "SELECT");
  }

  await page.getByLabel("Takas durumu").selectOption("Takas yok");
  await page.getByLabel("Akü durumu").selectOption("İyi");
  await page.getByLabel("Lastik durumu").selectOption("Orta");
  await page.getByLabel("LPG durumu").selectOption("Yok");

  await expect(page.getByLabel("Takas durumu")).toHaveValue("Takas yok");
  await expect(page.getByLabel("Akü durumu")).toHaveValue("İyi");
  await expect(page.getByLabel("Lastik durumu")).toHaveValue("Orta");
  await expect(page.getByLabel("LPG durumu")).toHaveValue("Yok");
  await expect(page.getByLabel("Kilometre")).toHaveAttribute("type", "number");
  await expect(page.getByLabel("Muayene bitiş tarihi")).toHaveAttribute("type", "date");
});

test("uses tappable damage part choices instead of text inputs", async ({ page }) => {
  await page.goto("/analiz");

  await expect(page.locator('input[name="paintedParts"]')).toHaveAttribute("type", "hidden");
  await expect(page.locator('input[name="replacedParts"]')).toHaveAttribute("type", "hidden");
  await expect(page.locator('input[name="localPaintedParts"]')).toHaveAttribute("type", "hidden");

  const paintedParts = page.getByRole("group", { name: "Boyalı parçalar", exact: true });
  const replacedParts = page.getByRole("group", { name: "Değişen parçalar", exact: true });
  const localPaintedParts = page.getByRole("group", { name: "Lokal boyalı parçalar", exact: true });

  await paintedParts.getByLabel("Sağ ön çamurluk").check();
  await replacedParts.getByLabel("Kaput").check();
  await localPaintedParts.getByLabel("Ön tampon").check();

  await expect(page.locator('input[name="paintedParts"]')).toHaveValue("Sağ ön çamurluk");
  await expect(page.locator('input[name="replacedParts"]')).toHaveValue("Kaput");
  await expect(page.locator('input[name="localPaintedParts"]')).toHaveValue("Ön tampon");
});

test("shows product module roadmap", async ({ page }) => {
  await page.goto("/moduller");
  await expect(
    page.getByRole("heading", { name: "Sadece ilan analizi değil, araç yolculuğu asistanı." }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Garajım" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Aktif modül" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Yakında gelecek özellikler" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "İlan Analizi" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Fotoğraftan Hasar Analizi" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Araç Sağlık Karnesi" })).toBeVisible();
  await expect(page.getByText("Kesinlik sınırı:")).toHaveCount(8);
});

test("shows feedback collection flow", async ({ page }) => {
  await page.goto("/geri-bildirim");
  await expect(page.getByRole("heading", { name: "Geri bildirim" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Kullanıcı testi notu gönder" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Kural geri bildirimi gönder" })).toBeVisible();
  await expect(page.getByRole("link", { name: "İlk kullanıcı testi issue'su" })).toBeVisible();
  await expect(page.getByText("kişisel veri eklemeden")).toBeVisible();
});

test("creates analysis result", async ({ page }) => {
  await page.goto("/analiz");
  await fillRequiredForm(page);
  await expect(page.getByRole("progressbar", { name: "Zorunlu alan ilerlemesi" })).toHaveAttribute(
    "aria-valuenow",
    "9",
  );
  await expect(page.getByText("Zorunlu alanlar tamamlandı.")).toBeVisible();
  await page.getByRole("button", { name: "Analiz oluştur" }).click();
  await expect(page).toHaveURL(/\/sonuc$/);
  await expect(page.getByText("Araç Risk Skoru")).toBeVisible();
  await expect(page.getByText("Bilgi doluluğu")).toBeVisible();
  await expect(page.getByText("Araç ve ilan özeti")).toBeVisible();
  await expect(page.getByText("Skor nasıl okunmalı?")).toBeVisible();
  await expect(page.getByText("Öncelik", { exact: true })).toBeVisible();
  await expect(page.getByLabel("İlk kontrol edilecek risk")).toBeVisible();
  await expect(page.getByText("Sonraki adım")).toBeVisible();
  await expect(page.getByRole("progressbar", { name: "Bilgi doluluğu yüzdesi" })).toBeVisible();
  await expect(page.getByRole("progressbar", { name: "Hasar geçmişi skoru" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Raporu yazdır" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Soruları kopyala" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Satıcı mesajını kopyala" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Rapor özetini kopyala" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Raporu paylaş" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Geri bildirim gönder" })).toBeVisible();
  await expect(page.getByText("Garaj kullanımı iddiası doğrulanmalı")).toBeVisible();
  await expect(page.getByText("Öncelikli ilk aksiyonlar")).toBeVisible();
  await expect(page.getByLabel("Risk bulgusu dağılımı")).toBeVisible();
  await expect(page.getByText("Yüksek riskli bulgu")).toBeVisible();
  await expect(page.getByRole("group", { name: "Risk bulgusu filtresi" })).toBeVisible();
  await page.getByRole("button", { name: /Yüksek \(/ }).click();
  await expect(page.getByRole("button", { name: /Yüksek \(/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText(/\/ Düşük/)).toHaveCount(0);
  await expect(page.getByText("Satıcıya sorulacak sorular")).toBeVisible();
  await expect(page.getByText("Ekspertizde özellikle kontrol edilmesi gerekenler")).toBeVisible();
  await expect(page.getByLabel("Tamamlanan kontroller 0 / 10")).toBeVisible();
  await page.getByLabel("Ruhsat sahibini doğruladım").check();
  await expect(page.getByLabel("Tamamlanan kontroller 1 / 10")).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: /Yüksek \(/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText(/\/ Düşük/)).toHaveCount(0);
  await expect(page.getByLabel("Tamamlanan kontroller 1 / 10")).toBeVisible();
  await expect(page.getByLabel("Ruhsat sahibini doğruladım")).toBeChecked();
  await page.getByRole("button", { name: /Tümü \(/ }).click();
});

test("copies seller-ready message to clipboard", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: "http://127.0.0.1:3000" });
  await page.goto("/analiz");
  await fillRequiredForm(page);
  await page.getByRole("button", { name: "Analiz oluştur" }).click();
  await expect(page).toHaveURL(/\/sonuc$/);

  await page.getByRole("button", { name: "Satıcı mesajını kopyala" }).click();
  await expect(page.getByText("Satıcı mesajı panoya kopyalandı.")).toBeVisible();

  const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboardText).toContain("Merhaba, 2020 Toyota Corolla ilanınızla ilgileniyorum.");
  expect(clipboardText).toContain("Satın alma öncesi birkaç bilgiyi netleştirmek isterim:");
  expect(clipboardText).toContain("kesin ekspertiz sonucu değildir");
});

test("prepares a clean print report", async ({ page }) => {
  await page.goto("/analiz");
  await fillRequiredForm(page);
  await page.getByRole("button", { name: "Analiz oluştur" }).click();
  await expect(page).toHaveURL(/\/sonuc$/);
  await expect(page.getByText(/Rapor tarihi:/)).toBeVisible();

  await page.emulateMedia({ media: "print" });
  await expect(page.getByRole("button", { name: "Raporu yazdır" })).toBeHidden();
  await expect(page.getByText("Araç Risk Skoru")).toBeVisible();
  await expect(page.getByText("Satıcıya sorulacak sorular")).toBeVisible();
});

test("clears current session result", async ({ page }) => {
  await page.goto("/analiz");
  await fillRequiredForm(page);
  await page.getByRole("button", { name: "Analiz oluştur" }).click();
  await page.getByRole("button", { name: "Oturum verisini sil" }).click();
  await expect(page.getByRole("heading", { name: "Analiz bulunamadı" })).toBeVisible();
});

test("mobile pages do not create horizontal overflow", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Mobile overflow is covered by the mobile project.");

  await page.goto("/");
  await expectNoHorizontalOverflow(page);

  await page.goto("/analiz");
  await expectNoHorizontalOverflow(page);

  await fillRequiredForm(page);
  await page.getByRole("button", { name: "Analiz oluştur" }).click();
  await expect(page).toHaveURL(/\/sonuc$/);
  await expectNoHorizontalOverflow(page);
});

async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
}
