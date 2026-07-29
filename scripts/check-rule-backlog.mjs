import { existsSync, readFileSync } from "node:fs";

const backlogPath = "docs/rule-backlog.md";
const candidatesPath = "src/lib/feedback/rule-candidates.ts";

function fail(message) {
  console.error(`Rule backlog check failed: ${message}`);
  process.exitCode = 1;
}

function unique(values) {
  return [...new Set(values)];
}

const backlog = readFileSync(backlogPath, "utf8");
const candidates = readFileSync(candidatesPath, "utf8");

const backlogIds = unique([...backlog.matchAll(/^\|\s*([a-z0-9]+(?:-[a-z0-9]+)+)\s*\|/gm)].map((match) => match[1]));
const candidateIds = unique([...candidates.matchAll(/id:\s*"([^"]+)"/g)].map((match) => match[1]));
const affectedRuleFiles = unique([...candidates.matchAll(/affectedRuleFile:\s*"([^"]+)"/g)].map((match) => match[1]));

for (const id of candidateIds) {
  if (!backlogIds.includes(id)) {
    fail(`${id} exists in ${candidatesPath} but not in ${backlogPath}`);
  }
}

for (const id of backlogIds) {
  if (!candidateIds.includes(id)) {
    fail(`${id} exists in ${backlogPath} but not in ${candidatesPath}`);
  }
}

for (const file of affectedRuleFiles) {
  if (!existsSync(file)) {
    fail(`affected rule file does not exist: ${file}`);
  }
}

if (!/acceptanceEvidence:\s*\[[\s\S]*?\]/.test(candidates)) {
  fail("rule candidates do not include acceptance evidence.");
}

if (!backlog.includes("Aktif kurala taşıma kapısı")) {
  fail(`${backlogPath} does not include the activation gate.`);
}

if (!process.exitCode) {
  console.log("Rule backlog check passed.");
}
