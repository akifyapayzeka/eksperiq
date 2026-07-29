import { execSync } from "node:child_process";

const steps = [
  { label: "Format", script: "format" },
  { label: "Lint", script: "lint" },
  { label: "TypeScript", script: "typecheck" },
  { label: "Sensitive data", script: "privacy:check" },
  { label: "Safe claims", script: "claims:check" },
  { label: "Feedback output safety", script: "feedback:outputs-check" },
  { label: "Feedback runbook", script: "feedback:runbook-check" },
  { label: "Form field types", script: "form:fields-check" },
  { label: "Rule backlog", script: "rule-backlog:check" },
  { label: "Unit tests", script: "test" },
  { label: "User test issue package", script: "user-tests:package-check" },
  { label: "User test note template", script: "user-tests:note-template-check" },
  { label: "User test triage", script: "user-tests:triage-check" },
  { label: "User test verification commands", script: "user-tests:commands-check" },
  { label: "Rule feedback package", script: "rule-feedback:check" },
  { label: "Launch readiness", script: "launch:check" },
  { label: "App Store metadata", script: "appstore:metadata-check" },
  { label: "Native build", script: "native:build" },
];

for (const step of steps) {
  console.log(`\n== ${step.label}: npm run ${step.script} ==`);
  execSync(`npm run ${step.script}`, { stdio: "inherit" });
}

console.log("\nRelease preflight passed.");
