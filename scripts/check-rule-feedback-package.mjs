import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = process.cwd();
const tempDir = mkdtempSync(join(tmpdir(), "eksperiq-rule-feedback-"));

function fail(message) {
  console.error(`Rule feedback package check failed: ${message}`);
  process.exitCode = 1;
}

function expectIncludes(content, snippets, fileName) {
  for (const snippet of snippets) {
    if (!content.includes(snippet)) {
      fail(`${fileName} missing text: ${snippet}`);
    }
  }
}

function expectManifestEntry(manifest, id, expected) {
  const entry = manifest.find((item) => item.id === id);

  if (!entry) {
    fail(`manifest missing candidate: ${id}`);
    return;
  }

  for (const [key, value] of Object.entries(expected)) {
    if (entry[key] !== value) {
      fail(`manifest ${id} has wrong ${key}: ${entry[key]}`);
    }
  }

  if (!existsSync(join(tempDir, entry.issueFile))) {
    fail(`manifest ${id} points to missing issue file: ${entry.issueFile}`);
  }

  if (typeof entry.acceptanceEvidenceCount !== "number" || entry.acceptanceEvidenceCount < 2) {
    fail(`manifest ${id} must include at least two acceptance evidence items.`);
  }
}

try {
  execFileSync(process.execPath, [join(root, "scripts", "prepare-rule-feedback-issues.mjs"), tempDir], {
    cwd: root,
    stdio: "pipe",
  });

  const readOutput = (fileName) => readFileSync(join(tempDir, fileName), "utf8");
  const readme = readOutput("README.md");
  const sellerIssue = readOutput("seller-claims-garage-kept.md");
  const maintenanceIssue = readOutput("maintenance-chain-unknown.md");
  const documentIssue = readOutput("document-owner-proxy-sale.md");
  const manifest = JSON.parse(readOutput("rule-feedback-manifest.json"));

  expectIncludes(
    readme,
    ["Kural Geri Bildirimi Issue Taslakları", "npm run rule-feedback:package", "rule-feedback-manifest.json"],
    "README.md",
  );
  expectIncludes(
    sellerIssue,
    [
      "Aday ID: seller-claims-garage-kept",
      "Kişisel veri paylaşmayın",
      "Garaj kullanımı iddiası doğrulanmalı",
      "Pozitif ve negatif unit test eklendi.",
    ],
    "seller-claims-garage-kept.md",
  );
  expectIncludes(
    maintenanceIssue,
    ["Aday ID: maintenance-chain-unknown", "Triger veya zincir geçmişi netleştirilmeli"],
    "maintenance-chain-unknown.md",
  );
  expectIncludes(
    documentIssue,
    ["Aday ID: document-owner-proxy-sale", "Ruhsat sahibi ve satış yetkisi doğrulanmalı"],
    "document-owner-proxy-sale.md",
  );

  if (!Array.isArray(manifest) || manifest.length < 3) {
    fail("rule-feedback-manifest.json must contain rule candidates.");
  }

  expectManifestEntry(manifest, "seller-claims-garage-kept", {
    issueFile: "seller-claims-garage-kept.md",
    status: "accepted",
    source: "market-observation",
    affectedRuleFile: "src/lib/analysis/rules/seller-rules.ts",
  });
  expectManifestEntry(manifest, "maintenance-chain-unknown", {
    issueFile: "maintenance-chain-unknown.md",
    status: "accepted",
    source: "user-feedback",
    affectedRuleFile: "src/lib/analysis/rules/maintenance-rules.ts",
  });
  expectManifestEntry(manifest, "document-owner-proxy-sale", {
    issueFile: "document-owner-proxy-sale.md",
    status: "accepted",
    source: "expert-review",
    affectedRuleFile: "src/lib/analysis/rules/document-rules.ts",
  });
} finally {
  rmSync(tempDir, { force: true, recursive: true });
}

if (!process.exitCode) {
  console.log("Rule feedback package check passed.");
}
