# AI Entegrasyonu

EksperIQ'un ana analiz motoru ilk sürümde kural tabanlıdır. OpenRouter entegrasyonu opsiyonel yardımcı katman olarak hazırlanmıştır.

## Güvenlik

- Gerçek API key repo'ya yazılmaz.
- Yerel key yalnızca `.env.local` içinde tutulur.
- `.env.local` `.gitignore` tarafından dışarıda bırakılır.
- Client component içinde API key kullanılmaz.
- Static export yapısı korunur; mevcut kullanıcı akışı OpenRouter'a bağlı değildir.

## Yerel değişkenler

```env
OPENROUTER_API_KEY=
OPENROUTER_MODEL=openrouter/free
OPENROUTER_DAILY_REQUEST_LIMIT=20
NEXT_PUBLIC_AI_ANALYSIS_NOTE_ENABLED=false
```

`OPENROUTER_API_KEY` yoksa AI yardımcı katmanı `disabled` döner ve kural tabanlı analiz kullanılmaya devam eder.

## Servis dosyaları

```text
src/lib/ai/openrouter.ts
src/lib/ai/analysis-note.ts
src/lib/ai/usage-guard.ts
src/lib/ai/feature-flags.ts
```

## Static export notu

Mevcut proje `output: "export"` ile statik yayınlanır. Bu yapı API route çalıştırmadığı için OpenRouter çağrısı doğrudan kullanıcı tarayıcısından yapılmamalıdır.

Canlı AI notu için `docs/ai-serverless-endpoint-plan.md` dosyasındaki serverless plan uygulanmalıdır.

## Kullanım sınırı

AI katmanı yalnızca ek karar destek notu üretmek için tasarlanmıştır. EksperIQ hiçbir durumda profesyonel ekspertiz, resmi kayıt sorgusu, servis kontrolü veya hukuki inceleme yerine geçmez.

## Resmi referans

OpenRouter doğrudan HTTP entegrasyonu için `https://openrouter.ai/api/v1/chat/completions` endpoint'ini kullanır.
