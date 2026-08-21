const { checkRateLimit } = require("../_lib/rate-limit.js");
const { callOpenRouterChatCompletions, hedgeCertainLanguage } = require("../_lib/openrouter.js");
const { applyCorsHeaders, handlePreflight } = require("../_lib/cors.js");

// "openrouter/free" rastgele bir ücretsiz modele yönlendirir; bunların arasında
// nvidia/nemotron-3.5-content-safety:free gibi moderasyon/güvenlik modelleri de
// var ve bunlar görsel girdide de strict JSON şemasını desteklemiyor. Bunun
// yerine görsel girdiyi ve strict JSON şemasını destekleyen, güvenilir,
// isimli bir ücretsiz model kullan.
const DEFAULT_VISION_MODEL = "google/gemma-4-26b-a4b-it:free";
// A single request still caps at 4 images (Vercel's serverless body-size
// limit — see MAX_TOTAL_IMAGE_DATA_URL_CHARS below), so the client sends a
// listing's photos as sequential batches. 3 free listings/day x up to 20
// photos (5 batches of 4) = 15 requests/day per device; the burst window
// needs enough headroom for one full 5-batch listing analysis to complete
// without tripping on request #5.
const DEFAULT_PHOTO_DAILY_LIMIT = 300;
const DEFAULT_PHOTO_DAILY_LIMIT_PER_INSTALL = 15;
const DEFAULT_BURST_LIMIT = 8;
const DEFAULT_BURST_WINDOW_SECONDS = 60;
// Vercel serverless functions reject request bodies over ~4.5MB before this
// handler even runs. This is a second, independent check: the client already
// compresses images to stay under MAX_AI_UPLOAD_PAYLOAD_BYTES
// (src/lib/photo-analysis/prepare-ai-image.ts), but a client can be spoofed
// or out of date, so the server must never trust it alone.
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
  return {
    name: value.name,
    mimeType: value.mimeType,
    dataUrl: value.dataUrl,
  };
}

