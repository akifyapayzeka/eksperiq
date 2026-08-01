import { readFileSync } from "node:fs";
import { join } from "node:path";

const source = readFileSync(join(process.cwd(), "src", "components", "forms", "analysis-form-sections.tsx"), "utf8");

const fixedChoiceSelectIds = [
  "brand",
  "model",
  "trim",
  "fuelType",
  "transmission",
  "city",
  "bodyType",
  "drivetrain",
  "ownerInfo",
  "tradeStatus",
  "airbagStatus",
  "timingBeltInfo",
  "transmissionMaintenanceInfo",
  "batteryStatus",
  "tireStatus",
  "lpgStatus",
];

const numericFieldIds = ["year", "mileage", "price", "engineSize", "enginePower", "tramerAmount"];
const dateFieldIds = ["lastMaintenanceDate", "inspectionEndDate"];
const damagePartFieldNames = ["paintedParts", "replacedParts", "localPaintedParts"];

function fail(message) {
  console.error(`Form field type check failed: ${message}`);
  process.exitCode = 1;
}

function includesAcrossWhitespace(snippet) {
  const normalizedSource = source.replace(/\s+/g, " ");
  const normalizedSnippet = snippet.replace(/\s+/g, " ");
  return normalizedSource.includes(normalizedSnippet);
}

function componentForId(componentName, id) {
  const idIndex = source.indexOf(`id="${id}"`);
  if (idIndex === -1) return "";

  const componentStart = source.lastIndexOf(`<${componentName}`, idIndex);
  const componentEnd = source.indexOf("/>", idIndex);

  if (componentStart === -1 || componentEnd === -1) return "";

  return source.slice(componentStart, componentEnd + 2);
}

for (const id of fixedChoiceSelectIds) {
  if (!componentForId("SelectField", id)) {
    fail(`${id} must stay a fixed-choice SelectField.`);
  }
}

for (const id of numericFieldIds) {
  const component = componentForId("Field", id);

  if (!component || !component.includes('type="number"')) {
    fail(`${id} must stay a numeric input.`);
  }
}

for (const id of dateFieldIds) {
  const component = componentForId("Field", id);

  if (!component || !component.includes('type="date"')) {
    fail(`${id} must stay a date input.`);
  }
}

for (const name of damagePartFieldNames) {
  if (
    !includesAcrossWhitespace(`name="${name}"`) ||
    !includesAcrossWhitespace(`<input type="hidden" {...register(name)} />`)
  ) {
    fail(`${name} must stay a tappable option picker backed by a hidden field.`);
  }
}

if (!source.includes("damagePartOptions.map")) {
  fail("Damage part fields must render from damagePartOptions.");
}

if (!process.exitCode) {
  console.log("Form field type check passed.");
}
