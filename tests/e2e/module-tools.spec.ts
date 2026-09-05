import { expect, test, type Page } from "@playwright/test";
import path from "node:path";
import { demoVehicleInput } from "../fixtures/demo-vehicle";
import { stubClipboard } from "./helpers/clipboard";
import { gotoAnalysisForm, openReportTab } from "./helpers/analysis-flow";

const vehiclePhotoFixturePath = path.join(__dirname, "..", "fixtures", "large-photo.jpg");

function formatLocalIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

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

/**
 * Fotoğraf seçimi artık sayfada duran bir `<input type="file">` ile değil,
 * Capacitor Camera eklentisinin "Galeriden seç" akışıyla yapılıyor
 * (src/lib/media/pick-photos.ts — iOS'ta OS'un İngilizce aksiyon sayfasını
 * göstermemek için). Eklentinin web uygulaması, input'u ancak butona
 * basıldığında `#_capacitor-camera-input-gallery` id'siyle oluşturup DOM'a
 * ekliyor ve seçim bitince kaldırıyor (@capacitor/camera .../web.js,
 * galleryInputExperience). Bu yüzden input butona basılmadan önce yok —
 * eski `input[type="file"]` beklentisi hiçbir zaman karşılanamıyordu.
 */
async function selectVehiclePhoto(page: Page) {
  const selectedLabel = page.getByText("1 fotoğraf seçildi.");

  // Eklenti input'u gizli olarak olusturup kendisi `click()` ediyor; dosya
  // secici acilmadan kapanirsa (headless'ta hep boyle olur) "User cancelled
  // photos app" ile reddedip input'u DOM'dan siliyor. Bu yuzden input'a
  // dogrudan `setInputFiles` yetismiyor — seciciyi Playwright'in kendi
  // filechooser olayiyla karsilamak gerekiyor.
  const fileChooserPromise = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Galeriden seç" }).click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(vehiclePhotoFixturePath);

  await expect(selectedLabel).toBeVisible({ timeout: 10000 });
}

/**
 * Ikinci arac eklemek UCRETLI bir ozellik: `canAddVehicle` ucretsiz pakette
 * 1 arac ile siniryor ve VehicleFormSheet form yerine paywall gosteriyor
 * (src/lib/pro/vehicle-limit.ts, vehicle-form-sheet.tsx). Arac BASINA ayrisma
 * davranisini dogrulamak icin ikinci araci UI'dan eklemek mumkun degil; kaydi
 * dogrudan uygulamanin kendi depolama anahtarina yaziyoruz. Paywall'in
 * gercekten ciktigi ayrica `ucretsiz pakette ikinci arac paywall acar`
 * testinde kilitleniyor.
 */
async function seedSecondVehicle(page: Page, label: string) {
  await page.evaluate((vehicleLabel) => {
    const key = "eksperiq:vehicles";
    const raw = window.localStorage.getItem(key);
    const current: Array<{ id: string; label: string; createdAt: string }> = raw ? JSON.parse(raw) : [];
    current.push({ id: `e2e-${Date.now()}`, label: vehicleLabel, createdAt: new Date().toISOString() });
    window.localStorage.setItem(key, JSON.stringify(current));
  }, label);
  await page.reload();
}

