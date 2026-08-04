import type { Page } from "@playwright/test";

/**
 * Playwright's WebKit engine does not support
 * context.grantPermissions(["clipboard-read", "clipboard-write"]) — it
 * throws "Unknown permission" there, so any test that depends on real OS
 * clipboard access via that API only ever fails under the webkit /
 * mobile-safari projects (chromium grants it fine). Stubbing
 * navigator.clipboard at the page level instead verifies the exact same
 * behavior — what text the app tried to copy — without depending on any
 * browser's clipboard permission model, so it works identically across all
 * Playwright projects. Must be called before page.goto().
 */
export async function stubClipboard(page: Page): Promise<void> {
  await page.addInitScript(() => {
    let text = "";
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: async (value: string) => {
          text = value;
        },
        readText: async () => text,
      },
      configurable: true,
    });
  });
}
