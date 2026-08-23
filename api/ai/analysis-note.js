const { checkRateLimit } = require("../_lib/rate-limit.js");
const { callOpenRouterChatCompletions, hedgeCertainLanguage } = require("../_lib/openrouter.js");
const { applyCorsHeaders, handlePreflight } = require("../_lib/cors.js");

// "openrouter/free" rastgele bir ücretsiz modele yönlendirir; bunların arasında
// nvidia/nemotron-3.5-content-safety:free gibi sohbet için uygun olmayan
// moderasyon/güvenlik modelleri de var ve bunlar anlamsız çıktı üretebiliyor
// (örn. "User Safety: safe"). Bunun yerine güvenilir, isimli bir ücretsiz model kullan.
//
// "openai/gpt-oss-20b:free" (the previous default) does NOT exist in
// OpenRouter's real /models catalog — verified directly, only
// "openai/gpt-oss-20b" (no ":free") is real, and that's a paid model. This
// endpoint had no fallback at all, so every request 404'd unconditionally.
// Same root cause and fix as listing-import.js's identical bug.
const DEFAULT_MODEL_CANDIDATES = ["google/gemma-4-26b-a4b-it:free", "google/gemma-4-31b-it:free"];
const PAID_FALLBACK_MODEL = "openai/gpt-5-nano";
// Confirmed live (2026-08-23): Vercel's own OPENROUTER_MODEL env var is set
// to this exact nonexistent ID. Filtered out here too so it can never be
// used regardless of what's set in Vercel — see listing-import.js's
// identical constant for the full story.
const KNOWN_INVALID_MODELS = new Set(["openai/gpt-oss-20b:free"]);
const DEFAULT_AI_DAILY_LIMIT = 20;
const DEFAULT_AI_DAILY_LIMIT_PER_INSTALL = 8;
const DEFAULT_BURST_LIMIT = 5;
const DEFAULT_BURST_WINDOW_SECONDS = 60;
const productionUrl = "https://eksperiq.vercel.app";
const appName = "EksperIQ";

function sendJson(response, statusCode, body) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(body));
}

async function readJsonBody(request) {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw.trim()) return null;
  return JSON.parse(raw);
}

function parsePositiveInt(value, fallback) {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function isFeatureEnabled() {
  return process.env.NEXT_PUBLIC_AI_ANALYSIS_NOTE_ENABLED === "true";
}

function isOpenRouterConfigured() {
  return Boolean(process.env.OPENROUTER_API_KEY?.trim());
}

function buildPrompt(input) {
  const findings = input.findings
    .slice(0, 6)
    .map((finding) => `${finding.severity.toUpperCase()} - ${finding.title}: ${finding.explanation}`)
    .join("\n");

  return `Araç: ${input.vehicleLabel}
Risk skoru: ${input.totalScore}/100
Sonuç: ${input.riskLabel}
Karar özeti: ${input.decision}

Öne çıkan bulgular:
${findings}

Kullanıcıya Türkçe, kısa, kesin hüküm vermeyen ve profesyonel ekspertizin yerine geçmediğini belirten bir karar destek notu yaz.`;
}

function isRecord(value) {
  return typeof value === "object" && value !== null;
}

function isBoundedString(value, min, max) {
  return typeof value === "string" && value.trim().length >= min && value.trim().length <= max;
}

function parseAnalysisNoteInput(value) {
  if (!isRecord(value)) return null;
  if (value.aiProviderConsent !== true) return null;
  if (!isBoundedString(value.vehicleLabel, 3, 120)) return null;
  const totalScore = value.totalScore;
  if (typeof totalScore !== "number" || !Number.isInteger(totalScore) || totalScore < 0 || totalScore > 100) {
    return null;
  }
  if (!isBoundedString(value.riskLabel, 2, 80)) return null;
  if (!isBoundedString(value.decision, 2, 160)) return null;
  if (!Array.isArray(value.findings) || value.findings.length < 1 || value.findings.length > 6) return null;

  const findings = value.findings.map((finding) => {
    if (!isRecord(finding)) return null;
    if (!isBoundedString(finding.severity, 2, 20)) return null;
    if (!isBoundedString(finding.title, 2, 160)) return null;
    if (!isBoundedString(finding.explanation, 2, 500)) return null;
    return {
      severity: finding.severity.trim(),
      title: finding.title.trim(),
      explanation: finding.explanation.trim(),
    };
  });

  if (findings.some((finding) => finding === null)) return null;

  return {
    vehicleLabel: value.vehicleLabel.trim(),
    totalScore,
    riskLabel: value.riskLabel.trim(),
    decision: value.decision.trim(),
    findings,
  };
}

function extractAssistantContent(payload) {
  if (!isRecord(payload)) return null;
  const choices = payload.choices;
  if (!Array.isArray(choices)) return null;
  const firstChoice = choices[0];
  if (!isRecord(firstChoice)) return null;
  const message = firstChoice.message;
  if (!isRecord(message)) return null;
  const content = message.content;
  return typeof content === "string" && content.trim().length > 0 ? content : null;
}

// Same ordering rationale as listing-import.js's resolveListingImportModelCandidates.
function resolveAnalysisNoteModelCandidates() {
  const candidates = [];
  const configuredPrimary = process.env.OPENROUTER_MODEL?.trim();
  if (configuredPrimary) candidates.push(configuredPrimary);
  candidates.push(...DEFAULT_MODEL_CANDIDATES);
  if (process.env.OPENROUTER_DISABLE_PAID_NOTE_FALLBACK !== "true") {
    candidates.push(PAID_FALLBACK_MODEL);
  }
  return [...new Set(candidates)].filter((model) => !KNOWN_INVALID_MODELS.has(model));
}

async function createAnalysisNote(input) {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) return { error: "OPENROUTER_API_KEY tanımlı değil; kural tabanlı analiz kullanılmalı." };

  const messages = [
    {
      role: "system",
      content:
        "Sen EksperIQ için çalışan dikkatli bir ikinci el araç karar destek asistanısın. Kesin ekspertiz, hasarsızlık veya satın alma garantisi verme. Yanıtı sadece Türkçe yaz; başka bir dilden tek kelime bile karıştırma.",
    },
    {
      role: "user",
      content: buildPrompt(input),
    },
  ];

  let lastError = "OpenRouter yanıtı alınamadı.";
  for (const model of resolveAnalysisNoteModelCandidates()) {
    const result = await callOpenRouterChatCompletions({
      apiKey,
      model,
      messages,
      temperature: 0.2,
      // PAID_FALLBACK_MODEL (gpt-5-nano) needs a much bigger budget than the
      // free models — same fix as listing-import.js and photo-damage.js:
      // it's a reasoning model by default and spends hidden reasoning
      // tokens out of this same max_tokens budget before any visible
      // output, so a tight budget tuned for a short free-model note leaves
      // it with content: null. Real cost stays negligible even at 6000.
      maxTokens: model === PAID_FALLBACK_MODEL ? 6000 : 700,
      refererUrl: productionUrl,
      appName,
    });
    if (!result.ok) {
      console.warn("[analysis-note] model attempt failed:", JSON.stringify({ model, error: result.error }));
      lastError = result.error;
      continue;
    }
    const note = extractAssistantContent(result.payload);
    if (!note) {
      lastError = "OpenRouter yanıtında okunabilir içerik bulunamadı.";
      continue;
    }
    return { note: hedgeCertainLanguage(note), model };
  }
  return { error: lastError };
}

