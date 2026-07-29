# Gercek Kullanici Feedback Runbook

Bu runbook, gercek kullanici testinden gelen tek bir notu kaybetmeden issue'a, kural adayina veya dogrudan duzeltmeye cevirmek icin kullanilir. Ham notlar ve uretilen ciktilar `dist` altinda kalir; repoya eklenmez.

## 1. Ham not dosyasini hazirla

```bash
npm run user-tests:new-note -- dist/user-test-notes mobil-tek-elle
```

Dosyayi doldururken plaka, telefon, e-posta, acik adres, satici adi, ilan sahibi bilgisi veya secret yazma. Kullanici gercek ilan kullandiysa bilgileri anonimlestir.

## 2. Notu triage et

```bash
npm run user-tests:triage -- dist/user-test-notes/<not-dosyasi>.txt
```

Komut iki cikti uretir:

- `dist/user-test-triage/*-triage.md`
- `dist/user-test-issues/*-github-issue.md`

`*-github-issue.md` GitHub issue govdesi icin baslangictir. Issue acmadan once kisinin kimligini gosterebilecek veri kalmadigini manuel kontrol et.

## 3. Issue tipini sec

Triage ciktisinda `Issue onerisi` bolumunu kullan:

- Kritik hata: analiz akisi, rapor, yasal uyari veya gizlilik bozulduysa ayni gun ele al.
- Kullanici deneyimi sorunu: mobil form, tek elle kullanim, secenekli alan veya metin anlasilirligi etkileniyorsa UI issue ac.
- Kural adayi: risk skoru, satici sorusu, ekspertiz kontrolu veya ilan aciklamasi tespiti icin yeni davranis oneriliyorsa kural issue ac.
- Guven ve dil riski: skor fazla kesin, korkutucu veya ekspertiz yerine geciyor gibi algilaniyorsa metin/disclaimer issue ac.
- App Store riski: izin, veri saklama, garanti vaadi, AI iddiasi veya odeme beklentisiyle ilgili guven sorunu varsa App Store uyumluluk issue'u ac.

`Ek issue sinyalleri` varsa ana issue'yu actiktan sonra listedeki ek UX, kural, guven dili veya App Store sinyallerini ayri issue'a cevir ya da neden kapsam disi biraktigini issue yorumunda yaz.

## 4. Kural backlog adayini bagla

Triage ciktisinda `Kural backlog aday taslagi` veya benzer kural sinyali varsa once backlog'a al:

1. `docs/rule-backlog.md` icine kanitli aday satiri ekle.
2. `src/lib/feedback/rule-candidates.ts` icine typed aday kaydi ekle.
3. Pozitif ve negatif unit test planini yazmadan aktif kurala tasima.

Sonra paket ve manifest uret:

```bash
npm run rule-feedback:package
npm run rule-feedback:check
```

`dist/rule-feedback-issues/rule-feedback-manifest.json` icinde aday ID, kaynak, issue dosyasi, durum ve etkilenen kural dosyasi eslesmesini kontrol et.

## 5. Dogrulama komutlarini calistir

Triage ciktisindaki `Onerilen dogrulama komutlari` bolumunu silme. Etkilenen alana gore daraltabilirsin ama kapanis kaniti icin en az su kontrolleri calistir:

```bash
npm run feedback:outputs-check
npm run user-tests:triage-check
npm run user-tests:commands-check
npm run rule-feedback:check
npm run release:check
```

Mobil form veya secenekli alanla ilgili notlarda ek olarak:

```bash
npm run form:fields-check
npx playwright test tests/e2e/main-flow.spec.ts --project=mobile --grep "select controls|damage part choices|creates analysis result"
```

## 6. Commit kurali

Commit'e ham kullanici notu, `dist/user-test-notes`, `dist/user-test-triage`, `dist/user-test-issues` veya `dist/rule-feedback-issues` ciktilarini ekleme.

Commit oncesi:

```bash
npm run feedback:outputs-check
git status --short
git diff --check
```

Sadece kaynak kod, test, dokuman ve issue template degisiklikleri commitlenir.
