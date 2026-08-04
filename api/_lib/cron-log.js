const RECORD_KEY = "eksperiq:cron:check-reminders:last-run";
// Keep a rolling log of runs so a stuck/silently-broken cron is visible
// (checked, sent, removed counts + any error) without needing to grep logs.
const LOG_TTL_SECONDS = 60 * 60 * 24 * 30;

const memoryStore = { lastRun: null };

function getUpstashConfig() {
  const url = (process.env.UPSTASH_REDIS_REST_URL || process.env.UPSTASH_REDIS_REST_KV_REST_API_URL)?.trim();
  const token = (process.env.UPSTASH_REDIS_REST_TOKEN || process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN)?.trim();
  if (!url || !token) return null;
  return { url: url.replace(/\/$/, ""), token };
}

async function upstashPipeline(config, commands) {
  const response = await fetch(`${config.url}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${config.token}`, "Content-Type": "application/json" },
    body: JSON.stringify(commands),
  });
  if (!response.ok) throw new Error(`Upstash pipeline failed: ${response.status}`);
  return response.json();
}

/**
 * Records the outcome of a cron run: timestamp, success/failure, and the
 * checked/sent/removed counts. Best-effort — a logging failure must never
 * fail the cron run itself, so callers should not await this on the
 * response path in a way that blocks returning a result to Vercel.
 */
async function recordCronRun(entry) {
  const record = { ...entry, recordedAt: new Date().toISOString() };
  const config = getUpstashConfig();
  if (!config) {
    memoryStore.lastRun = record;
    return;
  }
  try {
    await upstashPipeline(config, [
      ["SET", RECORD_KEY, JSON.stringify(record)],
      ["EXPIRE", RECORD_KEY, LOG_TTL_SECONDS],
    ]);
  } catch {
    // Logging is best-effort; the cron result itself already went to the caller.
  }
}

async function getLastCronRun() {
  const config = getUpstashConfig();
  if (!config) return memoryStore.lastRun;
  try {
    const response = await fetch(`${config.url}/get/${RECORD_KEY}`, {
      headers: { Authorization: `Bearer ${config.token}` },
    });
    if (!response.ok) return null;
    const payload = await response.json();
    if (!payload || typeof payload.result !== "string") return null;
    return JSON.parse(payload.result);
  } catch {
    return null;
  }
}

module.exports = { recordCronRun, getLastCronRun };
