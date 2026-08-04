import { expect, test } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";

// A real, decodable 1x1 PNG for flows that just need any valid image.
const MINIMAL_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
const minimalPngBuffer = Buffer.from(MINIMAL_PNG_BASE64, "base64");

/**
 * Spoofs the Capacitor iOS bridge so Capacitor.isNativePlatform() reports
 * true, the same signal src/lib/api/client.ts, src/lib/share/share.ts and
 * src/lib/push/native.ts branch on. No native plugin binary exists in a
 * Playwright browser context, so this only exercises the platform-detection
 * branch itself, not real Capacitor plugin bridges (those are Xcode-only —
 * see the manual verification steps in the final report).
 */
async function stubNativeIosBridge(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    (window as unknown as { webkit: unknown }).webkit = { messageHandlers: { bridge: {} } };
  });
}

test("resolves API requests to the production origin under a simulated native iOS bridge", async ({ page }) => {
  await stubNativeIosBridge(page);

  const seenRequests: string[] = [];
  await page.route("**/api/ai/photo-damage", async (route) => {
    seenRequests.push(route.request().url());
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        analysis: { isVehiclePhoto: true, summary: "ok", findings: [], disclaimer: "disclaimer" },
        remaining: 9,
      }),
    });
  });
  // Native requests target the absolute production origin, so intercept there too.
  await page.route("https://eksperiq.vercel.app/api/ai/photo-damage", async (route) => {
    seenRequests.push(route.request().url());
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        analysis: { isVehiclePhoto: true, summary: "ok", findings: [], disclaimer: "disclaimer" },
        remaining: 9,
      }),
    });
  });

  await page.goto("/fotograf-hasar");
  await page.locator('input[type="file"]').setInputFiles({
    name: "arac-on-tampon.jpg",
    mimeType: "image/jpeg",
    buffer: minimalPngBuffer,
  });
  await page.getByRole("button", { name: "AI ile fotoğrafı analiz et" }).click();
  await expect(page.getByText(/AI fotoğraf kontrolü tamamlandı/)).toBeVisible();

  expect(seenRequests).toHaveLength(1);
  expect(seenRequests[0]).toBe("https://eksperiq.vercel.app/api/ai/photo-damage");
});

test("keeps AI requests same-origin on the web when no native bridge is present", async ({ page, baseURL }) => {
  const seenRequests: string[] = [];
  await page.route("**/api/ai/photo-damage", async (route) => {
    seenRequests.push(route.request().url());
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        analysis: { isVehiclePhoto: true, summary: "ok", findings: [], disclaimer: "disclaimer" },
        remaining: 9,
      }),
    });
  });

  await page.goto("/fotograf-hasar");
  await page.locator('input[type="file"]').setInputFiles({
    name: "arac-on-tampon.jpg",
    mimeType: "image/jpeg",
    buffer: minimalPngBuffer,
  });
  await page.getByRole("button", { name: "AI ile fotoğrafı analiz et" }).click();
  await expect(page.getByText(/AI fotoğraf kontrolü tamamlandı/)).toBeVisible();

  expect(seenRequests).toHaveLength(1);
  expect(seenRequests[0]).toBe(`${baseURL}/api/ai/photo-damage`);
});

test("compresses an oversized photo below the AI upload budget before sending", async ({ page }) => {
  const largePhotoPath = path.join(__dirname, "..", "fixtures", "large-photo.jpg");
  const largePhotoBuffer = await fs.readFile(largePhotoPath);
  expect(largePhotoBuffer.byteLength).toBeGreaterThan(2_000_000);

  let capturedBodyBytes = 0;
  await page.route("**/api/ai/photo-damage", async (route) => {
    const body = route.request().postData() ?? "";
    capturedBodyBytes = Buffer.byteLength(body, "utf8");
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        analysis: { isVehiclePhoto: true, summary: "ok", findings: [], disclaimer: "disclaimer" },
        remaining: 9,
      }),
    });
  });

  await page.goto("/fotograf-hasar");
  await page.locator('input[type="file"]').setInputFiles({
    name: "buyuk-fotograf.jpg",
    mimeType: "image/jpeg",
    buffer: largePhotoBuffer,
  });
  await page.getByRole("button", { name: "AI ile fotoğrafı analiz et" }).click();
  await expect(page.getByText(/AI fotoğraf kontrolü tamamlandı/)).toBeVisible();

  // The full request body (JSON envelope + base64 image) must stay under the
  // combined AI upload budget documented in prepare-ai-image.ts.
  expect(capturedBodyBytes).toBeGreaterThan(0);
  expect(capturedBodyBytes).toBeLessThan(3_500_000);
});

