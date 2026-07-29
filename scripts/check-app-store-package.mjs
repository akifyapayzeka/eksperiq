import { existsSync } from "node:fs";
import { join } from "node:path";

const requiredFiles = [
  "dist/app-store-package/README.md",
  "dist/app-store-package/docs/app-store-submission.md",
  "dist/app-store-package/docs/app-store-readiness.md",
  "dist/app-store-package/docs/app-store-assets.md",
  "dist/app-store-package/screenshots/mobile-home.png",
  "dist/app-store-package/screenshots/mobile-analysis-form.png",
  "dist/app-store-package/screenshots/mobile-result.png",
  "dist/app-store-package/screenshots/mobile-my-analyses.png",
  "dist/app-store-package/screenshots/mobile-offline.png",
  "dist/app-store-package/assets/app-store-icon-source.svg",
  "dist/app-store-package/assets/apple-touch-icon.png",
];

const missing = requiredFiles.filter((file) => !existsSync(join(process.cwd(), file)));

if (missing.length) {
  console.error("App Store paketi eksik:");
  for (const file of missing) console.error(`- ${file}`);
  console.error("Once `npm run screenshots` ve `npm run appstore:package` calistirin.");
  process.exit(1);
}

console.log("App Store paket kontrolu gecti. Ucretli Apple islemi yapilmadi.");
