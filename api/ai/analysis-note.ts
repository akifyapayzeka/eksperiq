import type { IncomingMessage, ServerResponse } from "node:http";

const OPENROUTER_CHAT_COMPLETIONS_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_OPENROUTER_MODEL = "openrouter/free";
const DEFAULT_AI_DAILY_LIMIT = 20;
const UPSTASH_TTL_SECONDS = 60 * 60 * 48;
const usageKey = "analysis-note";
const productionUrl = "https://eksperiq.vercel.app";
const appName = "EksperIQ";

type JsonValue = Record<string, unknown>;
type CounterRecord = {
  dayKey: string;
  count: number;
};
type UpstashResponse = {
  result?: unknown;
  error?: string;
};

const counters = new Map<string, CounterRecord>();

type AnalysisNoteInput = {
  vehicleLabel: string;
  totalScore: number;
  riskLabel: string;
  decision: string;
  findings: Array<{
    severity: string;
    title: string;
    explanation: string;
  }>;
};

function sendJson(response: ServerResponse, statusCode: number, body: JsonValue): void {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(body));
}

async function readJsonBody(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw.trim()) return null;
  return JSON.parse(raw) as unknown;
}

function getTodayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function parseDailyLimit(value: string | undefined): number {
  if (!value) return DEFAULT_AI_DAILY_LIMIT;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_AI_DAILY_LIMIT;
}

function isFeatureEnabled(): boolean {
  return process.env.NEXT_PUBLIC_AI_ANALYSIS_NOTE_ENABLED === "true";
}

function isOpenRouterConfigured(): boolean {
  return Boolean(process.env.OPENROUTER_API_KEY?.trim());
}

function getMemoryUsage(key: string, date = new Date()): number {
  const dayKey = getTodayKey(date);
  const record = counters.get(key);
  if (!record || record.dayKey !== dayKey) return 0;
  return record.count;
}

function reserveMemoryUsage(
  key: string,
  dailyLimit: number,
  date = new Date(),
): { allowed: boolean; remaining: number } {
  const usedToday = getMemoryUsage(key, date);
  if (usedToday >= dailyLimit) return { allowed: false, remaining: 0 };

  const next = usedToday + 1;
  counters.set(key, { dayKey: getTodayKey(date), count: next });
  return { allowed: true, remaining: Math.max(dailyLimit - next, 0) };
}

function getUpstashConfig(): { url: string; token: string } | null {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) return null;
  return { url: url.replace(/\/$/, ""), token };
}

function parseCount(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

async function reserveUpstashUsage(
  key: string,
  dailyLimit: number,
  config: { url: string; token: string },
): Promise<{ allowed: boolean; remaining: number }> {
  const dailyKey = `eksperiq:ai:${key}:${getTodayKey()}`;
  const response = await fetch(`${config.url}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      ["INCR", dailyKey],
      ["EXPIRE", dailyKey, UPSTASH_TTL_SECONDS],
    ]),
  });

  if (!response.ok) throw new Error(`Upstash failed: ${response.status}`);
  const payload: unknown = await response.json();
  if (!Array.isArray(payload)) throw new Error("Invalid Upstash payload.");

  const firstResult = payload[0] as UpstashResponse | undefined;
  if (firstResult?.error) throw new Error("Upstash INCR failed.");

  const used = parseCount(firstResult?.result);
  if (used > dailyLimit) return { allowed: false, remaining: 0 };
  return { allowed: true, remaining: Math.max(dailyLimit - used, 0) };
}

async function reserveUsage(key: string, dailyLimit: number): Promise<{ allowed: boolean; remaining: number }> {
  const upstash = getUpstashConfig();
  if (!upstash) return reserveMemoryUsage(key, dailyLimit);
  return reserveUpstashUsage(key, dailyLimit, upstash);
}

function buildPrompt(input: AnalysisNoteInput): string {
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isBoundedString(value: unknown, min: number, max: number): value is string {
  return typeof value === "string" && value.trim().length >= min && value.trim().length <= max;
}

function parseAnalysisNoteInput(value: unknown): AnalysisNoteInput | null {
  if (!isRecord(value)) return null;
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
    findings: findings as AnalysisNoteInput["findings"],
  };
}

function extractAssistantContent(payload: unknown): string | null {
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

async function createAnalysisNote(
  input: AnalysisNoteInput,
): Promise<{ note: string; model: string } | { error: string }> {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) return { error: "OPENROUTER_API_KEY tanımlı değil; kural tabanlı analiz kullanılmalı." };

  const model = process.env.OPENROUTER_MODEL?.trim() || DEFAULT_OPENROUTER_MODEL;
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
      messages: [
        {
          role: "system",
          content:
            "Sen EksperIQ için çalışan dikkatli bir ikinci el araç karar destek asistanısın. Kesin ekspertiz, hasarsızlık veya satın alma garantisi verme.",
        },
        {
          role: "user",
          content: buildPrompt(input),
        },
      ],
      temperature: 0.2,
      max_tokens: 700,
    }),
  });

  if (!response.ok) return { error: `OpenRouter isteği başarısız oldu: ${response.status}` };

  const payload: unknown = await response.json();
  const note = extractAssistantContent(payload);
  if (!note) return { error: "OpenRouter yanıtında okunabilir içerik bulunamadı." };
  return { note, model };
}

export default async function handler(request: IncomingMessage, response: ServerResponse): Promise<void> {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    sendJson(response, 405, { error: "Yalnızca POST desteklenir." });
    return;
  }

  const dailyLimit = parseDailyLimit(process.env.OPENROUTER_DAILY_REQUEST_LIMIT);

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

  let body: unknown;
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

  let reservation;
  try {
    reservation = await reserveUsage(usageKey, dailyLimit);
  } catch {
    sendJson(response, 503, {
      error: "AI kullanım limiti şu anda doğrulanamadı. Kural tabanlı raporu kullanabilirsiniz.",
    });
    return;
  }

  if (!reservation.allowed) {
    sendJson(response, 429, {
      error: "Günlük AI deneme limiti doldu.",
      remaining: 0,
    });
    return;
  }

  const aiResult = await createAnalysisNote(parsed);
  if ("error" in aiResult) {
    sendJson(response, 502, { error: aiResult.error });
    return;
  }

  sendJson(response, 200, {
    note: aiResult.note,
    model: aiResult.model,
    remaining: reservation.remaining,
  });
}
