const { checkRateLimit } = require("../_lib/rate-limit.js");
const { callOpenRouterChatCompletions, hedgeCertainLanguage } = require("../_lib/openrouter.js");
const { applyCorsHeaders, handlePreflight } = require("../_lib/cors.js");

// "openrouter/free" rastgele bir ücretsiz modele yönlendirir; bunların arasında
// nvidia/nemotron-3.5-content-safety:free gibi moderasyon/güvenlik modelleri de
// var ve bunlar görsel girdide de strict JSON şemasını desteklemiyor. Bunun
// yerine görsel girdiyi destekleyen isimli ücretsiz modelleri sırayla dene.
//
// nvidia/nemotron-nano-12b-v2-vl:free, nvidia/nemotron-3-nano-omni-30b-a3b-
// reasoning:free, and both thinkingmachines/inkling(-small):free variants
// are all listed in OpenRouter's public /models catalog but every one of
// them returned 404/403 live from this endpoint on every attempt — being
// catalog-listed doesn't mean actually callable with this API key. Removed.
//
// dots-studio/dots-3-note-preview:free removed entirely — confirmed live in
// 4 distinct failure modes across repeated testing: (1) endless "Thinking
// Process:" narration that never reaches JSON at all, even at
// max_tokens=2000; (2) that same leaked narration reciting the system
// prompt's own vocabulary back to itself, causing a false "no vehicle
// detected"; (3) genuinely good, accurate Turkish content but with the JSON
// object cut off incomplete before the last field closes; (4) random
// Chinese characters spliced into the middle of Turkish sentences
// ("...sistemlerini学习 etmek için..."). Not fixable by prompting or token
// budget — this model is simply unreliable for a Turkish-only strict-JSON
// task. PAID_FALLBACK_MODEL below is the real, reliable answer once the
// named free models are exhausted.
const DEFAULT_VISION_MODEL_CANDIDATES = ["google/gemma-4-26b-a4b-it:free", "google/gemma-4-31b-it:free"];
const DEFAULT_VISION_MODEL = DEFAULT_VISION_MODEL_CANDIDATES[0];
const FREE_ROUTER_FALLBACK_MODEL = "openrouter/free";
// Confirmed live (2026-08-23): OpenRouter's free vision tier has very thin
// real capacity — at one point every free candidate above AND
// openrouter/free itself were 429/404/403 in the same request, leaving
// users with an honest "AI couldn't classify" note instead of a real
// answer, no matter how the free candidate list is tuned. This is a true
// last resort, tried only after every free option above has failed:
// openai/gpt-5-nano, a real paid model (verified against OpenRouter's
// /models catalog: vision-capable, ~$0.00000005/prompt-token — a few
// thousandths of a cent per photo), from OpenAI's own infrastructure
// rather than a small community-hosted free model, so it isn't subject to
// the same capacity/availability problems. Owner explicitly approved this
// cost tradeoff (2026-08-23). Set OPENROUTER_DISABLE_PAID_PHOTO_FALLBACK=
// "true" in Vercel to turn it back off without a code change.
const PAID_FALLBACK_MODEL = "openai/gpt-5-nano";
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
    const text = content
      .map((part) => {
        if (!isRecord(part)) return "";
        if (typeof part.text === "string") return part.text;
        if (typeof part.output_text === "string") return part.output_text;
        if (isRecord(part.text) && typeof part.text.value === "string") return part.text.value;
        return "";
      })
      .join("")
      .trim();
    if (text) return text;
  }
  if (typeof message.reasoning === "string") return message.reasoning;
  if (typeof firstChoice.text === "string") return firstChoice.text;
  return null;
}

