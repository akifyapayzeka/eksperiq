import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "@playwright/test";

const outputDir = join(process.cwd(), "dist", "app-store-package", "app-store-screenshots");
const sourceDir = join(process.cwd(), "test-results", "screenshots");
const width = 1320;
const height = 2868;

const screenshots = [
  {
    source: "mobile-home.png",
    output: "01-home-1320x2868.png",
    title: "İlanı daha bilinçli değerlendir",
    subtitle: "Riskli noktaları ve güçlü tarafları tek ekranda gör.",
  },
  {
    source: "mobile-analysis-form.png",
    output: "02-analysis-form-1320x2868.png",
    title: "Bilgileri manuel gir",
    subtitle: "İlan sitesi kazımadan, yalnızca verdiğin bilgilerle analiz üret.",
  },
  {
    source: "mobile-result.png",
    output: "03-result-1320x2868.png",
    title: "Risk skorunu ve soruları gör",
    subtitle: "Satıcıya ne soracağını ve ekspertizde neye bakılacağını öğren.",
  },
  {
    source: "mobile-my-analyses.png",
    output: "04-analyses-1320x2868.png",
    title: "Analizlerini oturumda takip et",
    subtitle: "Karar destek raporlarını sade bir akışta incele.",
  },
  {
    source: "mobile-offline.png",
    output: "05-offline-1320x2868.png",
    title: "Net sınırlar, güvenli kullanım",
    subtitle: "EksperIQ profesyonel ekspertizin yerine geçmez.",
  },
];

function pngDataUrl(filePath) {
  const base64 = readFileSync(filePath).toString("base64");
  return `data:image/png;base64,${base64}`;
}

function ensureSourcesExist() {
  const missing = screenshots
    .map((item) => join(sourceDir, item.source))
    .filter((sourcePath) => !existsSync(sourcePath));

  if (missing.length) {
    console.error("App Store screenshot kaynagi eksik:");
    for (const sourcePath of missing) console.error(`- ${sourcePath}`);
    console.error("Once `npm run screenshots` calistirin.");
    process.exit(1);
  }
}

function buildHtml(item) {
  const source = pngDataUrl(join(sourceDir, item.source));
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
        background: #f5f8fb;
        color: #0a1a2f;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      .canvas {
        width: ${width}px;
        height: ${height}px;
        padding: 168px 108px 116px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
      }
      .copy {
        width: 100%;
      }
      .eyebrow {
        color: #0f766e;
        font-size: 34px;
        font-weight: 800;
        margin: 0 0 28px;
      }
      h1 {
        margin: 0;
        max-width: 980px;
        font-size: 88px;
        line-height: 1.05;
        letter-spacing: 0;
      }
      .subtitle {
        margin: 34px 0 0;
        max-width: 940px;
        color: #475569;
        font-size: 42px;
        line-height: 1.3;
      }
      .phone {
        width: 900px;
        height: 1760px;
        padding: 22px;
        border-radius: 102px;
        background: #0a1a2f;
        box-shadow: 0 50px 130px rgba(10, 26, 47, 0.28);
      }
      .screen {
        width: 100%;
        height: 100%;
        border-radius: 80px;
        overflow: hidden;
        background: white;
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
        color: #64748b;
        font-size: 30px;
        font-weight: 700;
      }
      .brand {
        color: #0a1a2f;
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
mkdirSync(outputDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });

for (const item of screenshots) {
  await page.setContent(buildHtml(item), { waitUntil: "load" });
  await page.screenshot({ path: join(outputDir, item.output), fullPage: false });
}

await browser.close();
console.log(`App Store 6.9 inch screenshot seti hazirlandi: ${outputDir}`);
