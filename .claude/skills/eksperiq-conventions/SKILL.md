---
name: eksperiq-conventions
description: Established conventions for the EksperIQ repo (akifyapayzeka/eksperiq — Next.js 16 static-export web app + Capacitor iOS wrapper, second-hand vehicle listing risk assistant). Consult this whenever adding a feature/page/module, touching a server endpoint under api/, writing tests, changing CI, touching anything Pro/StoreKit-related, or handling git branches/PRs in this repo — even if the user just says "add a page for X" or "write the endpoint for Y" without mentioning conventions explicitly. Encodes patterns learned the hard way across many prior sessions (a real async-hydration race, a real fail-open cron bug, a real CORS gap, a real CI root cause) so they don't get rediscovered from scratch each time.
---

# EksperIQ codebase conventions

This is a single-developer Next.js 16 (static export) app with a Capacitor iOS
wrapper. No user accounts — everything is device-local (localStorage/IndexedDB)
except a handful of server endpoints under `api/` (Vercel serverless functions,
plain Node — not Next.js API routes). Turkish is the UI language throughout.

Read the section below that matches what you're about to do. Don't read the
whole file into every task — jump to the relevant heading.

## Adding a new feature/module

This repo has ~20 feature modules (Bakım Takvimi, Gider Defteri, Sağlık
Karnesi, ...) that all follow the same shape. Match it rather than inventing a
new one — consistency here is what makes the codebase navigable.

1. **Storage module** in `src/lib/storage/<feature>-storage.ts`: a
   localStorage-backed CRUD set — `create<X>Id()`, `load<X>()`, `upsert<X>()`,
   `delete<X>()`. Keep records plain, JSON-serializable objects. If a vehicle
   is involved, records carry a `vehicleId` and get filtered via
   `filterByVehicle()` (see `src/lib/vehicles/model.ts`).
2. **Page** in `src/app/<route>/page.tsx`: `"use client"`, pill-style buttons
   (`rounded-full`), dark mode classes on every colored element
   (`dark:bg-slate-900` etc. — check a recent page like
   `src/app/arac-saglik-karnesi/page.tsx` for the exact palette rather than
   guessing new colors).
3. **Unit tests** in `tests/unit/<feature>-storage.test.ts` (vitest) —
   at minimum, cover create/load/update/delete and any migration logic.
