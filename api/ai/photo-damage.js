const OPENROUTER_CHAT_COMPLETIONS_URL = "https://openrouter.ai/api/v1/chat/completions";
// "openrouter/free" rastgele bir ücretsiz modele yönlendirir; bunların arasında
// nvidia/nemotron-3.5-content-safety:free gibi moderasyon/güvenlik modelleri de
// var ve bunlar görsel girdide de strict JSON şemasını desteklemiyor. Bunun
// yerine görsel girdiyi ve strict JSON şemasını destekleyen, güvenilir,
// isimli bir ücretsiz model kullan.
const DEFAULT_VISION_MODEL = "google/gemma-4-26b-a4b-it:free";
const DEFAULT_PHOTO_DAILY_LIMIT = 10;
const usageKey = "photo-damage";
const productionUrl = "https://eksperiq.vercel.app";
const appName = "EksperIQ";
const counters = new Map();

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

function getTodayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function parseDailyLimit(value) {
  if (!value) return DEFAULT_PHOTO_DAILY_LIMIT;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_PHOTO_DAILY_LIMIT;
}

function reserveMemoryUsage(key, dailyLimit, date = new Date()) {
  const dayKey = getTodayKey(date);
  const record = counters.get(key);
  const usedToday = !record || record.dayKey !== dayKey ? 0 : record.count;
  if (usedToday >= dailyLimit) return { allowed: false, remaining: 0 };
  const next = usedToday + 1;
  counters.set(key, { dayKey, count: next });
  return { allowed: true, remaining: Math.max(dailyLimit - next, 0) };
}

function isRecord(value) {
  return typeof value === "object" && value !== null;
}

function parseImage(value) {
  if (!isRecord(value)) return null;
  if (typeof value.name !== "string" || value.name.length > 120) return null;
  if (typeof value.mimeType !== "string" || !value.mimeType.startsWith("image/")) return null;
  if (typeof value.dataUrl !== "string" || !value.dataUrl.startsWith("data:image/")) return null;
  if (value.dataUrl.length > 6_500_000) return null;
  return {
    name: value.name,
    mimeType: value.mimeType,
    dataUrl: value.dataUrl,
  };
}