test("keeps already-loaded client state usable after the app has gone offline", async ({ page, context }) => {
  await page.goto("/analiz");
  await page.getByLabel("Marka").selectOption("Toyota");
  await page.locator("#model").selectOption("Corolla");
  await page.getByLabel("Model yılı").fill("2019");
  await page.getByLabel("Yakıt türü").selectOption("Benzin");
  await page.getByLabel("Vites türü").selectOption("Otomatik");
  await page.getByLabel("Kilometre").fill("85000");
  await page.getByLabel("İstenen fiyat").fill("950000");
  await page.getByLabel("Şehir").selectOption("İstanbul");
  await page.getByLabel("Satıcı açıklaması veya araç notu").fill("Tek elden, düzenli bakımlı, hasar kaydı bulunmuyor.");
  await page.getByRole("button", { name: "Analiz oluştur" }).click();
  await expect(page).toHaveURL(/\/sonuc$/);
  await expect(page.getByText("Araç Risk Skoru")).toBeVisible();

  // The rules engine and the checklist/filter UI are entirely client-side
  // (localStorage-backed), so an already-rendered page must keep working
  // once connectivity drops mid-session — only the AI photo/note features
  // need the network. NOTE: there is no service-worker asset cache in this
  // app (public/sw.js only handles push events), so a *fresh* client
  // navigation to a not-yet-loaded route while offline is not expected to
  // work — that's a known, separate limitation, not covered by this test.
  await context.setOffline(true);

  await page.getByLabel("Ruhsat sahibini doğruladım").check();
  await expect(page.getByLabel("Tamamlanan kontroller 1 / 10")).toBeVisible();
  await page.getByRole("button", { name: /Yüksek \(/ }).click();
  await expect(page.getByRole("button", { name: /Yüksek \(/ })).toHaveAttribute("aria-pressed", "true");

  await context.setOffline(false);
});

test("shows a clear message when notification permission was denied", async ({ page }) => {
  await page.goto("/");
  const supportsPush = await page.evaluate(
    () => "serviceWorker" in navigator && "PushManager" in window && "Notification" in window,
  );
  test.skip(!supportsPush, "Web Push is not available in this browser engine.");

  await page.addInitScript(() => {
    Object.defineProperty(window.Notification, "permission", { value: "denied", configurable: true });
  });

  await page.goto("/bakim-odeme-takvimi");
  const notConfigured = page.getByText("Bildirim servisi henüz yapılandırılmadı.");
  // Reaching the "denied" branch requires a Web Push VAPID key to be baked
  // into the build (NEXT_PUBLIC_VAPID_PUBLIC_KEY) — without one, the app
  // correctly reports "not configured" before ever checking permission,
  // which this build (and most CI runs, since that key is a real secret)
  // does not set.
  if (await notConfigured.isVisible()) {
    test.skip(true, "NEXT_PUBLIC_VAPID_PUBLIC_KEY is not configured for this build.");
  }
  await expect(
    page.getByText("Bildirim izni reddedilmiş. Tarayıcı/cihaz ayarlarından izni yeniden açabilirsiniz."),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Bildirimleri aç" })).toHaveCount(0);
});

test("keeps the mobile bottom navigation within the safe viewport", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Fixed bottom nav / safe-area behavior only applies to the mobile layout.");

  await page.goto("/");
  const mobileNav = page.getByRole("navigation", { name: "Mobil alt menü" });
  await expect(mobileNav).toBeVisible();

  const box = await mobileNav.boundingBox();
  const viewport = page.viewportSize();
  expect(box).not.toBeNull();
  expect(viewport).not.toBeNull();
  if (box && viewport) {
    // The nav must stay reachable inside the viewport (not pushed off-screen
    // by a device's safe-area inset) and must sit at the bottom edge.
    expect(box.y + box.height).toBeLessThanOrEqual(viewport.height + 1);
    expect(box.y).toBeGreaterThan(0);
  }

  const position = await mobileNav.evaluate((element) => getComputedStyle(element).position);
  expect(position).toBe("fixed");
});

test("exports data, wipes it via delete-all, then restores it from the export file", async ({ page }) => {
  await page.goto("/arac-saglik-karnesi");
  await page.getByLabel("Başlık").fill("Yedekleme testi kaydı");
  await page.getByRole("button", { name: "Kaydı ekle" }).click();
  await expect(page.getByRole("heading", { name: "Yedekleme testi kaydı" })).toBeVisible();

  await page.goto("/profil");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Verilerimi dışa aktar" }).click();
  const download = await downloadPromise;
  const downloadPath = await download.path();
  expect(downloadPath).not.toBeNull();
  const exportedJson = await fs.readFile(downloadPath as string, "utf8");
  const exportedBundle = JSON.parse(exportedJson) as { data: Record<string, unknown[]> };
  expect(exportedBundle.data.healthRecords.length).toBeGreaterThan(0);

  await page.getByRole("button", { name: "Tüm verilerimi sil" }).click();
  // handleConfirmDelete awaits deleteAllLocalData() then calls
  // window.location.reload() — wait for that reload's load event so the
  // next navigation doesn't race the in-flight storage wipe.
  await Promise.all([page.waitForEvent("load"), page.getByRole("button", { name: "Evet, tümünü sil" }).click()]);

  await page.goto("/arac-saglik-karnesi");
  await expect(page.getByRole("heading", { name: "Yedekleme testi kaydı" })).toHaveCount(0);

  await page.goto("/profil");
  await page.locator('input[type="file"]').setInputFiles({
    name: "eksperiq-yedek.json",
    mimeType: "application/json",
    buffer: Buffer.from(exportedJson),
  });
  await expect(page.getByText(/kayıt türü içe aktarıldı/)).toBeVisible();

  await page.goto("/arac-saglik-karnesi");
  await expect(page.getByRole("heading", { name: "Yedekleme testi kaydı" })).toBeVisible();
});
