import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { extname } from "node:path";

const binaryExtensions = new Set([".avif", ".gif", ".ico", ".jpeg", ".jpg", ".pdf", ".png", ".webp", ".zip"]);

const checks = [
  {
    label: "OpenRouter API key",
    pattern: /sk-or-v1-[A-Za-z0-9_-]{20,}/g,
  },
  {
    label: "OpenAI-style API key",
    pattern: /sk-[A-Za-z0-9]{20,}/g,
  },
  {
    label: "JWT-like token",
    pattern: /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/g,
  },
];

const sensitiveEnvNames = ["OPENROUTER_API_KEY", "UPSTASH_REDIS_REST_TOKEN", "VAPID_PRIVATE_KEY"];

function trackedFiles() {
  return execFileSync("git", ["ls-files"], { encoding: "utf8" })
    .split(/\r?\n/)
    .filter(Boolean)
    .filter((file) => !binaryExtensions.has(extname(file).toLocaleLowerCase("tr-TR")));
}

function trackedEnvFiles() {
  return execFileSync("git", ["ls-files", ".env*"], { encoding: "utf8" })
    .split(/\r?\n/)
    .filter(Boolean)
    .filter((file) => file !== ".env.example");
}

function lineNumberFor(content, index) {
  return content.slice(0, index).split(/\r?\n/).length;
}

const findings = [];

for (const file of trackedEnvFiles()) {
  findings.push({
    file,
    label: "tracked env file is not allowed",
    line: 1,
  });
}

for (const file of trackedFiles()) {
  const content = readFileSync(file, "utf8");

  for (const check of checks) {
    check.pattern.lastIndex = 0;

    for (const match of content.matchAll(check.pattern)) {
      findings.push({
        file,
        label: check.label,
        line: lineNumberFor(content, match.index ?? 0),
      });
    }
  }

  content.split(/\r?\n/).forEach((line, index) => {
    for (const envName of sensitiveEnvNames) {
      const assignment = line.match(new RegExp(`^${envName}\\s*=\\s*(.*)$`));
      const value = assignment?.[1]?.trim().replace(/^['"]|['"]$/g, "");

      if (value) {
        findings.push({
          file,
          label: `non-empty ${envName} assignment`,
          line: index + 1,
        });
      }
    }
  });
}

if (findings.length > 0) {
  console.error("Sensitive data check failed:");

  for (const finding of findings) {
    console.error(`- ${finding.file}:${finding.line} ${finding.label}`);
  }

  process.exit(1);
}

console.log("Sensitive data check passed.");
