# FireVibe Final UI Integration

Date: 2026-08-08
Branch: `claude/firevibe-final-ui-integration-4iwtlv`

This document records what changed when the second (final) FireVibe-based
visual design was applied across the entire active EksperIQ app — not just
the 8 screens the FireVibe export covered — while preserving all existing
business logic, data flows, validation, and tests.

## 1. Design tokens

`src/app/globals.css` now carries the full token system ported from the
FireVibe export's `tokens.css` (light) plus an original, hand-designed dark
palette (navy/graphite hierarchy, not a plain color inversion). Tailwind 4
`@theme` maps these to utility classes (`bg-primary`, `text-muted-foreground`,
`border-border`, `rounded-theme`, …) that already carry both light and dark
values, so most components don't need `dark:` variants at all.

Fonts: Manrope (`font-heading`) + Inter (`font-body`), via `next/font/google`.

Theme toggle: `src/lib/theme/theme-preference.ts` + `src/components/ui/theme-toggle.tsx`,
three states (system/light/dark), `data-theme` attribute on `<html>`, a
`beforeInteractive` init script to avoid a flash of the wrong theme.

## 2. Shared component system

| Component                                        | Path                                             |
| ------------------------------------------------ | ------------------------------------------------ |
| `PrimaryButton`, `SecondaryButton`, `IconButton` | `src/components/ui/button.tsx`                   |
| `RiskBadge`                                      | `src/components/ui/risk-badge.tsx`               |
| `ScoreRing`                                      | `src/components/ui/score-ring.tsx`               |
| `InfoAlert`, `WarningAlert`, `DisclaimerCard`    | `src/components/ui/alert.tsx`                    |
| `EmptyState`                                     | `src/components/ui/empty-state.tsx`              |
| `Skeleton`, `LoadingSkeleton`                    | `src/components/ui/skeleton.tsx`                 |
| `StickyMobileAction`                             | `src/components/ui/sticky-mobile-action.tsx`     |
| `ConfirmationDialog`                             | `src/components/ui/confirmation-dialog.tsx`      |
| `BottomSheet`                                    | `src/components/ui/bottom-sheet.tsx`             |
| `VehiclePlaceholder`                             | `src/components/ui/vehicle-placeholder.tsx`      |
| `ThemeToggle`                                    | `src/components/ui/theme-toggle.tsx`             |
| `AppShell`                                       | `src/components/layout/app-shell.tsx`            |
| `PageHeader`                                     | `src/components/layout/page-header.tsx`          |
| `SectionHeader`                                  | `src/components/layout/section-header.tsx`       |
| `Logo` (official brand marks)                    | `src/components/layout/logo.tsx`                 |
| `HeroCard`                                       | `src/components/cards/hero-card.tsx`             |
| `StatGrid`                                       | `src/components/cards/stat-card.tsx`             |
| `VehicleCard`                                    | `src/components/cards/vehicle-card.tsx`          |
| `AnalysisCard`                                   | `src/components/cards/analysis-card.tsx`         |
| `ReminderCard`                                   | `src/components/cards/reminder-card.tsx`         |
| `VehicleFormSheet` (shared add/edit vehicle)     | `src/components/vehicles/vehicle-form-sheet.tsx` |

`MobileBottomNav` (`src/components/layout/mobile-bottom-nav.tsx`) was
restyled to exactly the required 5 items — **Ana Sayfa, Analiz, Garajım,
Geçmiş, Profil** — using real `next/link` + `usePathname` active state. It's
mounted once in `src/app/layout.tsx` and reused unchanged on every page.
`SiteHeader` (desktop nav) and `SiteFooter` were restyled onto tokens too.

## 3. FireVibe screen → real route mapping

