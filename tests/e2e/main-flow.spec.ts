import { expect, test, type Page } from "@playwright/test";
import { demoVehicleInput } from "../fixtures/demo-vehicle";
import { stubClipboard } from "./helpers/clipboard";
import { gotoAnalysisForm, openReportTab } from "./helpers/analysis-flow";

async function fillRequiredForm(page: Page) {
  await page.getByLabel("Marka").selectOption(demoVehicleInput.brand);
  await page.locator("#model").selectOption(demoVehicleInput.model);
  await page.getByLabel("Model yılı").fill(String(demoVehicleInput.year));
  await page.getByLabel("Yakıt türü").selectOption(demoVehicleInput.fuelType);
  await page.getByLabel("Vites türü").selectOption(demoVehicleInput.transmission);
  await page.getByLabel("Kilometre").fill(String(demoVehicleInput.mileage));
  await page.getByLabel("İstenen fiyat").fill(String(demoVehicleInput.price));
  await page.getByLabel("Şehir").selectOption(demoVehicleInput.city);
  await page.getByLabel("Tramer tutarı").fill(String(demoVehicleInput.tramerAmount));
  await page.getByLabel("Bakım faturaları var").check();
  await page.getByLabel("Ekspertiz raporu var").check();
  await page.getByLabel("Yedek anahtar var").check();
  await page.getByLabel("Satıcı açıklaması veya araç notu").fill(demoVehicleInput.sellerDescription);
}

