import { execFileSync } from "node:child_process";

const ignoredOutputExamples = [
  "dist/user-test-notes/sample-user-note.txt",
  "dist/user-test-triage/sample-triage.md",
  "dist/user-test-triage/sample-github-issue.md",
  "dist/user-test-issues/README.md",
  "dist/rule-feedback-issues/rule-feedback-manifest.json",
  "dist/rule-feedback-issues/sample-rule-issue.md",
];

const forbiddenTrackedPrefixes = [
  "dist/user-test-notes/",
  "dist/user-test-triage/",
  "dist/user-test-issues/",
  "dist/rule-feedback-issues/",
];

function fail(message) {
  console.error(`Feedback output safety check failed: ${message}`);
  process.exitCode = 1;
}

for (const file of ignoredOutputExamples) {
  try {
    execFileSync("git", ["check-ignore", "-q", file], { stdio: "pipe" });
  } catch {
    fail(`${file} must be ignored by git.`);
  }
}

const trackedFiles = execFileSync("git", ["ls-files"], { encoding: "utf8" }).split(/\r?\n/).filter(Boolean);

for (const file of trackedFiles) {
  if (forbiddenTrackedPrefixes.some((prefix) => file.startsWith(prefix))) {
    fail(`${file} must not be tracked because it can contain user feedback or generated issue drafts.`);
  }
}

if (!process.exitCode) {
  console.log("Feedback output safety check passed.");
}
