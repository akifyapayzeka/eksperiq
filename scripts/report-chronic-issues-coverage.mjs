import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const formSource = readFileSync("src/components/forms/analysis-form-sections.tsx", "utf8");
const dataDir = "src/lib/chronic-issues/data";
const dataSource = readdirSync(dataDir)
  .filter((file) => file.endsWith(".ts") && file !== "index.ts")
  .map((file) => readFileSync(join(dataDir, file), "utf8"))
  .join("\n");

function normalize(value) {
  return value
    .trim()
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
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
const currentCoverageYear = 2026;

function findMatchingBrace(source, openIndex) {
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let index = openIndex; index < source.length; index += 1) {
    const char = source[index];
    if (inString) {
      if (escape) {
        escape = false;
      } else if (char === "\\") {
        escape = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }
    if (char === '"') {
      inString = true;
    } else if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return -1;
}

function numberField(source, field) {
  const match = source.match(new RegExp(`${field}:\\s*(\\d{4})`));
  return match ? Number.parseInt(match[1], 10) : null;
}

const entryBlocks = [];
for (const match of dataSource.matchAll(/brand:\s*"([^"]+)"[\s\S]*?model:\s*"([^"]+)"/g)) {
  const openIndex = dataSource.lastIndexOf("{", match.index);
  const closeIndex = openIndex >= 0 ? findMatchingBrace(dataSource, openIndex) : -1;
  if (openIndex >= 0 && closeIndex > openIndex) entryBlocks.push(dataSource.slice(openIndex, closeIndex + 1));
}

let yearExpandedVariants = 0;
for (const entryBlock of entryBlocks) {
  const entryYearFrom = numberField(entryBlock, "yearFrom") ?? 2000;
  const entryYearTo = numberField(entryBlock, "yearTo") ?? currentCoverageYear;
  for (const engineMatch of entryBlock.matchAll(/engineLabel:\s*"([^"]+)"/g)) {
    const engineOpenIndex = entryBlock.lastIndexOf("{", engineMatch.index);
    const engineCloseIndex = engineOpenIndex >= 0 ? findMatchingBrace(entryBlock, engineOpenIndex) : -1;
    const engineBlock =
      engineOpenIndex >= 0 && engineCloseIndex > engineOpenIndex
        ? entryBlock.slice(engineOpenIndex, engineCloseIndex + 1)
        : "";
    const from = Math.max(2000, numberField(engineBlock, "yearFrom") ?? entryYearFrom);
    const to = Math.min(currentCoverageYear, numberField(engineBlock, "yearTo") ?? entryYearTo);
    if (to >= from) yearExpandedVariants += to - from + 1;
  }
}

console.log(`Form catalog: ${formModelsByBrand.size} brands, ${[...formModelsByBrand.values()].flat().length} models`);
console.log(
  `Chronic DB: ${brands.size} brands, ${chronicEntries.length} models, ${variants} variants, ${issues} issues`,
);
console.log(`Year-expanded engine coverage (2000-${currentCoverageYear}): ${yearExpandedVariants} engine-year rows`);
console.log(`Missing model coverage: ${missing.length}`);

const byBrand = new Map();
for (const item of missing) {
  byBrand.set(item.brand, [...(byBrand.get(item.brand) ?? []), item.model]);
}
for (const [brand, models] of [...byBrand.entries()].sort(([a], [b]) => a.localeCompare(b, "tr"))) {
  console.log(`- ${brand}: ${models.join(", ")}`);
}