| FireVibe file                 | Real route / components                                                                             | Notes                                                                                                                                                                                                                                                                                                                                                            |
| ----------------------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AnaSayfa.tsx`                | `src/app/page.tsx`                                                                                  | Real analysis history, vehicle count, next reminder, this-month expense total. Empty states: "Henüz analiz yok", "Henüz araç eklenmedi", "Yaklaşan hatırlatma yok", "Henüz gider kaydı yok".                                                                                                                                                                     |
| `YeniAnaliz.tsx`              | `src/app/analiz/page.tsx` + `src/components/forms/analysis-form.tsx` + `analysis-form-sections.tsx` | All fields, RHF + Zod schema, brand/model dependency, progress ring, sticky mobile submit — unchanged; only className/JSX structure updated.                                                                                                                                                                                                                     |
| `AnalizRaporu.tsx`            | `src/app/sonuc/page.tsx` + `src/components/results/result-client.tsx`                               | All report sections/actions unchanged; fixed the risk-tone-vs-riskBucket mismatch described below.                                                                                                                                                                                                                                                               |
| `Analizlerim.tsx`             | `src/app/analizlerim/page.tsx`                                                                      | Real analysis history + real photo analyses; search/filter/delete logic unchanged.                                                                                                                                                                                                                                                                               |
| `GarajM.tsx`                  | `src/app/arac-saglik-karnesi/page.tsx`                                                              | Multi-vehicle, health records, reminders, expenses unchanged; reminders now render via shared `ReminderCard`; `VehicleFormSheet` wired in.                                                                                                                                                                                                                       |
| `AraEkle.tsx`                 | `src/components/vehicles/vehicle-form-sheet.tsx` (new, shared)                                      | One real, type-safe component wired to `vehicle-storage`, reused from Garajım, Bakım ve Ödeme Takvimi, Gider Defteri, Araç Sağlık Karnesi.                                                                                                                                                                                                                       |
| `EkspertizKontrolListesi.tsx` | `src/app/kontrol-listesi/page.tsx`                                                                  | Checklist data/storage behavior unchanged.                                                                                                                                                                                                                                                                                                                       |
| `Profil.tsx`                  | `src/app/profil/page.tsx`                                                                           | No account fields (no "Ahmet Yılmaz", no "Çıkış yap"/"Hesabı Sil"). Added: `ThemeToggle`, `NotificationPreferenceSection` (new — wires the previously UI-less `src/lib/push` functions to a real control), reuses `DataManagementSection` as-is (export/import/delete/storage-usage), links to gizlilik/kullanım koşulları/hakkında (app version)/geri bildirim. |

## 4. Remaining pages restyled onto the same system

`fotograf-hasar`, `bakim-odeme-takvimi`, `gider-defteri`, `moduller`,
`onarim-maliyeti`, `ekspertiz-raporu`, `arac-deger-takibi`, `karsilastirma`,
`test-surusu-kontrol`, `resmi-sorgu-rehberi`, `satis-hazirligi`,
`bakim-takibi`, `gizlilik`, `kullanim-kosullari`, `hakkinda`,
`geri-bildirim`, `offline`, `not-found`, `error` — all wrapped in
`AppShell` + `HeroCard`, all business logic (forms, storage calls, AI
photo-damage feature-flag gating, push notification flow, comparison table,
checklist toggles) untouched.

`kullanim-kosullari`, `hakkinda`, `nasil-calisir` needed no page-level
changes — they already composed `InfoPage`, which was restyled once and
that was enough.

## 5. Real bug found and fixed while restyling

`src/components/results/result-client.tsx` had its own local 4-band
(80/60/40) score→color scale in `riskToneClass()` and
`scoreRingColorClass()`, independent of `src/lib/analysis/risk-bucket.ts`'s
3-band (80/60) scale used everywhere else (`RiskBadge`, `ScoreRing`, the
home page). Both now call `riskBucket()` directly, so there is exactly one
source of truth for score→risk-level across the app, per the project's
non-negotiable risk-semantics rule.

## 6. Minimal, explicitly-flagged business-logic touch

`src/lib/vehicles/types.ts` (`VehicleProfile`) and
`src/lib/storage/vehicle-storage.ts` (its validator) gained optional,
additive fields: `brand`, `model`, `modelYear`, `mileage`, `fuel`,
`transmission`, `plate`, `photoDataUrl`. This was required for the shared
`VehicleFormSheet` (the `AraEkle` mapping) to be a real, working component
instead of a second mock vehicle array — `VehicleProfile` previously only
had `id`/`label`/`createdAt`. The change is fully backward compatible:
existing stored records (which never had these fields) remain valid, and
`upsertVehicle`/`loadVehicles`/`deleteVehicle` signatures are unchanged.

No other file under `src/lib/analysis/`, `src/lib/storage/` (beyond the one
above), `api/`, `ios/`, or `scripts/` was touched.

## 7. Official brand marks

The user provided the real EksperIQ logo renders mid-session (this
supersedes the original plan to skip logo work). They were vectorized into
`public/brand/*.svg` (amblem, horizontal lockup, vertical lockup, vertical
mono) and wired in via `src/components/layout/logo.tsx`:

- `SiteHeader`: compact amblem on mobile widths, full horizontal lockup on
  desktop (`sm:+`).
- `not-found.tsx` / `error.tsx` / `offline/page.tsx`: vertical lockup in
  place of the old plain "EksperIQ" text label.
- `MobileBottomNav` deliberately does **not** get a logo slot — it must stay
  exactly 5 items.

All 4 marks are navy-based, designed for light backgrounds, with no
light/white variant. Rather than hand-edit their colors, dark-mode legibility
uses a CSS `dark:brightness-0 dark:invert` filter (renders as a white
silhouette) — the SVG files themselves are untouched.

**Still blocked**: a 5th image the user provided (`uygulama-ikonu`, meant as
the app icon) is a glossy 3D marketing-style render on a gradient/glow
background — not a flat, App Store-guideline-compliant square icon. It was
not used for anything. `public/app-store-icon-source.svg`,
`app-store-icon-1024.png`, `icon-192.png`, `icon-512.png` were left exactly
as they were. **A proper flat 1024×1024 app-icon source is still needed from
the user** if they want to replace the current placeholder icon.

## 8. iOS / TestFlight

Nothing in `ios/` was touched. No manual iOS/TestFlight steps changed —
whatever was documented before this session (see `docs/ios-testflight-preflight.md`,
`docs/testflight-qa-checklist.md`) is still accurate; this was a pure web
UI/CSS-class pass, no native code involved.

## 9. New regression tests

Added to `tests/unit/`:

- `risk-bucket.test.ts` — boundary tests for `riskBucket()` plus a guard
  against ever reintroducing a 4th band.
- `risk-badge.test.tsx` — `RiskBadge` always renders a text label (never
  color-only) and matches `riskBucket()` for every score 0–100.
- `ui-copy-guardrails.test.ts` — zero `supabase.co` references anywhere in
  `src/`, zero "Yakında", zero "Çıkış yap"/"Hesabı Sil", every module in the
  registry has `status: "active"`.
- `mobile-bottom-nav.test.tsx` — exactly 5 items, real routes, correct
  `aria-current` on the active route.

## 10. Verification run each phase

`npm run format`, `npx tsc --noEmit`, `npx eslint src tests`, `npx vitest run`
(330/330), `npm run build` (29 static routes) — all green after every phase.
Also green: `npm run coverage` (~80.6% statements), `npm run privacy:check`,
`npm run claims:check`, `npm run appstore:metadata-check`.

Playwright E2E, `chromium` project: **31 passed / 5 failed / 4 skipped**.
The 5 failures are a pre-existing local-sandbox gap, not a regression from
this redesign — this environment has no `.env.local`, so
`NEXT_PUBLIC_AI_PHOTO_DAMAGE_ENABLED` is unset (`.env.example` default:
`false`) and every test that clicks the AI-photo-check button correctly
finds it disabled and times out (`native-hardening.spec.ts:24,65,92`,
`module-tools.spec.ts:25,339`). Two genuinely stale selectors were found
and fixed (`tests/e2e/main-flow.spec.ts`, `screenshots.spec.ts`,
`native-hardening.spec.ts`) — old headings/labels the redesign correctly
replaced ("Araç almadan…" → "Aracınız için bugün ne yapalım?", "Aktif
modüller" → "Tüm modüller", "Mobil alt menü" → "Ana navigasyon" nav
aria-label and its old item set) were asserted verbatim; assertions now
match the new, correct copy. `playwright.config.ts` also gained a
sandbox-only conditional `executablePath` override so `chromium`/`mobile`
launch the pre-installed browser instead of failing to download a
revision this sandbox's network egress can't reach — inert in real CI.

`webkit`/`mobile-safari` genuinely cannot run in this sandbox — no WebKit
binary exists under `/opt/pw-browsers` (only Chromium + a headless-shell
variant + ffmpeg) — this is an environment limitation, not something this
change caused or can fix; run those two projects in CI or on a dev
machine to confirm.
