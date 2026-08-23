const { checkRateLimit } = require("../_lib/rate-limit.js");
const { callOpenRouterChatCompletions, hedgeCertainLanguage } = require("../_lib/openrouter.js");
const { applyCorsHeaders, handlePreflight } = require("../_lib/cors.js");

// Was a single model with no fallback at all — resolveVisionModel() blindly
// trusted any OPENROUTER_VISION_MODEL/OPENROUTER_MODEL env var ending in
// ":free", including Vercel's own OPENROUTER_MODEL which is set (confirmed
// live) to "openai/gpt-oss-20b:free", a model that does not exist in
// OpenRouter's real catalog — this endpoint was unconditionally broken
// whenever that env var was picked up. Now uses the same proven cascade as
// photo-damage.js/listing-import.js: named free models, then a paid last
// resort, with the known-bad ID filtered out regardless of env config.
const DEFAULT_MODEL_CANDIDATES = ["google/gemma-4-26b-a4b-it:free", "google/gemma-4-31b-it:free"];
const PAID_FALLBACK_MODEL = "openai/gpt-5-nano";
const KNOWN_INVALID_MODELS = new Set(["openai/gpt-oss-20b:free"]);
const DEFAULT_DAILY_LIMIT = 120;
const DEFAULT_DAILY_LIMIT_PER_INSTALL = 8;
const DEFAULT_BURST_LIMIT = 6;
const DEFAULT_BURST_WINDOW_SECONDS = 60;
const MAX_IMAGE_URLS = 12;
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
  for await (const chunk of request) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw.trim()) return null;
  return JSON.parse(raw);
}

function parsePositiveInt(value, fallback) {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function isRecord(value) {
  return typeof value === "object" && value !== null;
}

function parseImageUrl(value) {
  if (typeof value !== "string" || value.length > 1200) return null;
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return null;
  }
}

function parseInput(value) {
  if (!isRecord(value)) return { ok: false, reason: "invalid" };
  if (value.aiProviderConsent !== true) return { ok: false, reason: "missing-consent" };
  if (!Array.isArray(value.imageUrls) || value.imageUrls.length < 1) return { ok: false, reason: "invalid" };

  const imageUrls = value.imageUrls.slice(0, MAX_IMAGE_URLS).map(parseImageUrl);
  if (imageUrls.some((url) => url === null)) return { ok: false, reason: "invalid" };

  const context = isRecord(value.context) ? value.context : {};
  return {
    ok: true,
    input: {
      imageUrls,
      title: typeof context.title === "string" ? context.title.slice(0, 300) : "",
      sellerDescription:
        typeof context.sellerDescription === "string" ? context.sellerDescription.slice(0, 1600) : "",
    },
  };
}

function extractText(payload) {
  if (!isRecord(payload)) return null;
  const choices = payload.choices;
  if (!Array.isArray(choices)) return null;
  const firstChoice = choices[0];
  if (!isRecord(firstChoice)) return null;
  const message = firstChoice.message;
  if (!isRecord(message)) return null;
  const content = message.content;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => (isRecord(part) && typeof part.text === "string" ? part.text : ""))
      .join("")
      .trim();
  }
  return null;
}

function extractJson(text) {
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) return null;
  try {
    return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
  } catch {
    return null;
  }
}

function nullableString(value, maxLength = 500) {
  return typeof value === "string" && value.trim() ? hedgeCertainLanguage(value.trim().slice(0, maxLength)) : null;
}

function nullableNumber(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? Math.round(value) : null;
}

function nullableBoolean(value) {
  return typeof value === "boolean" ? value : null;
}

function normalizeAnalysis(value, imageCount) {
  if (!isRecord(value)) return null;
  const fields = isRecord(value.fields) ? value.fields : {};
  const rawIndexes = Array.isArray(value.documentImageIndexes) ? value.documentImageIndexes : [];
  const documentImageIndexes = Array.from(
    new Set(
      rawIndexes
        .filter((item) => Number.isInteger(item) && item >= 0 && item < imageCount)
        .slice(0, imageCount),
    ),
  );

  return {
    hasEvidence: value.hasEvidence === true,
    documentImageIndexes,
    evidenceSummary: nullableString(value.evidenceSummary, 800),
    documentTypes: Array.isArray(value.documentTypes)
      ? value.documentTypes.filter((item) => typeof item === "string" && item.trim()).slice(0, 6)
      : [],
    fields: {
      tramerAmount: nullableNumber(fields.tramerAmount),
      paintedParts: nullableString(fields.paintedParts, 300),
      replacedParts: nullableString(fields.replacedParts, 300),
      localPaintedParts: nullableString(fields.localPaintedParts, 300),
      airbagStatus: nullableString(fields.airbagStatus, 120),
      hasHeavyDamage: nullableBoolean(fields.hasHeavyDamage),
      hasChassisRepair: nullableBoolean(fields.hasChassisRepair),
      hasTotalLossHistory: nullableBoolean(fields.hasTotalLossHistory),
      hasExpertiseReport: nullableBoolean(fields.hasExpertiseReport),
      hasMaintenanceInvoices: nullableBoolean(fields.hasMaintenanceInvoices),
      lastMaintenanceDate: nullableString(fields.lastMaintenanceDate, 80),
      timingBeltInfo: nullableString(fields.timingBeltInfo, 120),
      transmissionMaintenanceInfo: nullableString(fields.transmissionMaintenanceInfo, 120),
      batteryStatus: nullableString(fields.batteryStatus, 120),
      tireStatus: nullableString(fields.tireStatus, 120),
      inspectionEndDate: nullableString(fields.inspectionEndDate, 80),
      sellerDescriptionAppend: nullableString(fields.sellerDescriptionAppend, 1000),
    },
  };
}

