import { expect, test, type Page } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";

const vehiclePhotoFixturePath = path.join(__dirname, "..", "fixtures", "large-photo.jpg");

/**
 * Spoofs Capacitor's supported custom platform hook so Capacitor.isNativePlatform()
 * reports true, the same signal src/lib/api/client.ts, src/lib/share/share.ts
 * and src/lib/push/native.ts branch on. No native plugin binary exists in a
 * Playwright browser context, so this only exercises the platform-detection
 * branch itself, not real Capacitor plugin bridges (those are Xcode-only).
 */
async function stubNativeIosBridge(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    (window as unknown as { CapacitorCustomPlatform: { name: string } }).CapacitorCustomPlatform = { name: "ios" };
  });
}

async function setSyntheticFile(
  page: Page,
  selector: string,
  file: { name: string; mimeType: string; base64: string },
) {
  const input = page.locator(selector).first();
  await expect(input).toBeAttached();

  await input.evaluate((input, selectedFile) => {
    const binary = window.atob(selectedFile.base64);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(new File([bytes], selectedFile.name, { type: selectedFile.mimeType }));
    Object.defineProperty(input, "files", { value: dataTransfer.files, configurable: true });
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }, file);
}

async function selectVehiclePhoto(page: Page) {
  const input = page.locator('input[type="file"]').first();
  const selectedLabel = page.getByText("1 fotoğraf seçildi.");
  await expect(input).toBeAttached();

  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await input.setInputFiles([]);
    await input.setInputFiles(vehiclePhotoFixturePath);
    const selectedCount = await input.evaluate((element: HTMLInputElement) => element.files?.length ?? 0);

    if (selectedCount === 1) {
      try {
        await expect(selectedLabel).toBeVisible({ timeout: 7000 });
        return;
      } catch (error) {
        lastError = error;
      }
    }

    await page.waitForTimeout(300);
  }

  throw lastError instanceof Error ? lastError : new Error("Vehicle photo file selection did not reach the UI.");
}

async function importBackupJson(page: Page, exportedJson: string) {
  const input = page.getByLabel("Yedek dosyası");
  const importedMessage = page.getByText(/kayıt türü içe aktarıldı/);
  await expect(page.getByText("Yedekten içe aktar")).toBeVisible();
  await expect(input).toBeAttached();

  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await input.setInputFiles({
      name: "eksperiq-yedek.json",
      mimeType: "application/json",
      buffer: Buffer.from(exportedJson, "utf8"),
    });

    try {
      await expect(importedMessage).toBeVisible({ timeout: 7000 });
      return;
    } catch (error) {
      lastError = error;
      await input.setInputFiles([]);
      await page.waitForTimeout(300);
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Backup import did not reach the UI.");
}

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
  await selectVehiclePhoto(page);
  await page.getByLabel(/AI sağlayıcısına geçici olarak gönderileceğini/).check();
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
  await setSyntheticFile(page, 'input[type="file"]', {
    name: "buyuk-fotograf.jpg",
    mimeType: "image/jpeg",
    base64: largePhotoBuffer.toString("base64"),
  });
  await expect(page.getByText("1 fotoğraf seçildi.")).toBeVisible();
  await expect(page.getByRole("button", { name: "AI ile fotoğrafı analiz et" })).toBeDisabled();
  await page.getByLabel(/AI sağlayıcısına geçici olarak gönderileceğini/).check();
  await expect(page.getByRole("button", { name: "AI ile fotoğrafı analiz et" })).toBeEnabled();
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
  const deniedText = page.getByText(
    "Bildirim izni reddedilmiş. Tarayıcı/cihaz ayarlarından izni yeniden açabilirsiniz.",
  );
  // getNotificationState() resolves asynchronously (after a requestAnimationFrame
  // + a promise chain), so the push UI state is not settled the instant this
  // page loads. Wait for it to land on one of the two possible states before
  // deciding anything — checking notConfigured.isVisible() immediately here
  // races the effect and was flaky/wrong on slower (mobile-emulated) CPUs.
  await Promise.race([notConfigured.waitFor({ state: "visible" }), deniedText.waitFor({ state: "visible" })]);

  // Reaching the "denied" branch requires a Web Push VAPID key to be baked
  // into the build (NEXT_PUBLIC_VAPID_PUBLIC_KEY) — without one, the app
  // correctly reports "not configured" before ever checking permission,
  // which this build (and most CI runs, since that key is a real secret)
  // does not set.
  if (await notConfigured.isVisible()) {
    test.skip(true, "NEXT_PUBLIC_VAPID_PUBLIC_KEY is not configured for this build.");
  }
  await expect(deniedText).toBeVisible();
  await expect(page.getByRole("button", { name: "Bildirimleri aç" })).toHaveCount(0);
});

test("keeps the mobile bottom navigation within the safe viewport", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Fixed bottom nav / safe-area behavior only applies to the mobile layout.");

  await page.goto("/");
  const mobileNav = page.getByRole("navigation", { name: "Ana navigasyon" });
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
  // The default vehicle is hydrated asynchronously (a requestAnimationFrame
  // after mount, to avoid a hydration mismatch) — the "Başlık"/"Kaydı ekle"
  // fields are already interactive before that finishes, so addRecord()'s
  // `if (!selectedVehicleId) return;` guard can silently no-op the whole
  // click if the form is submitted first. Wait for a real vehicle id to
  // land in the switcher before racing it.
  await expect(page.getByLabel("Araç seç")).not.toHaveValue("");
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
  await importBackupJson(page, exportedJson);

  await page.goto("/arac-saglik-karnesi");
  await expect(page.getByRole("heading", { name: "Yedekleme testi kaydı" })).toBeVisible();
});

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
  await selectVehiclePhoto(page);
  await page.getByLabel(/AI sağlayıcısına geçici olarak gönderileceğini/).check();
  await page.getByRole("button", { name: "AI ile fotoğrafı analiz et" }).click();
  await expect(page.getByText(/AI fotoğraf kontrolü tamamlandı/)).toBeVisible();

  expect(seenRequests).toHaveLength(1);
  expect(seenRequests[0]).toBe("https://eksperiq.vercel.app/api/ai/photo-damage");
});
