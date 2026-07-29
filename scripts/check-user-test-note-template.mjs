import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = process.cwd();
const tempDir = mkdtempSync(join(tmpdir(), "eksperiq-user-note-"));
const expectedFile = join(tempDir, "2026-07-30T10-00-00-000Z-mobil-tek-elle.txt");

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
  }
} finally {
  rmSync(tempDir, { force: true, recursive: true });
}

if (!process.exitCode) {
  console.log("User test note template check passed.");
}
