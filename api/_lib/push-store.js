const crypto = require("node:crypto");

const SUBSCRIPTIONS_INDEX_KEY = "eksperiq:push:subs";
const RECORD_PREFIX = "eksperiq:push:sub:";
// A subscription re-saves (and so refreshes this TTL) every time its owner's
// reminders sync while notifications are on. If a browser/device is gone for
// 90 days straight (uninstalled, never reopened), the record expires on its
// own instead of accumulating forever; the existing self-heal in
// listSubscriptions() then prunes the now-orphaned index entry the next time
// the cron runs.
const SUBSCRIPTION_TTL_SECONDS = 60 * 60 * 24 * 90;

const memoryStore = new Map();

function getUpstashConfig() {
  const url = (process.env.UPSTASH_REDIS_REST_URL || process.env.UPSTASH_REDIS_REST_KV_REST_API_URL)?.trim();
  const token = (process.env.UPSTASH_REDIS_REST_TOKEN || process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN)?.trim();
  if (!url || !token) return null;
  return { url: url.replace(/\/$/, ""), token };
}

function hashEndpoint(endpoint) {
  return crypto.createHash("sha256").update(endpoint).digest("hex").slice(0, 32);
}

async function upstashPipeline(config, commands) {
  const response = await fetch(`${config.url}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
  });
  if (!response.ok) throw new Error(`Upstash pipeline failed: ${response.status}`);
  const payload = await response.json();
  if (!Array.isArray(payload)) throw new Error("Invalid Upstash pipeline payload.");
  return payload;
}

function recordKey(hash) {
  return `${RECORD_PREFIX}${hash}`;
}

function mergeNotified(previousNotified, reminders) {
  const notified = {};
  const reminderById = new Map(reminders.map((reminder) => [reminder.id, reminder]));
  for (const [reminderId, entry] of Object.entries(previousNotified || {})) {
    const reminder = reminderById.get(reminderId);
    if (reminder && entry && entry.dueDate === reminder.dueDate) {
      notified[reminderId] = entry;
    }
  }
  return notified;
}

async function saveSubscription({ endpoint, subscription, reminders }) {
  const hash = hashEndpoint(endpoint);
  const upstash = getUpstashConfig();
  const previous = await getSubscriptionByHash(hash);
  const notified = mergeNotified(previous?.notified, reminders);
  const record = { subscription, reminders, notified, updatedAt: new Date().toISOString() };
  const serialized = JSON.stringify(record);

  if (!upstash) {
    memoryStore.set(hash, record);
    return { hash, store: "memory" };
  }

  await upstashPipeline(upstash, [
    ["SET", recordKey(hash), serialized],
    ["EXPIRE", recordKey(hash), SUBSCRIPTION_TTL_SECONDS],
    ["SADD", SUBSCRIPTIONS_INDEX_KEY, hash],
  ]);
  return { hash, store: "upstash" };
}

async function getSubscriptionByHash(hash) {
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

async function updateNotified(hash, notified) {
  const upstash = getUpstashConfig();
  const existing = await getSubscriptionByHash(hash);
  if (!existing) return;
  const record = { ...existing, notified };

  if (!upstash) {
    memoryStore.set(hash, record);
    return;
  }

  await upstashPipeline(upstash, [
    ["SET", recordKey(hash), JSON.stringify(record)],
    ["EXPIRE", recordKey(hash), SUBSCRIPTION_TTL_SECONDS],
  ]);
}

async function removeSubscriptionByEndpoint(endpoint) {
  const hash = hashEndpoint(endpoint);
  await removeSubscriptionByHash(hash);
}

async function removeSubscriptionByHash(hash) {
  const upstash = getUpstashConfig();
  if (!upstash) {
    memoryStore.delete(hash);
    return;
  }

  await upstashPipeline(upstash, [
    ["DEL", recordKey(hash)],
    ["SREM", SUBSCRIPTIONS_INDEX_KEY, hash],
  ]);
}

async function listSubscriptions() {
  const upstash = getUpstashConfig();
  if (!upstash) {
    return [...memoryStore.entries()].map(([hash, record]) => ({ hash, ...record }));
  }

  const membersResponse = await fetch(`${upstash.url}/smembers/${SUBSCRIPTIONS_INDEX_KEY}`, {
    headers: { Authorization: `Bearer ${upstash.token}` },
  });
  if (!membersResponse.ok) throw new Error(`Upstash smembers failed: ${membersResponse.status}`);
  const membersPayload = await membersResponse.json();
  const hashes = Array.isArray(membersPayload.result) ? membersPayload.result : [];

  const records = [];
  for (const hash of hashes) {
    const record = await getSubscriptionByHash(hash);
    if (record) records.push({ hash, ...record });
    else await removeSubscriptionByHash(hash);
  }
  return records;
}

module.exports = {
  hashEndpoint,
  saveSubscription,
  getSubscriptionByHash,
  updateNotified,
  removeSubscriptionByEndpoint,
  removeSubscriptionByHash,
  listSubscriptions,
  getUpstashConfig,
};
