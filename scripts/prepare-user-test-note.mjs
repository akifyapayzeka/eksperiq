import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const outputDir = process.argv[2] ?? join(process.cwd(), "dist", "user-test-notes");
const label = process.argv[3] ?? "kullanici-testi";
const timestampArg = process.argv[4];

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
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

function timestampSlug(value) {
  const date = value ? new Date(value) : new Date();

  if (Number.isNaN(date.getTime())) {
    throw new Error("Geçersiz tarih. ISO formatı kullanın: 2026-07-30T10:00:00.000Z");
  }

  return date.toISOString().replace(/[:.]/g, "-");
}

const safeLabel = normalizeFileName(label) || "kullanici-testi";
const fileName = `${timestampSlug(timestampArg)}-${safeLabel}.txt`;
const outputPath = join(outputDir, fileName);
const note = `EksperIQ kullanıcı testi ham notu

Kişisel veri eklemeyin: plaka, telefon, açık adres, satıcı adı, kimlik bilgisi veya ilan sahibine ait bilgi yazmayın.

Cihaz:
Tarayıcı:
Test tarihi:
Kullanılan ilan tipi:
Tamamlama süresi:

Akış kanıtı:
- [ ] Ana sayfadan analize geçti
- [ ] Formu doldurdu
- [ ] Seçenekli alanları kullandı
- [ ] Hata mesajı gördü
- [ ] Sonuç raporuna ulaştı
- [ ] Satıcı mesajı / soru / özet kopyalamayı denedi
- [ ] Ekspertiz checklist maddesi işaretledi

Kullanıcının kendi cümlesi:

Takıldığı yer:

Eksik gördüğü soru, kural veya kontrol:

Risk skoru veya sonuç dili nasıl hissettirdi?

Beklenen iyileştirme:

Triage komutu:
npm run user-tests:triage -- ${outputPath}
`;

mkdirSync(outputDir, { recursive: true });
writeFileSync(outputPath, note, "utf8");

console.log(`Kullanıcı testi not şablonu hazırlandı: ${outputPath}`);
