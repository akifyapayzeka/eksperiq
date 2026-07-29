# AI Production Rollout

EksperIQ'un ana raporu kural tabanlıdır. AI notu yalnızca ek karar destek katmanı olarak açılır ve her zaman kapatılabilir olmalıdır.

## Ön şartlar

- [ ] `npm run ai:env-check` local ortamda geçti.
- [ ] `npm run ai:staging-check` canlı/staging URL için geçti.
- [ ] Vercel Preview env içinde OpenRouter key tanımlı.
- [ ] `OPENROUTER_MODEL` ücretsiz veya düşük maliyetli model/router değerinde.
- [ ] `OPENROUTER_DAILY_REQUEST_LIMIT` düşük değerle başlıyor: öneri `20`.
- [ ] `NEXT_PUBLIC_AI_ANALYSIS_NOTE_ENABLED=false` production için varsayılan.
- [ ] `UPSTASH_REDIS_REST_URL` ve `UPSTASH_REDIS_REST_TOKEN` staging/production için mümkünse tanımlı.

## Staging açılışı

1. Preview/staging ortamında `NEXT_PUBLIC_AI_ANALYSIS_NOTE_ENABLED=true` yap.
2. `OPENROUTER_DAILY_REQUEST_LIMIT=20` ile başla.
3. `npm run ai:staging-check` çalıştır.
4. Bilinçli tek canlı deneme için:

```bash
AI_LIVE_CONFIRM=EVET AI_STAGING_LIVE=1 npm run ai:live-check
```

5. AI notunu kontrol et:
   - Kesin ekspertiz sonucu vermiyor.
   - Hasarsızlık veya satın alma garantisi vermiyor.
   - Kural tabanlı raporu değiştirmiyor.
   - Hata halinde kullanıcı raporu kaybetmiyor.

## Production açılışı

Production ortamında AI notu ilk gün sadece düşük limit ile açılmalıdır:

```text
NEXT_PUBLIC_AI_ANALYSIS_NOTE_ENABLED=true
OPENROUTER_DAILY_REQUEST_LIMIT=20
```

İlk 24 saat sonunda kontrol:

- Kullanıcı hata oranı
- Günlük AI istek sayısı
- Limit dolduğunda gösterilen mesaj
- AI notlarında kesin ifade riski
- OpenRouter maliyet/limit görünümü

## Rollback

Sorun olursa tek değişiklikle kapat:

```text
NEXT_PUBLIC_AI_ANALYSIS_NOTE_ENABLED=false
```

Bu kapatma kural tabanlı analiz motorunu, sonuç raporunu veya App Store/PWA akışını etkilemez.

## Açılmaması gereken durumlar

- Günlük limit yoksa.
- Key client tarafına sızıyorsa.
- Staging smoke geçmiyorsa.
- AI notu kesin alım, kesin hasarsızlık veya ekspertiz yerine geçen ifade üretiyorsa.
- Kullanıcı raporu AI hatası nedeniyle kullanılamaz hale geliyorsa.
