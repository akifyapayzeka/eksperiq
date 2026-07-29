import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const outputDir = join(root, "dist", "user-test-issues");
const requiredFiles = [
  "README.md",
  "01-ilk-kez-ikinci-el-arac-bakacak-kullanici.md",
  "02-aractan-anlayan-yakin-cevre-kullanicisi.md",
  "03-mobil-tek-elle-kullanim.md",
  "04-yuksek-riskli-ilan-degerlendirmesi.md",
  "05-paylasma-ve-ekspertize-hazirlik.md",
];

const requiredSnippets = [
  "Kişisel veri paylaşmayın",
  "## Triage sonrası",
  "npm run user-tests:triage -- path/to/user-note.txt",
  "Issue önerisi",
  "Önerilen doğrulama komutları",
  "*-github-issue.md",
  "Otomatik triage taslağı üretildi",
];

function fail(message) {
  console.error(`User test issue package check failed: ${message}`);
  process.exitCode = 1;
}

await import(pathToFileURL(join(root, "scripts", "prepare-user-test-issues.mjs")).href);

for (const file of requiredFiles) {
  const filePath = join(outputDir, file);

  if (!existsSync(filePath)) {
    fail(`missing generated file: ${file}`);
    continue;
  }

  if (file === "README.md") continue;

  const content = readFileSync(filePath, "utf8");

  for (const snippet of requiredSnippets) {
    if (!content.includes(snippet)) {
      fail(`${file} missing text: ${snippet}`);
    }
  }
}

const readme = readFileSync(join(outputDir, "README.md"), "utf8");
if (!readme.includes("npm run user-tests:triage-check")) {
  fail("README missing triage check command.");
}

if (!process.exitCode) {
  console.log("User test issue package check passed.");
}
