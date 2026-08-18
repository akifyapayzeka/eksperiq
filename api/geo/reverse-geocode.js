const { checkRateLimit } = require("../_lib/rate-limit.js");
const { applyCorsHeaders, handlePreflight } = require("../_lib/cors.js");

// OpenStreetMap Nominatim's usage policy requires a small volume and an
// identifying User-Agent (https://operations.osmfoundation.org/policies/nominatim/).
// This is a low-value, low-cost lookup (no AI token cost), so the daily caps
// here are generous compared to the AI endpoints — the point is protecting
// Nominatim from abuse, not our own bill.
const DEFAULT_DAILY_LIMIT = 200;
const DEFAULT_DAILY_LIMIT_PER_INSTALL = 40;
const DEFAULT_BURST_LIMIT = 5;
const DEFAULT_BURST_WINDOW_SECONDS = 60;
const productionUrl = "https://eksperiq.vercel.app";

function sendJson(response, statusCode, body) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(body));
}

function parsePositiveInt(value, fallback) {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseCoordinate(value, min, max) {
  const parsed = Number.parseFloat(String(value ?? ""));
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) return null;
  return parsed;
}

async function handler(request, response) {
  applyCorsHeaders(request, response);
  if (handlePreflight(request, response)) return;

  if (request.method !== "GET") {
    sendJson(response, 405, { error: "Yalnızca GET desteklenir." });
    return;
  }

  const url = new URL(request.url, "http://localhost");
  const lat = parseCoordinate(url.searchParams.get("lat"), -90, 90);
  const lon = parseCoordinate(url.searchParams.get("lon"), -180, 180);
  if (lat === null || lon === null) {
    sendJson(response, 400, { error: "Geçerli bir konum (lat, lon) gönderin." });
    return;
  }

  const rateLimit = await checkRateLimit(request, {
    usageKey: "reverse-geocode",
    burstLimit: parsePositiveInt(process.env.GEO_BURST_LIMIT, DEFAULT_BURST_LIMIT),
    burstWindowSeconds: parsePositiveInt(process.env.GEO_BURST_WINDOW_SECONDS, DEFAULT_BURST_WINDOW_SECONDS),
    dailyLimitPerIdentity: parsePositiveInt(process.env.GEO_DAILY_LIMIT_PER_INSTALL, DEFAULT_DAILY_LIMIT_PER_INSTALL),
    globalDailyLimit: parsePositiveInt(process.env.GEO_DAILY_REQUEST_LIMIT, DEFAULT_DAILY_LIMIT),
  });

  if (!rateLimit.ok) {
    if (rateLimit.reason === "unavailable") {
      sendJson(response, 503, { error: "Konum servisi şu anda doğrulanamadı." });
      return;
    }
    sendJson(response, 429, { error: "Çok fazla konum isteği gönderildi. Birazdan tekrar deneyin." });
    return;
  }

  try {
    const nominatimUrl = new URL("https://nominatim.openstreetmap.org/reverse");
    nominatimUrl.searchParams.set("format", "jsonv2");
    nominatimUrl.searchParams.set("lat", String(lat));
    nominatimUrl.searchParams.set("lon", String(lon));
    nominatimUrl.searchParams.set("zoom", "8");
    nominatimUrl.searchParams.set("addressdetails", "1");
    nominatimUrl.searchParams.set("accept-language", "tr");

    const geoResponse = await fetch(nominatimUrl, {
      headers: { "User-Agent": `EksperIQ/1 (${productionUrl})` },
      signal: AbortSignal.timeout(8000),
    });

    if (!geoResponse.ok) {
      sendJson(response, 502, { error: "Konumunuz şehre çevrilemedi." });
      return;
    }

    const payload = await geoResponse.json();
    const address = payload?.address ?? {};
    const city = address.province || address.city || address.state || null;

    sendJson(response, 200, { city });
  } catch {
    sendJson(response, 502, { error: "Konumunuz şehre çevrilemedi." });
  }
}

module.exports = handler;