// { ok: true, input } | { ok: false, reason: "invalid" | "too-large" }
function parseInput(value) {
  if (!isRecord(value)) return { ok: false, reason: "invalid" };
  if (value.aiProviderConsent !== true) return { ok: false, reason: "missing-consent" };
  if (!Array.isArray(value.images) || value.images.length < 1 || value.images.length > 4) {
    return { ok: false, reason: "invalid" };
  }

  const totalRawLength = value.images.reduce(
    (sum, image) => sum + (isRecord(image) && typeof image.dataUrl === "string" ? image.dataUrl.length : 0),
    0,
  );
  if (totalRawLength > MAX_TOTAL_IMAGE_DATA_URL_CHARS) return { ok: false, reason: "too-large" };

  const images = value.images.map(parseImage);
  if (images.some((image) => image === null)) return { ok: false, reason: "invalid" };

  return {
    ok: true,
    input: {
      images,
      userNote: typeof value.userNote === "string" ? value.userNote.slice(0, 600) : "",
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

function looksLikeNoDamageFinding(finding) {
  if (!isRecord(finding)) return false;
  const text = [finding.signal, finding.label, finding.explanation, finding.recommendation]
    .filter((value) => typeof value === "string")
    .join(" ")
    .toLocaleLowerCase("tr-TR");
  return (
    text.includes("no visible damage") ||
    text.includes("no signs") ||
    text.includes("no action required") ||
    text.includes("hasar yok") ||
    text.includes("bulgu yok") ||
    text.includes("işlem gerekmiyor")
  );
}

function normalizeSignal(finding) {
  if (!isRecord(finding)) return "Olası kontrol notu";
  if (typeof finding.signal === "string" && finding.signal.trim()) return finding.signal.slice(0, 80);
  if (typeof finding.label === "string" && finding.label.trim()) return finding.label.slice(0, 80);
  return "Olası kontrol notu";
}

function normalizeAnalysis(value) {
  if (!isRecord(value)) return null;
  const isVehiclePhoto = value.isVehiclePhoto === true;
  const summary = typeof value.summary === "string" ? hedgeCertainLanguage(value.summary.slice(0, 500)) : "";
  const findings = Array.isArray(value.findings) ? value.findings : [];
  return {
    isVehiclePhoto,
    summary:
      summary ||
      (isVehiclePhoto
        ? "Fotoğrafta araçla ilgili kontrol edilebilecek alanlar var."
        : "Fotoğrafta araç veya araç parçası güvenle tespit edilemedi."),
    findings: isVehiclePhoto
      ? findings
          .filter((finding) => !looksLikeNoDamageFinding(finding))
          .slice(0, 8)
          .map((finding, index) => ({
            id: `ai-photo-${index + 1}`,
            area: isRecord(finding) && typeof finding.area === "string" ? finding.area.slice(0, 80) : "Genel dış gövde",
            signal: normalizeSignal(finding),
            confidence:
              isRecord(finding) && ["low", "medium", "high"].includes(finding.confidence) ? finding.confidence : "low",
            explanation:
              isRecord(finding) && typeof finding.explanation === "string"
                ? hedgeCertainLanguage(finding.explanation.slice(0, 500))
                : "Görselden kesin hüküm verilemez; ekspertizde doğrulanmalıdır.",
            recommendation:
              isRecord(finding) && typeof finding.recommendation === "string" && !looksLikeNoDamageFinding(finding)
                ? hedgeCertainLanguage(finding.recommendation.slice(0, 300))
                : "Bağımsız ekspertizde kontrol ettirin.",
          }))
      : [],
    disclaimer:
      "Bu AI fotoğraf kontrolü kesin hasar veya arıza tespiti değildir. Işık, açı, çözünürlük, kir ve uyarı lambasının gerçek arıza kodu gibi etkenler sonucu değiştirebilir.",
  };
}

function normalizeTextFallback(text) {
  const normalized = text.toLocaleLowerCase("tr-TR");
  const saysNoVehicle =
    normalized.includes("araç yok") ||
    normalized.includes("araç bulunmamaktadır") ||
    normalized.includes("araç fotoğrafı değil") ||
    normalized.includes("no vehicle") ||
    normalized.includes("not a vehicle");
  const saysVehicle =
    normalized.includes("araç") ||
    normalized.includes("araba") ||
    normalized.includes("gösterge") ||
    normalized.includes("uyarı ışığı") ||
    normalized.includes("uyarı lambası") ||
    normalized.includes("motor arıza") ||
    normalized.includes("car") ||
    normalized.includes("vehicle");

  if (!saysNoVehicle && !saysVehicle) return null;

  return normalizeAnalysis({
    isVehiclePhoto: !saysNoVehicle,
    summary: text.slice(0, 500),
    findings: [],
  });
}

const photoDamageResponseFormat = {
  type: "json_schema",
  json_schema: {
    name: "eksperiq_photo_damage_analysis",
    strict: true,
    schema: {
      type: "object",
      additionalProperties: false,
      required: ["isVehiclePhoto", "summary", "findings"],
      properties: {
        isVehiclePhoto: { type: "boolean" },
        summary: { type: "string" },
        findings: {
          type: "array",
          maxItems: 8,
          items: {
            type: "object",
            additionalProperties: false,
            required: ["area", "signal", "confidence", "explanation", "recommendation"],
            properties: {
              area: { type: "string" },
              signal: { type: "string" },
              confidence: { type: "string", enum: ["low", "medium", "high"] },
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
        "Sen EksperIQ için çalışan dikkatli bir araç fotoğraf ve gösterge paneli kontrol asistanısın. TÜM metin alanlarını (summary, area, signal, explanation, recommendation) SADECE Türkçe yaz; tek bir İngilizce, Fransızca veya başka dilden kelime bile karıştırma, teknik terimlerin de Türkçe karşılığını kullan. Kesin hasar, kesin parça değişimi, kesin arıza teşhisi veya satın alma kararı verme; her zaman 'olası', 'olabilir', 'kontrol edilmeli' gibi ihtiyatlı ifadeler kullan. Araç dış/iç fotoğrafı, araç parçası, gösterge paneli, kadran veya uyarı lambası fotoğrafı araçla ilgilidir ve isVehiclePhoto=true dönebilir. Fotoğraf ekran görüntüsü, çizim, doküman, oyuncak veya araçla ilgisiz bir obje ise isVehiclePhoto=false döndür ve bulgu üretme. Fotoğraf bulanık, karanlık, çok yakın çekim veya düşük çözünürlüklüyse ve araçla ilgili olduğundan emin değilsen isVehiclePhoto=false döndür ya da confidence='low' ile çok sınırlı ve ihtiyatlı bir bulgu ver; asla belirsizliği gizleyip kesin bir hasar veya arıza iddiası üretme. Gösterge panelinde uyarı ışığı varsa area='Gösterge paneli' veya 'Kadran', signal='Uyarı ışığı' ya da görünen uyarının Türkçe adı olsun; explanation uyarının ne anlama gelebileceğini, recommendation ise kullanıcının sürüşe devam edip etmemesi, kendi kontrol edebileceği basit adım, oto tamirci/servis/OBD kontrolü gerekip gerekmediğini söylesin. Kırmızı yağ basıncı, hararet, fren veya akü/şarj uyarısında güvenli yerde durma ve servis/yol yardımı öner; sarı motor arıza, ABS/ESP, airbag veya lastik basıncı uyarısında kontrollü kullanım, basit kontrol ve servis/OBD doğrulaması öner. Fotoğrafta araçla ilgili görsel yoksa bunu açıkça söyle ve bulgu üretme. Görünür hasar veya uyarı yoksa findings boş dizi olsun. Yanıtı sadece geçerli JSON olarak ver.",
    },
    {
      role: "user",
      content: [
        {
          type: "text",
          text: `Bu görselleri araç dış gövde, araç içi ve gösterge paneli uyarı ışığı kontrolü için incele. Kullanıcı notu: ${input.userNote || "Yok"}.

JSON şeması:
{
  "isVehiclePhoto": true | false,
  "summary": "kısa Türkçe özet",
  "findings": [
    {
      "area": "örn. ön tampon / sağ kapı / gösterge paneli / kadran",
      "signal": "örn. çizik / göçük / renk farkı / panel hizasızlığı / motor arıza lambası / yağ basıncı uyarısı",
      "confidence": "low" | "medium" | "high",
      "explanation": "neden olası göründüğü",
      "recommendation": "ekspertizde, serviste, oto tamircide veya kullanıcının güvenli şekilde neyi kontrol etmesi gerektiği"
    }
  ]
}

Fotoğrafta araç, araç parçası, gösterge paneli, kadran veya uyarı lambası yoksa isVehiclePhoto=false ve findings=[] döndür.
Fotoğraf ekran görüntüsü, doküman, çizim ya da araçla ilgisiz bir objeyse isVehiclePhoto=false ve findings=[] döndür.
Fotoğraf bulanık, karanlık veya çok yakın çekimse ve araçla ilgili olduğundan emin değilsen isVehiclePhoto=false döndür veya yalnızca confidence="low" ile ihtiyatlı bir bulgu ver.
Araç varsa ama görünür hasar sinyali veya uyarı lambası yoksa isVehiclePhoto=true ve findings=[] döndür.
Gösterge panelinde uyarı lambası görünüyorsa bunu hasar gibi değil arıza/uyarı yorumu gibi ele al; kesin arıza teşhisi koyma, OBD/servis doğrulaması gerektiğini belirt.
"kesin", "kesinlikle", "definitely" gibi kesinlik bildiren kelimeler kullanma; her zaman olasılık dili kullan.
Tüm metin alanlarını yalnızca Türkçe yaz, başka dilden tek kelime bile ekleme.`,
        },
        ...input.images.map((image) => ({
          type: "image_url",
          image_url: {
            url: image.dataUrl,
          },
        })),
      ],
    },
  ];
}

function resolveVisionModel() {
  const configured = process.env.OPENROUTER_VISION_MODEL?.trim() || process.env.OPENROUTER_MODEL?.trim();
  return configured && configured.endsWith(":free") ? configured : DEFAULT_VISION_MODEL;
}

async function requestOpenRouterVision(input) {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) return { error: "OpenRouter API key tanımlı değil." };

  const model = resolveVisionModel();
  const result = await callOpenRouterChatCompletions({
    apiKey,
    model,
    messages: buildMessages(input),
    responseFormat: photoDamageResponseFormat,
    temperature: 0.1,
    maxTokens: 900,
    refererUrl: productionUrl,
    appName,
  });
  if (!result.ok) return { error: result.error };

  const text = extractText(result.payload);
  if (!text) return { error: "AI yanıtı okunamadı." };
  const json = extractJson(text);
  const analysis = json ? normalizeAnalysis(json) : normalizeTextFallback(text);
  if (!analysis) return { error: "AI fotoğraf sonucu işlenemedi." };
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

  if (process.env.NEXT_PUBLIC_AI_PHOTO_DAMAGE_ENABLED !== "true") {
    sendJson(response, 429, { error: "AI fotoğraf analizi şu anda kapalı." });
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
    sendJson(response, 413, {
      error: "Fotoğraf verisi çok büyük. Daha az fotoğraf seçip tekrar deneyin.",
    });
    return;
  }
  if (!parsed.ok && parsed.reason === "missing-consent") {
    sendJson(response, 400, {
      error: "AI fotoğraf kontrolü için AI sağlayıcısına veri gönderimi onayı zorunludur.",
    });
    return;
  }
  if (!parsed.ok) {
    sendJson(response, 400, {
      error: "1-4 adet geçerli araç fotoğrafı gönderin. Her görsel en fazla yaklaşık 2 MB olmalı.",
    });
    return;
  }
  const input = parsed.input;

  const rateLimit = await checkRateLimit(request, {
    usageKey: "photo-damage",
    burstLimit: parsePositiveInt(process.env.AI_BURST_LIMIT, DEFAULT_BURST_LIMIT),
    burstWindowSeconds: parsePositiveInt(process.env.AI_BURST_WINDOW_SECONDS, DEFAULT_BURST_WINDOW_SECONDS),
    dailyLimitPerIdentity: parsePositiveInt(
      process.env.AI_PHOTO_DAILY_LIMIT_PER_INSTALL,
      DEFAULT_PHOTO_DAILY_LIMIT_PER_INSTALL,
    ),
    globalDailyLimit: parsePositiveInt(process.env.OPENROUTER_PHOTO_DAILY_REQUEST_LIMIT, DEFAULT_PHOTO_DAILY_LIMIT),
  });

  if (!rateLimit.ok) {
    if (rateLimit.reason === "unavailable") {
      sendJson(response, 503, {
        error: "AI kullanım limiti şu anda doğrulanamadı. Manuel bulgu ekleyerek devam edebilirsiniz.",
      });
      return;
    }
    if (rateLimit.reason === "burst") {
      sendJson(response, 429, { error: "Çok hızlı istek gönderildi. Birazdan tekrar deneyin.", remaining: 0 });
      return;
    }
    sendJson(response, 429, { error: "Günlük AI fotoğraf analizi limiti doldu.", remaining: 0 });
    return;
  }

  const result = await requestOpenRouterVision(input);
  if ("error" in result) {
    console.error("[photo-damage] OpenRouter call failed:", result.error);
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
module.exports.DEFAULT_VISION_MODEL = DEFAULT_VISION_MODEL;
module.exports.resolveVisionModel = resolveVisionModel;
