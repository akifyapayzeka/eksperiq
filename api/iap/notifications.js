const { verifyAppleSignedPayload } = require("../_lib/apple-jws");
const { saveEntitlementRecord } = require("../_lib/iap-store");
const { deriveEntitlementState } = require("../_lib/iap-entitlement-state");

function sendJson(response, statusCode, body) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(body));
}

/**
 * Fail-closed: App Store Server Notifications V2 requires a webhook URL to
 * be registered in App Store Connect against a real subscription product,
 * neither of which exists yet (see docs/ios-storekit-integration.md). Until
 * APPLE_APP_STORE_NOTIFICATIONS_ENABLED is explicitly turned on, this
 * endpoint refuses every request rather than silently accepting payloads
 * with no real Apple configuration to correlate against.
 */
function isEnabled() {
  return process.env.APPLE_APP_STORE_NOTIFICATIONS_ENABLED === "true";
}

/**
 * Pure transform from an already-verified notification envelope +
 * transaction/renewal info to what gets stored — separated from the handler
 * so it's unit-testable without a real or synthetic Apple signature (see
 * tests/unit/iap-notifications-endpoint.test.ts). Apple's App Store Server
 * Notifications V2 legitimately delivers both Sandbox and Production
 * notifications to the same webhook URL (Sandbox testing, App Review before
 * launch, and real customers all land here) — environment is recorded on
 * the record and folded into its storage key (see api/_lib/iap-store.js)
 * so the two can never collide, but neither is rejected here.
 */
function buildEntitlementRecord(notification, transactionInfo, renewalInfo) {
  const environment = notification?.data?.environment ?? transactionInfo?.environment ?? null;
  return {
    state: deriveEntitlementState(transactionInfo, renewalInfo),
    productId: transactionInfo.productId ?? null,
    expiresAt:
      typeof transactionInfo.expiresDate === "number" ? new Date(transactionInfo.expiresDate).toISOString() : null,
    environment,
    notificationType: notification.notificationType ?? null,
    subtype: notification.subtype ?? null,
    notificationUUID: notification.notificationUUID ?? null,
    updatedAt: new Date().toISOString(),
  };
}

async function readJsonBody(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw.trim()) return null;
  return JSON.parse(raw);
}

/**
 * Receives Apple's App Store Server Notifications V2 (POST, server-to-server
 * — never called from the app itself, so unlike the client-facing /api/iap
 * and /api/ai/* endpoints this does not need CORS handling). Every claim in
 * the payload is independently re-verified via its own Apple-signed JWS
 * before anything is trusted: the outer envelope (signedPayload), and the
 * transaction/renewal info nested inside it (signedTransactionInfo /
 * signedRenewalInfo) are three separate JWS values Apple signs separately.
 *
 * NEVER exercised against real Apple traffic — there is no App Store
 * Connect webhook configured yet to send any. The JWS verification it
 * depends on (api/_lib/apple-jws.js) is proven correct against a synthetic
 * certificate chain in tests/unit/apple-jws.test.ts; this handler's own
 * tests (tests/unit/iap-notifications-endpoint.test.ts) can therefore only
 * cover the fail-closed and rejection paths, not a genuine Apple-signed
 * success payload.
 */
async function handler(request, response) {
  if (request.method !== "POST") {
    sendJson(response, 405, { error: "Method not allowed." });
    return;
  }

  if (!isEnabled()) {
    sendJson(response, 503, { error: "App Store Server Notifications are not configured." });
    return;
  }

  let body;
  try {
    body = await readJsonBody(request);
  } catch {
    sendJson(response, 400, { error: "Invalid JSON body." });
    return;
  }

  const signedPayload = body?.signedPayload;
  if (typeof signedPayload !== "string" || !signedPayload) {
    sendJson(response, 400, { error: "Missing signedPayload." });
    return;
  }

  let notification;
  try {
    notification = verifyAppleSignedPayload(signedPayload);
  } catch {
    // Deliberately no detail in the response — a caller probing this
    // endpoint (it's a public URL by nature) learns nothing about why
    // verification failed.
    sendJson(response, 401, { error: "Could not verify signedPayload." });
    return;
  }

  const signedTransactionInfo = notification?.data?.signedTransactionInfo;
  if (typeof signedTransactionInfo !== "string" || !signedTransactionInfo) {
    sendJson(response, 400, { error: "Notification is missing transaction info." });
    return;
  }

  let transactionInfo;
  let renewalInfo = null;
  try {
    transactionInfo = verifyAppleSignedPayload(signedTransactionInfo);
    const signedRenewalInfo = notification?.data?.signedRenewalInfo;
    if (typeof signedRenewalInfo === "string" && signedRenewalInfo) {
      renewalInfo = verifyAppleSignedPayload(signedRenewalInfo);
    }
  } catch {
    sendJson(response, 401, { error: "Could not verify embedded transaction/renewal info." });
    return;
  }

  const originalTransactionId = transactionInfo?.originalTransactionId;
  if (!originalTransactionId) {
    sendJson(response, 400, { error: "Transaction info is missing originalTransactionId." });
    return;
  }

  const record = buildEntitlementRecord(notification, transactionInfo, renewalInfo);
  await saveEntitlementRecord(originalTransactionId, record, record.environment ?? "Production");

  sendJson(response, 200, { received: true });
}

module.exports = handler;
module.exports.isEnabled = isEnabled;
module.exports.buildEntitlementRecord = buildEntitlementRecord;
