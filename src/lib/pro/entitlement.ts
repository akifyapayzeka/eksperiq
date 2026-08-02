/**
 * Whether the current user has an active EksperIQ Pro subscription.
 *
 * Always false for now: there is no purchase mechanism wired up yet. Apple/Google
 * in-app purchase only works inside the native app (not the web/PWA build), and
 * verifying it requires StoreKit/Play Billing code compiled and tested on a real
 * device with a real Apple Developer / Google Play Console account — none of
 * which exist in this environment. See eksperiq_codex.md for the exact steps
 * needed to wire this up for real.
 */
export function isPro(): boolean {
  return false;
}
