import type { IncomingMessage, ServerResponse } from "node:http";
import { z } from "zod";
import { createAiAnalysisNoteFromInput } from "../../src/lib/ai/analysis-note";
import { isAiAnalysisNoteEnabled } from "../../src/lib/ai/feature-flags";
import { isOpenRouterConfigured } from "../../src/lib/ai/openrouter";
import { reserveDailyAiUsage } from "../../src/lib/ai/usage-store";
import { decideAiUsage, parseDailyLimit } from "../../src/lib/ai/usage-guard";

const usageKey = "analysis-note";

const analysisNoteSchema = z.object({
  vehicleLabel: z.string().trim().min(3).max(120),
  totalScore: z.number().int().min(0).max(100),
  riskLabel: z.string().trim().min(2).max(80),
  decision: z.string().trim().min(2).max(160),
  findings: z
    .array(
      z.object({
        severity: z.string().trim().min(2).max(20),
        title: z.string().trim().min(2).max(160),
        explanation: z.string().trim().min(2).max(500),
      }),
    )
    .min(1)
    .max(6),
});

type JsonValue = Record<string, unknown>;

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

export default async function handler(request: IncomingMessage, response: ServerResponse): Promise<void> {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    sendJson(response, 405, { error: "Yalnızca POST desteklenir." });
    return;
  }

  const dailyLimit = parseDailyLimit(process.env.OPENROUTER_DAILY_REQUEST_LIMIT);
  const usageDecision = decideAiUsage({
    isConfigured: isOpenRouterConfigured(),
    isFeatureEnabled: isAiAnalysisNoteEnabled(),
    usedToday: 0,
    dailyLimit,
  });

  if (!usageDecision.allowed) {
    sendJson(response, 429, {
      error: usageDecision.reason,
      remaining: usageDecision.remaining,
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

  const parsed = analysisNoteSchema.safeParse(body);
  if (!parsed.success) {
    sendJson(response, 400, { error: "AI notu için gönderilen veri geçerli değil." });
    return;
  }

  let reservation;
  try {
    reservation = await reserveDailyAiUsage(usageKey, dailyLimit);
  } catch {
    sendJson(response, 503, {
      error: "AI kullanım limiti şu anda doğrulanamadı. Kural tabanlı raporu kullanabilirsiniz.",
    });
    return;
  }

  if (!reservation.allowed) {
    sendJson(response, 429, {
      error: reservation.reason,
      remaining: reservation.remaining,
    });
    return;
  }

  const aiResult = await createAiAnalysisNoteFromInput(parsed.data);
  if (aiResult.status !== "success") {
    sendJson(response, 502, { error: aiResult.reason });
    return;
  }

  sendJson(response, 200, {
    note: aiResult.content,
    model: aiResult.model,
    remaining: reservation.remaining,
  });
}