async function fillUntilValue(locator: ReturnType<Page["getByLabel"]>, value: string) {
  let lastValue = "";
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await locator.fill(value);
    try {
      await expect(locator).toHaveValue(value, { timeout: 2000 });
      return;
    } catch {
      lastValue = await locator.inputValue();
    }
  }
  throw new Error(`Expected input value "${value}", received "${lastValue}".`);
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
  await page.getByLabel(/AI sağlayıcısına geçici olarak gönderileceğini/).check();
  await page.getByRole("button", { name: "Fotoğrafları analiz et" }).click();
  await expect(page.getByText("Fotoğraf kontrolü tamamlandı. Bugün kalan hak: 9")).toBeVisible();
  await expect(page.getByText("Ön tampon: Çizik")).toHaveCount(2);

  // Eski /bakim-takibi modülü Bakım ve Ödeme Takvimi'yle birleştirildi;
  // route artık yalnızca oraya yönlendirir.
  await page.goto("/bakim-takibi");
  await expect(page).toHaveURL(/\/bakim-odeme-takvimi$/);

  await page.goto("/arac-saglik-karnesi");
  // Varsayilan arac bir frame sonra hidrate oluyor (mount sonrasi
  // requestAnimationFrame); bundan once form doldurup gondermek
  // addRecord()'in `if (!selectedVehicleId) return;` guard'ina takilip
  // sessizce no-op'a duser. Eskiden burada "Arac sec" select'i bekleniyordu
  // ama o select yalnizca BIRDEN FAZLA arac varken render ediliyor — tek
  // aracli varsayilan durumda hic yok. Aracin kendi baslik landmark'i her
  // durumda hidrasyon bitince beliriyor.
  await expect(page.locator("#vehicle-section-title")).toBeVisible();
  await page.getByRole("button", { name: "Yeni kayıt" }).click();
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
  // Varsayılan araç bir frame sonra hidrate oluyor (bkz. AGENTS/skill'deki
  // requestAnimationFrame kalıbı); ondan önce form gönderimi sessizce
  // no-op'a düşer. Eskiden burada "Araç seç" select'i bekleniyordu ama o
  // select yalnızca BİRDEN FAZLA araç varken render ediliyor — tek araçlı
  // varsayılan durumda hiç var olmuyordu. Aracın kendi başlığı, her durumda
  // hidrasyon tamamlandığında beliren gerçek sinyal.
  await expect(page.getByRole("heading", { name: "Aracım", exact: true })).toBeVisible();

  // Scoped to the record-add section: getByLabel("Tür") alone is ambiguous —
  // the page's separate Repair Cost Estimator has a "Şehir" select whose
  // default option text ("...Türkiye ortalaması") also contains "Tür".
  const recordForm = page.locator("section", { has: page.getByRole("heading", { name: "Kayıt ekle" }) });
  await page.getByRole("button", { name: "Yeni kayıt" }).click();
  await recordForm.getByLabel("Tür").selectOption("Sağlık Skoru");
  await page.getByLabel("Başlık").fill("İlk kontrol");
  await page.getByLabel("Tarih", { exact: true }).fill("2026-06-01");
  await page.getByLabel("Skor (opsiyonel, 0-100)").fill("60");
  await page.getByRole("button", { name: "Kaydı ekle" }).click();
  await expect(page.getByRole("heading", { name: "İlk kontrol" })).toBeVisible();

  await page.getByRole("button", { name: "Yeni kayıt" }).click();
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

  // Bu ekranda arac ekleme butonu "Yeni arac" ve arac secici, VehicleSwitcher
  // bileseninin #vehicle-switcher-select'i degil; sayfanin kendi inline
  // select'i ("Arac sec" etiketi) — o da yalnizca birden fazla arac varken
  // render ediliyor, yani ikinci arac eklendikten SONRA beliriyor.
  await seedSecondVehicle(page, "İkinci Arabam");
  await page.getByLabel("Araç seç").selectOption({ label: "İkinci Arabam" });
  await expect(page.getByRole("heading", { name: "İkinci kontrol" })).toHaveCount(0);
  await expect(page.getByText("Henüz kayıt eklenmedi.")).toBeVisible();

  await page.getByLabel("Araç seç").selectOption({ label: "Aracım" });
  await expect(page.getByRole("heading", { name: "İkinci kontrol" })).toBeVisible();
});

/**
 * Eski hali "Soruları kopyala" ve "Raporu yazdır" butonlarına basıyordu; bu
 * iki buton uygulamada hiç var olmadı (deponun kök commit'i dahil `src/`
 * içinde hiç geçmiyorlar), dolayısıyla test hiç geçmemişti. Sonuç ekranının
 * gerçek aksiyonları: her sekmede duran "Raporu paylaş" ve Alım Planı
 * sekmesindeki "Satıcı mesajını kopyala". İkisinin de kullanıcıya görünür bir
 * karşılık verdiği burada doğrulanıyor.
 */
