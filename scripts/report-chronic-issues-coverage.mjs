import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const formSource = readFileSync("src/components/forms/analysis-form-sections.tsx", "utf8");
const dataDir = "src/lib/chronic-issues/data";
const dataSource = readdirSync(dataDir)
  .filter((file) => file.endsWith(".ts") && file !== "index.ts")
  .map((file) => readFileSync(join(dataDir, file), "utf8"))
  .join("\n");

function normalize(value) {
  return value.trim().toLocaleLowerCase("tr-TR");
}

function quotedValues(value) {
  return [...value.matchAll(/"([^"]+)"/g)].map((match) => match[1]);
}

const modelBody = formSource.match(/modelsByBrand: Record<string, string\[]> = \{([\s\S]*?)\n\};/)?.[1] ?? "";
const formModelsByBrand = new Map();
for (const match of modelBody.matchAll(/\n\s*("[^"]+"|[A-Za-z][A-Za-z0-9]*)\s*:\s*\[([\s\S]*?)\](?:,|\n)/g)) {
  const brand = match[1].startsWith('"') ? match[1].slice(1, -1) : match[1];
  formModelsByBrand.set(brand, quotedValues(match[2]));
}

const chronicEntries = [...dataSource.matchAll(/brand:\s*"([^"]+)"[\s\S]*?model:\s*"([^"]+)"/g)].map((match) => ({
  brand: match[1],
  model: match[2],
}));
const coveredPairs = new Set(chronicEntries.map((entry) => `${normalize(entry.brand)}::${normalize(entry.model)}`));

const missing = [];
for (const [brand, models] of formModelsByBrand) {
  for (const model of models) {
    const key = `${normalize(brand)}::${normalize(model)}`;
    if (!coveredPairs.has(key)) missing.push({ brand, model });
  }
}

const brands = new Set(chronicEntries.map((entry) => entry.brand));
const variants = [...dataSource.matchAll(/engineLabel:\s*"([^"]+)"/g)].length;
const issues = [...dataSource.matchAll(/severity:\s*"(high|medium|low)"/g)].length;

console.log(`Form catalog: ${formModelsByBrand.size} brands, ${[...formModelsByBrand.values()].flat().length} models`);
console.log(
  `Chronic DB: ${brands.size} brands, ${chronicEntries.length} models, ${variants} variants, ${issues} issues`,
);
console.log(`Missing model coverage: ${missing.length}`);

const byBrand = new Map();
for (const item of missing) {
  byBrand.set(item.brand, [...(byBrand.get(item.brand) ?? []), item.model]);
}
for (const [brand, models] of [...byBrand.entries()].sort(([a], [b]) => a.localeCompare(b, "tr"))) {
  console.log(`- ${brand}: ${models.join(", ")}`);
}
