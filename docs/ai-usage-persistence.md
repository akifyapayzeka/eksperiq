# AI Kullanım Limiti Kalıcılık Stratejisi

Mevcut `src/lib/ai/daily-counter.ts` ilk koruma katmanı olarak in-memory sayaç kullanır. Bu düşük riskli staging denemesi için yeterlidir; serverless instance yeniden başladığında sayaç sıfırlanabilir.

## Neden kalıcı store gerekir?

- Birden fazla serverless instance aynı anda çalışabilir.
- Instance restart olursa in-memory sayaç sıfırlanır.
- Gerçek kullanıcı trafiğinde günlük limitin merkezi tutulması gerekir.

## Ücretsiz / düşük maliyetli seçenekler

1. Vercel KV / Upstash Redis free tier
   - Günlük sayaç için en uygun seçenek.
   - TTL ile otomatik sıfırlama yapılabilir.

2. Supabase free tier
   - Gelecekte kullanıcı/garage modülü gelirse daha anlamlı.
   - İlk AI limit için biraz ağır kalır.

3. GitHub issue/manual quota
   - Gerçek zamanlı koruma sağlamaz.
   - Sadece kapalı beta için uygundur.

## Önerilen ilk prod yaklaşımı

Vercel KV veya Upstash Redis:

```text
key: eksperiq:ai:analysis-note:YYYY-MM-DD
value: integer
ttl: 48 saat
```

Akış:

1. Request gelir.
2. Günlük sayaç okunur.
3. Limit dolmuşsa OpenRouter çağrısı yapılmaz.
4. Limit uygunsa sayaç atomik artırılır.
5. OpenRouter çağrısı yapılır.
6. Hata olursa kullanıcı kural tabanlı raporda kalır.

## Kabul kriteri

- Secret client'a çıkmaz.
- Sayaç merkezi ve atomik çalışır.
- Limit dolunca maliyet oluşturan OpenRouter çağrısı yapılmaz.
- Flag kapalıyken endpoint OpenRouter'a gitmez.
