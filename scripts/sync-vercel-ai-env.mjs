import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const requiredVars = [
  "OPENROUTER_API_KEY",
  "OPENROUTER_MODEL",
  "OPENROUTER_DAILY_REQUEST_LIMIT",
  "NEXT_PUBLIC_AI_ANALYSIS_NOTE_ENABLED",
  "OPENROUTER_VISION_MODEL",
  "OPENROUTER_PHOTO_DAILY_REQUEST_LIMIT",
  "NEXT_PUBLIC_AI_PHOTO_DAMAGE_ENABLED",
];

const envFile = resolve(process.cwd(), ".env.local");

function fail(message) {
  console.error(`Vercel AI env sync failed: ${message}`);
  process.exit(1);
}

function readLocalEnv() {
  if (!existsSync(envFile)) fail(".env.local bulunamadi.");

  const values = new Map();
  for (const line of readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    const name = trimmed.slice(0, index).trim();
    const value = trimmed
      .slice(index + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
    if (name) values.set(name, value);
  }
  return values;
}

function runVercel(args, input) {
  return spawnSync("npx", ["vercel", ...args], {
    input,
    encoding: "utf8",
    shell: process.platform === "win32",
    stdio: ["pipe", "pipe", "pipe"],
  });
}

const values = readLocalEnv();
const missing = requiredVars.filter((name) => !values.get(name));
if (missing.length) fail(`.env.local icinde eksik degisken var: ${missing.join(", ")}`);

const projectConfigExists = existsSync(resolve(process.cwd(), ".vercel", "project.json"));
if (!projectConfigExists) {
  fail("Bu klasor Vercel projesine linkli degil. Once Vercel hesabiyla `npx vercel link` gerekir.");
}

for (const name of requiredVars) {
  const removeResult = runVercel(["env", "rm", name, "production", "--yes"]);
  if (removeResult.status !== 0 && !`${removeResult.stderr}${removeResult.stdout}`.includes("not found")) {
    fail(`${name} eski production degeri silinemedi. Vercel oturumu/proje yetkisini kontrol edin.`);
  }

  const addResult = runVercel(["env", "add", name, "production"], `${values.get(name)}\n`);
  if (addResult.status !== 0) {
    fail(`${name} production ortamına eklenemedi. Vercel oturumu/proje yetkisini kontrol edin.`);
  }

  console.log(`${name}: production env guncellendi.`);
}

console.log("Vercel production AI env sync tamamlandi. Secret degerler yazdirilmadi.");
