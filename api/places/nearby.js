const { checkRateLimit } = require("../_lib/rate-limit.js");
const { applyCorsHeaders, handlePreflight } = require("../_lib/cors.js");

// Google Places API (legacy Text Search + Place Details) — real business
// name/address/phone/location for "aracı alırken nereye ekspertiz/noter/
// bakıma sokarım" logistics. Deliberately never returns a price: no map or
// places API publishes real per-firm pricing, and fabricating one would be
// dishonest data presented as fact (see the propose-then-approve decision
// with the app owner). Fails closed (503) without a real API key — never
// silently returns fake results.
const CATEGORY_QUERIES = {
  ekspertiz: "araç ekspertiz",
  noter: "noter",
  servis: "oto servis bakım",
};

const DEFAULT_DAILY_LIMIT = 120;
const DEFAULT_DAILY_LIMIT_PER_INSTALL = 8;
const DEFAULT_BURST_LIMIT = 4;
const DEFAULT_BURST_WINDOW_SECONDS = 60;
const SEARCH_RADIUS_METERS = 12000;
const MAX_RESULTS = 5;

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

function getApiKey() {
  return process.env.GOOGLE_PLACES_API_KEY?.trim() || null;
}

/** Haversine distance in km — used to sort and cap results to the truly nearest ones. */
function distanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function fetchTextSearch(apiKey, query, lat, lon) {
  const url = new URL("https://maps.googleapis.com/maps/api/place/textsearch/json");
  url.searchParams.set("query", query);
  url.searchParams.set("location", `${lat},${lon}`);
  url.searchParams.set("radius", String(SEARCH_RADIUS_METERS));
  url.searchParams.set("language", "tr");
  url.searchParams.set("region", "tr");
  url.searchParams.set("key", apiKey);

  const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error("text-search-http-error");
  const payload = await response.json();
  if (payload.status !== "OK" && payload.status !== "ZERO_RESULTS") {
    throw new Error(`text-search-status-${payload.status}`);
  }
  return Array.isArray(payload.results) ? payload.results : [];
}

async function fetchPhone(apiKey, placeId) {
  const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  url.searchParams.set("place_id", placeId);
  url.searchParams.set("fields", "formatted_phone_number");
  url.searchParams.set("language", "tr");
  url.searchParams.set("key", apiKey);

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!response.ok) return null;
    const payload = await response.json();
    return payload?.result?.formatted_phone_number || null;
  } catch {
    return null;
  }
}

async function handler(request, response) {
  applyCorsHeaders(request, response);
  if (handlePreflight(request, response)) return;

  if (request.method !== "GET") {
    sendJson(response, 405, { error: "Yalnızca GET desteklenir." });
    return;
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    sendJson(response, 503, { error: "Yakındaki hizmet arama şu anda yapılandırılı değil." });
    return;
  }

  const url = new URL(request.url, "http://localhost");
  const lat = parseCoordinate(url.searchParams.get("lat"), -90, 90);
  const lon = parseCoordinate(url.searchParams.get("lon"), -180, 180);
  const category = url.searchParams.get("category");

  if (lat === null || lon === null) {
    sendJson(response, 400, { error: "Geçerli bir konum (lat, lon) gönderin." });
    return;
  }
  if (!Object.prototype.hasOwnProperty.call(CATEGORY_QUERIES, category)) {
    sendJson(response, 400, { error: "Geçersiz kategori." });
    return;
  }

  const rateLimit = await checkRateLimit(request, {
    usageKey: "places-nearby",
    burstLimit: parsePositiveInt(process.env.PLACES_BURST_LIMIT, DEFAULT_BURST_LIMIT),
    burstWindowSeconds: parsePositiveInt(process.env.PLACES_BURST_WINDOW_SECONDS, DEFAULT_BURST_WINDOW_SECONDS),
    dailyLimitPerIdentity: parsePositiveInt(
      process.env.PLACES_DAILY_LIMIT_PER_INSTALL,
      DEFAULT_DAILY_LIMIT_PER_INSTALL,
    ),
    globalDailyLimit: parsePositiveInt(process.env.PLACES_DAILY_REQUEST_LIMIT, DEFAULT_DAILY_LIMIT),
  });

  if (!rateLimit.ok) {
    if (rateLimit.reason === "unavailable") {
      sendJson(response, 503, { error: "Yakındaki hizmet arama şu anda doğrulanamadı." });
      return;
    }
    sendJson(response, 429, { error: "Çok fazla arama isteği gönderildi. Birazdan tekrar deneyin." });
    return;
  }

  try {
    const results = await fetchTextSearch(apiKey, CATEGORY_QUERIES[category], lat, lon);

    const withDistance = results
      .map((item) => {
        const placeLat = item.geometry?.location?.lat;
        const placeLon = item.geometry?.location?.lng;
        if (typeof placeLat !== "number" || typeof placeLon !== "number") return null;
        return {
          placeId: item.place_id,
          name: item.name,
          address: item.formatted_address || "",
          lat: placeLat,
          lng: placeLon,
          distanceKm: distanceKm(lat, lon, placeLat, placeLon),
        };
      })
      .filter((item) => item !== null)
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, MAX_RESULTS);

    const places = await Promise.all(
      withDistance.map(async (item) => ({
        id: item.placeId,
        name: item.name,
        address: item.address,
        phone: await fetchPhone(apiKey, item.placeId),
        lat: item.lat,
        lng: item.lng,
        distanceKm: Math.round(item.distanceKm * 10) / 10,
      })),
    );

    sendJson(response, 200, { places });
  } catch {
    sendJson(response, 502, { error: "Yakındaki hizmetler şu anda getirilemedi." });
  }
}

module.exports = handler;
