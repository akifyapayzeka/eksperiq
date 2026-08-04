// Native iOS requests genuinely leave https://eksperiq.vercel.app/api/... as
// a *cross-origin* request from the WKWebView's perspective — Capacitor's
// default iOS scheme (no server.iosScheme override in capacitor.config.ts)
// makes the app's own origin "capacitor://localhost", not the API's origin.
// Without these headers, resolving the URL correctly (src/lib/api/client.ts)
// is not enough: the browser engine blocks the response before the app's JS
// ever sees it. The web/PWA build never needs this — it calls the API
// same-origin, where these headers are inert.
const ALLOWED_ORIGINS = new Set([
  "capacitor://localhost", // Capacitor's default iOS scheme + host
]);

function applyCorsHeaders(request, response) {
  const origin = request.headers?.origin;
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    response.setHeader("Access-Control-Allow-Origin", origin);
    response.setHeader("Vary", "Origin");
  }
  response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type, X-EksperIQ-Install-Id");
}

/** Returns true if the request was a handled CORS preflight (caller must return immediately). */
function handlePreflight(request, response) {
  if (request.method !== "OPTIONS") return false;
  response.statusCode = 204;
  response.end();
  return true;
}

module.exports = { applyCorsHeaders, handlePreflight, ALLOWED_ORIGINS };
