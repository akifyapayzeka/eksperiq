# AI Staging Checklist

Bu checklist OpenRouter AI notunu canlıya açmadan önce kullanılır. Secret değerleri dokümana veya issue'ya yazmayın.

## Yerel env kontrolü

```bash
npm run ai:env-check
```

Bu komut env değişkenlerinin varlığını kontrol eder, secret değerleri yazdırmaz.

## Gerekli değişkenler

```text
OPENROUTER_API_KEY
OPENROUTER_MODEL
OPENROUTER_DAILY_REQUEST_LIMIT
NEXT_PUBLIC_AI_ANALYSIS_NOTE_ENABLED
```

Opsiyonel kalıcı limit store değişkenleri:

```text
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
```

Bu iki değişken yoksa endpoint in-memory fallback kullanır. Staging ve production ortamında merkezi limit için Upstash Redis REST önerilir.

## Staging smoke kontrolü

Gerçek AI çağrısı yapmadan:

```bash
npm run ai:staging-check
```

Farklı preview URL için:

```bash
AI_STAGING_BASE_URL=https://preview-url.example npm run ai:staging-check
```

Gerçek AI notu üretimini bilinçli test etmek için:

```bash
AI_STAGING_LIVE=1 npm run ai:staging-check
```

Yanlışlıkla canlı AI çağrısı yapılmasını engelleyen tek deneme komutu:

```bash
AI_LIVE_CONFIRM=EVET AI_STAGING_LIVE=1 npm run ai:live-check
```

`AI_STAGING_LIVE=1` ve `ai:live-check` kullanımı günlük OpenRouter limitinden düşebilir. Bu modu yalnızca staging feature flag açıkken ve düşük limit belirlenmişken çalıştırın.

## Vercel staging adımları

1. Vercel project settings içinde env değişkenlerini staging/preview için gir.
2. `NEXT_PUBLIC_AI_ANALYSIS_NOTE_ENABLED=true` sadece staging ortamında aç.
3. Günlük limiti düşük tut: `OPENROUTER_DAILY_REQUEST_LIMIT=20`
4. Varsa `UPSTASH_REDIS_REST_URL` ve `UPSTASH_REDIS_REST_TOKEN` değerlerini staging ortamına gir.
5. Preview deploy al.
6. `npm run ai:staging-check` çalıştır.
7. Gerekirse `AI_STAGING_LIVE=1 npm run ai:staging-check` ile tek canlı AI notu dene.
8. Bir analiz raporu oluştur.
9. AI notu oluştur butonuna bir kez bas.
10. Notun kesin ekspertiz, hasarsızlık veya satın alma garantisi vermediğini kontrol et.
11. Limit dolduğunda kullanıcıya net hata gösterildiğini kontrol et.
12. Flag tekrar `false` yapıldığında AI alanının görünmediğini kontrol et.

## Kapatma planı

Sorun olursa:

```text
NEXT_PUBLIC_AI_ANALYSIS_NOTE_ENABLED=false
```

Bu kapatma anahtarı kural tabanlı raporu etkilemez.
