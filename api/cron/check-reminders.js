const webPush = require("web-push");
const { listSubscriptions, updateNotified, removeSubscriptionByHash } = require("../_lib/push-store");

const NOTIFICATION_THRESHOLDS = [30, 15];

function sendJson(response, statusCode, body) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(body));
}

function daysUntil(dueDate, now) {
  const target = new Date(`${dueDate}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.round((startOfDay(target).getTime() - startOfDay(now).getTime()) / 86_400_000);
}

function isAuthorized(request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return true;
  const header = request.headers.authorization || "";
  return header === `Bearer ${secret}`;
}

function isVapidConfigured() {
  return Boolean(process.env.VAPID_PUBLIC_KEY?.trim() && process.env.VAPID_PRIVATE_KEY?.trim());
}

function buildNotificationPayload(reminder, days) {
  const daysLabel = days === 0 ? "bugün" : `${days} gün içinde`;
  const amountLabel = typeof reminder.amount === "number" ? ` (${reminder.amount.toLocaleString("tr-TR")} TL)` : "";
  return {
    title: "EksperIQ hatırlatma",
    body: `${reminder.title} ${daysLabel} son tarihine ulaşıyor${amountLabel}.`,
    url: "/bakim-odeme-takvimi",
  };
}

async function handler(request, response) {
  if (!isAuthorized(request)) {
    sendJson(response, 401, { error: "Yetkisiz." });
    return;
  }

  if (!isVapidConfigured()) {
    sendJson(response, 200, { skipped: true, reason: "VAPID anahtarları tanımlı değil." });
    return;
  }

  webPush.setVapidDetails(
    process.env.VAPID_SUBJECT?.trim() || "mailto:destek@eksperiq.vercel.app",
    process.env.VAPID_PUBLIC_KEY.trim(),
    process.env.VAPID_PRIVATE_KEY.trim(),
  );

  const now = new Date();
  let checked = 0;
  let sent = 0;
  let removed = 0;

  let records;
  try {
    records = await listSubscriptions();
  } catch {
    sendJson(response, 503, { error: "Bildirim kayıtları şu anda okunamadı." });
    return;
  }

  for (const record of records) {
    let subscriptionGone = false;
    const notified = { ...(record.notified || {}) };
    let notifiedChanged = false;

    for (const reminder of record.reminders || []) {
      checked += 1;
      const days = daysUntil(reminder.dueDate, now);
      if (days === null) continue;

      const alreadyNotified = notified[reminder.id];
      const matchedThreshold = NOTIFICATION_THRESHOLDS.find(
        (threshold) => days === threshold && !(alreadyNotified?.thresholds || []).includes(threshold),
      );
      if (matchedThreshold === undefined) continue;

      if (subscriptionGone) continue;

      try {
        const payload = buildNotificationPayload(reminder, days);
        await webPush.sendNotification(record.subscription, JSON.stringify(payload));
        sent += 1;
        notified[reminder.id] = {
          dueDate: reminder.dueDate,
          thresholds: [...(alreadyNotified?.thresholds || []), matchedThreshold],
        };
        notifiedChanged = true;
      } catch (error) {
        const statusCode = error && typeof error === "object" ? error.statusCode : null;
        if (statusCode === 404 || statusCode === 410) {
          subscriptionGone = true;
        }
      }
    }

    if (subscriptionGone) {
      await removeSubscriptionByHash(record.hash);
      removed += 1;
    } else if (notifiedChanged) {
      await updateNotified(record.hash, notified);
    }
  }

  sendJson(response, 200, { checked, sent, removed, subscriptions: records.length });
}

module.exports = handler;
module.exports.daysUntil = daysUntil;
module.exports.buildNotificationPayload = buildNotificationPayload;
module.exports.isAuthorized = isAuthorized;
module.exports.NOTIFICATION_THRESHOLDS = NOTIFICATION_THRESHOLDS;