test("report action buttons show visible feedback", async ({ page }) => {
  await stubClipboard(page);
  await gotoAnalysisForm(page);
  await fillRequiredForm(page);
  await page.getByRole("button", { name: "Analiz oluştur" }).click();
  await expect(page).toHaveURL(/\/sonuc$/);

  await openReportTab(page, "Alım Planı");
  await page.getByRole("button", { name: "Satıcı mesajını kopyala" }).click();
  await expect(page.getByText("Satıcı mesajı panoya kopyalandı.")).toBeVisible();

  // PDF sunucuda üretiliyor ve ücretli pakete ait: ücretsiz kullanıcıda istek
  // hiç gönderilmiyor, bunun yerine paket ekranı açılıyor.
  await page.getByRole("button", { name: "Raporu paylaş" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
});

test("comparison page lists analyses added from the result screen and enforces the 3-entry cap", async ({ page }) => {
  test.setTimeout(60000);

  async function createAndAddAnalysis(price: string) {
    // This test creates 4 listing analyses to exercise the comparison
    // list's own 3-entry cap — unrelated to (and would otherwise collide
    // with) the free tier's separate 3-lifetime-analysis quota gate, so
    // that gate's counter is cleared before each one instead of going
    // through gotoAnalysisForm (whose "Araç satın alacağım" click is
    // exactly what the gate checks).
    await page.goto("/analiz");
    await page.evaluate(() => window.localStorage.removeItem("eksperiq:listing-quota"));
    await page.getByRole("button", { name: "Araç satın alacağım" }).click();
    await fillRequiredForm(page);
    await page.getByLabel("İstenen fiyat").fill(price);
    await page.getByRole("button", { name: "Analiz oluştur" }).click();
    await expect(page).toHaveURL(/\/sonuc$/);
    // Karşılaştırmaya ekleme sonuç ekranından değil, kayıtlı analiz
    // listesinden yapılıyor — sonuç ekranı tek aksiyonla sade tutuluyor.
    await page.goto("/analizlerim");
    await page.getByRole("button", { name: "Karşılaştırmaya ekle" }).first().click();
  }

  await createAndAddAnalysis("1200000");
  await expect(page.getByText("Karşılaştırmaya eklendi.")).toBeVisible();

  await createAndAddAnalysis("1350000");
  await createAndAddAnalysis("1450000");

  await page.goto("/karsilastirma");
  await expect(page.getByRole("cell", { name: "1.200.000 TL" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "1.350.000 TL" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "1.450.000 TL" })).toBeVisible();

  await createAndAddAnalysis("1500000");
  await expect(page.getByText(/Karşılaştırma listesi dolu \(en fazla 3 analiz\)/)).toBeVisible();

  await page.goto("/karsilastirma");
  await page
    .getByRole("button", { name: /karşılaştırmadan kaldır/ })
    .first()
    .click();
  await expect(page.getByRole("cell", { name: "1.200.000 TL" })).toHaveCount(0);
});

test("clicking 'Karşılaştırmaya ekle' twice on the same result only adds one entry", async ({ page }) => {
  await gotoAnalysisForm(page);
  await fillRequiredForm(page);
  await page.getByLabel("İstenen fiyat").fill("999000");
  await page.getByRole("button", { name: "Analiz oluştur" }).click();
  await expect(page).toHaveURL(/\/sonuc$/);

  await page.goto("/analizlerim");
  const addButton = page.getByRole("button", { name: "Karşılaştırmaya ekle" }).first();
  await addButton.click();
  await expect(page.getByText("Karşılaştırmaya eklendi.")).toBeVisible();

  // Aynı analiz ikinci kez eklenemez: üç kontenjandan biri boşa gitmesin ve
  // karşılaştırma ekranı aynı aracı kendisiyle kıyaslamasın diye.
  await addButton.click();
  await expect(page.getByText("Bu analiz karşılaştırma listesinde zaten var.")).toBeVisible();

  await page.goto("/karsilastirma");
  await expect(page.getByRole("cell", { name: "999.000 TL" })).toHaveCount(1);
});

/**
 * `/bakim-odeme-takvimi` artık yalnızca bir hub: takvim ekranı ikiye ayrıldı.
 * Vergi kategorileri (MTV, trafik sigortası, kasko) `/vergi` alt rotasında —
 * MTV taksit butonu da orada — bakım kategorileri (muayene, bakım, lastik,
 * akü, diğer) `/bakim` alt rotasında. Bu test ikisini tek sayfada arıyordu.
 */
test("maintenance and payment calendar tracks upcoming dates and syncs to the garage widget", async ({ page }) => {
  await page.goto("/bakim-odeme-takvimi");
  await expect(page.getByRole("heading", { name: "Bildirimler" })).toBeVisible();

  await page.goto("/bakim-odeme-takvimi/vergi");
  await expect(page.locator("#vehicle-switcher-select")).not.toHaveValue("");
  await page.getByRole("button", { name: "MTV taksitlerini ekle (Ocak/Temmuz)" }).click();
  await expect(page.getByText("MTV 1. taksit")).toBeVisible();
  await expect(page.getByText("MTV 2. taksit")).toBeVisible();

  await page.goto("/bakim-odeme-takvimi/bakim");
  await page.getByLabel("Tür").selectOption("muayene");
  await page.getByLabel("Başlık").fill("Araç muayenesi");
  const nearDate = new Date();
  nearDate.setDate(nearDate.getDate() + 10);
  await page.getByLabel("Son tarih").fill(formatLocalIsoDate(nearDate));
  await page.getByLabel("Tutar (opsiyonel, TL)").fill("1200");
  await page.getByRole("button", { name: "Kaydı ekle", exact: true }).click();

  await expect(page.getByText("Araç muayenesi")).toBeVisible();
  await expect(page.getByText("1.200 TL", { exact: false })).toBeVisible();
  await expect(page.getByText("10 gün kaldı")).toBeVisible();

  await page.goto("/arac-saglik-karnesi");
  await expect(page.getByText("Araç muayenesi")).toBeVisible();
  await expect(page.getByText("10 gün kaldı")).toBeVisible();

  await page.goto("/bakim-odeme-takvimi/vergi");
  await page.reload();
  await expect(page.getByText("MTV 1. taksit")).toBeVisible();
  await expect(page.getByText("MTV 2. taksit")).toBeVisible();
});

test("maintenance calendar keeps a separate reminder list per vehicle", async ({ page }) => {
  await page.goto("/bakim-odeme-takvimi/vergi");
  await expect(page.locator("#vehicle-switcher-select")).not.toHaveValue("");

  await page.getByRole("button", { name: "MTV taksitlerini ekle (Ocak/Temmuz)" }).click();
  await expect(page.getByText("MTV 1. taksit")).toBeVisible();

  await seedSecondVehicle(page, "İkinci Arabam");
  await page.locator("#vehicle-switcher-select").selectOption({ label: "İkinci Arabam" });

  await expect(page.getByText("MTV 1. taksit")).toHaveCount(0);
  await expect(page.getByText("Henüz takip edilen tarih yok.")).toBeVisible();

  await page.locator("#vehicle-switcher-select").selectOption({ label: "Aracım" });
  await expect(page.getByText("MTV 1. taksit")).toBeVisible();

  await page.reload();
  await expect(page.locator("#vehicle-switcher-select option")).toHaveCount(2);
  await expect(page.getByText("MTV 1. taksit")).toBeVisible();
});

test("maintenance calendar cancels an in-progress edit when the vehicle changes", async ({ page }) => {
  await page.goto("/bakim-odeme-takvimi/vergi");
  // Form alanlari `disabled={!selectedVehicleId}`; varsayilan arac bir frame
  // sonra hidrate oluyor. Once secicinin gercek bir degere ulasmasini bekle,
  // yoksa alanlar "visible ama disabled" halde takilir.
  await expect(page.locator("#vehicle-switcher-select")).not.toHaveValue("");

  const form = page.locator("section", { has: page.getByRole("heading", { name: "Kayıt ekle" }) });
  const titleInput = form.getByLabel("Başlık");
  await expect(titleInput).toHaveValue("MTV taksiti");
  // "muayene" bir BAKIM kategorisi; vergi ekraninin Tur listesinde yok
  // (TAX_CATEGORIES = mtv / trafik-sigortasi / kasko). Testin amaci kategori
  // degil, "arac degisince yarim kalan duzenleme iptal olur" davranisi.
  await form.getByLabel("Tür").selectOption("kasko");
  await fillUntilValue(titleInput, "Aracım kaskosu");
  await form.getByLabel("Son tarih").fill("2026-12-01");
  await fillUntilValue(titleInput, "Aracım kaskosu");
  await expect(titleInput).toHaveValue("Aracım kaskosu");
  await expect(form.getByLabel("Son tarih")).toHaveValue("2026-12-01");
  await page.getByRole("button", { name: "Kaydı ekle", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Aracım kaskosu" })).toBeVisible();
  await page.getByText("Düzenle", { exact: true }).click();
  await expect(page.getByRole("heading", { name: "Kaydı düzenle" })).toBeVisible();

  await seedSecondVehicle(page, "İkinci Arabam");
  await expect(page.locator("#vehicle-switcher-select")).not.toHaveValue("");
  await page.locator("#vehicle-switcher-select").selectOption({ label: "İkinci Arabam" });

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
  await expect(page.getByRole("heading", { name: "Kontrol ettiklerim: 0 / 7" })).toBeVisible();

  await page.locator("label", { hasText: "Hasar/TRAMER kaydı" }).locator('input[type="checkbox"]').check();
  await expect(page.getByRole("heading", { name: "Kontrol ettiklerim: 1 / 7" })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("heading", { name: "Kontrol ettiklerim: 1 / 7" })).toBeVisible();
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
  await page.getByLabel(/AI sağlayıcısına geçici olarak gönderileceğini/).check();
  await page.getByRole("button", { name: "Fotoğrafları analiz et" }).click();
  await expect(
    page.getByText("Bu görsellerde araç veya araç parçası güvenle tespit edilemedi. Hasar bulgusu oluşturulmadı."),
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

/**
 * Ucretsiz paketin arac siniri gercek bir gelir kurali; testlerin onu
 * atlamasi (ikinci araci depolamaya yazarak) kuralin kendisinin
 * dogrulanmadigi anlamina gelmesin diye burada ayrica kilitleniyor.
 */
test("ücretsiz pakette ikinci araç eklemek paywall açar", async ({ page }) => {
  await page.goto("/arac-saglik-karnesi");
  await expect(page.locator("#vehicle-section-title")).toBeVisible();

  await page.getByRole("button", { name: "Yeni araç" }).click();

  await expect(page.getByLabel("Araç adı")).toHaveCount(0);
  await expect(page.getByRole("dialog")).toBeVisible();
});
