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

## Vercel staging adımları

1. Vercel project settings içinde env değişkenlerini staging/preview için gir.
2. `NEXT_PUBLIC_AI_ANALYSIS_NOTE_ENABLED=true` sadece staging ortamında aç.
3. Günlük limiti düşük tut: `OPENROUTER_DAILY_REQUEST_LIMIT=20`
4. Preview deploy al.
5. Bir analiz raporu oluştur.
6. AI notu oluştur butonuna bir kez bas.
7. Notun kesin ekspertiz, hasarsızlık veya satın alma garantisi vermediğini kontrol et.
8. Limit dolduğunda kullanıcıya net hata gösterildiğini kontrol et.
9. Flag tekrar `false` yapıldığında AI alanının görünmediğini kontrol et.

## Kapatma planı

Sorun olursa:

```text
NEXT_PUBLIC_AI_ANALYSIS_NOTE_ENABLED=false
```

Bu kapatma anahtarı kural tabanlı raporu etkilemez.
