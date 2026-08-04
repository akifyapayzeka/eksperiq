const crypto = require("node:crypto");

const RECORD_PREFIX = "eksperiq:iap:entitlement:";
// Apple resends notifications and the client re-checks entitlement on every
// app open, so a record only needs to survive long enough to bridge gaps
// between those — 30 days comfortably covers a lapsed subscription window
// without accumulating stale records forever.
const RECORD_TTL_SECONDS = 60 * 60 * 24 * 30;

const memoryStore = new Map();

function getUpstashConfig() {
  const url = (process.env.UPSTASH_REDIS_REST_URL || process.env.UPSTASH_REDIS_REST_KV_REST_API_URL)?.trim();
  const token = (process.env.UPSTASH_REDIS_REST_TOKEN || process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN)?.trim();
  if (!url || !token) return null;
  return { url: url.replace(/\/$/, ""), token };
}

/**
 * There are no user accounts in this app (see docs/gizlilik) — the only
 * stable identifier StoreKit gives us across renewals/refunds/notifications
 * is Apple's own originalTransactionId, so entitlement records are keyed by
 * a hash of it rather than any account/install id. It is not secret, but
 * it's still hashed (never stored raw) so a leaked Upstash dump can't be
 * directly correlated back to Apple transaction IDs.
 */
function hashOriginalTransactionId(originalTransactionId) {
  return crypto.createHash("sha256").update(String(originalTransactionId)).digest("hex").slice(0, 32);
}

function recordKey(hash) {
  return `${RECORD_PREFIX}${hash}`;
}

async function upstashPipeline(config, commands) {
  const response = await fetch(`${config.url}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${config.token}`, "Content-Type": "application/json" },
    body: JSON.stringify(commands),
  });
  if (!response.ok) throw new Error(`Upstash pipeline failed: ${response.status}`);
  const payload = await response.json();
  if (!Array.isArray(payload)) throw new Error("Invalid Upstash pipeline payload.");
  return payload;
}

async function saveEntitlementRecord(originalTransactionId, record) {
  const hash = hashOriginalTransactionId(originalTransactionId);
  const upstash = getUpstashConfig();
  const serialized = JSON.stringify(record);

  if (!upstash) {
    memoryStore.set(hash, record);
    return { hash, store: "memory" };
  }

  await upstashPipeline(upstash, [
    ["SET", recordKey(hash), serialized],
    ["EXPIRE", recordKey(hash), RECORD_TTL_SECONDS],
  ]);
  return { hash, store: "upstash" };
}

async function getEntitlementRecord(originalTransactionId) {
  const hash = hashOriginalTransactionId(originalTransactionId);
  const upstash = getUpstashConfig();
  if (!upstash) return memoryStore.get(hash) || null;

  const response = await fetch(`${upstash.url}/get/${recordKey(hash)}`, {
    headers: { Authorization: `Bearer ${upstash.token}` },
  });
  if (!response.ok) return null;
  const payload = await response.json();
  if (!payload || typeof payload.result !== "string") return null;
  try {
    return JSON.parse(payload.result);
  } catch {
    return null;
  }
}

module.exports = {
  hashOriginalTransactionId,
  saveEntitlementRecord,
  getEntitlementRecord,
  getUpstashConfig,
};
