const crypto = require("node:crypto");

// A little over a day so a request right at the UTC day boundary still sees
// an accurate "used today" count instead of the key expiring mid-comparison.
const DAILY_TTL_SECONDS = 60 * 60 * 26;

function getUpstashConfig() {
  const url = (process.env.UPSTASH_REDIS_REST_URL || process.env.UPSTASH_REDIS_REST_KV_REST_API_URL)?.trim();
  const token = (process.env.UPSTASH_REDIS_REST_TOKEN || process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN)?.trim();
  if (!url || !token) return null;
  return { url: url.replace(/\/$/, ""), token };
}

function getTodayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function hmacIdentity(secret, value) {
  return crypto.createHmac("sha256", secret).update(value).digest("hex").slice(0, 32);
}

/** Vercel puts the client IP first in x-forwarded-for; anything after it is proxy hops. */
function getClientIp(request) {
  const forwarded = request.headers?.["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) return forwarded.split(",")[0].trim();
  const real = request.headers?.["x-real-ip"];
  if (typeof real === "string" && real.trim()) return real.trim();
  return request.socket?.remoteAddress || "unknown";
}

/** Anonymous, client-generated install id (see src/lib/api/install-id.ts) — never a real user identity. */
function getInstallId(request) {
  const header = request.headers?.["x-eksperiq-install-id"];
  if (typeof header === "string" && header.trim() && header.trim().length <= 100) return header.trim();
  return null;
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

function parseCount(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

/**
 * Layered, persistent (Upstash-backed) rate limiting for AI endpoints.
 * Replaces the old per-process in-memory counters, which reset on every cold
 * start and (for photo-damage) were never keyed by caller at all — one
 * global counter shared by every user.
 *
 * Layers, cheapest/most-specific first, so one abusive caller can't exhaust
 * a budget meant for everyone before we even look at it:
 *   1. burst  — short window per identity, stops rapid-fire scripted abuse
 *   2. daily  — per-identity daily cap
 *   3. global — whole-app daily budget, protects the OpenRouter bill regardless of identity
 *
 * The identity is the caller's install id if the client sent one, else their
 * IP — either way it is HMAC-SHA256'd with a server-only secret before ever
 * touching Redis, so no raw IP or install id is ever stored.
 *
 * Fails CLOSED: if Upstash or the hash secret isn't configured, or Upstash is
 * unreachable, the call is rejected (reason: "unavailable") rather than
 * silently allowed through with no limit at all.
 */
async function checkRateLimit(request, options) {
  const config = getUpstashConfig();
  const hashSecret = process.env.RATE_LIMIT_HASH_SECRET?.trim();
  if (!config || !hashSecret) return { ok: false, reason: "unavailable", remaining: 0 };

  const ip = getClientIp(request);
  const installId = getInstallId(request);
  const identity = installId ? `install:${installId}` : `ip:${ip}`;
  const identityHash = hmacIdentity(hashSecret, identity);
  const day = getTodayKey();

  const burstKey = `eksperiq:ratelimit:${options.usageKey}:burst:${identityHash}`;
  const dailyKey = `eksperiq:ratelimit:${options.usageKey}:daily:${identityHash}:${day}`;
  const globalKey = `eksperiq:ratelimit:${options.usageKey}:global:${day}`;

  try {
    const results = await upstashPipeline(config, [
      ["INCR", burstKey],
      ["EXPIRE", burstKey, options.burstWindowSeconds],
      ["INCR", dailyKey],
      ["EXPIRE", dailyKey, DAILY_TTL_SECONDS],
      ["INCR", globalKey],
      ["EXPIRE", globalKey, DAILY_TTL_SECONDS],
    ]);

    if (results.some((entry) => entry?.error)) throw new Error("Upstash rate limit command failed.");

    const burstCount = parseCount(results[0]?.result);
    const dailyCount = parseCount(results[2]?.result);
    const globalCount = parseCount(results[4]?.result);

    if (burstCount > options.burstLimit) return { ok: false, reason: "burst", remaining: 0 };
    if (dailyCount > options.dailyLimitPerIdentity) return { ok: false, reason: "daily", remaining: 0 };
    if (globalCount > options.globalDailyLimit) return { ok: false, reason: "global", remaining: 0 };

    return { ok: true, remaining: Math.max(options.globalDailyLimit - globalCount, 0) };
  } catch {
    return { ok: false, reason: "unavailable", remaining: 0 };
  }
}

module.exports = {
  checkRateLimit,
  getUpstashConfig,
  getClientIp,
  getInstallId,
};
