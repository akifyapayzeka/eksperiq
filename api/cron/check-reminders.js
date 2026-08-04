const webPush = require("web-push");
const { listSubscriptions, updateNotified, removeSubscriptionByHash } = require("../_lib/push-store");
const { recordCronRun } = require("../_lib/cron-log");

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

/**
 * Fail-closed: with no CRON_SECRET configured, every request is rejected —
 * never authorized. This endpoint sends real push notifications to real
 * subscribers, so an unauthenticated public trigger (the previous behavior
 * when the secret was unset) is a real abuse/spam vector, not a convenience.
 */
function isAuthorized(request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const header = request.headers.authorization || "";
  return header === `Bearer ${secret}`;
}

function isVapidConfigured() {
  return Boolean(
    (process.env.VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY)?.trim() &&
    process.env.VAPID_PRIVATE_KEY?.trim(),
  );
}

function nextThresholdToNotify(reminder, days, notified) {
  const alreadyNotified = notified[reminder.id];
  // Recurring reminders keep the same id across cycles but get a new dueDate
  // each time advanceIfPast() rolls them forward — thresholds from a past
  // cycle must not suppress notifications for the current one.
  const relevantThresholds = alreadyNotified?.dueDate === reminder.dueDate ? alreadyNotified.thresholds || [] : [];
  const threshold = NOTIFICATION_THRESHOLDS.find(
    (candidate) => days === candidate && !relevantThresholds.includes(candidate),
  );
  return { threshold, relevantThresholds };
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
    (process.env.VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY).trim(),
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
    await recordCronRun({ success: false, error: "Bildirim kayıtları okunamadı." });
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

      const { threshold: matchedThreshold, relevantThresholds } = nextThresholdToNotify(reminder, days, notified);
      if (matchedThreshold === undefined) continue;

      if (subscriptionGone) continue;

      try {
        const payload = buildNotificationPayload(reminder, days);
        await webPush.sendNotification(record.subscription, JSON.stringify(payload));
        sent += 1;
        notified[reminder.id] = {
          dueDate: reminder.dueDate,
          thresholds: [...relevantThresholds, matchedThreshold],
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

  await recordCronRun({ success: true, checked, sent, removed, subscriptions: records.length });
  sendJson(response, 200, { checked, sent, removed, subscriptions: records.length });
}

module.exports = handler;
module.exports.daysUntil = daysUntil;
module.exports.buildNotificationPayload = buildNotificationPayload;
module.exports.isAuthorized = isAuthorized;
module.exports.NOTIFICATION_THRESHOLDS = NOTIFICATION_THRESHOLDS;
module.exports.nextThresholdToNotify = nextThresholdToNotify;
