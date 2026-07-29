import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";

const inputPath = process.argv[2];
const outputDir = process.argv[3] ?? join(process.cwd(), "dist", "user-test-triage");

if (!inputPath) {
  console.error("Kullanim: node scripts/triage-user-test-note.mjs <not-dosyasi> [cikti-klasoru]");
  process.exit(1);
}

const rawNote = readFileSync(inputPath, "utf8");

const categories = [
  {
    type: "kritik hata",
    priority: "P0",
    patterns: ["acilmadi", "açılmadı", "calismadi", "çalışmadı", "rapora ulasamadim", "sonuc yok", "hata verdi"],
    action: "Aynı gün bug fix issue aç, E2E testi ekle ve release kontrolü çalıştır.",
  },
  {
    type: "güven ve dil riski",
    priority: "P1",
    patterns: ["korkuttu", "fazla kesin", "yaniltti", "yanılttı", "al dedi", "alma dedi", "guvenmedim", "güvenmedim"],
    action: "Sonuç dili, skor açıklaması ve yasal uyarı görünürlüğünü düzelt.",
  },
  {
    type: "App Store riski",
    priority: "P1",
    patterns: ["verim", "gizlilik", "garanti", "izin", "ucret", "ücret", "odeme", "ödeme"],
    action: "Gizlilik, App Store submission ve uygulama içi uyarıları birlikte kontrol et.",
  },
  {
    type: "kullanıcı deneyimi",
    priority: "P1",
    patterns: ["zor", "bulamadim", "bulamadım", "klavye", "tasiyor", "taşıyor", "küçük", "okunmuyor", "buton"],
    action: "Küçük UI iyileştirmesi yap, mobil screenshot ve E2E ile doğrula.",
  },
  {
    type: "kural adayı",
    priority: "P2",
    patterns: ["eksik soru", "eksik kural", "risk yok", "uyari yok", "uyarı yok", "sormali", "sormalı"],
    action: "Kural backlog girdisi aç, pozitif/negatif unit test olmadan aktif kurala taşıma.",
  },
];

const personalDataPatterns = [
  {
    label: "telefon olabilir",
    pattern: /(?:\+90|0)?\s?5\d{2}[\s.-]?\d{3}[\s.-]?\d{2}[\s.-]?\d{2}/g,
    replacement: "[telefon redakte edildi]",
  },
  {
    label: "plaka olabilir",
    pattern: /\b\d{2}\s?[A-ZÇĞİÖŞÜ]{1,3}\s?\d{2,4}\b/gi,
    replacement: "[plaka redakte edildi]",
  },
  { label: "e-posta olabilir", pattern: /[^\s@]+@[^\s@]+\.[^\s@]+/g, replacement: "[e-posta redakte edildi]" },
  { label: "URL olabilir", pattern: /https?:\/\/\S+/gi, replacement: "[url redakte edildi]" },
];

const affectedAreaPatterns = [
  {
    area: "Analiz formu",
    patterns: ["form", "alan", "secenek", "seçenek", "klavye", "şehir", "hasar parca", "hasar parça", "buton"],
    verification:
      "Analiz formunu mobil viewport'ta doldur, validasyon ve dokunma alanlarını E2E veya screenshot ile doğrula.",
  },
  {
    area: "Sonuç raporu",
    patterns: ["sonuc", "sonuç", "rapor", "risk skoru", "satici sorusu", "satıcı sorusu", "ekspertiz listesi"],
    verification:
      "Demo analiz oluşturup sonuç sayfasında skor, yasal uyarı ve ilgili bölümün görünür olduğunu doğrula.",
  },
  {
    area: "Mobil alt menü",
    patterns: ["alt menu", "alt menü", "tab", "navigasyon", "profil", "yeni analiz", "analiz raporu", "kontrol"],
    verification: "Mobil E2E'de alt menü bağlantılarını ve yatay taşma olmadığını kontrol et.",
  },
  {
    area: "Paylaşma ve kopyalama",
    patterns: ["paylas", "paylaş", "kopyala", "mesaj", "ozet", "özet", "clipboard"],
    verification: "Satıcı mesajı, kısa özet ve rapor paylaşma/kopyalama akışını tarayıcıda doğrula.",
  },
  {
    area: "Geri bildirim",
    patterns: ["geri bildirim", "feedback", "not gonder", "not gönder", "kullanici testi", "kullanıcı testi"],
    verification: "Geri bildirim sayfası metinlerinin kişisel veri istemediğini ve CTA'ların göründüğünü doğrula.",
  },
];

