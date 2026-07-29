import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = process.cwd();
const tempDir = mkdtempSync(join(tmpdir(), "eksperiq-triage-"));
const fixturePath = join(root, "tests", "fixtures", "user-test-note.txt");

function fail(message) {
  console.error(`User test triage check failed: ${message}`);
  process.exitCode = 1;
}

try {
  execFileSync(process.execPath, [join(root, "scripts", "triage-user-test-note.mjs"), fixturePath, tempDir], {
    cwd: root,
    stdio: "pipe",
  });

  const output = readFileSync(join(tempDir, "user-test-note-triage.md"), "utf8");
  const requiredSnippets = [
    "Sorun tipi: güven ve dil riski",
    "Öncelik: P1",
    "Sonuç dili, skor açıklaması ve yasal uyarı görünürlüğünü düzelt.",
    "Basit otomatik taramada telefon, plaka veya e-posta kalıbı bulunmadı.",
    "Şehir seçmek kolaydı",
  ];

  for (const snippet of requiredSnippets) {
    if (!output.includes(snippet)) {
      fail(`triage output missing text: ${snippet}`);
    }
  }
} finally {
  rmSync(tempDir, { force: true, recursive: true });
}

if (!process.exitCode) {
  console.log("User test triage check passed.");
}
