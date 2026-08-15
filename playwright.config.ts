import { existsSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

/**
 * Some local sandboxes pre-install browsers at a fixed path
 * (/opt/pw-browsers/*) whose revision can lag the one this pinned
 * @playwright/test version expects, so Playwright's own revision-resolution
 * download (from cdn.playwright.dev) fails there — typically because that
 * environment's network egress is allow-listed and doesn't include the
 * Playwright CDN. When that exact local Chromium binary is present, launch
 * it directly instead of letting Playwright resolve/download its own
 * revision. This path does not exist in normal CI (the official Playwright
 * Docker image manages its own browsers), so `chromiumLaunchOptions` is `{}`
 * there and this has no effect on CI.
 */
const sandboxChromiumPath = "/opt/pw-browsers/chromium";
const chromiumLaunchOptions = existsSync(sandboxChromiumPath)
  ? { launchOptions: { executablePath: sandboxChromiumPath } }
  : {};

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 120000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? undefined : 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1 --port 3000",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: true,
    timeout: 120000,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"], ...chromiumLaunchOptions } },
    { name: "mobile", use: { ...devices["Pixel 7"], ...chromiumLaunchOptions } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    { name: "mobile-safari", use: { ...devices["iPhone 15"] } },
  ],
});
