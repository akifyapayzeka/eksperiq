import { readFileSync } from "node:fs";

const file = "docs/real-user-feedback-runbook.md";
const content = readFileSync(file, "utf8");
const normalizedContent = content.toLocaleLowerCase("tr-TR");

const requiredSnippets = [
  "npm run user-tests:new-note",
  "npm run user-tests:triage",
  "*-github-issue.md",
  "Ek issue sinyalleri",
  "Kural backlog aday taslagi",
  "docs/rule-backlog.md",
  "src/lib/feedback/rule-candidates.ts",
  "npm run rule-feedback:package",
  "rule-feedback-manifest.json",
  "npm run feedback:outputs-check",
  "npm run release:check",
  "git diff --check",
  "dist/user-test-notes",
  "dist/user-test-triage",
  "dist/user-test-issues",
  "dist/rule-feedback-issues",
];

for (const snippet of requiredSnippets) {
  if (!normalizedContent.includes(snippet.toLocaleLowerCase("tr-TR"))) {
    console.error(`Feedback runbook check failed: missing "${snippet}" in ${file}.`);
    process.exitCode = 1;
  }
}

if (!process.exitCode) {
  console.log("Feedback runbook check passed.");
}
