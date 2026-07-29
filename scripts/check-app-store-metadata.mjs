import fs from "node:fs";

const files = ["docs/app-store-submission.md", "docs/app-store-privacy-answers.md", "docs/app-store-readiness.md"];

const requiredSnippets = [
  "EksperIQ",
  "karar destek",
  "profesyonel araç ekspertizinin",
  "garanti etmez",
  "Kullanıcı hesabı: Yok",
  "Reklam takibi: Yok",
  "Üçüncü taraf analytics: Yok",
  "Konum izni: Yok",
  "Destek URL'si: `https://eksperiq.vercel.app/geri-bildirim`",
];

const forbiddenPositiveClaims = [
  "kesin al",
  "kesin alınır",
  "asla alma",
  "hasarsızdır",
  "sorunsuzdur",
  "ekspertize gerek yok",
  "satın almaya uygundur",
];

function fail(message) {
  console.error(`App Store metadata kontrolu basarisiz: ${message}`);
  process.exitCode = 1;
}

const corpus = files
  .map((file) => {
    if (!fs.existsSync(file)) {
      fail(`eksik dosya: ${file}`);
      return "";
    }

    return fs.readFileSync(file, "utf8");
  })
  .join("\n");

const normalizedCorpus = corpus.toLocaleLowerCase("tr-TR");

for (const snippet of requiredSnippets) {
  if (!normalizedCorpus.includes(snippet.toLocaleLowerCase("tr-TR"))) {
    fail(`zorunlu metin eksik: ${snippet}`);
  }
}

for (const claim of forbiddenPositiveClaims) {
  if (normalizedCorpus.includes(claim.toLocaleLowerCase("tr-TR"))) {
    fail(`kesin veya yaniltici ifade bulundu: ${claim}`);
  }
}

if (!process.exitCode) {
  console.log("App Store metadata kontrolu gecti.");
}
