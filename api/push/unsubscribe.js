const { removeSubscriptionByEndpoint } = require("../_lib/push-store");

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

async function handler(request, response) {
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

  if (!isRecord(body) || typeof body.endpoint !== "string" || !body.endpoint.trim()) {
    sendJson(response, 400, { error: "Geçerli bir endpoint gönderilmelidir." });
    return;
  }

  try {
    await removeSubscriptionByEndpoint(body.endpoint.trim());
  } catch {
    sendJson(response, 503, { error: "Bildirim kaydı şu anda silinemedi." });
    return;
  }

  sendJson(response, 200, { ok: true });
}

module.exports = handler;
