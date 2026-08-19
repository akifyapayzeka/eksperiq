const { checkRateLimit } = require("../_lib/rate-limit.js");
const { applyCorsHeaders, handlePreflight } = require("../_lib/cors.js");

// Temporary diagnostic-only endpoint: a user reports the listing-link
// import getting stuck with no server-side trace at all in api/ai/listing-import
// (see that endpoint's own logs — nothing arrives there), and there is no
// way to get real device console logs (no Mac/Xcode access) to see where
// it actually stalls. Both the JS layer (src/lib/listing-import/import-listing.ts)
// and the native Swift plugin (EksperIQListingFetchPlugin.swift) fire a
// small, best-effort, fire-and-forget ping to this endpoint at each stage
// boundary — checking whichever pings did or didn't show up in Vercel's
// logs is the closest substitute available for a device console right now.
// Safe to delete once the listing-import hang is root-caused and fixed.

const ALLOWED_STEPS = new Set([
  "js-start",
  "js-native-confirmed",
  "js-before-add-listener",
  "js-after-add-listener",
  "js-add-listener-timed-out",
  "js-before-fetch",
  "js-after-fetch-ok",
  "js-after-fetch-error",
  "js-client-timeout",
  "swift-task-started",
  "swift-opening-page",
  "swift-page-fetched",
  "swift-normalizing",
  "swift-done",
  "swift-error",
]);

function sendJson(response, statusCode, body) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(body));
}

async function readJsonBody(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw.trim()) return null;
  return JSON.parse(raw);
}

function isBoundedString(value, min, max) {
  return typeof value === "string" && value.trim().length >= min && value.trim().length <= max;
}

async function handler(request, response) {
  applyCorsHeaders(request, response);
  if (handlePreflight(request, response)) return;

  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    sendJson(response, 405, { error: "Yalnızca POST desteklenir." });
    return;
  }

  let body;
  try {
    body = await readJsonBody(request);
  } catch {
    sendJson(response, 400, { error: "Geçerli JSON gövdesi gönderilmelidir." });
    return;
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !ALLOWED_STEPS.has(body.step) ||
    (body.detail !== undefined && !isBoundedString(body.detail, 0, 300))
  ) {
    sendJson(response, 400, { error: "Geçersiz iz kaydı." });
    return;
  }

  // Generous limits — this only ever fires a handful of times per real
  // import attempt from a small number of testers, not real traffic. Only
  // reject on an actual abuse signal; if the rate limiter itself is
  // unavailable (e.g. Upstash env vars unset), still log — this is a
  // diagnostic tool, not something worth losing signal over.
  const rateLimit = await checkRateLimit(request, {
    usageKey: "listing-import-trace",
    burstLimit: 30,
    burstWindowSeconds: 60,
    dailyLimitPerIdentity: 500,
    globalDailyLimit: 5000,
  });
  if (!rateLimit.ok && rateLimit.reason !== "unavailable") {
    sendJson(response, 429, { error: "Çok fazla iz kaydı." });
    return;
  }

  console.log("[listing-import-trace]", JSON.stringify({ step: body.step, detail: body.detail ?? null, ts: Date.now() }));
  response.statusCode = 204;
  response.end();
}

module.exports = handler;
