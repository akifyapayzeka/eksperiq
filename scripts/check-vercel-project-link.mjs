import { existsSync, readFileSync } from "node:fs";

const EXPECTED_PROJECT_ID = "prj_y7zIRzyGwy7xqap5QQATLrPYXbJv";
const EXPECTED_ORG_ID = "team_Qr1busUlL80svpk8j8rWVp5O";

function fail(message) {
  console.error(`Vercel project link check failed: ${message}`);
  process.exit(1);
}

function readLocalProjectJson() {
  if (!existsSync(".vercel/project.json")) return null;
  try {
    return JSON.parse(readFileSync(".vercel/project.json", "utf8"));
  } catch {
    fail(".vercel/project.json exists but is not valid JSON.");
  }
}

const local = readLocalProjectJson();
const projectId = process.env.VERCEL_PROJECT_ID || local?.projectId;
const orgId = process.env.VERCEL_ORG_ID || local?.orgId;

if (projectId !== EXPECTED_PROJECT_ID) {
  fail(`expected projectId ${EXPECTED_PROJECT_ID}, got ${projectId || "missing"}.`);
}

if (orgId !== EXPECTED_ORG_ID) {
  fail(`expected orgId ${EXPECTED_ORG_ID}, got ${orgId || "missing"}.`);
}

console.log(`Vercel project link check passed: project=${projectId}, org=${orgId}`);
