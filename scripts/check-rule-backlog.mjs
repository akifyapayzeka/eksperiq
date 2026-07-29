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
const sourceLabels = {
  "market-observation": "Piyasa gözlemi",
  "user-feedback": "Kullanıcı geri bildirimi",
  "expert-review": "Uzman değerlendirmesi",
};

function backlogRowsById() {
  const rows = new Map();

  for (const match of backlog.matchAll(
    /^\|\s*([a-z0-9]+(?:-[a-z0-9]+)+)\s*\|\s*([^|]+?)\s*\|\s*`([^`]+)`\s*\|[^|]*\|\s*`([^`]+)`\s*\|\s*([^|]+?)\s*\|/gm,
  )) {
    rows.set(match[1], {
      source: match[2].trim(),
      affectedRuleFile: match[3].trim(),
      unitTest: match[4].trim(),
      status: match[5].trim(),
    });
  }

  return rows;
}

function candidateBlocksById() {
  const blocks = new Map();

  const candidateBlocks = candidates
    .split(/\n  \{\n/)
    .slice(1)
    .map((part) => `  {\n${part}`)
    .filter((part) => part.includes("feedbackRecord:"));

  for (const block of candidateBlocks) {
    const id = block.match(/id:\s*"([^"]+)"/)?.[1] ?? "";
    if (!id) continue;

    blocks.set(id, {
      source: block.match(/source:\s*"([^"]+)"/)?.[1] ?? "",
      affectedRuleFile: block.match(/affectedRuleFile:\s*"([^"]+)"/)?.[1] ?? "",
      status: block.match(/status:\s*"([^"]+)"/)?.[1] ?? "",
      acceptanceEvidence: [...block.matchAll(/acceptanceEvidence:\s*\[([\s\S]*?)\]/g)].flatMap((item) =>
        [...item[1].matchAll(/"([^"]+)"/g)].map((evidence) => evidence[1]),
      ),
    });
  }

  return blocks;
}

const backlogRows = backlogRowsById();
const candidateBlocks = candidateBlocksById();

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

for (const id of candidateIds) {
  const row = backlogRows.get(id);
  const candidate = candidateBlocks.get(id);

  if (!row || !candidate) continue;

  if (row.affectedRuleFile !== candidate.affectedRuleFile) {
    fail(`${id} affected rule file mismatch: ${row.affectedRuleFile} != ${candidate.affectedRuleFile}`);
  }

  if (row.status !== candidate.status) {
    fail(`${id} status mismatch: ${row.status} != ${candidate.status}`);
  }

  if (sourceLabels[candidate.source] !== row.source) {
    fail(`${id} source mismatch: ${row.source} != ${sourceLabels[candidate.source] ?? candidate.source}`);
  }

  if (!existsSync(row.unitTest)) {
    fail(`${id} unit test file does not exist: ${row.unitTest}`);
  }

  if (candidate.status === "accepted" && candidate.acceptanceEvidence.length < 2) {
    fail(`${id} accepted candidate must include at least two acceptance evidence items.`);
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