const listingPhotoEvidenceResponseFormat = {
  type: "json_schema",
  json_schema: {
    name: "eksperiq_listing_photo_evidence",
    strict: true,
    schema: {
      type: "object",
      additionalProperties: false,
      required: ["hasEvidence", "documentImageIndexes", "documentTypes", "evidenceSummary", "fields"],
      properties: {
        hasEvidence: { type: "boolean" },
        documentImageIndexes: { type: "array", items: { type: "integer" }, maxItems: MAX_IMAGE_URLS },
        documentTypes: { type: "array", items: { type: "string" }, maxItems: 6 },
        evidenceSummary: { type: ["string", "null"] },
        fields: {
          type: "object",
          additionalProperties: false,
          required: [
            "tramerAmount",
            "paintedParts",
            "replacedParts",
            "localPaintedParts",
            "airbagStatus",
            "hasHeavyDamage",
            "hasChassisRepair",
            "hasTotalLossHistory",
            "hasExpertiseReport",
            "hasMaintenanceInvoices",
            "lastMaintenanceDate",
            "timingBeltInfo",
            "transmissionMaintenanceInfo",
            "batteryStatus",
            "tireStatus",
            "inspectionEndDate",
            "sellerDescriptionAppend",
          ],
          properties: {
            tramerAmount: { type: ["integer", "null"] },
            paintedParts: { type: ["string", "null"] },
            replacedParts: { type: ["string", "null"] },
            localPaintedParts: { type: ["string", "null"] },
            airbagStatus: { type: ["string", "null"] },
            hasHeavyDamage: { type: ["boolean", "null"] },
            hasChassisRepair: { type: ["boolean", "null"] },
            hasTotalLossHistory: { type: ["boolean", "null"] },
            hasExpertiseReport: { type: ["boolean", "null"] },
            hasMaintenanceInvoices: { type: ["boolean", "null"] },
            lastMaintenanceDate: { type: ["string", "null"] },
            timingBeltInfo: { type: ["string", "null"] },
            transmissionMaintenanceInfo: { type: ["string", "null"] },
            batteryStatus: { type: ["string", "null"] },
            tireStatus: { type: ["string", "null"] },
            inspectionEndDate: { type: ["string", "null"] },
            sellerDescriptionAppend: { type: ["string", "null"] },
          },
        },
      },
    },
  },
};

function buildMessages(input) {
  return [
    {
      role: "system",
      content:
        "Sen EksperIQ icin calisan dikkatli bir ikinci el arac ilan gorseli kanit okuma asistanisin. Sana ilan fotograf URL'leri verilecek. " +
        "Arac dis/icisindeki normal arac fotograflarini sadece arac fotografi olarak gor; bunlardan hasar uydurma. " +
        "Arac fotografi disindaki ekspertiz raporu, tramer/hasar kaydi ekran goruntusu, servis/bakim faturasi, muayene belgesi, boya-degisen semasi veya ilan icindeki belge/foto kanitlarini bul. " +
        "Belge veya ekran goruntusunden okunabilen tramer tutari, boyali/degisen/lokal boyali parcalar, agir hasar/pert/sasi-podye/airbag, bakim faturasi ve tarih bilgilerini cikar. " +
        "Okunmayan veya emin olmadigin degeri null birak; ASLA uydurma. Belge gorsellerinin 0'dan baslayan indekslerini documentImageIndexes alanina yaz. " +
        "Tum metin alanlarini SADECE Turkce yaz. Kesin hukum verme; ilandaki belge/foto kaniti olarak ihtiyatli anlat.",
    },
    {
      role: "user",
      content: [
        {
          type: "text",
          text: `Ilan basligi: ${input.title || "Yok"}
Ilan aciklamasi ozeti: ${input.sellerDescription || "Yok"}

Gorev:
- Arac fotografi olmayan ama arac hakkinda belge/kanit iceren gorselleri bul.
- Ekspertiz raporu, tramer kaydi, hasar kaydi, boya-degisen semasi, servis/bakim faturasi veya muayene belgesi varsa oku.
- Sadece gorselde okunabilen alanlari doldur; emin degilsen null birak.
- documentImageIndexes sadece belge/kanit gorsellerinin indeksleri olsun; normal arac fotograflarini buraya yazma.
- sellerDescriptionAppend alanina gorsellerden okunan yeni kaniti kisa, rapora eklenecek not olarak yaz.

JSON disinda metin yazma.`,
        },
        ...input.imageUrls.map((url) => ({ type: "image_url", image_url: { url } })),
      ],
    },
  ];
}

