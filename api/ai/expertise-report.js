const { checkRateLimit } = require("../_lib/rate-limit.js");
const { callOpenRouterChatCompletions, hedgeCertainLanguage } = require("../_lib/openrouter.js");
const { applyCorsHeaders, handlePreflight } = require("../_lib/cors.js");

// Ekspertiz raporlari yogun tablo/checkbox icerdigi icin genel amacli ucretsiz
// yonlendirme modelleri yerine gorsel girdiyi guvenilir okuyan, isimli bir
// model kullanilir (bkz. api/ai/photo-damage.js'deki ayni gerekce).
const DEFAULT_VISION_MODEL = "google/gemma-4-26b-a4b-it:free";
const DEFAULT_DAILY_LIMIT = 10;
const DEFAULT_DAILY_LIMIT_PER_INSTALL = 4;
const DEFAULT_BURST_LIMIT = 5;
const DEFAULT_BURST_WINDOW_SECONDS = 60;
const MAX_SINGLE_IMAGE_DATA_URL_CHARS = 3_000_000;
const MAX_TOTAL_IMAGE_DATA_URL_CHARS = 4_200_000;
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

function parseImage(value) {
  if (!isRecord(value)) return null;
  if (typeof value.name !== "string" || value.name.length > 120) return null;
  if (typeof value.mimeType !== "string" || !value.mimeType.startsWith("image/")) return null;
  if (typeof value.dataUrl !== "string" || !value.dataUrl.startsWith("data:image/")) return null;
  if (value.dataUrl.length > MAX_SINGLE_IMAGE_DATA_URL_CHARS) return null;
  return { name: value.name, mimeType: value.mimeType, dataUrl: value.dataUrl };
}

