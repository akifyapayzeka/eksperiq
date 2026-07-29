# AI Serverless Endpoint Planı

EksperIQ şu anda `next.config.ts` içinde `output: "export"` kullandığı için statik site olarak Vercel, Netlify veya Hostinger üzerinde yayınlanabilir. Bu yapı API route çalıştırmaz. OpenRouter key güvenliği için AI çağrısı client tarafında yapılmamalıdır.

## Neden serverless endpoint gerekli?

- `OPENROUTER_API_KEY` tarayıcıya gönderilmemelidir.
- Günlük limit ve kötüye kullanım koruması server tarafında yapılmalıdır.
- Hata durumunda kural tabanlı rapor bozulmadan kalmalıdır.

## Önerilen canlı açılış sırası

1. Web MVP static export ile çalışmaya devam eder.
2. Vercel serverless endpoint hazırlanır.
3. Endpoint yalnızca `POST /api/ai/analysis-note` tek amaçlı rotasını sunar.
4. Endpoint içinde `decideAiUsage` ile feature flag, key varlığı ve günlük limit kontrol edilir.
5. Endpoint `createAiAnalysisNote` çağırır.
6. Client yalnızca endpoint sonucunu gösterir; OpenRouter key hiçbir zaman client'a taşınmaz.

## Env değişkenleri

```env
OPENROUTER_API_KEY=
OPENROUTER_MODEL=openrouter/free
OPENROUTER_DAILY_REQUEST_LIMIT=20
NEXT_PUBLIC_AI_ANALYSIS_NOTE_ENABLED=false
```

## Eklenen endpoint

```text
api/ai/analysis-note.ts
```

Bu dosya Next App Router route handler değildir. Proje `output: "export"` ile statik kalmaya devam ederken Vercel'in root `api/` serverless function desteği için hazırlanmıştır.

Hostinger statik paketi bu endpoint'i içermez; Hostinger yayınında AI notu kapalı kalmalıdır.

## Kapatma anahtarı

`NEXT_PUBLIC_AI_ANALYSIS_NOTE_ENABLED=false` olduğunda sonuç raporundaki AI alanı görünmez. Bu nedenle canlı MVP kural tabanlı analizle çalışmayı sürdürür.

## Limit politikası

İlk gerçek kullanıcı testinde önerilen limit:

```text
20 istek / gün
```

Bu limit düşük tutulur. Ürün değeri kanıtlanmadan ücretli veya sınırsız AI çağrısı açılmaz.

## Kabul kriterleri

- Key client bundle içinde bulunmaz.
- Key repo'ya commitlenmez.
- API hatasında kullanıcı kural tabanlı raporu görmeye devam eder.
- AI metni kesin ekspertiz, hasarsızlık veya satın alma garantisi vermez.
- Günlük limit dolduğunda kullanıcıya net ve sakin hata mesajı gösterilir.