function extractPayloadError(payload) {
  if (!isRecord(payload) || !isRecord(payload.error)) return null;
  const { error } = payload;
  if (typeof error.message === "string" && error.message.trim()) return error.message.slice(0, 240);
  if (typeof error.code === "string" && error.code.trim()) return error.code.slice(0, 120);
  return "OpenRouter görsel modeli hata döndürdü.";
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

function normalizeShortTextList(value, fallback) {
  const list = Array.isArray(value)
    ? value.filter((item) => typeof item === "string" && item.trim()).map((item) => hedgeCertainLanguage(item.slice(0, 160)))
    : [];
  return list.length ? list.slice(0, 4) : fallback;
}

function normalizePhotoQuality(value, isVehiclePhoto) {
  if (!isRecord(value)) {
    return {
      status: "usable",
      issues: [],
      retakeTips: isVehiclePhoto
        ? [
            "Aynı bölgeyi düz, sağ çapraz ve sol çapraz açıdan tekrar çekin.",
            "Çizik veya boya farkı için parlama olmayan homojen ışık kullanın.",
          ]
        : ["Araç, araç parçası, gösterge paneli veya uyarı lambası net görünecek şekilde tekrar fotoğraf çekin."],
    };
  }

  const rawStatus = typeof value.status === "string" ? value.status : "";
  const status = ["good", "usable", "poor"].includes(rawStatus) ? rawStatus : "usable";
  return {
    status,
    issues: normalizeShortTextList(value.issues, status === "good" ? [] : ["Fotoğraf kalitesi sınırlı olabilir."]),
    retakeTips: normalizeShortTextList(value.retakeTips, [
      "Parça tamamı görünecek şekilde bir genel fotoğraf ve aynı bölgeden bir yakın fotoğraf çekin.",
      "Yansımayı azaltmak için aracı gölgeye alın veya kamerayı hafif çapraz açıya getirin.",
    ]),
  };
}

function describesNonVehiclePhoto(text) {
  const normalized = text.toLocaleLowerCase("tr-TR");
  const noVehicleSignals = [
    "araç değil",
    "arac degil",
    "araç fotoğrafı değil",
    "arac fotografi degil",
    "araç bulunmuyor",
    "arac bulunmuyor",
    "araç görünmüyor",
    "arac gorunmuyor",
    "araç yok",
    "arac yok",
    "araba yok",
    "otomobil yok",
    "vehicle is not visible",
    "no vehicle",
    "not a vehicle",
    "not a car",
  ];
  const unrelatedContentSignals = [
    "ekran görüntüsü",
    "ekran goruntusu",
    "telefon ekranı",
    "telefon ekrani",
    "screenshot",
    "doküman",
    "dokuman",
    "document",
    "evrak",
    "çizim",
    "cizim",
    "oyuncak",
    "insan",
    "kişi",
    "kisi",
    "hayvan",
    "yemek",
    "mobilya",
  ];
  return (
    noVehicleSignals.some((signal) => normalized.includes(signal)) ||
    unrelatedContentSignals.some((signal) => normalized.includes(signal))
  );
}

function normalizeAnalysis(value) {
  if (!isRecord(value)) return null;
  const summary = typeof value.summary === "string" ? hedgeCertainLanguage(value.summary.slice(0, 500)) : "";
  const isVehiclePhoto = value.isVehiclePhoto === true && !describesNonVehiclePhoto(summary);
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
    photoQuality: normalizePhotoQuality(value.photoQuality, isVehiclePhoto),
    disclaimer:
      "Bu AI fotoğraf kontrolü kesin hasar veya arıza tespiti değildir. Işık, açı, çözünürlük, kir ve uyarı lambasının gerçek arıza kodu gibi etkenler sonucu değiştirebilir.",
  };
}

