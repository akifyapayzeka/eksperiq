/**
 * StoreKit 2 subscription status values (Apple's model): a real purchase can
 * be in any of these states, not just "on"/"off". See
 * docs/ios-storekit-integration.md for the full integration plan — the
 * native Transaction/currentEntitlements listener that would resolve one of
 * these states from a real purchase does not exist yet (it requires Xcode +
 * an App Store Connect subscription product, neither of which exist in this
 * environment).
 */
export type EntitlementState = "free" | "pro" | "expired" | "billingRetry" | "gracePeriod" | "revoked" | "unknown";

export type EntitlementSnapshot = {
  state: EntitlementState;
  /** ISO timestamp the current subscription period ends, when known. */
  expiresAt?: string;
  /** When this snapshot was produced. */
  checkedAt: string;
};

/**
 * Resolves the current entitlement asynchronously — never a synchronous
 * boolean. A real implementation reads this from StoreKit 2's
 * `Transaction.currentEntitlements` (verified on-device by Apple) and/or a
 * short-lived token issued by the server after validating an App Store
 * Server Notifications V2 payload.
 */
export interface EntitlementProvider {
  getEntitlement(): Promise<EntitlementSnapshot>;
}

/**
 * The active provider until real StoreKit 2 purchase/restore code is
 * written, compiled, and verified in Xcode: there is no purchase mechanism,
 * so every user is honestly "free" (never fake "pro" via localStorage or any
 * other client-only flag). This is the feature flag referenced in the
 * production-hardening plan — no UI may render a purchase/upgrade action
 * while this provider is active, since it would not do anything.
 */
export const unavailableEntitlementProvider: EntitlementProvider = {
  async getEntitlement(): Promise<EntitlementSnapshot> {
    return { state: "free", checkedAt: new Date().toISOString() };
  },
};

const PRO_STATES: ReadonlySet<EntitlementState> = new Set(["pro", "gracePeriod"]);

/**
 * Whether the current user has an active EksperIQ Pro entitlement. Always
 * resolves through a provider rather than reading a client-stored flag, so a
 * future real provider can be swapped in without callers changing.
 */
export async function isPro(provider: EntitlementProvider = unavailableEntitlementProvider): Promise<boolean> {
  const snapshot = await provider.getEntitlement();
  return PRO_STATES.has(snapshot.state);
}
