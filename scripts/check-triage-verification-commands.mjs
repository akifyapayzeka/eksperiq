import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = process.cwd();
const tempDir = mkdtempSync(join(tmpdir(), "eksperiq-triage-commands-"));
const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const fixtures = [
  "tests/fixtures/user-test-note.txt",
  "tests/fixtures/user-test-rule-note.txt",
  "tests/fixtures/user-test-note-with-pii.txt",
  "tests/fixtures/user-test-ui-note.txt",
  "tests/fixtures/user-test-mixed-note.txt",
];
const allowedNpxCommands = [
  /^npx playwright test tests\/e2e\/main-flow\.spec\.ts --project=mobile$/,
  /^npx playwright test tests\/e2e\/main-flow\.spec\.ts --project=mobile --grep "form\|select\|damage"$/,
  /^npx playwright test tests\/e2e\/main-flow\.spec\.ts --project=mobile --grep "select controls\|damage part choices\|creates analysis result"$/,
  /^npx playwright test tests\/e2e\/main-flow\.spec\.ts --grep "creates analysis result"$/,
  /^npx playwright test tests\/e2e\/main-flow\.spec\.ts --project=mobile --grep "mobile bottom navigation"$/,
  /^npx playwright test tests\/e2e\/main-flow\.spec\.ts --grep "copies seller-ready message"$/,
  /^npx playwright test tests\/e2e\/main-flow\.spec\.ts --grep "feedback collection"$/,
];

function fail(message) {
  console.error(`Triage verification command check failed: ${message}`);
  process.exitCode = 1;
}

function commandsFromTriage(markdown) {
  return [...markdown.matchAll(/^- `([^`]+)`$/gm)].map((match) => match[1]);
}

function isValidCommand(command) {
  if (command.startsWith("npm run ")) {
    const script = command.replace("npm run ", "").trim();
    return typeof packageJson.scripts?.[script] === "string";
  }

  return allowedNpxCommands.some((pattern) => pattern.test(command));
}

try {
  for (const fixture of fixtures) {
    execFileSync(process.execPath, [join(root, "scripts", "triage-user-test-note.mjs"), join(root, fixture), tempDir], {
      cwd: root,
      stdio: "pipe",
    });
  }

  const outputs = [
    "user-test-note-triage.md",
    "user-test-rule-note-triage.md",
    "user-test-note-with-pii-triage.md",
    "user-test-ui-note-triage.md",
    "user-test-mixed-note-triage.md",
  ];

  for (const output of outputs) {
    const markdown = readFileSync(join(tempDir, output), "utf8");
    const commands = commandsFromTriage(markdown);

    if (commands.length === 0) {
      fail(`${output} does not include verification commands.`);
      continue;
    }

    for (const command of commands) {
      if (!isValidCommand(command)) {
        fail(`${output} includes unsupported command: ${command}`);
      }
    }
  }
} finally {
  rmSync(tempDir, { force: true, recursive: true });
}

if (!process.exitCode) {
  console.log("Triage verification command check passed.");
}
