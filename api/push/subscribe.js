const { saveSubscription } = require("../_lib/push-store");

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

function isBoundedString(value, min, max) {
  return typeof value === "string" && value.trim().length >= min && value.trim().length <= max;
}

function parseSubscription(value) {
  if (!isRecord(value)) return null;
  if (!isBoundedString(value.endpoint, 10, 600)) return null;
  const keys = value.keys;
  if (!isRecord(keys)) return null;
  if (!isBoundedString(keys.p256dh, 10, 300) || !isBoundedString(keys.auth, 5, 300)) return null;
  return {
    endpoint: value.endpoint.trim(),
    keys: { p256dh: keys.p256dh.trim(), auth: keys.auth.trim() },
    expirationTime: typeof value.expirationTime === "number" ? value.expirationTime : null,
  };
}

function parseReminder(value) {
  if (!isRecord(value)) return null;
  if (!isBoundedString(value.id, 1, 80)) return null;
  if (!isBoundedString(value.title, 1, 120)) return null;
  if (!isBoundedString(value.dueDate, 8, 12)) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value.dueDate)) return null;
  const category = isBoundedString(value.category, 1, 40) ? value.category.trim() : "diger";
  const amount = typeof value.amount === "number" && Number.isFinite(value.amount) ? value.amount : undefined;
  return { id: value.id.trim(), title: value.title.trim(), dueDate: value.dueDate, category, amount };
}

function parseInput(value) {
  if (!isRecord(value)) return null;
  const subscription = parseSubscription(value.subscription);
  if (!subscription) return null;
  if (!Array.isArray(value.reminders) || value.reminders.length > 50) return null;
  const reminders = value.reminders.map(parseReminder);
  if (reminders.some((reminder) => reminder === null)) return null;
  return { subscription, reminders };
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

  const input = parseInput(body);
  if (!input) {
    sendJson(response, 400, { error: "Bildirim kaydı için gönderilen veri geçerli değil." });
    return;
  }

  try {
    await saveSubscription({
      endpoint: input.subscription.endpoint,
      subscription: input.subscription,
      reminders: input.reminders,
    });
  } catch {
    sendJson(response, 503, { error: "Bildirim kaydı şu anda saklanamadı, daha sonra tekrar deneyin." });
    return;
  }

  sendJson(response, 200, { ok: true });
}

module.exports = handler;
