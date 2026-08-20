const { checkRateLimit } = require("../_lib/rate-limit.js");
const { callOpenRouterChatCompletions, hedgeCertainLanguage } = require("../_lib/openrouter.js");
const { applyCorsHeaders, handlePreflight } = require("../_lib/cors.js");

// Text-only normalization (no image analysis here — that stays a cost the
// user pays for at "Analiz oluştur" time, not at import time, per product
// decision). Same reliable named free model as analysis-note.js; avoid
// "openrouter/free" which can randomly route to a moderation/safety model.
const DEFAULT_OPENROUTER_MODEL = "openai/gpt-oss-20b:free";
const DEFAULT_DAILY_LIMIT = 60;
// TEMPORARY: raised from 10 for this bug-hunt session — this feature's own
// retry-on-blocked-page logic can burn 2 requests per user attempt, and a
// day of build-33-through-40 testing against the same install has likely
// already exhausted the real (10) limit, which only resets at UTC
// midnight. Dial back to 10 once the listing-import investigation is done.
const DEFAULT_DAILY_LIMIT_PER_INSTALL = 40;
const DEFAULT_BURST_LIMIT = 4;
const DEFAULT_BURST_WINDOW_SECONDS = 60;
const productionUrl = "https://eksperiq.vercel.app";
const appName = "EksperIQ";

// Kept in sync by hand with the exact option lists in
// src/components/forms/analysis-form-sections.tsx — api/*.js runs isolated
// from the Next app's src/ TypeScript (separate Vercel serverless bundle),
// so this can't just import that file. Every enum here MUST match a real
// <select> option there, or a field would silently show blank in the form.
const BRAND_OPTIONS = [
  "Audi",
  "BMW",
  "BYD",
  "Chery",
  "Chevrolet",
  "Citroen",
  "Cupra",
  "Dacia",
  "Fiat",
  "Ford",
  "Honda",
  "Hyundai",
  "Jeep",
  "Kia",
  "Lexus",
  "Mazda",
  "Mercedes-Benz",
  "MG",
  "Mini",
  "Nissan",
  "Opel",
  "Peugeot",
  "Renault",
  "Seat",
  "Skoda",
  "Suzuki",
  "Tesla",
  "Toyota",
  "Volkswagen",
  "Volvo",
];
const TRIM_OPTIONS = [
  "Baz paket",
  "Orta paket",
  "Üst paket",
  "Business",
  "Comfort",
  "Dream",
  "Dynamic",
  "Elegance",
  "Executive",
  "Joy",
  "Life",
  "Premium",
  "Style",
  "Touch",
  "Trend",
  "Belirtilmemiş",
];
const CITY_OPTIONS = [
  "Adana",
  "Adıyaman",
  "Afyonkarahisar",
  "Ağrı",
  "Amasya",
  "Ankara",
  "Antalya",
  "Artvin",
  "Aydın",
  "Balıkesir",
  "Bilecik",
  "Bingöl",
  "Bitlis",
  "Bolu",
  "Burdur",
  "Bursa",
  "Çanakkale",
  "Çankırı",
  "Çorum",
  "Denizli",
  "Diyarbakır",
  "Edirne",
  "Elazığ",
  "Erzincan",
  "Erzurum",
  "Eskişehir",
  "Gaziantep",
  "Giresun",
  "Gümüşhane",
  "Hakkari",
  "Hatay",
  "Isparta",
  "Mersin",
  "İstanbul",
  "İzmir",
  "Kars",
  "Kastamonu",
  "Kayseri",
  "Kırklareli",
  "Kırşehir",
  "Kocaeli",
  "Konya",
  "Kütahya",
  "Malatya",
  "Manisa",
  "Kahramanmaraş",
  "Mardin",
  "Muğla",
  "Muş",
  "Nevşehir",
  "Niğde",
  "Ordu",
  "Rize",
  "Sakarya",
  "Samsun",
  "Siirt",
  "Sinop",
  "Sivas",
  "Tekirdağ",
  "Tokat",
  "Trabzon",
  "Tunceli",
  "Şanlıurfa",
  "Uşak",
  "Van",
  "Yozgat",
  "Zonguldak",
  "Aksaray",
  "Bayburt",
  "Karaman",
  "Kırıkkale",
  "Batman",
  "Şırnak",
  "Bartın",
  "Ardahan",
  "Iğdır",
  "Yalova",
  "Karabük",
  "Kilis",
  "Osmaniye",
  "Düzce",
];
const BODY_TYPES = [
  "Sedan",
  "Hatchback",
  "Station wagon",
  "SUV",
  "Crossover",
  "Coupe",
  "Cabrio",
  "MPV",
  "Pickup",
  "Panelvan",
];
const DRIVETRAINS = ["Önden çekiş", "Arkadan itiş", "4x4", "AWD", "Bilinmiyor"];
const OWNER_INFO_OPTIONS = [
  "Ruhsat sahibi satıcı olduğunu belirtiyor",
  "Araç aile bireyi üzerine",
  "Vekaletle satış yapılacak",
  "Galeriden satış",
  "Ruhsat sahibi bilgisi belirsiz",
];
const TRADE_STATUSES = ["Takas yok", "Takas var", "Takas değerlendirilebilir", "Sadece satış", "Belirtilmemiş"];
const AIRBAG_STATUSES = ["Açmamış", "Açmış", "Değişmiş", "Bilinmiyor"];
const LPG_STATUSES = ["Yok", "Var", "Sökülmüş", "Bilinmiyor"];
const FUEL_TYPES = ["Benzin", "Dizel", "Hibrit", "Elektrik", "LPG"];
const TRANSMISSIONS = ["Manuel", "Otomatik", "Yarı otomatik"];

