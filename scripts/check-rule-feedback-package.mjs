import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
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

  expectIncludes(readme, ["Kural Geri Bildirimi Issue Taslakları", "npm run rule-feedback:package"], "README.md");
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
} finally {
  rmSync(tempDir, { force: true, recursive: true });
}

if (!process.exitCode) {
  console.log("Rule feedback package check passed.");
}
