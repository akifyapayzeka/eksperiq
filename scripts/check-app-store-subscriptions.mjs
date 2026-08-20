import { createPrivateKey, sign } from "node:crypto";

const API_BASE = "https://api.appstoreconnect.apple.com/v1";
const BUNDLE_ID = process.env.APP_STORE_BUNDLE_ID || "com.eksperiq.app";
const EXPECTED_PRODUCT_IDS = [
  "com.eksperiq.app.pro.monthly",
  "com.eksperiq.app.pro.yearly",
  "com.eksperiq.app.proplus.monthly",
  "com.eksperiq.app.proplus.yearly",
];

function fail(message) {
  console.error(`App Store subscription check failed: ${message}`);
  process.exit(1);
}

function base64url(input) {
  return Buffer.from(input).toString("base64url");
}

function readDerLength(signature, offset) {
  const first = signature[offset];
  if (first < 0x80) return { length: first, bytes: 1 };
  const byteCount = first & 0x7f;
  let length = 0;
  for (let index = 0; index < byteCount; index += 1) {
    length = (length << 8) + signature[offset + 1 + index];
  }
  return { length, bytes: 1 + byteCount };
}

function normalizeInteger(bytes) {
  let value = bytes;
  while (value.length > 0 && value[0] === 0) value = value.subarray(1);
  if (value.length > 32) fail("ES256 signature integer is longer than 32 bytes.");
  if (value.length === 32) return value;
  return Buffer.concat([Buffer.alloc(32 - value.length), value]);
}

function derToJose(signature) {
  if (signature[0] !== 0x30) fail("ES256 signature is not a DER sequence.");
  const sequence = readDerLength(signature, 1);
  let offset = 1 + sequence.bytes;
  if (signature[offset] !== 0x02) fail("ES256 signature is missing r integer.");
  const rLength = readDerLength(signature, offset + 1);
  offset += 1 + rLength.bytes;
  const r = signature.subarray(offset, offset + rLength.length);
  offset += rLength.length;
  if (signature[offset] !== 0x02) fail("ES256 signature is missing s integer.");
  const sLength = readDerLength(signature, offset + 1);
  offset += 1 + sLength.bytes;
  const s = signature.subarray(offset, offset + sLength.length);
  return Buffer.concat([normalizeInteger(r), normalizeInteger(s)]);
}

function readPrivateKey() {
  const raw = process.env.APP_STORE_CONNECT_API_KEY_P8_BASE64;
  if (!raw) fail("APP_STORE_CONNECT_API_KEY_P8_BASE64 is missing.");
  const decoded = Buffer.from(raw, "base64").toString("utf8").trim();
  if (!decoded.includes("BEGIN PRIVATE KEY")) {
    fail("APP_STORE_CONNECT_API_KEY_P8_BASE64 does not decode to a .p8 private key.");
  }
  return decoded;
}

function createJwt() {
  const keyId = process.env.APP_STORE_CONNECT_KEY_ID;
  const issuerId = process.env.APP_STORE_CONNECT_ISSUER_ID;
  if (!keyId) fail("APP_STORE_CONNECT_KEY_ID is missing.");
  if (!issuerId) fail("APP_STORE_CONNECT_ISSUER_ID is missing.");

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "ES256", kid: keyId, typ: "JWT" };
  const payload = {
    iss: issuerId,
    aud: "appstoreconnect-v1",
    iat: now,
    exp: now + 15 * 60,
  };
  const signingInput = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(payload))}`;
  const signature = derToJose(sign("sha256", Buffer.from(signingInput), createPrivateKey(readPrivateKey())));
  return `${signingInput}.${signature.toString("base64url")}`;
}

async function request(path, token) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const text = await response.text();
  let body;
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { raw: text };
  }
  if (!response.ok) {
    const detail = body?.errors?.[0]?.detail || body?.errors?.[0]?.title || text || response.statusText;
    fail(`${path} returned ${response.status}: ${detail}`);
  }
  return body;
}

function productIdOf(subscription) {
  return subscription?.attributes?.productId || subscription?.attributes?.subscriptionId || null;
}

async function main() {
  const token = createJwt();
  const apps = await request(`/apps?filter[bundleId]=${encodeURIComponent(BUNDLE_ID)}&limit=1`, token);
  const app = apps.data?.[0];
  if (!app?.id) fail(`No App Store Connect app found for bundle id ${BUNDLE_ID}.`);

  const groups = await request(`/apps/${app.id}/subscriptionGroups?limit=200`, token);
  if (!Array.isArray(groups.data) || groups.data.length === 0) {
    fail(`No subscription groups found for ${BUNDLE_ID}. Create the EksperIQ Pro/Pro+ subscription group first.`);
  }

  const found = new Set();
  for (const group of groups.data) {
    const subscriptions = await request(`/subscriptionGroups/${group.id}/subscriptions?limit=200`, token);
    for (const item of subscriptions.data ?? []) {
      const productId = productIdOf(item);
      if (productId) found.add(productId);
    }
  }

  const missing = EXPECTED_PRODUCT_IDS.filter((productId) => !found.has(productId));
  if (missing.length > 0) {
    fail(`Missing expected subscription product ids: ${missing.join(", ")}`);
  }

  console.log(`App Store subscription check passed for ${BUNDLE_ID}: ${EXPECTED_PRODUCT_IDS.join(", ")}`);
}

main().catch((error) => fail(error instanceof Error ? error.message : String(error)));
