# App Review Response Draft (Build 65 — 25 Ağustos 2026 reddine yanıt taslağı)

**Bu dosya bir taslaktır — App Store Connect'e henüz gönderilmedi.** Kullanmadan önce: (1) demo hesap kimlik bilgilerini bu dosyaya EKLEMEYİN, ayrıca güvenli şekilde iletilecek; (2) test edilen cihaz/iOS sürümünü gerçek bilgiyle doldurun; (3) ekran kaydını ekleyin.

## Screen Recording Checklist

Record on a physical iPhone/iPad running the latest available iOS version. Start recording before launching EksperIQ.

Recommended flow:

1. Launch EksperIQ (fresh install or after force-quit).
2. On the onboarding screen, choose "Giriş yap" and sign in with the demo account credentials.
3. Open the Analysis tab, paste a public vehicle listing URL (or use the manual form), generate the report, and show: risk score, seller questions, inspection checklist, chronic issue notes, listing photos.
4. Open Profile ("Profil") and show the subscription paywall: all four products (Pro Monthly, Pro Yearly, Pro+ Monthly, Pro+ Yearly) with real title, duration, localized price, Privacy Policy link, Terms of Use link, auto-renewal disclosure, and Restore Purchases button.
5. Attempt a purchase (Sandbox — no real charge during review) and show the resulting entitlement.
6. Show Restore Purchases working.
7. Show Profile > Account > "Hesabımı sil" (account deletion) is reachable and functional — do not complete it on the shared demo account unless a fresh one is available afterward.
8. Open the free photo analysis flow.
9. Open the Support page (Profil > Destek) and show the visible support email.

## Copy/Paste Reply Draft

Hello App Review Team,

Thank you for the detailed feedback on EksperIQ (reviewed on iPad Air 11-inch (M3), iPadOS 26.6.1, build 1.0 (61)). We've addressed each point below in build 1.0 (65).

**1. Guideline 2.1(a) — Information Needed / demo account**

We've created a persistent demo account with full access to the app, including the subscription purchase flow and account deletion. Credentials are provided in App Store Connect's App Review Information fields (not repeated here). No plan tier blocks access to the core analysis features — sign-in is only needed to reach subscription purchase and account deletion, both reachable with the demo account.

**2. Guideline 2.1(a) — App Completeness / signup error**

We root-caused the signup issue: our sign-up flow requires e-mail confirmation, so a successful signup correctly returns no active session yet — but our UI incorrectly treated that as "signed in" and routed the user to a screen that then looked exactly like a failed signup (no session existed, so it showed the sign-in screen again with no explanation). Build 65 fixes this: after signup, the user now sees an explicit "check your e-mail to confirm" message instead of a misleading blank state. We verified the fix against our production authentication backend.

**3. Guideline 2.1(b) — In-App Purchase**

All four subscription products (`com.eksperiq.app.pro.monthly`, `.pro.yearly`, `.proplus.monthly`, `.proplus.yearly`) are configured in the same subscription group with the correct levels (Pro+ above Pro) and are included in this version's review submission along with app version 1.0.

**4. Guideline 3.1.2(c)**

The in-app purchase screen displays each subscription's title, duration, localized price (loaded live from StoreKit — never hard-coded), our Privacy Policy link, Terms of Use link, and a Restore Purchases button, along with the required auto-renewal/cancellation disclosure. Our Privacy Policy is at https://eksperiq.vercel.app/gizlilik.

**5. Guideline 1.5 — Support URL**

We've replaced our Support URL with a genuine end-user support page: https://eksperiq.vercel.app/destek — it shows a visible, clickable support e-mail, guidance for bug reports/subscription questions/privacy requests, an account-deletion pointer, and links to our Privacy Policy and Terms of Use.

A screen recording covering the full flow above is attached to this submission.

Thank you for your time reviewing EksperIQ.

## Tested Devices and Operating Systems

- [ADD DEVICE MODEL], iOS/iPadOS [ADD VERSION], physical device, TestFlight build 65
- **Not:** Bu geliştirme oturumu bir Linux sandbox içinde çalıştı — fiziksel bir iOS/iPadOS cihazı yoktu. Signup düzeltmesi gerçek production Supabase backend'ine karşı canlı bir Node testiyle doğrulandı (kod/ağ düzeyinde), ancak gerçek cihazda/gerçek WKWebView'da elle test edilmedi. Yukarıdaki cihaz satırı, App Store Connect'e gönderilmeden önce gerçek bir cihazda manuel doğrulama yapıldıktan sonra doldurulmalıdır.

## External Services

Unchanged from the previous submission: OpenRouter (temporary AI processing, user-initiated), Vercel Serverless Functions, Upstash Redis (anonymous rate limiting), Google Places API + OpenStreetMap Nominatim (optional location-based suggestions), Supabase Authentication (optional account, Pro/Pro+ subscription management), Apple StoreKit 2 (subscription purchase/restore), Capacitor Camera/Photos/Local Notifications (user-initiated only).
