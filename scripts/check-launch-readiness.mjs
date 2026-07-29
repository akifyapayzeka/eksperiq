import fs from "node:fs";
import path from "node:path";

const requiredFiles = [
  "docs/launch-plan-2026-08-15.md",
  "docs/launch-master-checklist.md",
  "docs/all-steps-status.md",
  "docs/release-operations-checklist.md",
  "docs/first-user-test-script.md",
  "docs/first-5-user-tests.md",
  "docs/user-test-issue-plan.md",
  "docs/user-test-feedback-triage.md",
  "docs/feedback-rule-expansion.md",
  "docs/rule-backlog.md",
  "docs/ios-testflight-preflight.md",
  "docs/testflight-qa-checklist.md",
  "docs/testflight-qa-report.md",
  "docs/ios-repo-strategy.md",
  "docs/ai-production-rollout.md",
  "docs/app-store-submission.md",
  "docs/app-store-privacy-answers.md",
  "docs/app-store-readiness.md",
  ".github/ISSUE_TEMPLATE/rule-feedback.md",
  ".github/ISSUE_TEMPLATE/user-test-feedback.md",
  "src/app/geri-bildirim/page.tsx",
  "src/lib/feedback/rule-candidates.ts",
  "scripts/check-live-site.mjs",
  "scripts/check-hostinger-package.ps1",
  "scripts/check-repo-sync.mjs",
  "scripts/check-sensitive-data.mjs",
  "scripts/check-release-preflight.mjs",
  "scripts/prepare-user-test-issues.mjs",
  "scripts/triage-user-test-note.mjs",
  "scripts/check-user-test-triage.mjs",
  "scripts/audit-launch-checklist.mjs",
  "public/app-store-icon-1024.png",
];

const requiredPackageScripts = [
  "lint",
  "typecheck",
  "test",
  "e2e",
  "build",
  "native:build",
  "appstore:prepare",
  "appstore:metadata-check",
  "hostinger:package",
  "hostinger:check",
  "deploy:check",
  "repo:check",
  "privacy:check",
  "release:check",
  "user-tests:package",
  "user-tests:triage",
  "user-tests:triage-check",
  "launch:audit",
  "ai:staging-check",
  "launch:check",
];

const requiredTextChecks = [
  {
    file: "docs/launch-plan-2026-08-15.md",
    snippets: ["15 Ağustos 2026", "Apple Developer Program", "Launch Master Checklist"],
  },
  {
    file: "docs/launch-master-checklist.md",
    snippets: ["Yerel Ürün Kalitesi", "App Store Teslim Paketi", "Dış Bağımlılık Sınırı"],
  },
  {
    file: "docs/all-steps-status.md",
    snippets: ["Tamamlanan Yerel Adımlar", "Dış Bağımlılıkta Bekleyen Adımlar", "npm run launch:audit"],
  },
  {
    file: "docs/app-store-privacy-answers.md",
    snippets: ["Kullanıcı hesabı: Yok", "Reklam takibi: Yok", "İlan sitesi scraping: Yok"],
  },
  {
    file: "docs/user-test-feedback-triage.md",
    snippets: ["kişisel veri", "Kural adayı", "App Store riski"],
  },
  {
    file: "docs/first-5-user-tests.md",
    snippets: ["Test 1", "Test 5", "Kullanıcı testi issue"],
  },
  {
    file: "docs/user-test-issue-plan.md",
    snippets: ["Açılacak issue'lar", "Paylaşma ve ekspertize hazırlık", "Kapanış kuralı"],
  },
  {
    file: "docs/rule-backlog.md",
    snippets: ["Kural Backlog", "Kanıt", "Unit test"],
  },
  {
    file: "docs/ios-testflight-preflight.md",
    snippets: ["Xcode", "Signing", "TestFlight"],
  },
  {
    file: ".github/ISSUE_TEMPLATE/user-test-feedback.md",
    snippets: ["Kişisel veri paylaşmayın", "Cihaz ve ortam", "Satın alma güveni"],
  },
  {
    file: "docs/release-operations-checklist.md",
    snippets: ["npm run launch:check", "Geri bildirim ve kural geliştirme"],
  },
];

function fail(message) {
  console.error(`Launch readiness check failed: ${message}`);
  process.exitCode = 1;
}

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(process.cwd(), file))) {
    fail(`missing required file: ${file}`);
  }
}

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));

for (const script of requiredPackageScripts) {
  if (typeof packageJson.scripts?.[script] !== "string") {
    fail(`missing package script: ${script}`);
  }
}

for (const check of requiredTextChecks) {
  const content = fs.readFileSync(check.file, "utf8");
  const normalizedContent = content.toLocaleLowerCase("tr-TR");

  for (const snippet of check.snippets) {
    if (!normalizedContent.includes(snippet.toLocaleLowerCase("tr-TR"))) {
      fail(`${check.file} does not include required text: ${snippet}`);
    }
  }
}

if (!process.exitCode) {
  console.log("Launch readiness package is complete.");
}
