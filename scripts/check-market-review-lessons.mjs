import { readFileSync } from "node:fs";

const checklistPath = "docs/market-review-lessons-checklist.md";
const releaseChecklistPath = "docs/release-operations-checklist.md";
const launchChecklistPath = "docs/launch-master-checklist.md";
const storeKitDocPath = "docs/ios-storekit-integration.md";

const checklist = readFileSync(checklistPath, "utf8");
const releaseChecklist = readFileSync(releaseChecklistPath, "utf8");
const launchChecklist = readFileSync(launchChecklistPath, "utf8");
const storeKitDoc = readFileSync(storeKitDocPath, "utf8");

const requiredLessons = [
  "eksik ekspertiz tespiti",
  "guvenlik kusuru",
  "teklif/fiyat farkinin aciklanmamasi",
  "kronik sorun",
  "usta sorusu",
  "net satin alma tavsiyesi",
  "hasarsizlik",
  "ekspertiz garantisi",
  "Bilinmiyor",
  "saticiya sorular",
  "resmi sorgu rehberi",
];

const requiredCheckedGates = [
  "Rapor dili net satin alma tavsiyesi",
  "Sonuc ekraninda kronik sorunlar",
  "Ilan linkinden gelen eksik bilgi",
  "Ilan fotograf filtreleme",
  "Foto hasar ve ekspertiz raporu AI",
  "Mobil alt navigasyon",
  "Kullanici geri bildirimleri",
  "Kronik sorun verisi 40 marka",
  "Pro/paywall",
];

const requiredOpenExternalGates = [
  "Gercek TestFlight cihazinda ilan linki",
  "App Store Connect abonelik urunleri",
  "Gercek kullanici testlerinden",
];

function fail(message) {
  console.error(`Market review lessons check failed: ${message}`);
  process.exitCode = 1;
}

function includes(source, snippet) {
  return source.toLocaleLowerCase("tr-TR").includes(snippet.toLocaleLowerCase("tr-TR"));
}

for (const lesson of requiredLessons) {
  if (!includes(checklist, lesson)) fail(`${checklistPath} missing lesson: ${lesson}`);
}

for (const gate of requiredCheckedGates) {
  if (!includes(checklist, `- [x] ${gate}`)) fail(`${checklistPath} missing checked gate: ${gate}`);
}

for (const gate of requiredOpenExternalGates) {
  if (!includes(checklist, `- [ ] ${gate}`)) fail(`${checklistPath} missing open external gate: ${gate}`);
}

for (const source of [
  { path: releaseChecklistPath, content: releaseChecklist },
  { path: launchChecklistPath, content: launchChecklist },
]) {
  if (!includes(source.content, checklistPath)) fail(`${source.path} does not reference ${checklistPath}`);
}

if (!includes(storeKitDoc, "NEXT_PUBLIC_STOREKIT_PURCHASES_ENABLED=true")) {
  fail(`${storeKitDocPath} does not document StoreKit purchase enable flag`);
}

if (!process.exitCode) {
  console.log("Market review lessons checklist is wired to release gates.");
}