const FIELD_NAMES = [
  "brand",
  "model",
  "year",
  "trim",
  "fuelType",
  "transmission",
  "mileage",
  "price",
  "city",
  "bodyType",
  "engineSize",
  "enginePower",
  "drivetrain",
  "ownerInfo",
  "tradeStatus",
  "airbagStatus",
  "lpgStatus",
  "hasHeavyDamage",
  "hasChassisRepair",
  "hasSpareKey",
  "sellerDescription",
];

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

function isBoundedString(value, min, max) {
  return typeof value === "string" && value.trim().length >= min && value.trim().length <= max;
}

function isFeatureEnabled() {
  return process.env.NEXT_PUBLIC_LISTING_IMPORT_ENABLED === "true";
}

const SUPPORTED_SOURCES = ["sahibinden", "arabam"];

function parseListingImportInput(value) {
  if (!isRecord(value)) return null;
  if (value.aiProviderConsent !== true) return null;
  if (!SUPPORTED_SOURCES.includes(value.source)) return null;
  if (!isBoundedString(value.url, 8, 800)) return null;
  if (!isBoundedString(value.bodyText, 40, 20000)) return null;
  if (typeof value.title !== "string" || value.title.length > 300) return null;
  if (typeof value.ogTitle !== "string" || value.ogTitle.length > 300) return null;
  if (typeof value.ogDescription !== "string" || value.ogDescription.length > 2000) return null;
  if (!Array.isArray(value.jsonLd) || value.jsonLd.length > 5) return null;
  if (value.jsonLd.some((item) => typeof item !== "string" || item.length > 8000)) return null;

  return {
    source: value.source,
    url: value.url.trim(),
    title: value.title.trim(),
    ogTitle: value.ogTitle.trim(),
    ogDescription: value.ogDescription.trim(),
    bodyText: value.bodyText.trim(),
    jsonLd: value.jsonLd,
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

// Some models (especially free-tier ones) occasionally ignore the nested
// `fields: {...}` wrapper the schema asks for and return the field keys
// flattened at the top level instead — most often seen on a degenerate
// input (e.g. a Cloudflare block page with nothing real to extract), where
// the model still faithfully reports its findings in `warnings` but gets
// the envelope shape wrong. That's a real, useful response (a correctly
// detected blocked page) being thrown away as unparseable. Detect the flat
// shape and re-nest it instead of failing.
function normalizeFieldsShape(json) {
  if (isRecord(json.fields)) return json;
  const hasAnyFieldKey = FIELD_NAMES.some((name) => Object.prototype.hasOwnProperty.call(json, name));
  if (!hasAnyFieldKey) return json;
  const fields = {};
  for (const name of FIELD_NAMES) fields[name] = name in json ? json[name] : null;
  return { ...json, fields };
}

function enumProp(options) {
  return { type: ["string", "null"], enum: [...options, null] };
}

const listingImportResponseFormat = {
  type: "json_schema",
  json_schema: {
    name: "eksperiq_listing_import",
    strict: true,
    schema: {
      type: "object",
      additionalProperties: false,
      required: ["title", "fields", "lowConfidenceFields", "missingFields", "warnings"],
      properties: {
        title: { type: "string" },
        fields: {
          type: "object",
          additionalProperties: false,
          required: FIELD_NAMES,
          properties: {
            brand: enumProp(BRAND_OPTIONS),
            model: { type: ["string", "null"] },
            year: { type: ["integer", "null"] },
            trim: enumProp(TRIM_OPTIONS),
            fuelType: enumProp(FUEL_TYPES),
            transmission: enumProp(TRANSMISSIONS),
            mileage: { type: ["integer", "null"] },
            price: { type: ["integer", "null"] },
            city: enumProp(CITY_OPTIONS),
            bodyType: enumProp(BODY_TYPES),
            engineSize: { type: ["string", "null"] },
            enginePower: { type: ["string", "null"] },
            drivetrain: enumProp(DRIVETRAINS),
            ownerInfo: enumProp(OWNER_INFO_OPTIONS),
            tradeStatus: enumProp(TRADE_STATUSES),
            airbagStatus: enumProp(AIRBAG_STATUSES),
            lpgStatus: enumProp(LPG_STATUSES),
            hasHeavyDamage: { type: ["boolean", "null"] },
            hasChassisRepair: { type: ["boolean", "null"] },
            hasSpareKey: { type: ["boolean", "null"] },
            sellerDescription: { type: ["string", "null"] },
          },
        },
        lowConfidenceFields: { type: "array", items: { type: "string" }, maxItems: 21 },
        missingFields: { type: "array", items: { type: "string" }, maxItems: 21 },
        warnings: { type: "array", items: { type: "string" }, maxItems: 6 },
      },
    },
  },
};

function buildMessages(input) {
  const jsonLdBlock = input.jsonLd.length ? input.jsonLd.join("\n---\n").slice(0, 6000) : "(yok)";

  return [
    {
      role: "system",
      content:
        "Sen EksperIQ icin calisan bir ikinci el arac ilani okuma asistanisin. Sana bir arac ilani sayfasinin " +
        "basligi, meta bilgileri, JSON-LD verisi ve gorunur sayfa metni verilecek. Gorevin bu metinden arac " +
        "bilgilerini cikarip verilen JSON semasina gore doldurmak. " +
        "KURALLAR: (1) Sadece metinde acikca yazan veya net sekilde cikarilabilen degerleri doldur; emin " +
        "olmadigin veya metinde olmayan alani null birak, ASLA uydurma. (2) enum ile sinirli alanlarda " +
        "(brand, trim, fuelType, transmission, city, bodyType, drivetrain, ownerInfo, tradeStatus, airbagStatus, " +
        "lpgStatus) SADECE verilen listedeki degerlerden birini sec; listede tam karsiligi yoksa null birak. " +
        "(3) sellerDescription alanina sayfadaki navigasyon/reklam/cerez metnini degil, satici tarafindan " +
        "yazilmis gercek ilan aciklama metnini koy (temizlenmis, kisaltilmamis). (4) hasHeavyDamage ve " +
        "hasChassisRepair alanlarini sadece ilan acikca 'agir hasarli', 'sasi degisti/kaynak' gibi bir sey " +
        "belirtiyorsa true yap; aksi halde null birak (yokluk kaniti degil, sadece belirtilmemis demektir). " +
        "(5) Emin olmadigin ama yine de doldurdugun alanlarin adini lowConfidenceFields dizisine ekle. " +
        "(6) Sayfa bir arac ilanina benzemiyorsa (kaldirilmis ilan, arama sonuc sayfasi, hata sayfasi) " +
        "warnings dizisine bunu Turkce belirt ve fields'i olabildigince null birak. " +
        "(7) Fiyati ve kilometreyi Turkce bicimden (orn. '1.845.000 TL', '125.000 km') temiz tam sayiya cevir. " +
        "(8) Tum metin alanlarini SADECE Turkce yaz; baska bir dilden tek kelime bile karistirma. " +
        "(9) Kesin hukum verme; ilanin kendi beyani oldugunu unutma, dogrulanmis gercek gibi sunma.",
    },
    {
      role: "user",
      content: `Kaynak: ${input.source}
URL: ${input.url}
Sayfa basligi: ${input.title}
OG basligi: ${input.ogTitle}
OG aciklamasi: ${input.ogDescription}

JSON-LD verisi:
${jsonLdBlock}

Sayfa metni (kirpilmis):
${input.bodyText.slice(0, 12000)}`,
    },
  ];
}

async function requestOpenRouterListingImport(input) {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) return { error: "OpenRouter API key tanımlı değil." };

  const model = process.env.OPENROUTER_MODEL?.trim() || DEFAULT_OPENROUTER_MODEL;
  const result = await callOpenRouterChatCompletions({
    apiKey,
    model,
    messages: buildMessages(input),
    responseFormat: listingImportResponseFormat,
    temperature: 0.1,
    // Was 1600 — a real ilan's full field set (title + ~17 fields +
    // lowConfidenceFields/missingFields/warnings arrays + sellerDescription)
    // can run longer than that, and a truncated response is invalid JSON,
    // which extractJson() below can only ever report as a bare "couldn't
    // parse" — not distinguishable from the model genuinely misbehaving.
    maxTokens: 3200,
    refererUrl: productionUrl,
    appName,
  });
  if (!result.ok) return { error: result.error };

  const text = extractText(result.payload);
  if (!text) {
    console.error(
      "[listing-import] extractText found no readable choices[0].message.content. Raw payload (first 500 chars):",
      JSON.stringify(result.payload).slice(0, 500),
    );
    return { error: "AI yanıtı okunamadı." };
  }
  const parsed = extractJson(text);
  const json = parsed ? normalizeFieldsShape(parsed) : null;
  if (!json || !isRecord(json.fields)) {
    console.error(
      "[listing-import] AI response did not parse to the expected shape. Raw text (first 800 chars):",
      text.slice(0, 800),
    );
    return { error: "İlan bilgisi işlenemedi." };
  }

  const fields = json.fields;
  if (typeof fields.sellerDescription === "string") {
    fields.sellerDescription = hedgeCertainLanguage(fields.sellerDescription.slice(0, 4000));
  }

  return {
    result: {
      title: typeof json.title === "string" ? json.title.slice(0, 300) : "",
      fields,
      lowConfidenceFields: Array.isArray(json.lowConfidenceFields) ? json.lowConfidenceFields.slice(0, 21) : [],
      missingFields: Array.isArray(json.missingFields) ? json.missingFields.slice(0, 21) : [],
      warnings: Array.isArray(json.warnings) ? json.warnings.slice(0, 6) : [],
    },
    model,
  };
}

async function handler(request, response) {
  applyCorsHeaders(request, response);
  if (handlePreflight(request, response)) return;

  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    sendJson(response, 405, { error: "Yalnızca POST desteklenir." });
    return;
  }

  if (!isFeatureEnabled()) {
    sendJson(response, 429, { error: "İlan linkiyle otomatik doldurma şu anda kapalı." });
    return;
  }

  let body;
  try {
    body = await readJsonBody(request);
  } catch {
    sendJson(response, 400, { error: "Geçerli JSON gövdesi gönderilmelidir." });
    return;
  }

  const parsed = parseListingImportInput(body);
  if (!parsed) {
    sendJson(response, 400, { error: "İlan bilgisi geçerli değil." });
    return;
  }

  const rateLimit = await checkRateLimit(request, {
    usageKey: "listing-import",
    burstLimit: parsePositiveInt(process.env.LISTING_IMPORT_BURST_LIMIT, DEFAULT_BURST_LIMIT),
    burstWindowSeconds: parsePositiveInt(process.env.LISTING_IMPORT_BURST_WINDOW_SECONDS, DEFAULT_BURST_WINDOW_SECONDS),
    dailyLimitPerIdentity: parsePositiveInt(
      process.env.LISTING_IMPORT_DAILY_LIMIT_PER_INSTALL,
      DEFAULT_DAILY_LIMIT_PER_INSTALL,
    ),
    globalDailyLimit: parsePositiveInt(process.env.LISTING_IMPORT_DAILY_REQUEST_LIMIT, DEFAULT_DAILY_LIMIT),
  });

  if (!rateLimit.ok) {
    if (rateLimit.reason === "unavailable") {
      sendJson(response, 503, { error: "İlan aktarma şu anda doğrulanamadı." });
      return;
    }
    if (rateLimit.reason === "burst") {
      sendJson(response, 429, { error: "Çok hızlı istek gönderildi. Birazdan tekrar deneyin." });
      return;
    }
    sendJson(response, 429, { error: "Günlük ilan aktarma limiti doldu." });
    return;
  }

  const aiResult = await requestOpenRouterListingImport(parsed);
  if ("error" in aiResult) {
    console.error("[listing-import] OpenRouter call failed:", aiResult.error);
    sendJson(response, 502, { error: aiResult.error });
    return;
  }

  sendJson(response, 200, { result: aiResult.result, model: aiResult.model, remaining: rateLimit.remaining });
}

module.exports = handler;
module.exports.DEFAULT_OPENROUTER_MODEL = DEFAULT_OPENROUTER_MODEL;
module.exports.BRAND_OPTIONS = BRAND_OPTIONS;