function normalize(value) {
  return value
    .toLocaleLowerCase("tr-TR")
    .replaceAll("ı", "i")
    .replaceAll("ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("ş", "s")
    .replaceAll("ö", "o")
    .replaceAll("ç", "c")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function pickCategory(note) {
  const normalizedNote = normalize(note);

  return (
    categories.find((category) => category.patterns.some((pattern) => normalizedNote.includes(normalize(pattern)))) ?? {
      type: "kullanıcı deneyimi",
      priority: "P2",
      action: "İkinci kullanıcıdan benzer kanıt gelene kadar takip et.",
    }
  );
}

function findPersonalDataWarnings(note) {
  return personalDataPatterns
    .filter((item) => {
      item.pattern.lastIndex = 0;
      return item.pattern.test(note);
    })
    .map((item) => item.label);
}

function inferAffectedArea(note) {
  const normalizedNote = normalize(note);

  return (
    affectedAreaPatterns.find((item) =>
      item.patterns.some((pattern) => normalizedNote.includes(normalize(pattern))),
    ) ?? {
      area: "Genel kullanıcı akışı",
      verification: "Ana akışı mobil ve desktop E2E ile tekrar doğrula; gerekirse kullanıcıdan ekran görüntüsü iste.",
    }
  );
}

function redactPersonalData(note) {
  return personalDataPatterns.reduce((redactedNote, item) => {
    item.pattern.lastIndex = 0;
    return redactedNote.replace(item.pattern, item.replacement);
  }, note);
}

function slugify(value) {
  return normalize(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function inferRuleModule(note) {
  const normalizedNote = normalize(note);

  if (["tramer", "hasar", "boya", "degisen", "sasi", "airbag", "pert"].some((term) => normalizedNote.includes(term))) {
    return "hasar";
  }
  if (
    ["bakim", "triger", "zincir", "sanziman", "aku", "lastik", "muayene"].some((term) => normalizedNote.includes(term))
  ) {
    return "bakım";
  }
  if (["ruhsat", "vekalet", "rehin", "haciz", "evrak", "ekspertiz"].some((term) => normalizedNote.includes(term))) {
    return "belge";
  }
  if (
    ["satici", "satıcı", "ilan aciklamasi", "ilan açıklaması", "mesaj", "soru"].some((term) =>
      normalizedNote.includes(term),
    )
  ) {
    return "satıcı açıklaması";
  }

  return "ilan analizi";
}

function backlogDraft(note, sourceName) {
  const moduleName = inferRuleModule(note);
  const candidateId = `feedback-${slugify(sourceName || "kural-adayi")}`;

  return `## Kural backlog aday taslağı

- Aday ID: ${candidateId}
- Kaynak: Kullanıcı testi
- Etkilenen modül: ${moduleName}
- Girdi sinyali: Ham nottan netleştirilecek.
- Beklenen bulgu: Başlık, kategori, severity ve öneri cümlesi yazılacak.
- Kanıt: ${basename(inputPath)}
- Skor etkisi: Belirlenecek; gerekirse sadece bilgilendirme.
- Unit test: Pozitif ve negatif test eklenmeden aktif kurala taşınmayacak.
- Durum: Needs feedback
`;
}

const category = pickCategory(rawNote);
const warnings = findPersonalDataWarnings(rawNote);
const redactedNote = redactPersonalData(rawNote);
const affectedArea = inferAffectedArea(rawNote);
const inputName = basename(inputPath).replace(/\.[^.]+$/, "");
const outputFile = join(outputDir, `${slugify(inputName || "kullanici-notu")}-triage.md`);
const optionalBacklogDraft = category.type === "kural adayı" ? `\n${backlogDraft(rawNote, inputName)}` : "";
const redactionNote =
  warnings.length > 0 ? "\n- [ ] Orijinal notu issue'a taşıma; aşağıdaki redakte edilmiş sürümü kullan." : "";

const issueBody = `# Kullanıcı testi triage taslağı

Kaynak not: \`${basename(inputPath)}\`

## Otomatik sınıflandırma

- Sorun tipi: ${category.type}
- Öncelik: ${category.priority}
- Etkilenen ekran/akış: ${affectedArea.area}
- Önerilen aksiyon: ${category.action}
- Önerilen doğrulama: ${affectedArea.verification}

## Kişisel veri kontrolü

${
  warnings.length
    ? warnings.map((warning) => `- [ ] Kontrol et: ${warning}`).join("\n")
    : "- [x] Basit otomatik taramada telefon, plaka, e-posta veya URL kalıbı bulunmadı."
}
${redactionNote}

## Redakte edilmiş ham not

\`\`\`text
${redactedNote.trim()}
\`\`\`

## Issue'a çevirmeden önce

- [ ] Kişisel veri temizlendi.
- [ ] Beklenen davranış tek cümleyle yazıldı.
- [ ] Etkilenen ekran veya kural modülü seçildi.
- [ ] Kural adayıysa pozitif ve negatif test gereksinimi yazıldı.
- [ ] UI sorunuysa mobil screenshot veya E2E doğrulaması belirlendi.
${optionalBacklogDraft}
`;

mkdirSync(outputDir, { recursive: true });
writeFileSync(outputFile, issueBody, "utf8");

console.log(`Triage taslagi hazirlandi: ${outputFile}`);
if (warnings.length) {
  console.log(`Kisisel veri kontrol uyarisi: ${warnings.join(", ")}`);
}