test("home to analysis form", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Aracınız için bugün ne yapalım/ })).toBeVisible();
  const analysisLink = page.getByRole("main").getByRole("link", { name: "Yeni analiz oluştur" });
  await expect(analysisLink).toHaveAttribute("href", "/analiz");
  await Promise.all([page.waitForURL(/\/analiz$/), analysisLink.click()]);
  await expect(page.getByRole("heading", { name: "Yeni analiz oluştur" })).toBeVisible();
  await page.getByRole("button", { name: "Araç satın alacağım" }).click();
  await expect(page.getByRole("heading", { name: "Araç satın alacağım" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Form ilerlemesi" })).toBeVisible();
  await expect(page.getByRole("progressbar", { name: "Zorunlu alan ilerlemesi" })).toHaveAttribute(
    "aria-valuenow",
    "0",
  );
  await expect(page.getByRole("navigation", { name: "Analiz formu bölümleri" })).toBeVisible();
  await page.getByRole("link", { name: "Açıklama" }).click();
  await expect(page).toHaveURL(/#seller-description$/);
  await expect(page.getByRole("heading", { name: "Satıcı açıklaması ve notlar" })).toBeVisible();
});

test("mobile bottom navigation opens app actions", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Mobile bottom navigation is only visible on small screens.");

  await page.goto("/");
  await page.addStyleTag({
    content:
      "nextjs-portal, [data-nextjs-devtools-button] { display: none !important; pointer-events: none !important; }",
  });
  const mobileNav = page.getByRole("navigation", { name: "Ana navigasyon" });
  await expect(mobileNav).toBeVisible();
  await expect(mobileNav.getByRole("link", { name: "Ana Sayfa" })).toBeVisible();
  await expect(mobileNav.getByRole("link", { name: "Analiz" })).toBeVisible();
  await expect(mobileNav.getByRole("link", { name: "Garajım" })).toBeVisible();
  await expect(mobileNav.getByRole("link", { name: "Geçmiş" })).toBeVisible();
  await expect(mobileNav.getByRole("link", { name: "Profil" })).toBeVisible();

  await mobileNav.getByRole("link", { name: "Analiz" }).click();
  await expect(page).toHaveURL(/\/analiz$/);
  await expect(page.getByRole("heading", { name: "Yeni analiz oluştur" })).toBeVisible();

  await page.getByRole("navigation", { name: "Ana navigasyon" }).getByRole("link", { name: "Geçmiş" }).click();
  await expect(page).toHaveURL(/\/analizlerim$/);
  await expect(page.getByRole("heading", { name: "Analizlerim", exact: true })).toBeVisible();

  await page.getByRole("navigation", { name: "Ana navigasyon" }).getByRole("link", { name: "Garajım" }).click();
  await expect(page).toHaveURL(/\/arac-saglik-karnesi$/);
  await expect(page.getByRole("heading", { name: "Analiz, bakım ve notları tek ekranda tut" })).toBeVisible();

  await page.getByRole("navigation", { name: "Ana navigasyon" }).getByRole("link", { name: "Profil" }).click();
  await expect(page).toHaveURL(/\/profil$/);
  await expect(page.getByRole("heading", { name: "Profil ve Ayarlar" })).toBeVisible();
});

test("shows validation errors", async ({ page }) => {
  await gotoAnalysisForm(page);
  await page.getByRole("button", { name: "Analiz oluştur" }).click();
  await expect(page.getByText("Marka zorunludur.")).toBeVisible();
  await expect(page.getByText("İlan açıklaması en az 20 karakter olmalı.")).toBeVisible();
});

test("starts analysis with manual vehicle choices", async ({ page }) => {
  await gotoAnalysisForm(page);
  await expect(page.getByRole("heading", { name: "Analiz için araç bilgilerini doldurun" })).toBeVisible();
  await expect(page.getByText("İlan linkiyle otomatik doldurabilir")).toBeVisible();
  await expect(page.getByRole("button", { name: "Örnek ilanla doldur" })).toHaveCount(0);
  await fillRequiredForm(page);
  await expect(page.getByLabel("Marka")).toHaveValue("Toyota");
  await expect(page.locator("#model")).toHaveValue("Corolla");
  await expect(page.getByRole("progressbar", { name: "Zorunlu alan ilerlemesi" })).toHaveAttribute(
    "aria-valuenow",
    "9",
  );
});

test("model list only shows models that belong to the selected brand", async ({ page }) => {
  await gotoAnalysisForm(page);

  await expect(page.locator("#model")).toBeDisabled();

  await page.getByLabel("Marka").selectOption("Fiat");
  await expect(page.locator("#model")).toBeEnabled();
  await expect(page.locator("#model option", { hasText: /^Egea$/ })).toHaveCount(1);
  await expect(page.locator("#model option", { hasText: /^i20$/ })).toHaveCount(0);

  await page.locator("#model").selectOption("Egea");
  await page.getByLabel("Marka").selectOption("Hyundai");
  await expect(page.locator("#model")).toHaveValue("");
  await expect(page.locator("#model option", { hasText: /^i20$/ })).toHaveCount(1);
  await expect(page.locator("#model option", { hasText: /^Egea$/ })).toHaveCount(0);
});

test("uses select controls for fixed-choice vehicle details", async ({ page }) => {
  await gotoAnalysisForm(page);

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
  await gotoAnalysisForm(page);

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
  await expect(page.getByRole("heading", { name: "Tüm modüller" })).toBeVisible();
  // Sayı elle tutuluyor: yeni bir modül eklendiğinde ya da bir modül sessizce
  // kaybolduğunda bu satır kırılsın diye. Kırıldığında doğru refleks sayıyı
  // güncellemek DEĞİL, önce modülün gerçekten olması gerektiğini doğrulamak.
  await expect(page.getByRole("link", { name: /Modülü aç/ })).toHaveCount(12);
  await expect(page.getByRole("heading", { name: "İlan Analizi", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Fotoğraftan Hasar Analizi" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Araç Sağlık Karnesi" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Bakım Takibi", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Test Sürüşü Kontrol Listesi" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Gider Defteri" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Karşılaştırmalı İlan Analizi" })).toBeVisible();
  await expect(page.getByText("Kesinlik sınırı:")).toHaveCount(12);
});

test("shows feedback collection flow", async ({ page }) => {
  await stubClipboard(page);
  await page.goto("/geri-bildirim");
  await expect(page.getByRole("heading", { name: "Geri bildirim", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Kullanıcı testi notu gönder" })).toHaveAttribute(
    "href",
    /^mailto:ruzgar\.mesavo@gmail\.com\?/,
  );
  await expect(page.getByRole("link", { name: "Kural geri bildirimi gönder" })).toHaveAttribute(
    "href",
    /^mailto:ruzgar\.mesavo@gmail\.com\?/,
  );
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
  await gotoAnalysisForm(page);
  await fillRequiredForm(page);
  await expect(page.getByRole("progressbar", { name: "Zorunlu alan ilerlemesi" })).toHaveAttribute(
    "aria-valuenow",
    "9",
  );
  await expect(page.getByText("Zorunlu alanlar tamamlandı.")).toBeVisible();
  await page.getByRole("button", { name: "Analiz oluştur" }).click();
  await expect(page).toHaveURL(/\/sonuc$/);
  // Sekmeden bağımsız, raporun tepesinde her zaman duran bölüm.
  await expect(page.getByText("Araç Risk Skoru")).toBeVisible();
  await expect(page.getByRole("button", { name: "Raporu paylaş" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Geri bildirim" })).toBeVisible();

  await openReportTab(page, "Özet");
  await expect(page.getByText("Bilgi doluluğu")).toBeVisible();
  await expect(page.getByText("Kategori skorları")).toBeVisible();
  await expect(page.getByText("Güçlü taraflar")).toBeVisible();
  await expect(page.getByText("Öncelikli ilk aksiyonlar")).toBeVisible();
  await expect(page.getByRole("progressbar", { name: "Bilgi doluluğu yüzdesi" })).toBeVisible();
  await expect(page.getByRole("progressbar", { name: "Hasar geçmişi skoru" })).toBeVisible();
  await expect(page.getByText("TRAMER veya e-Devlet'ten doğrulanmadıkça kesin kabul edilmemelidir.")).toBeVisible();

  await openReportTab(page, "Araç/Fotolar");
  await expect(page.getByText("Araç ve ilan özeti")).toBeVisible();

  await openReportTab(page, "Alım Planı");
  await expect(page.getByRole("button", { name: "Satıcı mesajını kopyala" })).toBeVisible();

  await openReportTab(page, "Riskler");
  await expect(page.getByText("Garaj kullanımı iddiası doğrulanmalı")).toBeVisible();
  await expect(page.getByLabel("Risk bulgusu dağılımı")).toBeVisible();
  await expect(page.getByText("Yüksek riskli bulgu")).toBeVisible();
  await expect(page.getByRole("group", { name: "Risk bulgusu filtresi" })).toBeVisible();
  await page.getByRole("button", { name: /Yüksek \(/ }).click();
  await expect(page.getByRole("button", { name: /Yüksek \(/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText(/\/ Düşük/)).toHaveCount(0);

  await openReportTab(page, "Alım Planı");
  await expect(page.getByText("Satıcıya sorulacak sorular")).toBeVisible();
  await expect(page.getByText("Ekspertizde özellikle kontrol edilmesi gerekenler")).toBeVisible();

  await openReportTab(page, "Kontrol Listesi");
  await expect(page.getByLabel("Tamamlanan kontroller 0 / 10")).toBeVisible();
  await page.getByLabel("Ruhsat sahibini doğruladım").check();
  await expect(page.getByLabel("Tamamlanan kontroller 1 / 10")).toBeVisible();

  await page.reload();
  await openReportTab(page, "Riskler");
  await expect(page.getByRole("button", { name: /Yüksek \(/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText(/\/ Düşük/)).toHaveCount(0);
  await openReportTab(page, "Kontrol Listesi");
  await expect(page.getByLabel("Tamamlanan kontroller 1 / 10")).toBeVisible();
  await expect(page.getByLabel("Ruhsat sahibini doğruladım")).toBeChecked();
  await openReportTab(page, "Riskler");
  await page.getByRole("button", { name: /Tümü \(/ }).click();
});

test("copies seller-ready message to clipboard", async ({ page }) => {
  await stubClipboard(page);
  await gotoAnalysisForm(page);
  await fillRequiredForm(page);
  await page.getByRole("button", { name: "Analiz oluştur" }).click();
  await expect(page).toHaveURL(/\/sonuc$/);

  await openReportTab(page, "Alım Planı");
  await page.getByRole("button", { name: "Satıcı mesajını kopyala" }).click();
  await expect(page.getByText("Satıcı mesajı panoya kopyalandı.")).toBeVisible();

  const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
  // Butonun kopyaladığı metin result-client.tsx'teki şablon; test eskiden
  // report-summary.ts'teki AYRI ve farklı sözcüklü şablonu doğruluyordu.
  expect(clipboardText).toContain("Merhaba, 2020 Toyota Corolla ilanınızla ilgileniyorum.");
  expect(clipboardText).toContain("Aracı görmeden önce şu bilgileri yazılı paylaşabilir misiniz?");
  expect(clipboardText).toContain("bağımsız ekspertize göstermek");
});

test("prepares a clean print report", async ({ page }) => {
  await gotoAnalysisForm(page);
  await fillRequiredForm(page);
  await page.getByRole("button", { name: "Analiz oluştur" }).click();
  await expect(page).toHaveURL(/\/sonuc$/);
  await expect(page.getByText(/Rapor tarihi:/)).toBeVisible();

  await page.emulateMedia({ media: "print" });
  // Eskiden burada var olmayan bir "Raporu yazdır" butonunun gizli olduğu
  // iddia ediliyordu; olmayan eleman zaten "hidden" sayıldığı için bu iddia
  // hiçbir şey doğrulamıyordu. Gerçekte ekrandaki tek aksiyon "Raporu paylaş"
  // ve baskıda gizlenmesi gereken de o.
  await expect(page.getByRole("button", { name: "Raporu paylaş" })).toBeHidden();
  await expect(page.getByRole("tablist", { name: "Rapor bölümleri" })).toBeHidden();
  await expect(page.getByText("Araç Risk Skoru")).toBeVisible();
  await expect(page.getByText("Satıcıya sorulacak sorular")).toBeVisible();
  await expect(page.getByRole("main").getByText("EksperIQ", { exact: true })).toBeVisible();
  await expect(page.getByText(/Rapor oluşturma:/)).toBeVisible();
});

/**
 * Eskiden bu test `/sonuc` ekranında "Oturum verisini sil" adlı bir butona
 * basıyordu. Böyle bir buton uygulamada hiç olmadı (deponun kök commit'i
 * dahil hiçbir sürümde `src/` içinde geçmiyor), dolayısıyla test hiçbir zaman
 * geçmemişti. Doğrulanan asıl davranış korunuyor: analiz oturumluk saklanır,
 * temizlendiğinde /sonuc "Analiz bulunamadı" der.
 */
test("clears current session result", async ({ page }) => {
  await gotoAnalysisForm(page);
  await fillRequiredForm(page);
  await page.getByRole("button", { name: "Analiz oluştur" }).click();
  await expect(page).toHaveURL(/\/sonuc$/);
  await expect(page.getByText("Araç Risk Skoru")).toBeVisible();

  await page.evaluate(() => window.sessionStorage.clear());
  await page.reload();

  await expect(page.getByRole("heading", { name: "Analiz bulunamadı" })).toBeVisible();
});

test("shows a friendly not-found page for unknown routes", async ({ page }) => {
  await page.goto("/bu-sayfa-yok");
  await expect(page.getByRole("heading", { name: "Sayfa bulunamadı" })).toBeVisible();
  await page.getByRole("link", { name: "Ana sayfaya dön" }).click();
  await expect(page).toHaveURL("/");
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

  await gotoAnalysisForm(page);
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
