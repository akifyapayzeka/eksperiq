# eksperIQ Supabase Production Setup

Bu repo Supabase'i kullaniciya bagli veri, analiz gecmisi, bildirim abonelikleri,
AI kullanim kaydi ve ileride App Store entitlement esitlemesi icin production
backend olarak hazirlar.

## Gerekli env

GitHub/Vercel/hosting ortaminda degerler secret olarak tutulmali:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DATABASE_URL`

Kontrol:

```bash
npm run supabase:env-check
npm run supabase:env-check -- --required
```

## Migration

Ilk schema:

```text
supabase/migrations/202608090001_initial_production_schema.sql
```

Migration kullanici verilerini ayiran RLS politikalarini acik kurar. Client
yalnizca `auth.uid() = owner_id` olan satirlari gorebilir veya yazabilir.
`service_role` anahtari sadece server/CI tarafinda tutulmalidir.

Supabase CLI yüklü ve proje linkli oldugunda:

```bash
supabase link --project-ref <project-ref>
supabase db push
```

Dogru proje oldugunu SQL editor veya CLI ile kontrol etmeden production SQL
calistirma.

GitHub Actions icinden migration kontrolu `.github/workflows/supabase.yml`
dosyasindaki manuel workflow ile yapilir. Varsayilan calisma `dry-run` yapar;
`apply_migrations=true` secilirse `SUPABASE_DATABASE_URL` uzerinden production
migration uygulanir. Bu URL `.env`, migration veya workflow dosyalarina
yazilmamalidir.

## App Store notu

Supabase hazirligi TestFlight yuklemesinin yerine gecmez. TestFlight icin Apple
signing secret'lari ve App Store Connect API key'leri ayrica GitHub secrets'a
eklenmelidir.
