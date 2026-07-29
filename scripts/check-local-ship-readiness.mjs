import { execSync } from "node:child_process";

const steps = [
  { label: "Release preflight", script: "release:check" },
  { label: "End-to-end tests", script: "e2e" },
  { label: "App Store package", script: "appstore:prepare" },
  { label: "Hostinger static package", script: "hostinger:package" },
  { label: "Hostinger package check", script: "hostinger:check" },
  { label: "Launch audit", script: "launch:audit" },
];

for (const step of steps) {
  console.log(`\n== ${step.label}: npm run ${step.script} ==`);
  execSync(`npm run ${step.script}`, { stdio: "inherit" });
}

console.log(
  "\nLocal ship readiness passed. Account, payment, panel and App Store submission steps are still external.",
);