4. **E2E coverage** in `tests/e2e/` if it's a user-facing flow a real person
   would click through — see the Testing section below for the exact patterns
   to reuse (don't reinvent the clipboard stub or the hydration wait).
5. **Before calling it done**, run the full local validation suite in this
   order (cheapest-first, so a failure is caught before wasting time on a
   slower step): `npm run format`, `npm run typecheck`, `npm run lint`,
   `npm run test`, `npm run build`.

## Async state hydration — a real bug class, not theoretical

Every page that reads localStorage/IndexedDB/notification-permission on
mount does it inside:

```tsx
useEffect(() => {
  const frame = window.requestAnimationFrame(() => {
    // ...load data, setState here...
  });
  return () => window.cancelAnimationFrame(frame);
}, []);
```

Not a synchronous `setState` directly in the effect body — that trips this
repo's `react-hooks/set-state-in-effect` ESLint rule. This means the very
first render always shows empty/default state, and real data lands one frame
later.

**This has bitten real e2e tests.** A test that does
`page.goto(url)` then immediately fills a form and clicks submit can race this
frame — the default vehicle/state may not have hydrated yet, so a guard like
`if (!selectedVehicleId) return;` silently no-ops the whole submission with no
error shown. If you're writing a test that interacts with a page right after
navigation, wait for a real signal first, e.g.:

```ts
await expect(page.getByLabel("Araç seç")).not.toHaveValue("");
```

not `page.waitForTimeout()` and not an un-awaited `isVisible()` check (that's
a non-waiting snapshot check, not a real wait — it raced a different async
effect in this exact codebase before and gave a false read depending on CPU
speed).

## Fail-closed security — no exceptions

Every server-side gate on a secret/config value refuses the request when that
config is absent, rather than letting it through. This is deliberate: the
previous, more "convenient" behavior (allow when unconfigured) was a real
production bug found in the cron endpoint — anyone could trigger push
notifications to every subscriber with no secret set at all.

Pattern (see `api/cron/check-reminders.js`'s `isAuthorized()`,
`api/_lib/rate-limit.js`'s `checkRateLimit()`, `api/iap/entitlement.js`'s
`isEnabled()`):

```js
function isAuthorized(request) {
  const secret = process.env.SOME_SECRET?.trim();
  if (!secret) return false; // no secret configured => never authorized
  return request.headers.authorization === `Bearer ${secret}`;
}
```

If you add a new endpoint that does anything sensitive (spend money, send
notifications, read/write data keyed by something guessable), it needs this
shape. Return 503 for "not configured" and 401 for "configured but this
request didn't authenticate" — that distinction matters for debugging later.

## Honest error reporting — never a silent fake "success"

If a UI action has a network-dependent side effect that can fail (typical
example: deleting a server-side push subscription record when the user hits
"delete all my data"), don't swallow the failure and show success anyway.
Thread a real result shape through the call chain instead:

```ts
type Result = { serverDeleted: boolean };
// ...
.catch(() => ({ serverDeleted: false })) // NOT .catch(() => undefined)
```

...and branch the UI message on it. See `src/lib/data-management/delete-all.ts`
and `src/components/profile/data-management-section.tsx` for the full pattern,
including the sessionStorage one-shot flag needed when the action is
immediately followed by `window.location.reload()` (which would otherwise
wipe the result before it could be shown).

## CORS for native (Capacitor) requests

Capacitor's iOS origin is `capacitor://localhost` — genuinely cross-origin
from the API's perspective, even though the URLs are correctly resolved to
the production domain. Every endpoint the native app calls must apply CORS
as the _first_ lines of the handler, before any method-check logic:

```js
const { applyCorsHeaders, handlePreflight } = require("../_lib/cors.js");

async function handler(request, response) {
  applyCorsHeaders(request, response);
  if (handlePreflight(request, response)) return;
  // ...rest of handler
}
```

Forgetting this doesn't fail loudly — it fails silently in the native app
while working fine in every browser-based test, because the web build never
needs it. If you add a new client-facing endpoint, wire this in from the
start.

## Testing conventions

- **Unit tests (vitest)**: endpoints are plain Node functions
  `(request, response) => ...`, not Next.js API routes — they read the body
  manually (`for await (const chunk of request) ...`), not via
  `request.body`. Mock the request as a `Readable` stream:

  ```ts
  import { Readable } from "node:stream";
  function createRequest(body: unknown, method = "POST") {
    const request = Readable.from([JSON.stringify(body)]) as Readable & { method?: string };
    request.method = method;
    return request;
  }
  ```

  See any `tests/unit/*-endpoint.test.ts` for the full pattern including the
  mock `response` (a `Writable` capturing `.statusCode`/`.body`).

- **E2E (Playwright)**: 4 projects — `chromium` (desktop), `mobile` (Pixel 7,
  Chromium engine), `webkit` (Desktop Safari), `mobile-safari` (iPhone 15,
  WebKit engine). Two real cross-engine gotchas already found and fixed here:
  - WebKit does **not** support
    `context.grantPermissions(["clipboard-read", "clipboard-write"])`. Use
    `tests/e2e/helpers/clipboard.ts`'s `stubClipboard(page)` instead — it
    stubs `navigator.clipboard` at the page level and works identically
    across every engine.
  - Any code branching on project name (e.g. for `fullPage` screenshot logic)
    must check the `isMobile` fixture, not a hardcoded string — there are two
    mobile projects (`mobile` and `mobile-safari`), and a `!== "mobile"` check
    silently misses the second one. WebKit also hard-caps screenshot
    dimensions at 32767px, which a narrow-viewport `fullPage` screenshot can
    exceed.

## Never fake Pro/paid features

`isPro()` in `src/lib/pro/entitlement.ts` defaults to
`unavailableEntitlementProvider`, which always honestly returns `"free"`.
Real StoreKit 2 code exists (`nativeStoreKitEntitlementProvider`,
`purchasePro()`, `restorePurchases()`, the Swift plugin in
`ios/App/App/Plugins/`, the server-side JWS verification in `api/_lib/`) but
**none of it is wired into any UI**, and won't be until it's been compiled in
Xcode and verified on a real device with a real Apple Developer account. If
you're tempted to add a "Pro'ya geç" button — don't, until that verification
has actually happened. A button that looks real but silently does nothing (or
worse, half-works) is worse than no button.

Relatedly: never claim Swift code "tested" without an actual Xcode compile.
`.github/workflows/ios-xcode-build-check.yml` (manual `workflow_dispatch`
only, on a macOS GitHub runner) can verify the Swift compiles without needing
an Apple Developer account — trigger it from the Actions tab after any change
to `ios/App/App/Plugins/*.swift`, don't just assume it compiles.

## Git/PR workflow for this repo

- Work on a single designated branch (check with the user which one is
  current — it gets restarted, see below).
- **Never merge without explicit user approval**, and never trigger a
  production deploy — that's true even mid-session with an explicit
  "handle everything" instruction; merge/deploy are their own separate
  approvals.
- If the designated branch's PR gets merged mid-session (it will — this
  project iterates in small PRs), treat follow-up work as a _fresh_ branch:
  `git fetch origin master && git checkout -B <same-branch-name> origin/master`,
  then continue. Don't stack new commits on top of already-merged history —
  a normal (non-squash) merge means the old commits stay reachable through
  master anyway, so this reset is safe and doesn't lose anything.
- Full local validation (`format`/`typecheck`/`lint`/`test`/`build`, plus
  `npm run privacy:check`, `npm run claims:check`,
  `npm run appstore:metadata-check`) before every push — these are exactly
  the checks CI runs, so a local failure now saves a slow CI round-trip
  later.

## CI structure

`.github/workflows/ci.yml` has 3 parallel jobs:

- `checks` — format/typecheck/lint/unit/coverage/build/security/privacy/App
  Store metadata, plain `ubuntu-latest`.
- `e2e-chromium` / `e2e-webkit` — run inside the official Playwright Docker
  image (`mcr.microsoft.com/playwright:v1.62.0-noble`), **not**
  `playwright install --with-deps` on bare `ubuntu-latest` — that used to
  blow the entire job timeout on a slow apt mirror before a single test ran.

If you add or change an e2e test that depends on a `NEXT_PUBLIC_*` feature
flag (e.g. `NEXT_PUBLIC_AI_PHOTO_DAMAGE_ENABLED`), check that the flag is set
in the e2e jobs' `env:` block in `ci.yml`, not just in `.env.local` — local
`.env.local` is gitignored, so a flag that only lives there is invisible to
CI and any test depending on it will fail in a confusing way (element stays
disabled, not an obvious "env var missing" error).

There's also `.github/workflows/ios-xcode-build-check.yml` — manual-only,
see "Never fake Pro/paid features" above.