async function handler(request, response) {
  applyCorsHeaders(request, response);
  if (handlePreflight(request, response)) return;

  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    sendJson(response, 405, { error: "Yalnızca POST desteklenir." });
    return;
  }

  const dailyLimit = parsePositiveInt(process.env.OPENROUTER_DAILY_REQUEST_LIMIT, DEFAULT_AI_DAILY_LIMIT);

  if (!isFeatureEnabled()) {
    sendJson(response, 429, {
      error: "AI karar destek notu şu anda kapalı.",
      remaining: dailyLimit,
    });
    return;
  }

  if (!isOpenRouterConfigured()) {
    sendJson(response, 429, {
      error: "OpenRouter key tanımlı değil.",
      remaining: dailyLimit,
    });
    return;
  }

  let body;
  try {
    body = await readJsonBody(request);
  } catch {
    sendJson(response, 400, { error: "Geçerli JSON gövdesi gönderilmelidir." });
    return;
  }

  const parsed = parseAnalysisNoteInput(body);
  if (!parsed) {
    sendJson(response, 400, { error: "AI notu için gönderilen veri geçerli değil." });
    return;
  }

  const rateLimit = await checkRateLimit(request, {
    usageKey: "analysis-note",
    burstLimit: parsePositiveInt(process.env.AI_BURST_LIMIT, DEFAULT_BURST_LIMIT),
    burstWindowSeconds: parsePositiveInt(process.env.AI_BURST_WINDOW_SECONDS, DEFAULT_BURST_WINDOW_SECONDS),
    dailyLimitPerIdentity: parsePositiveInt(
      process.env.AI_NOTE_DAILY_LIMIT_PER_INSTALL,
      DEFAULT_AI_DAILY_LIMIT_PER_INSTALL,
    ),
    globalDailyLimit: dailyLimit,
  });

  if (!rateLimit.ok) {
    if (rateLimit.reason === "unavailable") {
      sendJson(response, 503, {
        error: "AI kullanım limiti şu anda doğrulanamadı. Kural tabanlı raporu kullanabilirsiniz.",
      });
      return;
    }
    if (rateLimit.reason === "burst") {
      sendJson(response, 429, { error: "Çok hızlı istek gönderildi. Birazdan tekrar deneyin.", remaining: 0 });
      return;
    }
    sendJson(response, 429, {
      error: "Günlük AI deneme limiti doldu.",
      remaining: 0,
    });
    return;
  }

  const aiResult = await createAnalysisNote(parsed);
  if ("error" in aiResult) {
    console.error("[analysis-note] OpenRouter call failed:", aiResult.error);
    sendJson(response, 502, { error: aiResult.error });
    return;
  }

  sendJson(response, 200, {
    note: aiResult.note,
    model: aiResult.model,
    remaining: rateLimit.remaining,
  });
}

module.exports = handler;
module.exports.DEFAULT_MODEL_CANDIDATES = DEFAULT_MODEL_CANDIDATES;
module.exports.PAID_FALLBACK_MODEL = PAID_FALLBACK_MODEL;
