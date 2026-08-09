import { execFileSync } from "node:child_process";

const requiredGitHubSecrets = [
  "APPLE_TEAM_ID",
  "IOS_DISTRIBUTION_CERTIFICATE_P12_BASE64",
  "IOS_DISTRIBUTION_CERTIFICATE_PASSWORD",
  "IOS_PROVISIONING_PROFILE_BASE64",
  "APP_STORE_CONNECT_KEY_ID",
  "APP_STORE_CONNECT_ISSUER_ID",
  "APP_STORE_CONNECT_API_KEY_P8_BASE64",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_DATABASE_URL",
];

const requiredEnv = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_DATABASE_URL",
];

const repo = process.env.GITHUB_REPOSITORY || "akifyapayzeka/eksperiq";
const strict = process.argv.includes("--required") || process.env.EXTERNAL_READINESS_REQUIRED === "true";

function readGitHubSecrets() {
  try {
    const output = execFileSync("gh", ["secret", "list", "--repo", repo], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });

    return new Set(
      output
        .split(/\r?\n/)
        .map((line) => line.trim().split(/\s+/)[0])
        .filter(Boolean),
    );
  } catch {
    return null;
  }
}

const configuredSecrets = readGitHubSecrets();
const missingSecrets =
  configuredSecrets === null
    ? requiredGitHubSecrets
    : requiredGitHubSecrets.filter((name) => !configuredSecrets.has(name));
const missingEnv = requiredEnv.filter((name) => !process.env[name]?.trim());

if (configuredSecrets === null) {
  console.log("GitHub secret listesi okunamadi; gh CLI oturumu yoksa bu kontrol sadece env durumunu raporlar.");
}

if (missingSecrets.length > 0) {
  console.log(`Eksik GitHub secret: ${missingSecrets.join(", ")}`);
}

if (missingEnv.length > 0) {
  console.log(`Eksik local/CI env: ${missingEnv.join(", ")}`);
}

if (missingSecrets.length === 0 && missingEnv.length === 0) {
  console.log("External readiness kontrati tamam: Apple ve Supabase secret isimleri mevcut.");
  process.exit(0);
}

if (strict) {
  process.exit(1);
}

console.log(
  "External readiness tamam degil. Bu development'ta uyaridir; TestFlight/App Store oncesi --required ile temiz gecmelidir.",
);
