const crypto = require("node:crypto");
const { verifyAppleSignedPayload } = require("../_lib/apple-jws");
const { saveEntitlementRecord } = require("../_lib/iap-store");
const { deriveEntitlementState } = require("../_lib/iap-entitlement-state");
const { applyCorsHeaders, handlePreflight } = require("../_lib/cors");

const PRO_MONTHLY_PRODUCT_ID = "com.eksperiq.app.pro.monthly";
// Short-lived on purpose: the client keeps this token in memory only (never
// localStorage) and re-requests it rather than persisting a long-lived
// "is pro" credential client-side.
const TOKEN_TTL_SECONDS = 15 * 60;

function sendJson(response, statusCode, body) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(body));
}

/**
 * Fail-closed: without both the feature flag and a real signing secret,
 * every request is rejected — never a silently-trusted client claim.
 */
function isEnabled() {
  return process.env.APPLE_IAP_ENTITLEMENT_ENABLED === "true" && Boolean(getTokenSecret());
}

function getTokenSecret() {
  return process.env.STOREKIT_ENTITLEMENT_TOKEN_SECRET?.trim() || null;
}

async function readJsonBody(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw.trim()) return null;
  return JSON.parse(raw);
}

function signToken(secret, payload) {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", secret).update(encodedPayload).digest("base64url");
  return `${encodedPayload}.${signature}`;
}

/**
 * Client-facing endpoint: the app posts the signedTransactionInfo JWS it
 * already received (and cryptographically trusted) from its own on-device
 * StoreKit 2 call (VerificationResult.jwsRepresentation). The server
 * independently re-verifies Apple's signature — an on-device jailbreak
 * could otherwise fabricate a "verified" transaction the app would
 * naively trust — and, only once re-verified, issues a short-lived
 * HMAC-signed token asserting the entitlement state as of that check.
 *
 * This only ever sees the raw transaction JWS, never the paired
 * signedRenewalInfo (that only exists inside App Store Server
 * Notifications — see api/iap/notifications.js), so it cannot itself
 * distinguish "gracePeriod"/"billingRetry" from a plain "expired"; those
 * finer states only ever come from a notification having already updated
 * the shared entitlement record.
 *
 * NEVER exercised against a real Apple-signed transaction — see the
 * same disclaimer in api/iap/notifications.js and
 * docs/ios-storekit-integration.md.
 */
async function handler(request, response) {
  applyCorsHeaders(request, response);
  if (handlePreflight(request, response)) return;

  if (request.method !== "POST") {
    sendJson(response, 405, { error: "Method not allowed." });
    return;
  }

  if (!isEnabled()) {
    sendJson(response, 503, { error: "Entitlement verification is not configured." });
    return;
  }

  let body;
  try {
    body = await readJsonBody(request);
  } catch {
    sendJson(response, 400, { error: "Invalid JSON body." });
    return;
  }

  const signedTransactionInfo = body?.signedTransactionInfo;
  if (typeof signedTransactionInfo !== "string" || !signedTransactionInfo) {
    sendJson(response, 400, { error: "Missing signedTransactionInfo." });
    return;
  }

  let transactionInfo;
  try {
    transactionInfo = verifyAppleSignedPayload(signedTransactionInfo);
  } catch {
    sendJson(response, 401, { error: "Could not verify signedTransactionInfo." });
    return;
  }

  if (transactionInfo.productId !== PRO_MONTHLY_PRODUCT_ID) {
    sendJson(response, 400, { error: "Unexpected productId." });
    return;
  }

  const originalTransactionId = transactionInfo.originalTransactionId;
  if (!originalTransactionId) {
    sendJson(response, 400, { error: "Transaction info is missing originalTransactionId." });
    return;
  }

  const state = deriveEntitlementState(transactionInfo, null);
  const expiresAt =
    typeof transactionInfo.expiresDate === "number" ? new Date(transactionInfo.expiresDate).toISOString() : null;

  await saveEntitlementRecord(originalTransactionId, {
    state,
    productId: transactionInfo.productId,
    expiresAt,
    updatedAt: new Date().toISOString(),
  });

  const issuedAt = Date.now();
  const tokenPayload = {
    state,
    productId: transactionInfo.productId,
    expiresAt,
    issuedAt,
    tokenExpiresAt: issuedAt + TOKEN_TTL_SECONDS * 1000,
  };
  const token = signToken(getTokenSecret(), tokenPayload);

  sendJson(response, 200, { token, ...tokenPayload });
}

module.exports = handler;
module.exports.isEnabled = isEnabled;
module.exports.PRO_MONTHLY_PRODUCT_ID = PRO_MONTHLY_PRODUCT_ID;
