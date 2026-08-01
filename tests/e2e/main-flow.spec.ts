import { expect, test, type Page } from "@playwright/test";
import { demoVehicleInput } from "../fixtures/demo-vehicle";

async function fillRequiredForm(page: Page) {
  await page.getByLabel("Marka").selectOption(demoVehicleInput.brand);
  await page.locator("#model").selectOption(demoVehicleInput.model);
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
  const analysisLink = page.getByRole("link", { name: "Ücretsiz analiz et" });
  await expect(analysisLink).toHaveAttribute("href", "/analiz");
  await Promise.all([page.waitForURL(/\/analiz$/), analysisLink.click()]);
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
  await expect(mobileNav.getByRole("link", { name: "Uzmanlık kontrol listesi" })).toBeVisible();
  await expect(mobileNav.getByText("Kontrol", { exact: true })).toBeVisible();

  await mobileNav.getByRole("link", { name: "Profil" }).click();
  await expect(page).toHaveURL(/\/profil$/);
  await expect(page.getByRole("heading", { name: "EksperIQ hesabı olmadan kullanılabilir." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Destek ve geri bildirim" })).toBeVisible();
  await page.getByRole("link", { name: "Geri bildirim gönder" }).click();
  await expect(page).toHaveURL(/\/geri-bildirim$/);
  await expect(page.getByRole("heading", { name: "Geri bildirim", exact: true })).toBeVisible();

  await page.getByRole("navigation", { name: "Mobil alt menü" }).getByRole("link", { name: "Yeni Analiz" }).click();
  await expect(page).toHaveURL(/\/analiz$/);
  await expect(page.getByRole("heading", { name: "Araç ilanı analizi" })).toBeVisible();

  await page.getByRole("navigation", { name: "Mobil alt menü" }).getByRole("link", { name: "Analiz Raporu" }).click();
  await expect(page).toHaveURL(/\/analizlerim$/);
  await expect(page.getByRole("heading", { name: "Analizlerim" })).toBeVisible();

  await page
    .getByRole("navigation", { name: "Mobil alt menü" })
    .getByRole("link", { name: "Uzmanlık kontrol listesi" })
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

test("starts analysis with listing link and manual choices", async ({ page }) => {
  await page.goto("/analiz");
  await expect(page.getByRole("heading", { name: "İlan linkiyle başla" })).toBeVisible();
  await expect(page.getByText("İlan sitelerini otomatik okumadan")).toBeVisible();
  await expect(page.getByRole("button", { name: "Örnek ilanla doldur" })).toHaveCount(0);
  await page.getByLabel("İlan bağlantısı").fill("https://www.sahibinden.com/ilan/vasita-otomobil-test");
  await page.getByLabel("Marka").selectOption(demoVehicleInput.brand);
  await page.locator("#model").selectOption(demoVehicleInput.model);
  await expect(page.getByLabel("İlan bağlantısı")).toHaveValue("https://www.sahibinden.com/ilan/vasita-otomobil-test");
  await expect(page.getByRole("heading", { name: "İlan linki", exact: true })).toBeVisible();
  await expect(page.getByText("Eklendi")).toBeVisible();
  await expect(page.getByRole("progressbar", { name: "Zorunlu alan ilerlemesi" })).toHaveAttribute(
    "aria-valuenow",
    "2",
  );
});

test("uses select controls for fixed-choice vehicle details", async ({ page }) => {
  await page.goto("/analiz");

  const selectIds = [
    "bodyType",
    "brand",
    "model",
    "trim",
    "city",
    "drivetrain",
    "ownerInfo",
    "tradeStatus",
    "airbagStatus",
    "timingBeltInfo",
    "transmissionMaintenanceInfo",
    "batteryStatus",
    "tireStatus",
    "lpgStatus",
  ];

  for (const id of selectIds) {
    await expect(page.locator(`#${id}`)).toHaveJSProperty("tagName", "SELECT");
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
  await expect(page.getByLabel("Motor hacmi")).toHaveAttribute("type", "number");
  await expect(page.getByLabel("Motor gücü")).toHaveAttribute("type", "number");
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
  await expect(page.getByRole("heading", { name: "Aktif modüller" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Modülü aç/ })).toHaveCount(8);
  await expect(page.getByRole("heading", { name: "İlan Analizi" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Fotoğraftan Hasar Analizi" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Araç Sağlık Karnesi" })).toBeVisible();
  await expect(page.getByText("Kesinlik sınırı:")).toHaveCount(8);
});

test("shows feedback collection flow", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: "http://127.0.0.1:3000" });
  await page.goto("/geri-bildirim");
  await expect(page.getByRole("heading", { name: "Geri bildirim", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Kullanıcı testi notu gönder" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Kural geri bildirimi gönder" })).toBeVisible();
  await expect(page.getByRole("link", { name: "İlk kullanıcı testi issue'su" })).toBeVisible();
  await expect(page.getByText("kişisel veri eklemeden")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Anonim test notu şablonu" })).toBeVisible();
  await page.getByRole("button", { name: "Anonim not şablonunu kopyala" }).click();
  await expect(page.getByText("Anonim test notu şablonu panoya kopyalandı.")).toBeVisible();

  const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboardText).toContain("EksperIQ kullanıcı testi notu");
  expect(clipboardText).toContain("Kişisel veri eklemedim: Evet");
  await expect(page.getByRole("heading", { name: "Geri bildirimi doğru hatta ayır" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "UI / kullanılabilirlik" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Kural adayı" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Güven ve App Store dili" })).toBeVisible();
  await expect(page.getByText("npm run user-tests:triage -- path/to/user-note.txt")).toBeVisible();
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

  const staticMobilePaths = [
    "/",
    "/analiz",
    "/analizlerim",
    "/profil",
    "/geri-bildirim",
    "/kontrol-listesi",
    "/moduller",
    "/nasil-calisir",
    "/hakkinda",
    "/gizlilik",
    "/kullanim-kosullari",
    "/offline",
  ];

  for (const path of staticMobilePaths) {
    await page.goto(path);
    await expectNoHorizontalOverflow(page);
  }

  await page.goto("/analiz");
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
