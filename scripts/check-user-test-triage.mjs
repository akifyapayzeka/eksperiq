import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = process.cwd();
const tempDir = mkdtempSync(join(tmpdir(), "eksperiq-triage-"));
const fixturePath = join(root, "tests", "fixtures", "user-test-note.txt");
const ruleFixturePath = join(root, "tests", "fixtures", "user-test-rule-note.txt");
const piiFixturePath = join(root, "tests", "fixtures", "user-test-note-with-pii.txt");
const uiFixturePath = join(root, "tests", "fixtures", "user-test-ui-note.txt");

function fail(message) {
  console.error(`User test triage check failed: ${message}`);
  process.exitCode = 1;
}

function expectIncludes(output, snippets, context) {
  for (const snippet of snippets) {
    if (!output.includes(snippet)) {
      fail(`${context} missing text: ${snippet}`);
    }
  }
}

function expectExcludes(output, snippets, context) {
  for (const snippet of snippets) {
    if (output.includes(snippet)) {
      fail(`${context} leaked text: ${snippet}`);
    }
  }
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
    "Basit otomatik taramada telefon, plaka, e-posta veya URL kalıbı bulunmadı.",
    "Şehir seçmek kolaydı",
  ];

  expectIncludes(output, requiredSnippets, "triage output");

  execFileSync(process.execPath, [join(root, "scripts", "triage-user-test-note.mjs"), ruleFixturePath, tempDir], {
    cwd: root,
    stdio: "pipe",
  });

  const ruleOutput = readFileSync(join(tempDir, "user-test-rule-note-triage.md"), "utf8");
  const requiredRuleSnippets = [
    "Sorun tipi: kural adayı",
    "Öncelik: P2",
    "Kural backlog aday taslağı",
    "Aday ID: feedback-user-test-rule-note",
    "Etkilenen modül: satıcı açıklaması",
    "Unit test: Pozitif ve negatif test eklenmeden aktif kurala taşınmayacak.",
    "Durum: Needs feedback",
  ];

  expectIncludes(ruleOutput, requiredRuleSnippets, "rule triage output");

  execFileSync(process.execPath, [join(root, "scripts", "triage-user-test-note.mjs"), piiFixturePath, tempDir], {
    cwd: root,
    stdio: "pipe",
  });

  const piiOutput = readFileSync(join(tempDir, "user-test-note-with-pii-triage.md"), "utf8");
  const requiredPiiSnippets = [
    "Sorun tipi: App Store riski",
    "Kontrol et: telefon olabilir",
    "Kontrol et: plaka olabilir",
    "Kontrol et: e-posta olabilir",
    "Kontrol et: URL olabilir",
    "Orijinal notu issue'a taşıma; aşağıdaki redakte edilmiş sürümü kullan.",
    "[telefon redakte edildi]",
    "[plaka redakte edildi]",
    "[e-posta redakte edildi]",
    "[url redakte edildi]",
  ];
  const forbiddenPiiSnippets = ["0555 123 45 67", "34 ABC 123", "test@example.com", "https://example.com/ilan/secret"];

  expectIncludes(piiOutput, requiredPiiSnippets, "pii triage output");
  expectExcludes(piiOutput, forbiddenPiiSnippets, "pii triage output");

  execFileSync(process.execPath, [join(root, "scripts", "triage-user-test-note.mjs"), uiFixturePath, tempDir], {
    cwd: root,
    stdio: "pipe",
  });

  const uiOutput = readFileSync(join(tempDir, "user-test-ui-note-triage.md"), "utf8");
  const requiredUiSnippets = [
    "Sorun tipi: kullanıcı deneyimi",
    "Öncelik: P1",
    "Etkilenen ekran/akış: Analiz formu",
    "Analiz formunu mobil viewport'ta doldur",
    "Küçük UI iyileştirmesi yap",
  ];

  expectIncludes(uiOutput, requiredUiSnippets, "ui triage output");
} finally {
  rmSync(tempDir, { force: true, recursive: true });
}

if (!process.exitCode) {
  console.log("User test triage check passed.");
}