function parseInput(value) {
  if (!isRecord(value)) return null;
  if (!Array.isArray(value.images) || value.images.length < 1 || value.images.length > 4) return null;
  const images = value.images.map(parseImage);
  if (images.some((image) => image === null)) return null;
  return {
    images,
    userNote: typeof value.userNote === "string" ? value.userNote.slice(0, 600) : "",
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

const absoluteLanguageReplacements = [
  [/kesinlikle hasar(lı|lıdır|)\b/gi, "olası hasar"],
  [/kesin hasar/gi, "olası hasar"],
  [/hasar(lı|lıdır) kesin/gi, "olası hasarlı"],
  [/kesinlikle\b/gi, "büyük olasılıkla"],
  [/kesindir\b/gi, "olabilir"],
  [/kesin\b/gi, "olası"],
  [/(100\s?%|%\s?100)\s*/gi, ""],
  [/definitely damaged/gi, "possibly damaged"],
  [/confirmed damage/gi, "possible damage"],
  [/is damaged/gi, "may be damaged"],
  [/certainly\b/gi, "possibly"],
  [/definitely\b/gi, "possibly"],
];

function hedgeCertainLanguage(text) {
  if (typeof text !== "string" || !text) return text;
  return absoluteLanguageReplacements.reduce(
    (current, [pattern, replacement]) => current.replace(pattern, replacement),
    text,
  );
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
      "Bu AI fotoğraf kontrolü kesin hasar tespiti değildir. Işık, açı, çözünürlük ve kir gibi etkenler sonucu değiştirebilir.",
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
        "Sen EksperIQ için çalışan dikkatli bir araç fotoğraf kontrol asistanısın. Kesin hasar, kesin parça değişimi veya satın alma kararı verme; her zaman 'olası', 'olabilir', 'kontrol edilmeli' gibi ihtiyatlı ifadeler kullan. Fotoğraf ekran görüntüsü, çizim, doküman, oyuncak veya araçla ilgisiz bir obje ise isVehiclePhoto=false döndür ve bulgu üretme. Fotoğraf bulanık, karanlık, çok yakın çekim veya düşük çözünürlüklüyse ve araç parçası olduğundan emin değilsen isVehiclePhoto=false döndür ya da confidence='low' ile çok sınırlı ve ihtiyatlı bir bulgu ver; asla belirsizliği gizleyip kesin bir hasar iddiası üretme. Fotoğrafta araç yoksa bunu açıkça söyle ve bulgu üretme. Görünür hasar yoksa findings boş dizi olsun. Yanıtı sadece geçerli JSON olarak ver.",
    },
    {
      role: "user",
      content: [
        {
          type: "text",
          text: `Bu görselleri araç dış gövde kontrolü için incele. Kullanıcı notu: ${input.userNote || "Yok"}.

JSON şeması:
{
  "isVehiclePhoto": true | false,
  "summary": "kısa Türkçe özet",
  "findings": [
    {
      "area": "örn. ön tampon",
      "signal": "örn. çizik / göçük / renk farkı / panel hizasızlığı",
      "confidence": "low" | "medium" | "high",
      "explanation": "neden olası göründüğü",
      "recommendation": "ekspertizde ne kontrol edilmeli"
    }
  ]
}

Fotoğrafta araç veya araç parçası yoksa isVehiclePhoto=false ve findings=[] döndür.
Fotoğraf ekran görüntüsü, doküman, çizim ya da araçla ilgisiz bir objeyse isVehiclePhoto=false ve findings=[] döndür.
Fotoğraf bulanık, karanlık veya çok yakın çekimse ve araç parçası olduğundan emin değilsen isVehiclePhoto=false döndür veya yalnızca confidence="low" ile ihtiyatlı bir bulgu ver.
Araç varsa ama görünür hasar sinyali yoksa isVehiclePhoto=true ve findings=[] döndür.
"kesin", "kesinlikle", "definitely" gibi kesinlik bildiren kelimeler kullanma; her zaman olasılık dili kullan.`,
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

async function requestOpenRouterVision(input) {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) return { error: "OpenRouter API key tanımlı değil." };

  const model =
    process.env.OPENROUTER_VISION_MODEL?.trim() || process.env.OPENROUTER_MODEL?.trim() || DEFAULT_VISION_MODEL;
  const response = await fetch(OPENROUTER_CHAT_COMPLETIONS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": productionUrl,
      "X-OpenRouter-Title": appName,
    },
    body: JSON.stringify({
      model,
      messages: buildMessages(input),
      response_format: photoDamageResponseFormat,
      temperature: 0.1,
      max_tokens: 900,
    }),
  });

  if (!response.ok) return { error: `OpenRouter vision isteği başarısız oldu: ${response.status}` };
  const payload = await response.json();
  const text = extractText(payload);
  if (!text) return { error: "AI yanıtı okunamadı." };
  const json = extractJson(text);
  const analysis = json ? normalizeAnalysis(json) : normalizeTextFallback(text);
  if (!analysis) return { error: "AI fotoğraf sonucu işlenemedi." };
  return { analysis, model };
}

async function handler(request, response) {
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

  const input = parseInput(body);
  if (!input) {
    sendJson(response, 400, {
      error: "1-4 adet geçerli araç fotoğrafı gönderin. Her görsel en fazla yaklaşık 5 MB olmalı.",
    });
    return;
  }

  const dailyLimit = parseDailyLimit(process.env.OPENROUTER_PHOTO_DAILY_REQUEST_LIMIT);
  const reservation = reserveMemoryUsage(usageKey, dailyLimit);
  if (!reservation.allowed) {
    sendJson(response, 429, { error: "Günlük AI fotoğraf analizi limiti doldu.", remaining: 0 });
    return;
  }

  const result = await requestOpenRouterVision(input);
  if ("error" in result) {
    sendJson(response, 502, { error: result.error, remaining: reservation.remaining });
    return;
  }

  sendJson(response, 200, {
    analysis: result.analysis,
    model: result.model,
    remaining: reservation.remaining,
  });
}

module.exports = handler;
module.exports.DEFAULT_VISION_MODEL = DEFAULT_VISION_MODEL;
