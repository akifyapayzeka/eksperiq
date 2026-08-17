# Codex Devir Görevi — EksperIQ Destek E-postası Sahip Onayı

> Format: `aiajans/docs/playbooks/codex-handoff.md`. Bu not sürekli bakım taramasında bulundu ve gerçek iletişim/yasal bilgi gerektirdiği için kodda tahmini değerle değiştirilmedi.

## Bağlam

`src/lib/constants/app.ts` içinde kullanıcıya açık geri bildirim adresi şu anda kişisel Gmail adresi olarak sabit:

- `appConfig.feedbackEmail = "ruzgar.mesavo@gmail.com"`

Bu değer `src/app/geri-bildirim/page.tsx` içindeki iki `mailto:` aksiyonunda kullanılıyor. `tests/e2e/main-flow.spec.ts` de bu kişisel adrese giden mailto davranışını doğruluyor.

## Risk

App Store / Play Store metadata, destek URL/e-posta ve uygulama içi iletişim kanalları gerçek marka/şirket bilgisiyle tutarlı olmalıdır. Kişisel Gmail adresinin doğru resmi destek adresi olup olmadığı iş/yasal karar gerektirir. Yanlış adres kullanılırsa kullanıcı geri bildirimi ve olası kişisel veriler yanlış posta kutusuna yönlenebilir.

## Sahipten Gereken Karar

1. EksperIQ için resmi destek e-postasını doğrula.
2. Bu adres App Store Connect / Play Console metadata içinde kullanılacak destek e-postasıyla aynı mı karar ver.
3. Onaylı adresi geliştiriciye açıkça ver.

## Kodda Yapılacaklar (Onay Sonrası)

1. `src/lib/constants/app.ts` içindeki `feedbackEmail` değerini onaylı destek e-postasıyla güncelle.
2. `tests/e2e/main-flow.spec.ts` içindeki mailto beklentilerini aynı adrese göre güncelle.
3. `docs/app-store-submission.md`, `docs/app-store-readiness.md` ve ilgili privacy/support dokümanlarında aynı iletişim bilgisinin tutarlı olduğundan emin ol.
4. `npm run test -- tests/e2e/main-flow.spec.ts` veya ilgili Playwright hedefini ve `npm run lint`, `npm run typecheck`, `npm run build` kontrollerini çalıştır.

## Sınırlar

- Gerçek destek e-postası uydurulmayacak.
- Kişisel/şirket iletişim bilgisi sahibi onayı olmadan değiştirilmeyecek.
- Store submission veya production deploy yapılmayacak.
