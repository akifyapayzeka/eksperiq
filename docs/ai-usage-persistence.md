# AI Kullanım Limiti Kalıcılık Stratejisi

Mevcut uygulama iki katmanlı kullanım limiti kullanır:

1. `src/lib/ai/usage-store.ts`
   - `UPSTASH_REDIS_REST_URL` ve `UPSTASH_REDIS_REST_TOKEN` varsa Upstash Redis REST ile merkezi sayaç kullanır.
   - Env yoksa in-memory fallback'e döner.

2. `src/lib/ai/daily-counter.ts`
   - Ücretsiz yerel geliştirme ve düşük riskli staging denemesi için fallback sayaçtır.
   - Serverless instance yeniden başladığında sayaç sıfırlanabilir.

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

## Uygulanan ilk prod yaklaşımı

Upstash Redis REST:

```text
key: eksperiq:ai:analysis-note:YYYY-MM-DD
value: integer
ttl: 48 saat
```

Akış:

1. Request gelir.
2. Feature flag ve OpenRouter konfigürasyonu kontrol edilir.
3. JSON gövdesi doğrulanır.
4. Günlük kullanım hakkı rezerve edilir.
5. Limit dolmuşsa OpenRouter çağrısı yapılmaz.
6. Limit uygunsa OpenRouter çağrısı yapılır.
7. Hata olursa kullanıcı kural tabanlı raporda kalır.

Upstash REST pipeline komutları:

```text
INCR eksperiq:ai:analysis-note:YYYY-MM-DD
EXPIRE eksperiq:ai:analysis-note:YYYY-MM-DD 172800
```

Bu yapı OpenRouter çağrısından önce limiti merkezi olarak artırır. AI sağlayıcısı hata döndürürse deneme hakkı harcanmış sayılır; bu tercih maliyet kontrolünü kullanıcı deneyiminden önde tutar.

## Kabul kriteri

- Secret client'a çıkmaz.
- Sayaç merkezi ve atomik çalışır.
- Limit dolunca maliyet oluşturan OpenRouter çağrısı yapılmaz.
- Flag kapalıyken endpoint OpenRouter'a gitmez.
