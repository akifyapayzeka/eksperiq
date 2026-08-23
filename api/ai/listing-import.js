const { checkRateLimit } = require("../_lib/rate-limit.js");
const { callOpenRouterChatCompletions, hedgeCertainLanguage } = require("../_lib/openrouter.js");
const { applyCorsHeaders, handlePreflight } = require("../_lib/cors.js");

// Text-only listing normalization. Photo analysis is a separate, always-free
// user-owned vehicle flow; paid plan limits apply to listing-link analysis
// volume, not to a stronger photo model. Avoid "openrouter/free" which can
// randomly route to a moderation/safety model.
//
// "openai/gpt-oss-20b:free" (the previous default here and in
// analysis-note.js) does NOT exist in OpenRouter's real /models catalog —
// verified directly (curl https://openrouter.ai/api/v1/models, only
// "openai/gpt-oss-20b" without ":free" is real, and that's a paid model).
// Every listing-import request was 404ing on this model with no fallback
// configured (DEFAULT_OPENROUTER_FALLBACK_MODEL was ""), so the feature has
// been unconditionally broken — confirmed live via Vercel runtime logs
// showing "OpenRouter isteği başarısız oldu: 404" on every attempt. Replaced
// with the same free vision-capable models already proven reliable for
// photo-damage.js's cascade (photo-damage doesn't need text-only, so any
// text task works fine on a vision model too), plus the same paid
// last-resort pattern already approved and shipped there.
const DEFAULT_MODEL_CANDIDATES = ["google/gemma-4-26b-a4b-it:free", "google/gemma-4-31b-it:free"];
const PAID_FALLBACK_MODEL = "openai/gpt-5-nano";
// Confirmed live (2026-08-23): Vercel's own OPENROUTER_MODEL env var is set
// to this exact nonexistent ID — an operator apparently copied the old
// broken default in as an explicit override at some point. Fixing the code
// default above doesn't help while that env var still wins first in the
// candidate order below; filter it out here too so this specific known-bad
// value can never be used regardless of what's set in Vercel, without
// needing dashboard write access to actually remove it there.
const KNOWN_INVALID_MODELS = new Set(["openai/gpt-oss-20b:free"]);
// TEMPORARY: raised well above real launch levels — the app has no public
// users yet (still in App Store review), only the owner's own device
// testing against it repeatedly. Dial both back down to sane per-install
// (~10) and global (~60) values once the app is live and this daily cap
// needs to mean something again.
const DEFAULT_DAILY_LIMIT = 600;
const DEFAULT_DAILY_LIMIT_PER_INSTALL = 500;
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
  "Edition",
  "Executive",
  "Feel",
  "Icon",
  "Joy",
  "Life",
  "Premium",
  "Shine",
  "Style",
  "Titanium",
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
const FUEL_TYPES = ["Benzin", "Dizel", "Hibrit", "Elektrik", "LPG", "Bilinmiyor"];
const TRANSMISSIONS = ["Manuel", "Otomatik", "Yarı otomatik", "Bilinmiyor"];
const BATTERY_STATUSES = ["İyi", "Orta", "Zayıf", "Yeni değişmiş", "Bilinmiyor"];
const TIRE_STATUSES = ["İyi", "Orta", "Kötü", "Yeni", "Mevsimlik değişim gerekli", "Bilinmiyor"];
const TIMING_BELT_STATUSES = [
  "Değişmiş, fatura mevcut",
  "Değişmiş, belge yok",
  "Zincirli motor olduğu belirtiliyor",
  "Değişim zamanı yaklaşmış olabilir",
  "Bilinmiyor",
  "Belirtilmemiş",
];
const TRANSMISSION_MAINTENANCE_STATUSES = [
  "Bakım yapılmış, fatura mevcut",
  "Bakım yapılmış, belge yok",
  "Manuel şanzıman",
  "Bakım zamanı yaklaşmış olabilir",
  "Bilinmiyor",
  "Belirtilmemiş",
];

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
  "tramerAmount",
  "paintedParts",
  "replacedParts",
  "localPaintedParts",
  "airbagStatus",
  "lpgStatus",
  "hasHeavyDamage",
  "hasChassisRepair",
  "hasTotalLossHistory",
  "hasExpertiseReport",
  "lpgRegistered",
  "hasSpareKey",
  "hasMaintenanceInvoices",
  "lastMaintenanceDate",
  "timingBeltInfo",
  "transmissionMaintenanceInfo",
  "batteryStatus",
  "tireStatus",
  "inspectionEndDate",
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

