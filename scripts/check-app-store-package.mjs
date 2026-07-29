import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const requiredFiles = [
  "dist/app-store-package/README.md",
  "dist/app-store-package/docs/app-store-submission.md",
  "dist/app-store-package/docs/app-store-privacy-answers.md",
  "dist/app-store-package/docs/app-store-readiness.md",
  "dist/app-store-package/docs/app-store-assets.md",
  "dist/app-store-package/docs/launch-master-checklist.md",
  "dist/app-store-package/docs/ios-testflight-preflight.md",
  "dist/app-store-package/docs/first-5-user-tests.md",
  "dist/app-store-package/docs/testflight-qa-checklist.md",
  "dist/app-store-package/docs/testflight-qa-report.md",
  "dist/app-store-package/docs/ios-repo-strategy.md",
  "dist/app-store-package/docs/ai-production-rollout.md",
  "dist/app-store-package/screenshots/mobile-home.png",
  "dist/app-store-package/screenshots/mobile-analysis-form.png",
  "dist/app-store-package/screenshots/mobile-result.png",
  "dist/app-store-package/screenshots/mobile-my-analyses.png",
  "dist/app-store-package/screenshots/mobile-offline.png",
  "dist/app-store-package/assets/app-store-icon-source.svg",
  "dist/app-store-package/assets/app-store-icon-1024.png",
  "dist/app-store-package/assets/apple-touch-icon.png",
  "dist/app-store-package/app-store-screenshots/01-home-1320x2868.png",
  "dist/app-store-package/app-store-screenshots/02-analysis-form-1320x2868.png",
  "dist/app-store-package/app-store-screenshots/03-result-1320x2868.png",
  "dist/app-store-package/app-store-screenshots/04-analyses-1320x2868.png",
  "dist/app-store-package/app-store-screenshots/05-offline-1320x2868.png",
];

const missing = requiredFiles.filter((file) => !existsSync(join(process.cwd(), file)));

if (missing.length) {
  console.error("App Store paketi eksik:");
  for (const file of missing) console.error(`- ${file}`);
  console.error("Once `npm run screenshots` ve `npm run appstore:package` calistirin.");
  process.exit(1);
}

function readPngDimensions(filePath) {
  const buffer = readFileSync(filePath);
  const pngSignature = "89504e470d0a1a0a";
  if (buffer.subarray(0, 8).toString("hex") !== pngSignature) {
    throw new Error(`${filePath} PNG degil.`);
  }
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
    colorType: buffer[25],
  };
}

const iconPath = join(process.cwd(), "dist/app-store-package/assets/app-store-icon-1024.png");
const iconDimensions = readPngDimensions(iconPath);
if (iconDimensions.width !== 1024 || iconDimensions.height !== 1024) {
  console.error(`App Store ikon olcusu hatali: ${iconDimensions.width}x${iconDimensions.height}`);
  process.exit(1);
}
if (iconDimensions.colorType === 4 || iconDimensions.colorType === 6) {
  console.error("App Store ikon PNG alpha kanali iceriyor. Opak RGB PNG olmalidir.");
  process.exit(1);
}

const finalScreenshots = requiredFiles.filter((file) => file.includes("app-store-screenshots"));
const wrongDimensions = finalScreenshots.filter((file) => {
  const dimensions = readPngDimensions(join(process.cwd(), file));
  return dimensions.width !== 1320 || dimensions.height !== 2868;
});

if (wrongDimensions.length) {
  console.error("App Store final screenshot olcusu hatali:");
  for (const file of wrongDimensions) {
    const dimensions = readPngDimensions(join(process.cwd(), file));
    console.error(`- ${file}: ${dimensions.width}x${dimensions.height}`);
  }
  process.exit(1);
}

console.log("App Store paket kontrolu gecti. Ucretli Apple islemi yapilmadi.");
