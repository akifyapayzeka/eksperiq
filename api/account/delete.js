const { createClient } = require("@supabase/supabase-js");
const { applyCorsHeaders, handlePreflight } = require("../_lib/cors.js");

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

function isRecord(value) {
  return typeof value === "object" && value !== null;
}

/**
 * Same URL/service-role-key contract as src/lib/supabase/{config,server}.ts —
 * duplicated here (not imported) because api/*.js runs as plain CommonJS
 * Node, outside the Next.js build that compiles src/. The service role key
 * is read only from the server-only env var, never NEXT_PUBLIC_*, and never
 * reaches the client.
 */
function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !serviceRoleKey) return null;
  return createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
}

/**
 * Permanently deletes the caller's own Supabase Auth account (email/password
 * + first/last name — the only account data stored server-side; vehicle,
 * analysis, reminder etc. records all live on-device and are wiped by the
 * client separately, see src/lib/data-management/delete-all.ts).
 *
 * Fail-closed: refuses (503) if Supabase isn't configured, rather than
 * silently no-opping. The caller's identity is never taken from the request
 * body — it's derived only from a Supabase-issued access token that this
 * handler verifies server-side (auth.getUser), so one account can never
 * delete another by guessing/forging an id.
 */
async function handler(request, response) {
  applyCorsHeaders(request, response);
  if (handlePreflight(request, response)) return;

  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    sendJson(response, 405, { error: "Yalnızca POST desteklenir." });
    return;
  }

  const supabase = getServiceClient();
  if (!supabase) {
    sendJson(response, 503, { error: "Hesap silme şu anda kullanılamıyor." });
    return;
  }

  let body;
  try {
    body = await readJsonBody(request);
  } catch {
    sendJson(response, 400, { error: "Geçerli JSON gövdesi gönderilmelidir." });
    return;
  }

  if (!isRecord(body) || typeof body.accessToken !== "string" || !body.accessToken.trim()) {
    sendJson(response, 400, { error: "Geçerli bir oturum belirteci gönderilmelidir." });
    return;
  }

  const { data: userData, error: userError } = await supabase.auth.getUser(body.accessToken.trim());
  if (userError || !userData?.user?.id) {
    sendJson(response, 401, { error: "Oturum doğrulanamadı. Lütfen tekrar giriş yapıp tekrar deneyin." });
    return;
  }

  const { error: deleteError } = await supabase.auth.admin.deleteUser(userData.user.id);
  if (deleteError) {
    sendJson(response, 502, { error: "Hesap silinemedi. Lütfen daha sonra tekrar deneyin." });
    return;
  }

  sendJson(response, 200, { ok: true });
}

module.exports = handler;