function cleanListingLine(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function normalizeTurkish(value) {
  return cleanListingLine(value)
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

const SELLER_DESCRIPTION_ANCHOR_PATTERN =
  /açıklama|aciklama|hoş geldiniz|hos geldiniz|yetki belge|ekspertiz|expertiz|ustaya açık|ustaya acik|hatasız|hatasiz|boyasız|boyasiz|hasar kayıtsız|hasar kayitsiz|değişensiz|degisensiz|lokal boya|tramer|airbag|şerit takip|serit takip|car\s*play|cruise|far sensörü|far sensoru|yağmur sensörü|yagmur sensoru|geri görüş|geri gorus/i;

const SELLER_DESCRIPTION_STOP_PATTERN =
  /^(ilan bilgileri|araç bilgileri|arac bilgileri|özellikler|ozellikler|konum|adres|favori|mesaj gönder|mesaj gonder|benzer ilanlar|arama sonuçları|arama sonuclari)$/i;

function extractSellerDescriptionFromText(text) {
  const lines = String(text || "")
    .split(/\r?\n+/)
    .map(cleanListingLine)
    .filter((line) => line.length >= 3 && line.length <= 260);

  const explicitLabelIndex = lines.findIndex((line) => /^(ilan\s+)?açıklama(sı)?$|^(ilan\s+)?aciklama(si)?$/i.test(line));
  if (explicitLabelIndex >= 0) {
    const collected = [];
    for (const line of lines.slice(explicitLabelIndex + 1)) {
      if (SELLER_DESCRIPTION_STOP_PATTERN.test(line)) break;
      if (/^(paylaş|paylas|facebook|twitter|whatsapp|şikayet et|sikayet et)$/i.test(line)) continue;
      collected.push(line);
      if (collected.join("\n").length >= 3500) break;
    }
    const candidate = collected.join("\n").trim();
    if (candidate.length >= 20) return candidate.slice(0, 4000);
  }

  const anchorIndex = lines.findIndex((line) => SELLER_DESCRIPTION_ANCHOR_PATTERN.test(line));
  if (anchorIndex < 0) return null;

  const collected = [];
  for (const line of lines.slice(anchorIndex)) {
    if (collected.length > 0 && SELLER_DESCRIPTION_STOP_PATTERN.test(line)) break;
    if (/^(göster|goster|ara|mesaj|favori|paylaş|paylas)$/i.test(line)) continue;
    collected.push(line);
    if (collected.join("\n").length >= 3500) break;
  }
  const candidate = collected.join("\n").trim();
  return candidate.length >= 20 ? candidate.slice(0, 4000) : null;
}

function extractCityFromText(text) {
  const raw = String(text || "");
  const normalized = normalizeTurkish(raw);
  const locationMatch = normalized.match(/(?:konum adaylari|konum|adres|ilçe|ilce|mahalle|semt|şehir|sehir)([\s\S]{0,900})/);
  const locationWindow = locationMatch?.[1] ?? "";
  const exactCity = CITY_OPTIONS.find((city) => {
    const cityKey = normalizeTurkish(city);
    return new RegExp(`(^|[^\\p{L}])${cityKey}([^\\p{L}]|$)`, "iu").test(locationWindow);
  });
  if (exactCity) return exactCity;

  return (
    CITY_OPTIONS.find((city) => {
      const cityKey = normalizeTurkish(city);
      return new RegExp(`(^|[^\\p{L}])${cityKey}([^\\p{L}]|$)`, "iu").test(normalized);
    }) ?? null
  );
}

function extractEnginePowerFromText(text) {
  const match = String(text || "").match(/\b(\d{2,3})\s*(?:hp|ps|beygir|bg)\b/i);
  return match ? `${match[1]} HP` : null;
}

function parseListingNumber(value) {
  const digits = String(value || "").replace(/[^\d]/g, "");
  if (!digits) return null;
  const parsed = Number.parseInt(digits, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function extractMileageFromText(text) {
  const source = String(text || "");
  const patterns = [
    /(?:kilometre|km)\D{0,50}(\d[\d.\s]{2,})/i,
    /(\d[\d.\s]{2,})\s*(?:km|kilometre)\b/i,
  ];
  for (const pattern of patterns) {
    const match = source.match(pattern);
    const parsed = parseListingNumber(match?.[1]);
    if (parsed && parsed >= 1_000 && parsed <= 2_000_000) return parsed;
  }
  return null;
}

function shouldPreferFallbackMileage(currentMileage, fallbackMileage) {
  if (!fallbackMileage) return false;
  if (!currentMileage) return true;
  // Free models sometimes pick the model year ("2020") as mileage when the
  // page also contains an explicit "Kilometre 115.000 km" row. In that case
  // the deterministic label-based extraction is more trustworthy.
  return currentMileage < 5_000 && fallbackMileage >= 10_000;
}

function extractPriceFromText(text) {
  const source = String(text || "");
  const patterns = [
    /(?:fiyat|ilan\s+fiyat[ıi])\D{0,50}(\d[\d.\s]{4,})\s*(?:tl|₺)?/i,
    /(\d[\d.\s]{4,})\s*(?:tl|₺)\b/i,
  ];
  for (const pattern of patterns) {
    const match = source.match(pattern);
    const parsed = parseListingNumber(match?.[1]);
    if (parsed && parsed >= 10_000 && parsed <= 100_000_000) return parsed;
  }
  return null;
}

const LISTING_TABLE_LABEL_PATTERN =
  /^(marka|seri|model|paket|y[ıi]l|model y[ıi]l[ıi]|yak[ıi]t|yak[ıi]t t[üu]r[üu]|vites|vites t[üu]r[üu]|kilometre|km|fiyat|ilan fiyat[ıi]|kasa tipi|motor hacmi|motor g[üu]c[üu]|çekiş|cekis|kimden|takas|airbag|lpg)$/i;

function extractLabeledValueFromText(text, labelPattern) {
  const lines = String(text || "")
    .split(/\r?\n+/)
    .map(cleanListingLine)
    .filter(Boolean);

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const normalizedLine = normalizeTurkish(line);
    const match = normalizedLine.match(labelPattern);
    if (!match) continue;

    const sameLineValue = cleanListingLine(line.slice((match.index ?? 0) + match[0].length).replace(/^[:\s/-]+/, ""));
    if (sameLineValue && sameLineValue.length <= 90 && !LISTING_TABLE_LABEL_PATTERN.test(normalizeTurkish(sameLineValue))) {
      return sameLineValue;
    }

    for (const nextLine of lines.slice(index + 1, index + 4)) {
      const normalizedNext = normalizeTurkish(nextLine);
      if (LISTING_TABLE_LABEL_PATTERN.test(normalizedNext)) continue;
      if (nextLine.length <= 90) return nextLine;
      break;
    }
  }
  return null;
}

function selectOptionFromText(value, options) {
  const normalized = normalizeTurkish(value);
  return (
    options.find((option) => {
      const key = normalizeTurkish(option);
      return new RegExp(`(^|[^\\p{L}\\p{N}])${key}([^\\p{L}\\p{N}]|$)`, "iu").test(normalized);
    }) ?? null
  );
}

function extractTrimFromText(text) {
  const explicit = extractLabeledValueFromText(text, /^paket(?:\s+tipi)?\b/i);
  const haystack = [explicit, text].filter(Boolean).join("\n");
  return selectOptionFromText(haystack, TRIM_OPTIONS.filter((option) => option !== "Belirtilmemiş"));
}

function extractFuelTypeFromText(text) {
  const value = extractLabeledValueFromText(text, /^yak[ıi]t(?:\s+t[üu]r[üu])?\b/i) || text;
  const normalized = normalizeTurkish(value);
  if (/elektrik/.test(normalized)) return "Elektrik";
  if (/hibrit|hybrid/.test(normalized)) return "Hibrit";
  if (/lpg/.test(normalized)) return "LPG";
  if (/dizel|diesel/.test(normalized)) return "Dizel";
  if (/benzin/.test(normalized)) return "Benzin";
  return null;
}

function extractTransmissionFromText(text) {
  const value = extractLabeledValueFromText(text, /^vites(?:\s+t[üu]r[üu])?\b/i) || text;
  const normalized = normalizeTurkish(value);
  if (/yar[ıi]\s+otomatik|yari\s+otomatik|easytronic|etg|edc|dsg/.test(normalized)) return "Yarı otomatik";
  if (/otomatik|automatic|at\b/.test(normalized)) return "Otomatik";
  if (/manuel|manual|d[üu]z\s+vites|duz\s+vites/.test(normalized)) return "Manuel";
  return null;
}

function extractBodyTypeFromText(text) {
  const value = extractLabeledValueFromText(text, /^kasa\s+tipi\b/i) || text;
  return selectOptionFromText(value, BODY_TYPES);
}

function extractEngineSizeFromText(text) {
  const value = extractLabeledValueFromText(text, /^motor\s+hacmi\b/i) || text;
  const ccMatch = String(value).match(/\b(\d{3,4})\s*(?:cc|cm3|cm³)\b/i);
  if (ccMatch) {
    const cc = Number.parseInt(ccMatch[1], 10);
    if (Number.isFinite(cc) && cc >= 600 && cc <= 8000) return `${(cc / 1000).toLocaleString("tr-TR", { maximumFractionDigits: 1 })}`;
  }
  const literMatch = String(value).match(/\b(\d[.,]\d{1,2})\s*(?:lt|l|litre|t)?\b/i);
  return literMatch ? literMatch[1].replace(",", ".") : null;
}

function extractOwnerInfoFromText(text) {
  const value = extractLabeledValueFromText(text, /^kimden\b/i) || text;
  const normalized = normalizeTurkish(value);
  if (/galeri|oto\s+galeri|otomotiv/.test(normalized)) return "Galeriden satış";
  if (/sahibinden/.test(normalized)) return "Ruhsat sahibi satıcı olduğunu belirtiyor";
  if (/vekalet|vekaletle/.test(normalized)) return "Vekaletle satış yapılacak";
  return null;
}

function extractTradeStatusFromText(text) {
  const value = extractLabeledValueFromText(text, /^takas\b/i);
  if (!value) return null;
  const normalized = normalizeTurkish(value);
  if (/yok|hay[ıi]r|olmaz/.test(normalized)) return "Takas yok";
  if (/de[ğg]erlendirilir|olabilir/.test(normalized)) return "Takas değerlendirilebilir";
  if (/var|evet/.test(normalized)) return "Takas var";
  return null;
}

const PART_ALIASES = [
  ["Ön tampon", /ön\s+tampon|on\s+tampon/i],
  ["Arka tampon", /arka\s+tampon/i],
  ["Kaput", /kaput/i],
  ["Bagaj kapağı", /bagaj\s+kapa[ğıg]ı?/i],
  ["Tavan", /tavan/i],
  ["Sağ ön çamurluk", /sa[ğg]\s+ön\s+çamurluk|sag\s+on\s+camurluk/i],
  ["Sol ön çamurluk", /sol\s+ön\s+çamurluk|sol\s+on\s+camurluk/i],
  ["Sağ arka çamurluk", /sa[ğg]\s+arka\s+çamurluk|sag\s+arka\s+camurluk/i],
  ["Sol arka çamurluk", /sol\s+arka\s+çamurluk|sol\s+arka\s+camurluk/i],
  ["Sağ ön kapı", /sa[ğg]\s+ön\s+kapı|sag\s+on\s+kapi/i],
  ["Sol ön kapı", /sol\s+ön\s+kapı|sol\s+on\s+kapi/i],
  ["Sağ arka kapı", /sa[ğg]\s+arka\s+kapı|sag\s+arka\s+kapi/i],
  ["Sol arka kapı", /sol\s+arka\s+kapı|sol\s+arka\s+kapi/i],
];
const NORMALIZED_PART_ALIASES = [
  ["Ön tampon", /on\s+tampon/i],
  ["Arka tampon", /arka\s+tampon/i],
  ["Kaput", /kaput/i],
  ["Bagaj kapağı", /bagaj\s+kapagi/i],
  ["Tavan", /tavan/i],
  ["Sağ ön çamurluk", /sag\s+on\s+camurluk/i],
  ["Sol ön çamurluk", /sol\s+on\s+camurluk/i],
  ["Sağ arka çamurluk", /sag\s+arka\s+camurluk/i],
  ["Sol arka çamurluk", /sol\s+arka\s+camurluk/i],
  ["Sağ ön kapı", /sag\s+on\s+kapi/i],
  ["Sol ön kapı", /sol\s+on\s+kapi/i],
  ["Sağ arka kapı", /sag\s+arka\s+kapi/i],
  ["Sol arka kapı", /sol\s+arka\s+kapi/i],
];

function extractPartsNearKeyword(text, keywordPattern) {
  const source = String(text || "");
  const compact = normalizeTurkish(source);
  const keywordMatch = compact.match(keywordPattern);
  if (!keywordMatch) return null;
  const start = Math.max(0, (keywordMatch.index ?? 0) - 80);
  const end = Math.min(compact.length, (keywordMatch.index ?? 0) + keywordMatch[0].length + 80);
  const window = compact.slice(start, end);
  const parts = NORMALIZED_PART_ALIASES.filter(([, pattern]) => pattern.test(window)).map(([name]) => name);
  return parts.length ? Array.from(new Set(parts)).join(", ") : null;
}

function extractQuantifiedPaintedPartsFromText(text) {
  const normalized = normalizeTurkish(text);
  if (!/boya|boyali|boyalı/.test(normalized)) return null;

  const parts = [];
  const hasTwo = (word) => new RegExp(`(?:\\b2\\b|\\biki\\b)\\s+${word}`, "i").test(normalized);
  const hasOne = (word) => new RegExp(`(?:\\b1\\b|\\bbir\\b|\\btek\\b)\\s+${word}`, "i").test(normalized);

  if (hasTwo("kap[ıi]")) parts.push("İki kapı");
  else if (hasOne("kap[ıi]")) parts.push("Bir kapı");

  if (hasTwo("camurluk")) parts.push("İki çamurluk");
  else if (hasOne("camurluk")) parts.push("Bir çamurluk");

  if (hasTwo("parca")) parts.push("İki parça");
  else if (hasOne("parca")) parts.push("Bir parça");

  return parts.length ? Array.from(new Set(parts)).join(", ") : null;
}

const PART_SECTION_STOP_PATTERN =
  /^(boyal[ıi]|boyas[ıi]z|de[ğg]i[şs]en|de[ğg]i[şs]ensiz|lokal\s+boyal[ıi]|lokal\s+boya|özellikler|ozellikler|güvenlik|guvenlik|iç\s+donan[ıi]m|ic\s+donanim|multimedya|konum|aç[ıi]klama|ac[ıi]klama|tüm\s+teknik|tum\s+teknik)/i;

function extractPartsUnderLabel(text, labelPattern) {
  const lines = String(text || "")
    .split(/\r?\n+/)
    .map(cleanListingLine)
    .filter(Boolean);
  const labelIndex = lines.findIndex((line) => labelPattern.test(normalizeTurkish(line)));
  if (labelIndex < 0) return null;

  const parts = [];
  for (const line of lines.slice(labelIndex + 1, labelIndex + 12)) {
    const normalizedLine = normalizeTurkish(line);
    if (parts.length && PART_SECTION_STOP_PATTERN.test(normalizedLine)) break;
    for (const [name, pattern] of PART_ALIASES) {
      if (pattern.test(line)) parts.push(name);
    }
    if (parts.length && line.length > 120) break;
  }

  return parts.length ? Array.from(new Set(parts)).join(", ") : null;
}

function removeMissingField(missingFields, fieldName) {
  return Array.isArray(missingFields) ? missingFields.filter((field) => field !== fieldName) : [];
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
            tramerAmount: { type: ["integer", "null"] },
            paintedParts: { type: ["string", "null"] },
            replacedParts: { type: ["string", "null"] },
            localPaintedParts: { type: ["string", "null"] },
            airbagStatus: enumProp(AIRBAG_STATUSES),
            lpgStatus: enumProp(LPG_STATUSES),
            hasHeavyDamage: { type: ["boolean", "null"] },
            hasChassisRepair: { type: ["boolean", "null"] },
            hasTotalLossHistory: { type: ["boolean", "null"] },
            hasExpertiseReport: { type: ["boolean", "null"] },
            lpgRegistered: { type: ["boolean", "null"] },
            hasSpareKey: { type: ["boolean", "null"] },
            hasMaintenanceInvoices: { type: ["boolean", "null"] },
            lastMaintenanceDate: { type: ["string", "null"] },
            timingBeltInfo: enumProp(TIMING_BELT_STATUSES),
            transmissionMaintenanceInfo: enumProp(TRANSMISSION_MAINTENANCE_STATUSES),
            batteryStatus: enumProp(BATTERY_STATUSES),
            tireStatus: enumProp(TIRE_STATUSES),
            inspectionEndDate: { type: ["string", "null"] },
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
  // Was 6000 — jsonLd can hold up to 5 blocks x 8000 chars each (see
  // parseListingImportInput above), and a page can emit several JSON-LD
  // blocks (Organization, BreadcrumbList, Product...) before the one that
  // actually has the vehicle data, silently dropping it past this cutoff.
  const jsonLdBlock = input.jsonLd.length ? input.jsonLd.join("\n---\n").slice(0, 12000) : "(yok)";

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
        "yazilmis gercek ilan aciklama metnini koy (temizlenmis, kisaltilmamis); metinde ilan aciklamasi varsa " +
        "bu alani null birakma. (4) Dolu bilgi alanlarinda eksik kalan marka/model/yil/yakit/vites/motor gucu/" +
        "sehir gibi degerleri satici aciklamasindaki net ifadelerden de cikar. Ornegin 'GENERAL MOTOR 145 HP' " +
        "motor gucu icin, 'SOL ON CAMURLUK LOKAL BOYA' localPaintedParts icin acik kanittir. (5) city alanini " +
        "ilan konumu/adres/breadcrumb/konum adaylari metninden bul; ilanda sehir yaziyorsa null veya Bilinmiyor " +
        "donme. (6) paintedParts, " +
        "replacedParts ve localPaintedParts alanlarini yalnizca ilanda acikca yazan parca adlariyla doldur; " +
        "virgulle ayrilmis Turkce parca listesi kullan (orn. 'Kaput, Sol on kapi'). Degisensiz/boyasiz gibi " +
        "ifade varsa ilgili parca alanlarini null birak; ama 'lokal boya harici' gibi parca belirtilen ifadeyi " +
        "localPaintedParts olarak isle. (7) hasHeavyDamage, hasChassisRepair, " +
        "hasTotalLossHistory, hasExpertiseReport, lpgRegistered, hasSpareKey, hasMaintenanceInvoices alanlarini " +
        "sadece ilan acikca belirtiyorsa true/false yap; yokluk kaniti yoksa null birak. (8) tramerAmount, " +
        "lastMaintenanceDate ve inspectionEndDate alanlarini yalnizca acik deger varsa doldur. " +
        "(9) Emin olmadigin ama yine de doldurdugun alanlarin adini lowConfidenceFields dizisine ekle. " +
        "(10) Sayfa bir arac ilanina benzemiyorsa (kaldirilmis ilan, arama sonuc sayfasi, hata sayfasi) " +
        "warnings dizisine bunu Turkce belirt ve fields'i olabildigince null birak. " +
        "(11) Fiyati, kilometreyi ve tramer tutarini Turkce bicimden (orn. '1.845.000 TL', '125.000 km') " +
        "temiz tam sayiya cevir. (12) Tum metin alanlarini SADECE Turkce yaz; baska bir dilden tek kelime " +
        "bile karistirma. (13) Kesin hukum verme; ilanin kendi beyani oldugunu unutma, dogrulanmis gercek " +
        "gibi sunma.",
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
${input.bodyText.slice(0, 20000)}`,
    },
  ];
}

// Ordered: an explicitly configured OPENROUTER_MODEL first (so an operator
// can still override), then the verified-real free defaults, then an
// explicitly configured OPENROUTER_LISTING_IMPORT_FALLBACK_MODEL, then the
// paid last resort — mirrors photo-damage.js's resolveVisionModelCandidates.
function resolveListingImportModelCandidates() {
  const candidates = [];
  const configuredPrimary = process.env.OPENROUTER_MODEL?.trim();
  if (configuredPrimary) candidates.push(configuredPrimary);
  candidates.push(...DEFAULT_MODEL_CANDIDATES);
  const configuredFallback = process.env.OPENROUTER_LISTING_IMPORT_FALLBACK_MODEL?.trim();
  if (configuredFallback) candidates.push(configuredFallback);
  if (process.env.OPENROUTER_DISABLE_PAID_LISTING_IMPORT_FALLBACK !== "true") {
    candidates.push(PAID_FALLBACK_MODEL);
  }
  return [...new Set(candidates)].filter((model) => !KNOWN_INVALID_MODELS.has(model));
}

function normalizeListingImportJson(json, input, model) {
  const fields = json.fields;
  const fallbackText = [input.bodyText, input.ogDescription, input.ogTitle, input.title].filter(Boolean).join("\n");
  if (typeof fields.sellerDescription === "string") {
    fields.sellerDescription = hedgeCertainLanguage(fields.sellerDescription.slice(0, 4000));
  }
  const fallbackSellerDescription = extractSellerDescriptionFromText(fallbackText);
  if ((!fields.sellerDescription || fields.sellerDescription.length < 20) && fallbackSellerDescription) {
    fields.sellerDescription = hedgeCertainLanguage(fallbackSellerDescription);
    json.missingFields = removeMissingField(json.missingFields, "sellerDescription");
  }
  if (!fields.city) {
    const fallbackCity = extractCityFromText(fallbackText);
    if (fallbackCity) {
      fields.city = fallbackCity;
      json.missingFields = removeMissingField(json.missingFields, "city");
    }
  }
  if (!fields.enginePower) {
    const fallbackEnginePower = extractEnginePowerFromText(fallbackText);
    if (fallbackEnginePower) {
      fields.enginePower = fallbackEnginePower;
      json.missingFields = removeMissingField(json.missingFields, "enginePower");
    }
  }
  if (!fields.trim) {
    const fallbackTrim = extractTrimFromText(fallbackText);
    if (fallbackTrim) {
      fields.trim = fallbackTrim;
      json.missingFields = removeMissingField(json.missingFields, "trim");
    }
  }
  if (!fields.fuelType) {
    const fallbackFuelType = extractFuelTypeFromText(fallbackText);
    if (fallbackFuelType) {
      fields.fuelType = fallbackFuelType;
      json.missingFields = removeMissingField(json.missingFields, "fuelType");
    }
  }
  if (!fields.transmission) {
    const fallbackTransmission = extractTransmissionFromText(fallbackText);
    if (fallbackTransmission) {
      fields.transmission = fallbackTransmission;
      json.missingFields = removeMissingField(json.missingFields, "transmission");
    }
  }
  if (!fields.bodyType) {
    const fallbackBodyType = extractBodyTypeFromText(fallbackText);
    if (fallbackBodyType) {
      fields.bodyType = fallbackBodyType;
      json.missingFields = removeMissingField(json.missingFields, "bodyType");
    }
  }
  if (!fields.engineSize) {
    const fallbackEngineSize = extractEngineSizeFromText(fallbackText);
    if (fallbackEngineSize) {
      fields.engineSize = fallbackEngineSize;
      json.missingFields = removeMissingField(json.missingFields, "engineSize");
    }
  }
  if (!fields.ownerInfo) {
    const fallbackOwnerInfo = extractOwnerInfoFromText(fallbackText);
    if (fallbackOwnerInfo) {
      fields.ownerInfo = fallbackOwnerInfo;
      json.missingFields = removeMissingField(json.missingFields, "ownerInfo");
    }
  }
  if (!fields.tradeStatus) {
    const fallbackTradeStatus = extractTradeStatusFromText(fallbackText);
    if (fallbackTradeStatus) {
      fields.tradeStatus = fallbackTradeStatus;
      json.missingFields = removeMissingField(json.missingFields, "tradeStatus");
    }
  }
  const fallbackMileage = extractMileageFromText(fallbackText);
  if (shouldPreferFallbackMileage(fields.mileage, fallbackMileage)) {
    fields.mileage = fallbackMileage;
    json.missingFields = removeMissingField(json.missingFields, "mileage");
  }
  if (!fields.price) {
    const fallbackPrice = extractPriceFromText(fallbackText);
    if (fallbackPrice) {
      fields.price = fallbackPrice;
      json.missingFields = removeMissingField(json.missingFields, "price");
    }
  }
  if (!fields.paintedParts) {
    const fallbackPaintedParts =
      extractPartsUnderLabel(fallbackText, /^boyal[ıi]$/i) ||
      extractQuantifiedPaintedPartsFromText(fallbackText) ||
      extractPartsNearKeyword(fallbackText, /\bboyali\b|\bboyal[ıi]\b|yuzeysel\s+boya|y[üu]zeysel\s+boya|boya\s+vardir|boya\s+vard[ıi]r/i);
    if (fallbackPaintedParts) {
      fields.paintedParts = fallbackPaintedParts;
      json.missingFields = removeMissingField(json.missingFields, "paintedParts");
    }
  }
  if (!fields.replacedParts) {
    const fallbackReplacedParts =
      extractPartsUnderLabel(fallbackText, /^de[ğg]i[şs]en$/i) ||
      extractPartsNearKeyword(fallbackText, /\bdegisen\b|\bde[ğg]i[şs]en\b/i);
    if (fallbackReplacedParts) {
      fields.replacedParts = fallbackReplacedParts;
      json.missingFields = removeMissingField(json.missingFields, "replacedParts");
    }
  }
  if (!fields.localPaintedParts) {
    const fallbackLocalPaintedParts = extractPartsNearKeyword(
      fallbackText,
      /lokal\s+boya|lokal\s+boyali|lokal\s+boyal[ıi]/i,
    );
    if (fallbackLocalPaintedParts) {
      fields.localPaintedParts = fallbackLocalPaintedParts;
      json.missingFields = removeMissingField(json.missingFields, "localPaintedParts");
    }
  }
  if (fields.hasHeavyDamage === null && /a[ğg][ıi]r\s+hasar\s+kayd[ıi]\s+yok|hasar\s+kay[ıi]ts[ıi]z/i.test(fallbackText)) {
    fields.hasHeavyDamage = false;
    json.missingFields = removeMissingField(json.missingFields, "hasHeavyDamage");
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

async function requestOpenRouterListingImportWithModel(input, apiKey, model) {
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
    //
    // PAID_FALLBACK_MODEL needs a much bigger budget than that, for the same
    // reason as photo-damage.js's identical fix: gpt-5-nano is a reasoning
    // model by default and spends *hidden* reasoning tokens out of this same
    // max_tokens budget before ever emitting visible output. Confirmed live:
    // a real request returned finish_reason "length"/"max_output_tokens"
    // with content: null — the whole 3200-token budget was consumed by
    // internal reasoning ("Extracting vehicle data..."), none left for the
    // actual JSON. The paid model's real cost is negligible even at this
    // budget (~$0.004/request worst case), so there's no reason to keep it
    // tight for it specifically.
    maxTokens: model === PAID_FALLBACK_MODEL ? 10000 : 3200,
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

  return normalizeListingImportJson(json, input, model);
}

async function requestOpenRouterListingImport(input) {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) return { error: "OpenRouter API key tanımlı değil." };

  const candidates = resolveListingImportModelCandidates();
  let lastError = "İlan bilgisi işlenemedi.";
  for (let index = 0; index < candidates.length; index += 1) {
    const model = candidates[index];
    const result = await requestOpenRouterListingImportWithModel(input, apiKey, model);
    if (!("error" in result)) {
      return index === 0 ? result : { ...result, fallbackUsed: true };
    }
    console.warn(
      "[listing-import] model attempt failed:",
      JSON.stringify({ model, isLastCandidate: index === candidates.length - 1, error: result.error }),
    );
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

  // TEMPORARY: real listings are still coming back with most fields
  // unfilled and there is no way to tell, from this log alone, whether the
  // client actually captured the vehicle detail table or whether the AI
  // model just failed to read it out of text that did contain it. No PII
  // here — url is the public listing link, bodyText is only measured, not
  // logged in full. Remove once field-extraction quality is confirmed
  // fixed.
  console.log(
    "[listing-import] input sizes:",
    JSON.stringify({
      source: parsed.source,
      url: parsed.url,
      bodyTextLength: parsed.bodyText.length,
      jsonLdCount: parsed.jsonLd.length,
      jsonLdTotalLength: parsed.jsonLd.reduce((sum, item) => sum + item.length, 0),
      bodyTextHead: parsed.bodyText.slice(0, 200),
      bodyTextTail: parsed.bodyText.slice(-200),
    }),
  );

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

  // TEMPORARY: paired with the input-size log above — lets us see whether a
  // thin missingFields list correlates with a short bodyText (truncation /
  // capture problem) or shows up even with a full 20000-char body (model
  // reading problem instead). Remove alongside that log.
  console.log(
    "[listing-import] output quality:",
    JSON.stringify({
      model: aiResult.model,
      fallbackUsed: aiResult.fallbackUsed === true,
      missingFields: aiResult.result.missingFields,
      lowConfidenceFields: aiResult.result.lowConfidenceFields,
      warnings: aiResult.result.warnings,
    }),
  );

  sendJson(response, 200, {
    result: aiResult.result,
    model: aiResult.model,
    fallbackUsed: aiResult.fallbackUsed === true,
    remaining: rateLimit.remaining,
  });
}

module.exports = handler;
module.exports.DEFAULT_MODEL_CANDIDATES = DEFAULT_MODEL_CANDIDATES;
module.exports.PAID_FALLBACK_MODEL = PAID_FALLBACK_MODEL;
module.exports.resolveListingImportModelCandidates = resolveListingImportModelCandidates;
module.exports.BRAND_OPTIONS = BRAND_OPTIONS;
