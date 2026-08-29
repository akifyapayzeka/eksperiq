# App Review Response Draft (Build 65 — 25 Ağustos 2026 reddine yanıt taslağı)

**Bu dosya bir taslaktır — App Store Connect'e henüz gönderilmedi.** Aşağıdaki `[MANUAL STEP REQUIRED]` işaretli her satır, gönderim öncesi tamamlanması gereken, henüz bitmemiş bir adımı gösterir — bunlar tamamlanmadan bu metni Apple'a göndermeyin. Demo hesap kimlik bilgilerini bu dosyaya EKLEMEYİN; ayrıca güvenli şekilde iletilecek.

## Screen Recording Checklist

Record on a physical iPhone/iPad running the latest available iOS version.

1. Start the screen recording **before** launching EksperIQ.
2. Launch EksperIQ.
3. Show the signup screen (onboarding "Üye ol" tab).
4. Create a new account and show that it no longer errors — the app now shows the explicit "e-postanı onayla" confirmation-pending message instead of a misleading blank/failed state.
5. Sign in with the Apple demo account credentials.
6. Run a listing-link or manual vehicle analysis.
7. On the real analysis result, show: risk score, seller questions, inspection checklist, chronic issue notes.
8. Photo Analysis: select a real vehicle photo, run the analysis, show the result.
9. Open Profile > subscription paywall.
10. Show all four products' title, duration, and localized real price.
11. Show the auto-renewal disclosure text.
12. Show the Privacy Policy link.
13. Show the Terms of Use / EULA link.
14. Show the Restore Purchases button.
15. Make a Sandbox purchase (no real charge during review).
16. Show the resulting entitlement is active.
17. Force-close and reopen the app, then show the entitlement persisted after restart.
18. Navigate to the account deletion screen (Profile > Account > "Hesabımı sil") to show it exists and is reachable — **do not** actually delete the shared demo account.
19. Open Profile > Destek.
20. Show the visible support e-mail on the Destek page.

**[MANUAL STEP REQUIRED]** — this recording has not been made yet. Steps 1–8, 18–20 can be done today; steps 9–17 require the App Store Connect subscription metadata/screenshots to be submitted and approved first (see the subscription blockers in the final report), since the paywall's purchase buttons stay disabled until `NEXT_PUBLIC_STOREKIT_PURCHASES_ENABLED` is turned on, which itself waits on a physical-device Sandbox purchase test.

## Copy/Paste Reply Draft

Hello App Review Team,

Thank you for the detailed feedback on EksperIQ (reviewed on iPad Air 11-inch (M3), iPadOS 26.6.1, build 1.0 (61)). Below is our response for build 1.0 (65).

**1. Guideline 2.1(a) — Information Needed / demo account**

We've created a persistent demo account with full access to the app, including the subscription purchase flow and account deletion. Credentials are provided in App Store Connect's App Review Information fields (not repeated here). No plan tier blocks access to the core analysis features — sign-in is only needed to reach subscription purchase and account deletion, both reachable with the demo account.

**2. Guideline 2.1(a) — App Completeness / signup error**

We root-caused the signup issue against our real production authentication backend (not simulated). Two distinct bugs were found and fixed:

- Our sign-up flow requires e-mail confirmation, so a successful signup correctly returns no active session yet — but our UI incorrectly treated that as "signed in" and routed the user to a screen that then looked exactly like a failed signup. The user now sees an explicit "check your e-mail to confirm" message instead.
- Two of our error-message mappings were incomplete: a sign-in attempt before confirming e-mail, and our provider's transactional-email send-rate limit, both previously fell through to a generic, unhelpful error message. Both are now mapped to a clear, specific message.

**[MANUAL STEP REQUIRED]** — our production project currently relies on Supabase's default (non-production-grade) transactional e-mail sender, which has a very low sending rate limit; this is a contributing factor to signup difficulty during review and requires configuring a dedicated SMTP provider in our Auth backend before we can consider this fully resolved end-to-end. This does not block signup itself (the account is created either way), but can delay delivery of the confirmation e-mail.

**[MANUAL STEP REQUIRED]** — this fix has been verified via direct API-level testing against our real production backend, but not yet manually verified on a physical iOS device end-to-end (this development session had no physical device available).

**3. Guideline 2.1(b) — In-App Purchase**

Product IDs `com.eksperiq.app.pro.monthly`, `.pro.yearly`, `.proplus.monthly`, `.proplus.yearly` exist in App Store Connect in a single subscription group.

**[MANUAL STEP REQUIRED]** — two of the four products currently have an incorrect subscription level in App Store Connect (Pro Monthly and Pro+ Monthly are swapped relative to their yearly counterparts) and must be corrected before submission. **[MANUAL STEP REQUIRED]** — none of the four products have review screenshots/metadata submitted yet; they must be completed and included in this version's review submission before this section can be marked resolved.

**4. Guideline 3.1.2(c)**

The in-app purchase screen displays each subscription's title, duration, localized price (loaded live from StoreKit — never hard-coded), our Privacy Policy link, Terms of Use link, and a Restore Purchases button, along with the required auto-renewal/cancellation disclosure. Our Privacy Policy is at https://eksperiq.vercel.app/gizlilik. **[MANUAL STEP REQUIRED]** — please confirm in App Store Connect whether our License Agreement is Apple's Standard EULA (in which case its link has been added to our App Description) or a custom one (in which case it must be kept consistent with the field in App Store Connect).

**5. Guideline 1.5 — Support URL**

We've replaced our Support URL with a genuine end-user support page: https://eksperiq.vercel.app/destek — it shows a visible, clickable support e-mail, guidance for bug reports/subscription questions/privacy requests, an account-deletion pointer, and links to our Privacy Policy and Terms of Use. **[MANUAL STEP REQUIRED]** — this URL will only be live in production once this pull request is merged and deployed; please confirm it returns the expected page before updating the Support URL field in App Store Connect.

**[MANUAL STEP REQUIRED]** — a screen recording covering the full flow (see checklist above) is not yet attached to this submission.

Thank you for your time reviewing EksperIQ.

## Tested Devices and Operating Systems

- [ADD DEVICE MODEL], iOS/iPadOS [ADD VERSION], physical device, TestFlight build 65 — **[MANUAL STEP REQUIRED]**, not filled in yet.
- **Not:** Bu geliştirme oturumu bir Linux sandbox içinde çalıştı — fiziksel bir iOS/iPadOS cihazı yoktu. Signup düzeltmesi gerçek production Supabase backend'ine karşı canlı API testleriyle doğrulandı (kod/ağ düzeyinde: normal signup, requires-confirmation, duplicate hesap — hem onaylanmamış hem onaylanmış varyantları, weak password, invalid email, logout+login), ancak gerçek cihazda/gerçek WKWebView'da elle test edilmedi. E-posta doğrulama linkine tıklanıp gerçek bir gelen kutusundan onaylanan tam akış da **MANUAL TEST** olarak işaretlidir — bu oturum gerçek bir e-posta gelen kutusuna erişemez.

## External Services

Unchanged from the previous submission: OpenRouter (temporary AI processing, user-initiated), Vercel Serverless Functions, Upstash Redis (anonymous rate limiting), Google Places API + OpenStreetMap Nominatim (optional location-based suggestions), Supabase Authentication (optional account, Pro/Pro+ subscription management), Apple StoreKit 2 (subscription purchase/restore), Capacitor Camera/Photos/Local Notifications (user-initiated only).
