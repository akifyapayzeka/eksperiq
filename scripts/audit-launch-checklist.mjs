import fs from "node:fs";

const checklistPath = "docs/all-steps-status.md";
const content = fs.readFileSync(checklistPath, "utf8");

const unchecked = [...content.matchAll(/^- \[ \] (.+)$/gm)].map((match) => match[1]);
const externalSection = content.split("## Dış Bağımlılıkta Bekleyen Adımlar")[1] ?? "";

function fail(message) {
  console.error(`Launch audit basarisiz: ${message}`);
  process.exitCode = 1;
}

if (!content.includes("## Tamamlanan Yerel Adımlar")) {
  fail("tamamlanan yerel adimlar bolumu yok.");
}

if (!content.includes("## Dış Bağımlılıkta Bekleyen Adımlar")) {
  fail("dis bagimlilik bolumu yok.");
}

for (const item of unchecked) {
  if (!externalSection.includes(item)) {
    fail(`unchecked madde dis bagimlilik bolumunde degil: ${item}`);
  }
}

if (!content.includes("npm run launch:audit")) {
  fail("launch audit komutu dokumanda yok.");
}

for (const requiredLocalGate of [
  "npm run market-review:check",
  "npm run storekit:gate-check",
  "npm run chronic-issues:coverage",
]) {
  if (!content.includes(requiredLocalGate)) {
    fail(`yerel tamamlanan kapilar bolumunde eksik komut: ${requiredLocalGate}`);
  }
}

if (!process.exitCode) {
  console.log(`Launch audit gecti. Dis bagimlilikta bekleyen madde: ${unchecked.length}`);
  for (const item of unchecked) {
    console.log(`- ${item}`);
  }
}
