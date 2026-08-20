import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";

const outputDir = join(process.cwd(), "dist", "app-store-package");
const docsDir = join(outputDir, "docs");
const screenshotsDir = join(outputDir, "screenshots");
const assetsDir = join(outputDir, "assets");

const docs = [
  "docs/app-store-submission.md",
  "docs/app-store-privacy-answers.md",
  "docs/app-store-readiness.md",
  "docs/app-store-assets.md",
  "docs/launch-master-checklist.md",
  "docs/ios-testflight-preflight.md",
  "docs/first-5-user-tests.md",
  "docs/testflight-qa-checklist.md",
  "docs/testflight-qa-report.md",
  "docs/ios-repo-strategy.md",
  "docs/ai-production-rollout.md",
  "docs/release-operations-checklist.md",
];

const screenshots = [
  "mobile-home.png",
  "mobile-analysis-form.png",
  "mobile-result.png",
  "mobile-my-analyses.png",
  "mobile-offline.png",
];

function copyIfExists(source, targetDir) {
  if (!existsSync(source)) return false;
  copyFileSync(source, join(targetDir, basename(source)));
  return true;
}

rmSync(outputDir, { recursive: true, force: true });
mkdirSync(docsDir, { recursive: true });
mkdirSync(screenshotsDir, { recursive: true });
mkdirSync(assetsDir, { recursive: true });

const copiedDocs = docs.filter((doc) => copyIfExists(join(process.cwd(), doc), docsDir));
const copiedScreenshots = screenshots.filter((file) =>
  copyIfExists(join(process.cwd(), "test-results", "screenshots", file), screenshotsDir),
);
const copiedAssets = [
  "public/app-store-icon-source.svg",
  "public/app-store-icon-1024.png",
  "public/apple-touch-icon.png",
].filter((asset) => copyIfExists(join(process.cwd(), asset), assetsDir));

writeFileSync(
  join(outputDir, "README.md"),
  `# EksperIQ App Store Package

Bu klasör App Store Connect için ücretsiz hazırlanabilen teslim varlıklarını toplar.

## İçerik

- Docs: ${copiedDocs.length} dosya
- Screenshots: ${copiedScreenshots.length} dosya
- Assets: ${copiedAssets.length} dosya

## Kontrol

1. Screenshot dosyalarını gerçek iPhone ölçülerine göre incele.
2. App Store ikonunun 1024x1024 opak PNG çıktısını \`assets/app-store-icon-1024.png\` içinden kullan.
3. App Store Connect metinlerini \`docs/app-store-submission.md\` içinden kullan.
4. Review note içinde ilan linki analizinin kullanıcı aksiyonuyla çalıştığını ve fotoğraf kontrolünün kesin hasar tespiti olmadığını koru.
5. Gizlilik cevaplarında OpenRouter üzerinden geçici AI işleme ve kullanıcının dosya seçimiyle sınırlı fotoğraf erişimi bilgisini kullan.
6. TestFlight öncesi \`npm run native:build\` sonucunu yeniden doğrula.
`,
  "utf8",
);

const files = readdirSync(outputDir, { recursive: true });
console.log(`App Store package hazirlandi: ${outputDir}`);
console.log(`Toplam dosya: ${files.length}`);
