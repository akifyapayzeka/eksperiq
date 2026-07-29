import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const outputDir = join(process.cwd(), "dist", "user-test-issues");

const issues = [
  {
    file: "01-ilk-kez-ikinci-el-arac-bakacak-kullanici.md",
    title: "[Kullanıcı testi] İlk kez ikinci el araç bakacak kullanıcı",
    scenario: "Ana sayfadan örnek ilanla rapora ulaşma.",
    evidence: "Tamamlama süresi, takıldığı yer, risk skorunu nasıl yorumladığı.",
  },
  {
    file: "02-aractan-anlayan-yakin-cevre-kullanicisi.md",
    title: "[Kullanıcı testi] Araçtan anlayan yakın çevre kullanıcısı",
    scenario: "Anonim gerçek ilanla satıcı soruları ve ekspertiz listesini değerlendirme.",
    evidence: "Eksik görülen soru, fazla sert veya fazla zayıf bulunan uyarı.",
  },
  {
    file: "03-mobil-tek-elle-kullanim.md",
    title: "[Kullanıcı testi] Mobil tek elle kullanım",
    scenario: "Küçük telefonda seçenekli alanları kullanarak form doldurma, hata düzeltme ve rapora ulaşma.",
    evidence: "Şehir, araç detayı, hasar parçası, klavye, buton, yatay taşma veya okunabilirlik notu.",
  },
  {
    file: "04-yuksek-riskli-ilan-degerlendirmesi.md",
    title: "[Kullanıcı testi] Yüksek riskli ilan değerlendirmesi",
    scenario: "Hasar, bakım ve belge bilgisi zayıf ilanla rapor okuma.",
    evidence: "Kullanıcının ilk üç aksiyonu anlayıp anlamadığı.",
  },
  {
    file: "05-paylasma-ve-ekspertize-hazirlik.md",
    title: "[Kullanıcı testi] Paylaşma ve ekspertize hazırlık",
    scenario: "Satıcı mesajını kopyalama, kısa özeti kopyalama, satıcı sorularını okuma, checklist işaretleme.",
    evidence: "Satıcı mesajı, paylaşılabilir özet, yasal uyarı ve App Store dili hakkında geri bildirim.",
  },
];

function issueBody(issue) {
  return `# ${issue.title}

## Kişisel veri paylaşmayın

Plaka, telefon, açık adres, satıcı adı, kimlik bilgisi veya ilan sahibine ait kişisel bilgi eklemeyin. Gerçek ilan kullanıldıysa bilgileri anonimleştirin.

## Senaryo

${issue.scenario}

## Beklenen kanıt

${issue.evidence}

## Cihaz ve ortam

- Cihaz:
- Tarayıcı:
- Ekran boyutu veya telefon modeli:
- Test tarihi:

## Kullanılan akış

- [ ] Ana sayfadan analiz formuna geçildi
- [ ] Form dolduruldu
- [ ] Şehir, araç detayları ve hasar parça seçenekleri denendi
- [ ] Hata mesajları görüldü
- [ ] Analiz oluşturuldu
- [ ] Sonuç raporu okundu
- [ ] Ekspertiz kontrol listesi işaretlendi
- [ ] Satıcı mesajı, satıcı soruları veya rapor özeti kopyalama denendi

## Test notu

- Takıldığı yer:
- En faydalı bölüm:
- Zor gelen form alanı:
- Satın alma güveni:
- Eksik kural veya soru:
- Beklenen iyileştirme:

## Kapanış

- [ ] Kişisel veri içermediği kontrol edildi
- [ ] P0/P1 bug varsa ayrı issue açıldı
- [ ] Tekrarlanan kural önerisi varsa \`docs/rule-backlog.md\` ile ilişkilendirildi
`;
}

mkdirSync(outputDir, { recursive: true });

for (const issue of issues) {
  writeFileSync(join(outputDir, issue.file), issueBody(issue), "utf8");
}

writeFileSync(
  join(outputDir, "README.md"),
  `# Kullanıcı Testi Issue Taslakları

Bu klasör GitHub issue açarken kullanılacak beş kullanıcı testi taslağını içerir.

Üretim komutu:

\`\`\`bash
npm run user-tests:package
\`\`\`

Dosyalar gerçek kullanıcı testi yapılmadan issue kapatmak için kullanılmamalıdır.
`,
  "utf8",
);

console.log(`Kullanici testi issue taslaklari hazirlandi: ${outputDir}`);