// { ok: true, input } | { ok: false, reason: "invalid" | "too-large" | "missing-consent" }
function parseInput(value) {
  if (!isRecord(value)) return { ok: false, reason: "invalid" };
  if (value.aiProviderConsent !== true) return { ok: false, reason: "missing-consent" };
  if (!Array.isArray(value.images) || value.images.length < 1 || value.images.length > 6) {
    return { ok: false, reason: "invalid" };
  }

  const totalRawLength = value.images.reduce(
    (sum, image) => sum + (isRecord(image) && typeof image.dataUrl === "string" ? image.dataUrl.length : 0),
    0,
  );
  if (totalRawLength > MAX_TOTAL_IMAGE_DATA_URL_CHARS) return { ok: false, reason: "too-large" };

  const images = value.images.map(parseImage);
  if (images.some((image) => image === null)) return { ok: false, reason: "invalid" };

  return { ok: true, input: { images } };
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

const VALID_RISK = ["low", "medium", "high"];

function normalizeAnalysis(value) {
  if (!isRecord(value)) return null;
  const isReportReadable = value.isReportReadable !== false;
  const overallRisk = VALID_RISK.includes(value.overallRisk) ? value.overallRisk : "low";
  const summary = typeof value.summary === "string" ? hedgeCertainLanguage(value.summary.slice(0, 600)) : "";
  const findingsRaw = Array.isArray(value.findings) ? value.findings : [];

  return {
    isReportReadable,
    overallRisk: isReportReadable ? overallRisk : "low",
    summary:
      summary ||
      (isReportReadable
        ? "Rapordan kontrol edilebilecek bulgular çıkarıldı."
        : "Yüklenen dosya bir ekspertiz raporu olarak güvenle okunamadı."),
    findings: isReportReadable
      ? findingsRaw.slice(0, 12).map((finding, index) => ({
          id: `report-${index + 1}`,
          category:
            isRecord(finding) && typeof finding.category === "string" ? finding.category.slice(0, 60) : "Genel",
          area: isRecord(finding) && typeof finding.area === "string" ? finding.area.slice(0, 80) : "Belirtilmemiş",
          status: isRecord(finding) && typeof finding.status === "string" ? finding.status.slice(0, 60) : "",
          explanation:
            isRecord(finding) && typeof finding.explanation === "string"
              ? hedgeCertainLanguage(finding.explanation.slice(0, 500))
              : "",
          recommendation:
            isRecord(finding) && typeof finding.recommendation === "string"
              ? hedgeCertainLanguage(finding.recommendation.slice(0, 300))
              : "Bağımsız ekspertizde doğrulatın.",
        }))
      : [],
    disclaimer:
      "Bu özet raporun AI ile okunmasından oluşur; orijinal rapor ve bağımsız ekspertiz görüşü yerine geçmez.",
  };
}

const expertiseReportResponseFormat = {
  type: "json_schema",
  json_schema: {
    name: "eksperiq_expertise_report_analysis",
    strict: true,
    schema: {
      type: "object",
      additionalProperties: false,
      required: ["isReportReadable", "overallRisk", "summary", "findings"],
      properties: {
        isReportReadable: { type: "boolean" },
        overallRisk: { type: "string", enum: ["low", "medium", "high"] },
        summary: { type: "string" },
        findings: {
          type: "array",
          maxItems: 12,
          items: {
            type: "object",
            additionalProperties: false,
            required: ["category", "area", "status", "explanation", "recommendation"],
            properties: {
              category: { type: "string" },
              area: { type: "string" },
              status: { type: "string" },
              explanation: { type: "string" },
              recommendation: { type: "string" },
            },
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
        "Sen EksperIQ icin calisan, Turkiye'deki arac ekspertiz raporlarini (TUVTURK, ozel ekspertiz firmalari) okuyup ortalama bir arac alicisina sade Turkce ile yorumlayan dikkatli bir asistansin. Rapor genelde panel bazli boya/degisen/orijinal tablosu, mekanik/elektronik kontrol listesi ve genel notlar icerir. Goruntudeki tum sayfalari oku, tabloyu ve checkbox/isaretleri dikkatle yorumla. " +
        "Ciddiyet siralamasini her zaman soyle degerlendir: 'orijinal' normaldir, sorun degildir. 'boyali'/'lokal boyali' cogunlukla kozmetik bir islemdir (tampon, camurluk gibi disaridan darbe alan parcalarda sik gorulur), tek basina ciddi bir bulgu degildir. 'degisen' parcalar arasinda da fark var: tampon/camurluk/kapi gibi carpisma parcalarinin degismis olmasi her zaman agir kaza anlamina gelmez, ama kaput, tavan, on/arka panel, direk (A/B/C direk) veya sasi/podyede boya/degisen/islem/kaynak izi varsa bunu HER ZAMAN yuksek riskli olarak isaretle ve aciklamada bu bolgelerin aracin tasiyici govdesi oldugunu, agir kaza gecmisine isaret edebilecegini belirt. Coklu parcada (3+ panel) boya/degisen varsa bunu da ayrica riskli olarak vurgula, tek parca degisiminden farkli olarak genis capli bir onarim/kaza gecmisine isaret edebilir. " +
        "Kesin hukum verme; her zaman 'olasi', 'kontrol edilmeli' gibi ihtiyatli dil kullan. Yuklenen gorsel bir ekspertiz raporuna benzemiyorsa (alakasiz fotograf, bos sayfa, okunamayacak kadar bulanik) isReportReadable=false don ve findings=[] birak. Tum metin alanlarini SADECE Turkce yaz; baska bir dilden tek kelime bile karistirma.",
    },
    {
      role: "user",
      content: [
        {
          type: "text",
          text: `Bu ekspertiz raporu goruntulerini incele ve JSON semasina gore yanitla:
{
  "isReportReadable": true | false,
  "overallRisk": "low" | "medium" | "high",
  "summary": "kisa Turkce ozet",
  "findings": [
    {
      "category": "orn. Boya/Degisen, Mekanik, Elektronik, Sasi/Podye, Airbag",
      "area": "orn. sag on capa, motor, sasi",
      "status": "orn. degisen, boyali, ariza kaydi var",
      "explanation": "neden onemli oldugu",
      "recommendation": "satici/ekspertizde ne sorulmali/kontrol edilmeli"
    }
  ]
}
Rapor okunamiyorsa veya ekspertiz raporu degilse isReportReadable=false ve findings=[] don.
Onemli/riskli bulgulari once siralayarak listele. "kesin", "kesinlikle" gibi kesinlik bildiren kelimeler kullanma.`,
        },
        ...input.images.map((image) => ({ type: "image_url", image_url: { url: image.dataUrl } })),
      ],
    },
  ];
}

// Ayni kademelendirme mantigi api/ai/photo-damage.js'deki resolveVisionModel
// ile birebir aynidir (bkz. oradaki yorum): FORCE bayraklari yalnizca
// admin'in kendi test ortaminda model kalitesi karsilastirmasi icindir,
// gercek kullanici bazli Pro/Pro+ secimi degildir.
function resolveVisionModel() {
  const isForcedProPlus = process.env.EKSPERIQ_FORCE_PRO_PLUS === "true";
  const proPlusModel = process.env.OPENROUTER_VISION_MODEL_PRO_PLUS?.trim();
  if (isForcedProPlus && proPlusModel) return proPlusModel;

  const isForcedPro = process.env.EKSPERIQ_FORCE_PRO === "true";
  const proModel = process.env.OPENROUTER_VISION_MODEL_PRO?.trim();
  if (isForcedPro && proModel) return proModel;

  return process.env.OPENROUTER_VISION_MODEL?.trim() || process.env.OPENROUTER_MODEL?.trim() || DEFAULT_VISION_MODEL;
}

async function requestOpenRouterVision(input) {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) return { error: "OpenRouter API key tanımlı değil." };

  const model = resolveVisionModel();
  const result = await callOpenRouterChatCompletions({
    apiKey,
    model,
    messages: buildMessages(input),
    responseFormat: expertiseReportResponseFormat,
    temperature: 0.1,
    maxTokens: 1400,
    refererUrl: productionUrl,
    appName,
  });
  if (!result.ok) return { error: result.error };

  const text = extractText(result.payload);
  if (!text) return { error: "AI yanıtı okunamadı." };
  const json = extractJson(text);
  if (!json) return { error: "AI rapor sonucu işlenemedi." };
  const analysis = normalizeAnalysis(json);
  if (!analysis) return { error: "AI rapor sonucu işlenemedi." };
  return { analysis, model };
}

async function handler(request, response) {
  applyCorsHeaders(request, response);
  if (handlePreflight(request, response)) return;

  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    sendJson(response, 405, { error: "Yalnızca POST desteklenir." });
    return;
  }

  if (process.env.NEXT_PUBLIC_EXPERTISE_REPORT_AI_ENABLED !== "true") {
    sendJson(response, 429, { error: "Ekspertiz raporu AI analizi şu anda kapalı." });
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
  if (!parsed.ok && parsed.reason === "too-large") {
    sendJson(response, 413, { error: "Rapor verisi çok büyük. Daha az sayfa/fotoğrafla tekrar deneyin." });
    return;
  }
  if (!parsed.ok && parsed.reason === "missing-consent") {
    sendJson(response, 400, { error: "AI rapor analizi için AI sağlayıcısına veri gönderimi onayı zorunludur." });
    return;
  }
  if (!parsed.ok) {
    sendJson(response, 400, { error: "1-6 adet geçerli sayfa/fotoğraf gönderin." });
    return;
  }
  const input = parsed.input;

  const rateLimit = await checkRateLimit(request, {
    usageKey: "expertise-report",
    burstLimit: parsePositiveInt(process.env.AI_BURST_LIMIT, DEFAULT_BURST_LIMIT),
    burstWindowSeconds: parsePositiveInt(process.env.AI_BURST_WINDOW_SECONDS, DEFAULT_BURST_WINDOW_SECONDS),
    dailyLimitPerIdentity: parsePositiveInt(
      process.env.AI_EXPERTISE_REPORT_DAILY_LIMIT_PER_INSTALL,
      DEFAULT_DAILY_LIMIT_PER_INSTALL,
    ),
    globalDailyLimit: parsePositiveInt(
      process.env.OPENROUTER_EXPERTISE_REPORT_DAILY_REQUEST_LIMIT,
      DEFAULT_DAILY_LIMIT,
    ),
  });

  if (!rateLimit.ok) {
    if (rateLimit.reason === "unavailable") {
      sendJson(response, 503, { error: "AI kullanım limiti şu anda doğrulanamadı. Birazdan tekrar deneyin." });
      return;
    }
    if (rateLimit.reason === "burst") {
      sendJson(response, 429, { error: "Çok hızlı istek gönderildi. Birazdan tekrar deneyin.", remaining: 0 });
      return;
    }
    sendJson(response, 429, { error: "Günlük AI rapor analizi limiti doldu.", remaining: 0 });
    return;
  }

  const result = await requestOpenRouterVision(input);
  if ("error" in result) {
    console.error("[expertise-report] OpenRouter call failed:", result.error);
    sendJson(response, 502, { error: result.error, remaining: rateLimit.remaining });
    return;
  }

  sendJson(response, 200, { analysis: result.analysis, model: result.model, remaining: rateLimit.remaining });
}

module.exports = handler;
module.exports.DEFAULT_VISION_MODEL = DEFAULT_VISION_MODEL;
module.exports.resolveVisionModel = resolveVisionModel;
