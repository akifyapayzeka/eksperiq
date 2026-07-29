import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const requiredServerVars = ["OPENROUTER_API_KEY", "OPENROUTER_MODEL", "OPENROUTER_DAILY_REQUEST_LIMIT"];
const requiredPublicVars = ["NEXT_PUBLIC_AI_ANALYSIS_NOTE_ENABLED"];

function loadEnvFile(fileName) {
  const filePath = resolve(process.cwd(), fileName);
  if (!existsSync(filePath)) return;

  const lines = readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const name = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    if (!name || process.env[name]) continue;

    process.env[name] = rawValue.replace(/^["']|["']$/g, "");
  }
}

function hasValue(name) {
  return typeof process.env[name] === "string" && process.env[name].trim().length > 0;
}

loadEnvFile(".env");
loadEnvFile(".env.local");

const missingServer = requiredServerVars.filter((name) => !hasValue(name));
const missingPublic = requiredPublicVars.filter((name) => !hasValue(name));
const flagValue = process.env.NEXT_PUBLIC_AI_ANALYSIS_NOTE_ENABLED;
const limit = Number.parseInt(process.env.OPENROUTER_DAILY_REQUEST_LIMIT ?? "", 10);
const problems = [];

if (missingServer.length) problems.push(`Eksik server env: ${missingServer.join(", ")}`);
if (missingPublic.length) problems.push(`Eksik public env: ${missingPublic.join(", ")}`);
if (flagValue && !["true", "false"].includes(flagValue)) {
  problems.push("NEXT_PUBLIC_AI_ANALYSIS_NOTE_ENABLED sadece true veya false olmali.");
}
if (hasValue("OPENROUTER_DAILY_REQUEST_LIMIT") && (!Number.isFinite(limit) || limit <= 0)) {
  problems.push("OPENROUTER_DAILY_REQUEST_LIMIT pozitif sayi olmali.");
}

if (problems.length) {
  console.error("AI env kontrolu basarisiz:");
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log("AI env kontrolu gecti. Secret degerler yazdirilmadi.");
