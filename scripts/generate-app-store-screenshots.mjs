import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "@playwright/test";

const outputDir = join(process.cwd(), "dist", "app-store-package", "app-store-screenshots");
const sourceDir = join(process.cwd(), "docs", "app-store-screenshot-sources", "build-59");
const width = 1320;
const height = 2868;

const screenshots = [
  {
    source: "01-home.jpg",
    output: "01-home-1320x2868.png",
    title: "Araç alırken ilk adımı seç",
    subtitle: "İlan analizi, satın alma rehberi ve yakındaki kontrol noktaları tek yerde.",
  },
  {
    source: "02-analysis-start.jpg",
    output: "02-analysis-start-1320x2868.png",
    title: "İlanı ya da kendi aracını analiz et",
    subtitle: "İlan linkiyle satın alma raporu oluşturun veya fotoğrafla ön kontrol yapın.",
  },
  {
    source: "03-risk-score.jpg",
    output: "03-risk-score-1320x2868.png",
    title: "Risk skorunu ve özeti gör",
    subtitle: "Skor, karar özeti ve riskli bulgular satın alma öncesi öncelik verir.",
  },
  {
    source: "04-garage.jpg",
    output: "04-garage-1320x2868.png",
    title: "Garajında bakım ve ödemeyi takip et",
    subtitle: "Bakım, muayene, lastik, akü, MTV, sigorta ve kasko tarihlerini düzenli tut.",
  },
  {
    source: "05-buyer-decision.jpg",
    output: "05-buyer-decision-1320x2868.png",
    title: "Almadan önce şartları öğren",
    subtitle: "Ekspertiz, belge ve bakım sorularını gör; kararını kanıtla destekle.",
  },
];

function imageDataUrl(filePath) {
  const base64 = readFileSync(filePath).toString("base64");
  const mimeType = filePath.toLowerCase().endsWith(".jpg") || filePath.toLowerCase().endsWith(".jpeg")
    ? "image/jpeg"
    : "image/png";
  return `data:${mimeType};base64,${base64}`;
}

function ensureSourcesExist() {
  const missing = screenshots
    .map((item) => join(sourceDir, item.source))
    .filter((sourcePath) => !existsSync(sourcePath));

  if (missing.length) {
    console.error("App Store screenshot kaynagi eksik:");
    for (const sourcePath of missing) console.error(`- ${sourcePath}`);
    console.error("Build 59 screenshot kaynaklarini docs/app-store-screenshot-sources/build-59 altina ekleyin.");
    process.exit(1);
  }
}

function buildHtml(item) {
  const source = imageDataUrl(join(sourceDir, item.source));
  return `<!doctype html>
<html lang="tr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=${width}, initial-scale=1" />
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0;
        width: ${width}px;
        height: ${height}px;
        overflow: hidden;
        background:
          radial-gradient(circle at 22% 8%, rgba(79, 176, 229, 0.22), transparent 36%),
          radial-gradient(circle at 88% 3%, rgba(33, 195, 155, 0.12), transparent 32%),
          #07131d;
        color: #f8fafc;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      .canvas {
        width: ${width}px;
        height: ${height}px;
        padding: 128px 104px 104px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
      }
      .copy {
        width: 100%;
      }
      .eyebrow {
        color: #53b4f1;
        font-size: 34px;
        font-weight: 800;
        margin: 0 0 24px;
      }
      h1 {
        margin: 0;
        max-width: 1020px;
        font-size: 84px;
        line-height: 1.05;
        letter-spacing: 0;
      }
      .subtitle {
        margin: 34px 0 0;
        max-width: 1010px;
        color: #a8b4c2;
        font-size: 40px;
        line-height: 1.3;
      }
      .phone {
        width: 840px;
        height: 1822px;
        padding: 18px;
        border-radius: 86px;
        background: linear-gradient(180deg, #1e3447, #06111a);
        border: 2px solid rgba(142, 197, 234, 0.24);
        box-shadow: 0 52px 140px rgba(0, 0, 0, 0.48);
      }
      .screen {
        width: 100%;
        height: 100%;
        border-radius: 68px;
        overflow: hidden;
        background: #08141f;
      }
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: top center;
        display: block;
      }
      .footer {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: #8ea0b2;
        font-size: 30px;
        font-weight: 700;
      }
      .brand {
        color: #f8fafc;
        font-size: 42px;
        font-weight: 900;
      }
    </style>
  </head>
  <body>
    <main class="canvas">
      <section class="copy">
        <p class="eyebrow">EksperIQ</p>
        <h1>${item.title}</h1>
        <p class="subtitle">${item.subtitle}</p>
      </section>
      <section class="phone" aria-label="Uygulama ekranı">
        <div class="screen"><img src="${source}" alt="" /></div>
      </section>
      <section class="footer">
        <span class="brand">EksperIQ</span>
        <span>Karar desteği, kesin ekspertiz değildir.</span>
      </section>
    </main>
  </body>
</html>`;
}

ensureSourcesExist();
rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });

// Some local sandboxes pre-install a browser at a fixed path whose revision
// can lag what this pinned @playwright/test version expects, so the default
// revision-resolution download fails there (see playwright.config.ts for the
// full rationale). Reuse that same fallback here. No effect in real CI.
const sandboxChromiumPath = "/opt/pw-browsers/chromium";
const launchOptions = existsSync(sandboxChromiumPath) ? { executablePath: sandboxChromiumPath } : {};
const browser = await chromium.launch(launchOptions);
const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });

for (const item of screenshots) {
  await page.setContent(buildHtml(item), { waitUntil: "load" });
  await page.screenshot({ path: join(outputDir, item.output), fullPage: false });
}

await browser.close();
console.log(`App Store 6.9 inch screenshot seti hazirlandi: ${outputDir}`);
