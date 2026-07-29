import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const sourcePath = "src/lib/feedback/rule-candidates.ts";
const outputDir = process.argv[2] ?? join(process.cwd(), "dist", "rule-feedback-issues");
const source = readFileSync(sourcePath, "utf8");

function normalizeFileName(value) {
  return value
    .toLocaleLowerCase("tr-TR")
    .replaceAll("ı", "i")
    .replaceAll("ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("ş", "s")
    .replaceAll("ö", "o")
    .replaceAll("ç", "c")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function field(block, name) {
  const match = block.match(new RegExp(`${name}:\\s*"([^"]+)"`));
  return match?.[1] ?? "";
}

function stringArray(block, name) {
  const match = block.match(new RegExp(`${name}:\\s*\\[([\\s\\S]*?)\\]`));
  if (!match) return [];

  return [...match[1].matchAll(/"([^"]+)"/g)].map((item) => item[1]);
}

function candidateBlocks() {
  return source
    .split(/\n  \{\n/)
    .slice(1)
    .map((part) => `  {\n${part}`)
    .filter((part) => part.includes("feedbackRecord:"));
}

function issueBody(candidate) {
  return `# ${candidate.issueTitle}

## Kişisel veri paylaşmayın

Bu taslak yalnızca anonim kullanıcı girdileriyle doldurulmalıdır. Plaka, telefon, açık adres, satıcı adı, kimlik bilgisi veya ilan sahibine ait kişisel bilgi eklemeyin.

## Backlog bilgisi

- Aday ID: ${candidate.id}
- Kaynak: ${candidate.source}
- Etkilenen modül: ${candidate.moduleId}
- Etkilenen dosya: \`${candidate.affectedRuleFile}\`
- Durum: ${candidate.status}

## Girdi sinyali

${candidate.inputSignal}

## Anonim girilebilecek alanlar

${candidate.anonymizedInputFields.map((item) => `- ${item}`).join("\n")}

## Beklenen analiz davranışı

${candidate.expectedBehaviorPrompt}

Beklenen bulgu:

- Kategori: ${candidate.category}
- Seviye: ${candidate.severity}
- Başlık: ${candidate.title}
- Öneri: ${candidate.recommendation}

## Mevcut analiz davranışı

${candidate.currentBehaviorPrompt}

## Doğrulama sorusu

${candidate.validationQuestion}

## Kabul kanıtı

${candidate.acceptanceEvidence.map((item) => `- [ ] ${item}`).join("\n")}

## Kapanış kapısı

- [ ] Kişisel veri içermediği kontrol edildi.
- [ ] Kesin hüküm veya satın alma garantisi dili yok.
- [ ] Pozitif ve negatif unit test eklendi.
- [ ] Skor etkisi varsa merkezi constants üzerinden değerlendirildi.
- [ ] App Store/gizlilik iddialarıyla çelişmiyor.
`;
}

const candidates = candidateBlocks().map((block) => ({
  id: field(block, "id"),
  moduleId: field(block, "moduleId"),
  status: field(block, "status"),
  source: field(block, "source"),
  affectedRuleFile: field(block, "affectedRuleFile"),
  inputSignal: field(block, "inputSignal"),
  category: field(block, "category"),
  severity: field(block, "severity"),
  title: field(block, "title"),
  recommendation: field(block, "recommendation"),
  validationQuestion: field(block, "validationQuestion"),
  issueTitle: field(block, "issueTitle"),
  feedbackType: field(block, "feedbackType"),
  anonymizedInputFields: stringArray(block, "anonymizedInputFields"),
  expectedBehaviorPrompt: field(block, "expectedBehaviorPrompt"),
  currentBehaviorPrompt: field(block, "currentBehaviorPrompt"),
  acceptanceEvidence: stringArray(block, "acceptanceEvidence"),
}));

mkdirSync(outputDir, { recursive: true });

for (const candidate of candidates) {
  const fileName = `${normalizeFileName(candidate.id)}.md`;
  writeFileSync(join(outputDir, fileName), issueBody(candidate), "utf8");
}

const manifest = candidates.map((candidate) => ({
  id: candidate.id,
  issueFile: `${normalizeFileName(candidate.id)}.md`,
  issueTitle: candidate.issueTitle,
  source: candidate.source,
  status: candidate.status,
  affectedRuleFile: candidate.affectedRuleFile,
  moduleId: candidate.moduleId,
  feedbackType: candidate.feedbackType,
  acceptanceEvidenceCount: candidate.acceptanceEvidence.length,
}));

writeFileSync(join(outputDir, "rule-feedback-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

writeFileSync(
  join(outputDir, "README.md"),
  `# Kural Geri Bildirimi Issue Taslakları

Bu klasör \`${sourcePath}\` içindeki typed kural adaylarından üretilir.

Üretim komutu:

\`\`\`bash
npm run rule-feedback:package
\`\`\`

Issue açmadan önce kullanıcı girdilerinin kişisel veri içermediğini manuel kontrol edin.

\`rule-feedback-manifest.json\` dosyası aday ID, issue dosyası, kaynak, durum ve etkilenen kural dosyasını makine okunabilir biçimde listeler.
`,
  "utf8",
);

console.log(`Kural geri bildirimi issue taslaklari hazirlandi: ${outputDir}`);
