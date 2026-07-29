import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = process.cwd();
const tempDir = mkdtempSync(join(tmpdir(), "eksperiq-user-note-"));
const triageDir = join(tempDir, "triage");
const expectedFile = join(tempDir, "2026-07-30T10-00-00-000Z-mobil-tek-elle.txt");
const expectedTriageFile = join(triageDir, "2026-07-30t10-00-00-000z-mobil-tek-elle-triage.md");
const expectedIssueDraftFile = join(triageDir, "2026-07-30t10-00-00-000z-mobil-tek-elle-github-issue.md");

function fail(message) {
  console.error(`User test note template check failed: ${message}`);
  process.exitCode = 1;
}

function expectIncludes(content, snippets) {
  for (const snippet of snippets) {
    if (!content.includes(snippet)) {
      fail(`missing text: ${snippet}`);
    }
  }
}

try {
  execFileSync(
    process.execPath,
    [join(root, "scripts", "prepare-user-test-note.mjs"), tempDir, "mobil tek elle", "2026-07-30T10:00:00.000Z"],
    {
      cwd: root,
      stdio: "pipe",
    },
  );

  if (!existsSync(expectedFile)) {
    fail(`expected note file was not created: ${expectedFile}`);
  } else {
    const content = readFileSync(expectedFile, "utf8");
    expectIncludes(content, [
      "EksperIQ kullanıcı testi ham notu",
      "Kişisel veri eklemeyin",
      "plaka, telefon, açık adres, satıcı adı",
      "Akış kanıtı:",
      "Kullanıcının kendi cümlesi:",
      "Eksik gördüğü soru, kural veya kontrol:",
      "Risk skoru veya sonuç dili nasıl hissettirdi?",
      "npm run user-tests:triage --",
    ]);

    execFileSync(process.execPath, [join(root, "scripts", "triage-user-test-note.mjs"), expectedFile, triageDir], {
      cwd: root,
      stdio: "pipe",
    });

    if (!existsSync(expectedTriageFile)) {
      fail(`expected triage file was not created: ${expectedTriageFile}`);
    }

    if (!existsSync(expectedIssueDraftFile)) {
      fail(`expected GitHub issue draft was not created: ${expectedIssueDraftFile}`);
    }

    const triageContent = readFileSync(expectedTriageFile, "utf8");
    const issueDraftContent = readFileSync(expectedIssueDraftFile, "utf8");

    expectIncludes(triageContent, ["Otomatik sınıflandırma", "Issue önerisi", "Önerilen doğrulama komutları"]);
    expectIncludes(issueDraftContent, ["Triage özeti", "Redakte edilmiş kullanıcı notu", "Kapanış kriterleri"]);
  }
} finally {
  rmSync(tempDir, { force: true, recursive: true });
}

if (!process.exitCode) {
  console.log("User test note template check passed.");
}
