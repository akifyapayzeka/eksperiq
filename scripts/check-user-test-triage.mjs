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
const mixedFixturePath = join(root, "tests", "fixtures", "user-test-mixed-note.txt");

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
  const issueDraft = readFileSync(join(tempDir, "user-test-note-github-issue.md"), "utf8");
  const requiredSnippets = [
    "Sorun tipi: güven ve dil riski",
    "Öncelik: P1",
    "Başlık: [Kullanıcı testi][P1] Analiz formu - güven ve dil riski",
    "Şablon: `.github/ISSUE_TEMPLATE/user-test-feedback.md`",
    "Label'lar: `feedback`, `user-test`, `trust-language`, `p1`, `app-store`, `analysis-form`",
    "Sonuç dili, skor açıklaması ve yasal uyarı görünürlüğünü düzelt.",
    "npm run appstore:metadata-check",
    "Basit otomatik taramada telefon, plaka, e-posta veya URL kalıbı bulunmadı.",
    "Şehir seçmek kolaydı",
  ];

  expectIncludes(output, requiredSnippets, "triage output");
  expectIncludes(
    issueDraft,
    [
      "# [Kullanıcı testi][P1] Analiz formu - güven ve dil riski",
      "## Triage özeti",
      "Şablon: `.github/ISSUE_TEMPLATE/user-test-feedback.md`",
      "Label'lar: `feedback`, `user-test`, `trust-language`, `p1`, `app-store`, `analysis-form`",
      "## Doğrulama komutları",
      "## Redakte edilmiş kullanıcı notu",
      "## Kapanış kriterleri",
    ],
    "github issue draft",
  );

  execFileSync(process.execPath, [join(root, "scripts", "triage-user-test-note.mjs"), ruleFixturePath, tempDir], {
    cwd: root,
    stdio: "pipe",
  });

  const ruleOutput = readFileSync(join(tempDir, "user-test-rule-note-triage.md"), "utf8");
  const ruleIssueDraft = readFileSync(join(tempDir, "user-test-rule-note-github-issue.md"), "utf8");
  const requiredRuleSnippets = [
    "Sorun tipi: kural adayı",
    "Öncelik: P2",
    "Başlık: [Kural geri bildirimi][P2] Sonuç raporu - kural adayı",
    "Şablon: `.github/ISSUE_TEMPLATE/rule-feedback.md`",
    "Label'lar: `feedback`, `user-test`, `rules`, `p2`, `result-report`",
    "Kural backlog aday taslağı",
    "Aday ID: feedback-user-test-rule-note",
    "Etkilenen modül: satıcı açıklaması",
    "Önerilen dosya: `src/lib/analysis/rules/seller-rules.ts`",
    "Backlog tablo satırı taslağı",
    "| feedback-user-test-rule-note | Kullanıcı testi | `src/lib/analysis/rules/seller-rules.ts` | user-test-rule-note.txt | Belirlenecek | needs-feedback |",
    "Typed kayıt taslağı için kontrol",
    "`src/lib/feedback/rule-candidates.ts` içine `feedback-user-test-rule-note` ID'siyle aday ekle.",
    "`status` değeri `needs-feedback` olmalı.",
    "`source` değeri `user-feedback` olmalı.",
    "`affectedRuleFile` değeri `src/lib/analysis/rules/seller-rules.ts` olmalı.",
    "Issue taslağı önerisi: `dist/rule-feedback-issues/feedback-user-test-rule-note.md`",
    "Unit test: Pozitif ve negatif test eklenmeden aktif kurala taşınmayacak.",
    "Durum: Needs feedback",
    "npm run rule-backlog:check",
    "npm run rule-feedback:check",
  ];

  expectIncludes(ruleOutput, requiredRuleSnippets, "rule triage output");
  expectIncludes(
    ruleIssueDraft,
    [
      "# [Kural geri bildirimi][P2] Sonuç raporu - kural adayı",
      "Şablon: `.github/ISSUE_TEMPLATE/rule-feedback.md`",
      "Kural adayıysa backlog kaydı ve pozitif/negatif test ihtiyacı yazıldı.",
    ],
    "rule github issue draft",
  );

  execFileSync(process.execPath, [join(root, "scripts", "triage-user-test-note.mjs"), piiFixturePath, tempDir], {
    cwd: root,
    stdio: "pipe",
  });

  const piiOutput = readFileSync(join(tempDir, "user-test-note-with-pii-triage.md"), "utf8");
  const piiIssueDraft = readFileSync(join(tempDir, "user-test-note-with-pii-github-issue.md"), "utf8");
  const requiredPiiSnippets = [
    "Sorun tipi: App Store riski",
    "Başlık: [Kullanıcı testi][P1] Genel kullanıcı akışı - App Store riski",
    "Şablon: `.github/ISSUE_TEMPLATE/user-test-feedback.md`",
    "Label'lar: `feedback`, `user-test`, `app-store`, `privacy`, `p1`, `flow`",
    "Kontrol et: telefon olabilir",
    "Kontrol et: plaka olabilir",
    "Kontrol et: e-posta olabilir",
    "Kontrol et: URL olabilir",
    "Orijinal notu issue'a taşıma; aşağıdaki redakte edilmiş sürümü kullan.",
    "npm run privacy:check",
    "[telefon redakte edildi]",
    "[plaka redakte edildi]",
    "[e-posta redakte edildi]",
    "[url redakte edildi]",
  ];
  const forbiddenPiiSnippets = ["0555 123 45 67", "34 ABC 123", "test@example.com", "https://example.com/ilan/secret"];

  expectIncludes(piiOutput, requiredPiiSnippets, "pii triage output");
  expectExcludes(piiOutput, forbiddenPiiSnippets, "pii triage output");
  expectIncludes(piiIssueDraft, ["[telefon redakte edildi]", "[plaka redakte edildi]"], "pii github issue draft");
  expectExcludes(piiIssueDraft, forbiddenPiiSnippets, "pii github issue draft");

  execFileSync(process.execPath, [join(root, "scripts", "triage-user-test-note.mjs"), uiFixturePath, tempDir], {
    cwd: root,
    stdio: "pipe",
  });

  const uiOutput = readFileSync(join(tempDir, "user-test-ui-note-triage.md"), "utf8");
  const requiredUiSnippets = [
    "Sorun tipi: kullanıcı deneyimi",
    "Öncelik: P1",
    "Etkilenen ekran/akış: Analiz formu",
    "Başlık: [Kullanıcı testi][P1] Analiz formu - kullanıcı deneyimi",
    "Label'lar: `feedback`, `user-test`, `ux`, `mobile`, `p1`, `analysis-form`",
    "Analiz formunu mobil viewport'ta doldur",
    "npx playwright test tests/e2e/main-flow.spec.ts --project=mobile",
    "npm run form:fields-check",
    "select controls|damage part choices|creates analysis result",
    "Mobil form alanı sinyali",
    "Seçenekli alanlar gerçek seçim kontrolü olarak kalmalı",
    "Sayı girilecek alanlar ayrı kalmalı",
    "Hasar parça seçimleri dokunulabilir seçenek olarak kalmalı",
    "Küçük UI iyileştirmesi yap",
  ];

  expectIncludes(uiOutput, requiredUiSnippets, "ui triage output");

  execFileSync(process.execPath, [join(root, "scripts", "triage-user-test-note.mjs"), mixedFixturePath, tempDir], {
    cwd: root,
    stdio: "pipe",
  });

  const mixedOutput = readFileSync(join(tempDir, "user-test-mixed-note-triage.md"), "utf8");
  const mixedIssueDraft = readFileSync(join(tempDir, "user-test-mixed-note-github-issue.md"), "utf8");
  const requiredMixedSnippets = [
    "Sorun tipi: güven ve dil riski",
    "Öncelik: P1",
    "Etkilenen ekran/akış: Sonuç raporu",
    "Ek issue sinyalleri",
    "Bu not birden fazla iş tipine temas ediyor.",
    "P2 / kural adayı",
    "Kural backlog girdisi aç",
    "npm run appstore:metadata-check",
    'npx playwright test tests/e2e/main-flow.spec.ts --grep "creates analysis result"',
  ];

  expectIncludes(mixedOutput, requiredMixedSnippets, "mixed triage output");
  expectIncludes(mixedIssueDraft, ["Ek issue sinyalleri", "P2 / kural adayı"], "mixed github issue draft");
} finally {
  rmSync(tempDir, { force: true, recursive: true });
}

if (!process.exitCode) {
  console.log("User test triage check passed.");
}
