/**
 * Maps a decoded StoreKit 2 JWSTransactionDecodedPayload (and, when
 * available, the matching JWSRenewalInfoDecodedPayload) to this app's
 * EntitlementState. Mirrors src/lib/pro/entitlement.ts's EntitlementState
 * union exactly: "free" | "pro" | "expired" | "billingRetry" |
 * "gracePeriod" | "revoked" | "unknown".
 *
 * gracePeriod/billingRetry can only be detected when renewalInfo is
 * available (its gracePeriodExpiresDate / autoRenewStatus fields) — Apple's
 * App Store Server Notifications carry both signedTransactionInfo and
 * signedRenewalInfo, but a client only ever has its own transaction JWS
 * (VerificationResult.jwsRepresentation), so renewalInfo is null there and
 * this can only resolve to "pro" | "expired" | "revoked" in that case.
 */
function deriveEntitlementState(transactionInfo, renewalInfo) {
  if (!transactionInfo || typeof transactionInfo !== "object") return "unknown";

  if (transactionInfo.revocationDate) return "revoked";

  const expiresAt = transactionInfo.expiresDate;
  if (typeof expiresAt !== "number") return "pro";

  const now = Date.now();
  if (expiresAt >= now) return "pro";

  if (renewalInfo && typeof renewalInfo === "object") {
    if (typeof renewalInfo.gracePeriodExpiresDate === "number" && renewalInfo.gracePeriodExpiresDate >= now) {
      return "gracePeriod";
    }
    if (renewalInfo.autoRenewStatus === 1) return "billingRetry";
  }

  return "expired";
}

module.exports = { deriveEntitlementState };
