# AI Production Rollout

EksperIQ'un ana raporu kural tabanlıdır. AI notu ve fotoğraf AI kontrolü yalnızca ek karar destek katmanı olarak açılır ve her zaman kapatılabilir olmalıdır.

## Ön Şartlar

- [ ] `npm run ai:env-check` local ortamda geçti.
- [ ] `npm run ai:staging-check` canlı/staging URL için geçti.
- [ ] `npm run ai:photo-prod-check` production fotoğraf AI flag durumunu doğruluyor.
- [ ] Vercel Preview/Production env içinde OpenRouter key tanımlı.
- [ ] `OPENROUTER_MODEL` ücretsiz veya düşük maliyetli model/router değerinde.
- [ ] Opsiyonel `OPENROUTER_LISTING_IMPORT_FALLBACK_MODEL` düşük maliyetli ücretli ilan modeli olarak tanımlı; boşsa ücretli fallback kapalıdır.
- [ ] `OPENROUTER_VISION_MODEL` vision destekli ücretsiz `:free` model değerinde.
- [ ] `OPENROUTER_DAILY_REQUEST_LIMIT` düşük değerle başlıyor: öneri `20`.
- [ ] `OPENROUTER_PHOTO_DAILY_REQUEST_LIMIT` düşük değerle başlıyor: öneri `10`.
- [ ] `NEXT_PUBLIC_AI_ANALYSIS_NOTE_ENABLED=false` production için varsayılan.
- [ ] `NEXT_PUBLIC_AI_PHOTO_DAMAGE_ENABLED=false` production için varsayılan.
- [ ] `UPSTASH_REDIS_REST_URL` ve `UPSTASH_REDIS_REST_TOKEN` staging/production için mümkünse tanımlı.

## Staging Açılışı

1. Preview/staging ortamında `NEXT_PUBLIC_AI_ANALYSIS_NOTE_ENABLED=true` yap.
2. Preview/staging ortamında `NEXT_PUBLIC_AI_PHOTO_DAMAGE_ENABLED=true` yap.
3. `OPENROUTER_DAILY_REQUEST_LIMIT=20` ve `OPENROUTER_PHOTO_DAILY_REQUEST_LIMIT=10` ile başla.
4. `npm run ai:staging-check` çalıştır.
5. Bilinçli tek canlı deneme için:

```bash
AI_LIVE_CONFIRM=EVET AI_STAGING_LIVE=1 npm run ai:live-check
```

6. Fotoğraf AI production flag kontrolü için:

```bash
npm run ai:photo-prod-check
```

7. AI çıktısını kontrol et:
   - Kesin ekspertiz sonucu vermiyor.
   - Hasarsızlık veya satın alma garantisi vermiyor.
   - Araç olmayan fotoğrafta hasar bulgusu üretmiyor.
   - Kural tabanlı raporu değiştirmiyor.
   - Hata halinde kullanıcı raporu kaybetmiyor.

## Production Açılışı

Production ortamında AI özellikleri ilk gün sadece düşük limit ile açılmalıdır:

```text
OPENROUTER_API_KEY Vercel secret olarak tanımlı
OPENROUTER_MODEL=openai/gpt-oss-20b:free
OPENROUTER_LISTING_IMPORT_FALLBACK_MODEL=openai/gpt-oss-20b
OPENROUTER_VISION_MODEL=google/gemma-4-26b-a4b-it:free
NEXT_PUBLIC_AI_ANALYSIS_NOTE_ENABLED=true
NEXT_PUBLIC_AI_PHOTO_DAMAGE_ENABLED=true
OPENROUTER_DAILY_REQUEST_LIMIT=20
OPENROUTER_PHOTO_DAILY_REQUEST_LIMIT=10
```

Vercel projesi local klasöre linklendiyse env'leri panelden tek tek girmek yerine:

```bash
npm run vercel:sync-ai-env
```

Ardından production redeploy yapılır ve şu iki kontrol geçmeden AI canlı kabul edilmez:

```bash
npm run ai:staging-check
npm run ai:photo-prod-check
```

İlk 24 saat sonunda kontrol:

- Kullanıcı hata oranı
- Günlük AI istek sayısı
- Limit dolduğunda gösterilen mesaj
- AI notlarında kesin ifade riski
- Araç dışı fotoğraflarda yanlış hasar bulgusu riski
- OpenRouter maliyet/limit görünümü

## Rollback

Sorun olursa tek değişiklikle kapat:

```text
NEXT_PUBLIC_AI_ANALYSIS_NOTE_ENABLED=false
NEXT_PUBLIC_AI_PHOTO_DAMAGE_ENABLED=false
```

Bu kapatma kural tabanlı analiz motorunu, sonuç raporunu veya App Store/PWA akışını etkilemez.

## Açılmaması Gereken Durumlar

- Günlük limit yoksa.
- Key client tarafına sızıyorsa.
- Staging smoke geçmiyorsa.
- `npm run ai:photo-prod-check` geçmiyorsa.
- AI notu kesin alım, kesin hasarsızlık veya ekspertiz yerine geçen ifade üretiyorsa.
- Fotoğraf AI araç dışı görselde hasar bulgusu üretiyorsa.
- Kullanıcı raporu AI hatası nedeniyle kullanılamaz hale geliyorsa.