function normalizeTextFallback(text) {
  const normalized = text.toLocaleLowerCase("tr-TR");

  const looksLikeReasoningLeak =
    /thinking process|analyze the request|strict json|provided schema|step\s*\d|chain of thought/i.test(text);
  const cleanText = text
    .replace(/thinking process:[\s\S]*/i, "")
    .replace(/```[\s\S]*?```/g, "")
    .trim();
  // Only usable when it's real prose from the model, not schema/reasoning
  // noise — otherwise any stray word in that noise ends up keyword-matched
  // into a confident-sounding but fabricated conclusion, completely
  // disconnected from what the photo actually shows. Seen live, twice:
  // (1) a photo of a car with its entire front bumper torn off got labeled
  // "Ön sol bölüm: Olası uyarı ışığı" (dashboard warning light) because the
  // leaked text happened to contain "front-left"/"warning"-ish fragments;
  // (2) the SAME photo, on a retry, came back "no vehicle detected at all"
  // because the model's leaked reasoning recited the system prompt's own
  // classification vocabulary back to itself while working through the
  // schema ("ekran görüntüsü, çizim, doküman, oyuncak" — the prompt's own
  // list of non-vehicle categories) and that recitation, not any real
  // judgment about the image, tripped the no-vehicle keyword check.
  const hasUsableText = Boolean(cleanText) && !looksLikeReasoningLeak;
  // "No vehicle" is only trustworthy when it's the model's own clean
  // conclusion — never derived from reasoning/schema noise, for the reason
  // above. A false "not a vehicle" is worse than a false positive here: it
  // silently drops a real damage photo instead of just showing an honest
  // low-confidence note, so this is the one direction that must never be
  // guessed from unreliable text.
  const saysNoVehicle =
    hasUsableText &&
    (describesNonVehiclePhoto(text) ||
      normalized.includes("araç yok") ||
      normalized.includes("araç bulunmamaktadır") ||
      normalized.includes("araç fotoğrafı değil") ||
      normalized.includes("no vehicle") ||
      normalized.includes("not a vehicle"));
  const saysVehicle =
    normalized.includes("araç") ||
    normalized.includes("araba") ||
    normalized.includes("gösterge") ||
    normalized.includes("uyarı ışığı") ||
    normalized.includes("uyarı lambası") ||
    normalized.includes("motor arıza") ||
    normalized.includes("car") ||
    normalized.includes("vehicle");
  const saysDamageOrWarning =
    /hasar|kaza|darbe|göçük|gocuk|çizik|cizik|çatlak|catlak|kırık|kirik|tampon|kaput|far|stop|çamurluk|camurluk|kapı|kapi|podye|şasi|sasi|panel|radyatör|radyator|ızgara|izgara|airbag|hava yastığı|uyarı|uyari|arıza|ariza|lamba|kadran|damage|collision|accident|bumper|hood|fender|headlight|front/.test(
      normalized,
    );

  if (!saysNoVehicle && !saysVehicle && !saysDamageOrWarning) return null;

  const safeSummary = hasUsableText
    ? cleanText.slice(0, 500)
    : saysNoVehicle
      ? "Fotoğrafta araç veya araçla ilgili net bir bölüm güvenle tespit edilemedi."
      : saysDamageOrWarning
        ? "Fotoğrafta araçla ilgili olası hasar veya kontrol gerektiren bir belirti görülebilir, ancak AI yapılandırılmış bir sonuç üretemedi."
        : "Fotoğrafta araçla ilgili kontrol edilebilecek alanlar var.";
  const fallbackArea = hasUsableText
    ? normalized.includes("front-left") || normalized.includes("ön sol") || normalized.includes("on sol")
      ? "Ön sol bölüm"
      : normalized.includes("front-right") || normalized.includes("ön sağ") || normalized.includes("on sag")
        ? "Ön sağ bölüm"
        : normalized.includes("front") || normalized.includes("ön ") || normalized.includes("on ")
          ? "Ön bölüm"
          : normalized.includes("gösterge") || normalized.includes("kadran") || normalized.includes("uyarı")
            ? "Gösterge paneli"
            : "Görseldeki araç bölgesi"
    : "Görseldeki araç bölgesi";
  const fallbackExplanation = hasUsableText
    ? cleanText.slice(0, 500)
    : "AI modeli bu fotoğraf için yapılandırılmış bir sonuç üretemedi, bu yüzden belirli bir bölge veya belirti güvenle adlandırılamıyor. Fotoğraf gözle görülür bir hasar/arıza gösteriyor olabilir; lütfen görseli kendiniz inceleyip ekspertizde doğrulatın.";

  const fallbackFinding =
    !saysNoVehicle && saysDamageOrWarning
      ? [
          {
            area: fallbackArea,
            signal: hasUsableText && (normalized.includes("uyarı") || normalized.includes("uyari") || normalized.includes("lamba"))
              ? "Olası uyarı ışığı"
              : "Olası hasar veya arıza sinyali (AI net sınıflandıramadı)",
            confidence: "low",
            explanation: fallbackExplanation,
            recommendation:
              "AI bu görseli net yapılandıramadı; fotoğrafı kendiniz gözle kontrol edin ve ilgili bölgeyi ekspertizde, gerekirse kaporta veya servis kontrolünde doğrulatın.",
          },
        ]
      : [];

  return normalizeAnalysis({
    isVehiclePhoto: !saysNoVehicle,
    summary: safeSummary,
    findings: fallbackFinding,
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
      required: ["isVehiclePhoto", "summary", "photoQuality", "findings"],
      properties: {
        isVehiclePhoto: { type: "boolean" },
        summary: { type: "string" },
        photoQuality: {
          type: "object",
          additionalProperties: false,
          required: ["status", "issues", "retakeTips"],
          properties: {
            status: { type: "string", enum: ["good", "usable", "poor"] },
            issues: {
              type: "array",
              maxItems: 4,
              items: { type: "string" },
            },
            retakeTips: {
              type: "array",
              maxItems: 4,
              items: { type: "string" },
            },
          },
        },
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
  "photoQuality": {
    "status": "good" | "usable" | "poor",
    "issues": ["bulanıklık / parlama / karanlık / fazla yakın çekim / kadraj sorunu gibi kısa notlar"],
    "retakeTips": ["kullanıcının çizik, göçük veya uyarı ışığını daha net göstermek için ne yapması gerektiği"]
  },
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
Çizik, boya farkı veya ince göçük net seçilemiyorsa photoQuality.status="poor" veya "usable" yap; issues içinde sorunu yaz, retakeTips içinde aynı parçayı düz + iki çapraz açıdan, parlama olmadan, bir genel bir yakın fotoğrafla tekrar çekmesini söyle.
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
  const explicitVisionModel = process.env.OPENROUTER_VISION_MODEL?.trim();
  if (explicitVisionModel && explicitVisionModel.endsWith(":free")) return explicitVisionModel;

  const sharedModel = process.env.OPENROUTER_MODEL?.trim();
  if (sharedModel && sharedModel.endsWith(":free") && /vision|vl|gemma-4|llava|qwen.*vl|pixtral/i.test(sharedModel)) {
    return sharedModel;
  }

  return DEFAULT_VISION_MODEL;
}

function resolveVisionModelCandidates() {
  const candidates = [resolveVisionModel()];
  const fallback = process.env.OPENROUTER_VISION_FALLBACK_MODEL?.trim();
  if (fallback && fallback.endsWith(":free")) candidates.push(fallback);
  candidates.push(...DEFAULT_VISION_MODEL_CANDIDATES);
  // Paid fallback comes BEFORE openrouter/free's random routing, not after
  // — see PAID_FALLBACK_MODEL's comment above for why it exists and what it
  // costs. openrouter/free can land on an arbitrary free model, including
  // moderation/safety classifiers unsuited to this task entirely; once the
  // named free vision models are exhausted, a known-reliable paid model is
  // a better bet than gambling on that random routing, at negligible cost.
  if (process.env.OPENROUTER_DISABLE_PAID_PHOTO_FALLBACK !== "true") {
    candidates.push(PAID_FALLBACK_MODEL);
  }
  if (process.env.OPENROUTER_ENABLE_FREE_ROUTER_VISION_FALLBACK !== "false") {
    candidates.push(FREE_ROUTER_FALLBACK_MODEL);
  }
  return [...new Set(candidates)];
}

async function requestOpenRouterVision(input) {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) return { error: "OpenRouter API key tanımlı değil." };

  const messages = buildMessages(input);
  const callVisionModel = (model, responseFormat) =>
    callOpenRouterChatCompletions({
      apiKey,
      model,
      messages,
      responseFormat,
      temperature: 0.1,
      // Was 900, then 2000 — confirmed live, twice, that a fixed 2000-token
      // ceiling isn't enough even for models with no visible "thinking"
      // text: openai/gpt-5-nano (a GPT-5-series model, reasoning-capable by
      // default) returned valid-looking JSON that just stopped after 85
      // characters. GPT-5-series models spend *hidden* reasoning tokens out
      // of the same max_tokens budget before ever emitting visible output —
      // with nothing surfaced in the response text to explain where the
      // budget went, unlike the free models' visible "Thinking Process:"
      // narration. The paid model's real per-token cost is negligible
      // (~$0.00000005), so there's no reason to keep this tight for it.
      maxTokens: model === PAID_FALLBACK_MODEL ? 8000 : 2000,
      refererUrl: productionUrl,
      appName,
    });

  let lastError = "AI fotoğraf sonucu işlenemedi.";
  for (const model of resolveVisionModelCandidates()) {
    const attempts = model === FREE_ROUTER_FALLBACK_MODEL ? [undefined] : [photoDamageResponseFormat, undefined];
    for (const responseFormat of attempts) {
      const result = await callVisionModel(model, responseFormat);
      if (!result.ok) {
        // TEMPORARY: every candidate model+attempt combination was
        // exhausted with only the LAST failure's message surfaced to the
        // user ("AI fotoğraf sonucu işlenemedi." or similar) — this logs
        // each individual attempt's outcome so a real multi-model cascade
        // failure can be root-caused instead of guessed at from one final
        // generic message.
        console.warn(
          "[photo-damage] attempt failed:",
          JSON.stringify({ model, hasResponseFormat: Boolean(responseFormat), error: result.error }),
        );
        lastError = result.error;
        if (responseFormat && /:\s*400\b/.test(result.error)) continue;
        break;
      }

      const payloadError = extractPayloadError(result.payload);
      if (payloadError) {
        console.warn(
          "[photo-damage] attempt returned payload error:",
          JSON.stringify({ model, hasResponseFormat: Boolean(responseFormat), payloadError }),
        );
        lastError = payloadError;
        if (responseFormat && /response_format|schema|structured|json/i.test(payloadError)) continue;
        break;
      }

      const text = extractText(result.payload);
      if (!text) {
        console.warn(
          "[photo-damage] attempt had no extractable text:",
          JSON.stringify({ model, hasResponseFormat: Boolean(responseFormat), payloadKeys: Object.keys(result.payload ?? {}), payloadHead: JSON.stringify(result.payload).slice(0, 600) }),
        );
        lastError = "AI yanıtı okunamadı.";
        continue;
      }
      const json = extractJson(text);
      if (!json) {
        // TEMPORARY: the unstructured-text fallback path has produced
        // fabricated, unrelated-looking findings (e.g. a heavily damaged
        // front bumper photo interpreted as a possible dashboard warning
        // light) — this log captures the actual raw text so a future
        // misfire can be root-caused instead of guessed at. No PII: this is
        // model output about an uploaded photo, not user data.
        console.warn(
          "[photo-damage] model returned no parseable JSON, using text fallback:",
          JSON.stringify({ model, textLength: text.length, textHead: text.slice(0, 800) }),
        );
      }
      const analysis = json ? normalizeAnalysis(json) : normalizeTextFallback(text);
      if (analysis) return { analysis, model };
      lastError = "AI fotoğraf sonucu işlenemedi.";
    }
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
module.exports.DEFAULT_VISION_MODEL_CANDIDATES = DEFAULT_VISION_MODEL_CANDIDATES;
module.exports.FREE_ROUTER_FALLBACK_MODEL = FREE_ROUTER_FALLBACK_MODEL;
module.exports.PAID_FALLBACK_MODEL = PAID_FALLBACK_MODEL;
module.exports.resolveVisionModel = resolveVisionModel;
module.exports.resolveVisionModelCandidates = resolveVisionModelCandidates;