function resolveVisionModelCandidates() {
  const candidates = [];
  const configured = process.env.OPENROUTER_VISION_MODEL?.trim() || process.env.OPENROUTER_MODEL?.trim();
  if (configured && configured.endsWith(":free")) candidates.push(configured);
  candidates.push(...DEFAULT_MODEL_CANDIDATES);
  if (process.env.OPENROUTER_DISABLE_PAID_PHOTO_EVIDENCE_FALLBACK !== "true") {
    candidates.push(PAID_FALLBACK_MODEL);
  }
  return [...new Set(candidates)].filter((model) => !KNOWN_INVALID_MODELS.has(model));
}

async function requestOpenRouterVisionWithModel(input, apiKey, model) {
  const result = await callOpenRouterChatCompletions({
    apiKey,
    model,
    messages: buildMessages(input),
    responseFormat: listingPhotoEvidenceResponseFormat,
    temperature: 0.1,
    // PAID_FALLBACK_MODEL needs a much bigger budget — see the identical fix
    // (and its live-confirmed reason) in listing-import.js/photo-damage.js.
    maxTokens: model === PAID_FALLBACK_MODEL ? 8000 : 1800,
    refererUrl: productionUrl,
    appName,
  });
  if (!result.ok) return { error: result.error };

  const text = extractText(result.payload);
  if (!text) return { error: "AI görsel kanıt yanıtı okunamadı." };
  const json = extractJson(text);
  if (!json) return { error: "AI görsel kanıt sonucu işlenemedi." };
  const analysis = normalizeAnalysis(json, input.imageUrls.length);
  if (!analysis) return { error: "AI görsel kanıt sonucu işlenemedi." };
  return { analysis, model };
}

async function requestOpenRouterVision(input) {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) return { error: "OpenRouter API key tanımlı değil." };

  let lastError = "AI görsel kanıt sonucu işlenemedi.";
  for (const model of resolveVisionModelCandidates()) {
    const result = await requestOpenRouterVisionWithModel(input, apiKey, model);
    if (!("error" in result)) return result;
    console.warn("[listing-photo-evidence] model attempt failed:", JSON.stringify({ model, error: result.error }));
    lastError = result.error;
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

  if (process.env.NEXT_PUBLIC_LISTING_IMPORT_ENABLED !== "true") {
    sendJson(response, 429, { error: "İlan görsel kanıt analizi şu anda kapalı." });
    return;
  }

  let body;
  try {
    body = await readJsonBody(request);
  } catch {
    sendJson(response, 400, { error: "Geçerli JSON gövdesi gönderilmelidir." });
    return;
  }

  const parsed = parseInput(body);
  if (!parsed.ok && parsed.reason === "missing-consent") {
    sendJson(response, 400, { error: "Görsel kanıt analizi için AI sağlayıcısına veri gönderimi onayı zorunludur." });
    return;
  }
  if (!parsed.ok) {
    sendJson(response, 400, { error: "1-12 adet geçerli ilan fotoğrafı URL'si gönderin." });
    return;
  }

  const rateLimit = await checkRateLimit(request, {
    usageKey: "listing-photo-evidence",
    burstLimit: parsePositiveInt(process.env.AI_BURST_LIMIT, DEFAULT_BURST_LIMIT),
    burstWindowSeconds: parsePositiveInt(process.env.AI_BURST_WINDOW_SECONDS, DEFAULT_BURST_WINDOW_SECONDS),
    dailyLimitPerIdentity: parsePositiveInt(
      process.env.AI_LISTING_PHOTO_EVIDENCE_DAILY_LIMIT_PER_INSTALL,
      DEFAULT_DAILY_LIMIT_PER_INSTALL,
    ),
    globalDailyLimit: parsePositiveInt(process.env.OPENROUTER_LISTING_PHOTO_EVIDENCE_DAILY_LIMIT, DEFAULT_DAILY_LIMIT),
  });

  if (!rateLimit.ok) {
    if (rateLimit.reason === "unavailable") {
      sendJson(response, 503, { error: "AI kullanım limiti şu anda doğrulanamadı." });
      return;
    }
    sendJson(response, 429, { error: "Günlük ilan görsel kanıt analizi limiti doldu.", remaining: 0 });
    return;
  }

  const result = await requestOpenRouterVision(parsed.input);
  if ("error" in result) {
    console.error("[listing-photo-evidence] OpenRouter call failed:", result.error);
    sendJson(response, 502, { error: result.error, remaining: rateLimit.remaining });
    return;
  }

  sendJson(response, 200, {
    analysis: result.analysis,
    model: result.model,
    remaining: rateLimit.remaining,
  });
}

module.exports = handler;
module.exports.DEFAULT_MODEL_CANDIDATES = DEFAULT_MODEL_CANDIDATES;
module.exports.PAID_FALLBACK_MODEL = PAID_FALLBACK_MODEL;
module.exports.resolveVisionModelCandidates = resolveVisionModelCandidates;
