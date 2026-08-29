# App Review Response Draft (Build 65 — 25 Ağustos 2026 reddine yanıt taslağı)

**Bu dosya bir taslaktır — App Store Connect'e henüz gönderilmedi.** Aşağıdaki `[MANUAL STEP REQUIRED]` işaretli her satır, gönderim öncesi tamamlanması gereken, henüz bitmemiş bir adımı gösterir — bunlar tamamlanmadan bu metni Apple'a göndermeyin.

**Mimari değişiklik (bu taslağın önceki sürümünden farkı):** Uygulamadan kullanıcı hesabı/giriş sistemi (Supabase Authentication, signup, e-posta onayı, "Hesabımı sil") tamamen kaldırıldı. Pro/Pro+ satın alma artık tamamen Apple StoreKit üzerinden, Apple ID'ye bağlı ve hesapsız çalışıyor. Bu, Rejection #1 (demo account) ve Rejection #2'yi (signup error) kök nedenden ortadan kaldırır — gösterilecek bir giriş/kayıt ekranı artık yok.

## Screen Recording Checklist

Record on a physical iPhone/iPad running the latest available iOS version.

1. Start the screen recording **before** launching EksperIQ.
2. Launch EksperIQ — it opens directly to the main screen, no sign-in/sign-up gate.
3. Run a listing-link or manual vehicle analysis.
4. On the real analysis result, show: risk score, seller questions, inspection checklist, chronic issue notes.
5. Photo Analysis: select a real vehicle photo, run the analysis, show the result.
6. Open Profile > subscription paywall.
7. Show all four products' title, duration, and localized real price.
8. Show the auto-renewal disclosure text.
9. Show the Privacy Policy link.
10. Show the Terms of Use / EULA link.
11. Show the Restore Purchases button.
12. Make a Sandbox purchase (no real charge during review).
13. Show the resulting entitlement is active.
14. Force-close and reopen the app, then show the entitlement persisted after restart.
15. Open Profile > Destek.
16. Show the visible support e-mail on the Destek page.

**[MANUAL STEP REQUIRED]** — this recording has not been made yet. Steps 1–5, 15–16 can be done today; steps 6–14 require the App Store Connect subscription metadata/screenshots to be submitted and approved first (see the subscription blockers in the final report), since the paywall's purchase buttons stay disabled until `NEXT_PUBLIC_STOREKIT_PURCHASES_ENABLED` is turned on, which itself waits on a physical-device Sandbox purchase test.

## Copy/Paste Reply Draft

Hello App Review Team,

Thank you for the detailed feedback on EksperIQ (reviewed on iPad Air 11-inch (M3), iPadOS 26.6.1, build 1.0 (61)). Below is our response for build 1.0 (65).

**1. Guideline 2.1(a) — Information Needed / demo account**

We've removed the app's account/sign-in system entirely. There is no login of any kind in this build, so no demo account is needed — every screen, including the subscription purchase flow, is reachable immediately on first launch by any reviewer.

**2. Guideline 2.1(a) — App Completeness / signup error**

The signup screen that produced this error no longer exists — we removed the account system rather than patching it. There is nothing left to sign up for, so this failure mode is no longer reachable.

**3. Guideline 2.1(b) — In-App Purchase**

Product IDs `com.eksperiq.app.pro.monthly`, `.pro.yearly`, `.proplus.monthly`, `.proplus.yearly` exist in App Store Connect in a single subscription group. Purchases are handled purely by StoreKit against the reviewer's own (Sandbox) Apple ID — no app account is involved.

**[MANUAL STEP REQUIRED]** — two of the four products currently have an incorrect subscription level in App Store Connect (Pro Monthly and Pro+ Monthly are swapped relative to their yearly counterparts) and must be corrected before submission. **[MANUAL STEP REQUIRED]** — none of the four products have review screenshots/metadata submitted yet; they must be completed and included in this version's review submission before this section can be marked resolved.

**4. Guideline 3.1.2(c)**

The in-app purchase screen displays each subscription's title, duration, localized price (loaded live from StoreKit — never hard-coded), our Privacy Policy link, Terms of Use link, and a Restore Purchases button, along with the required auto-renewal/cancellation disclosure. Our Privacy Policy is at https://eksperiq.vercel.app/gizlilik. **[MANUAL STEP REQUIRED]** — please confirm in App Store Connect whether our License Agreement is Apple's Standard EULA (in which case its link has been added to our App Description) or a custom one (in which case it must be kept consistent with the field in App Store Connect).

**5. Guideline 1.5 — Support URL**

We've replaced our Support URL with a genuine end-user support page: https://eksperiq.vercel.app/destek — it shows a visible, clickable support e-mail, guidance for bug reports/subscription questions/privacy requests, a pointer for deleting locally-stored data, and links to our Privacy Policy and Terms of Use. **[MANUAL STEP REQUIRED]** — this URL will only be live in production once this pull request is merged and deployed; please confirm it returns the expected page before updating the Support URL field in App Store Connect.

**[MANUAL STEP REQUIRED]** — a screen recording covering the full flow (see checklist above) is not yet attached to this submission.

Thank you for your time reviewing EksperIQ.

## Tested Devices and Operating Systems

- [ADD DEVICE MODEL], iOS/iPadOS [ADD VERSION], physical device, TestFlight build 65 — **[MANUAL STEP REQUIRED]**, not filled in yet.
- **Not:** Bu geliştirme oturumu bir Linux sandbox içinde çalıştı — fiziksel bir iOS/iPadOS cihazı yoktu. Hesap/signup sistemi tamamen kaldırıldığı için o akışa dair ayrı bir doğrulama gerekmiyor; kalan **MANUAL TEST** ihtiyacı yalnızca StoreKit satın alma/restore akışının fiziksel cihazda Sandbox Apple ID ile uçtan uca doğrulanmasıdır (bkz. `docs/ios-storekit-integration.md`).

## External Services

Değişiklik: **Supabase Authentication kaldırıldı — uygulamanın artık hiçbir kullanıcı hesabı/kimlik doğrulama backend'i yok.** Kalan dış servisler: OpenRouter (temporary AI processing, user-initiated), Vercel Serverless Functions, Upstash Redis (anonymous rate limiting), Google Places API + OpenStreetMap Nominatim (optional location-based suggestions), Apple StoreKit 2 (subscription purchase/restore, hesapsız), Capacitor Camera/Photos/Local Notifications (user-initiated only).
