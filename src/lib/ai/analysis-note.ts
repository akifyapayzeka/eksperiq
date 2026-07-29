import type { AnalysisResult } from "@/lib/analysis/types";
import { requestOpenRouterChat, type OpenRouterChatResult } from "@/lib/ai/openrouter";

export function buildAnalysisNotePrompt(result: AnalysisResult): string {
  const topFindings = result.findings
    .slice(0, 6)
    .map((finding) => `${finding.severity.toUpperCase()} - ${finding.title}: ${finding.explanation}`)
    .join("\n");

  return `Araç: ${result.input.year} ${result.input.brand} ${result.input.model}
Risk skoru: ${result.totalScore}/100
Sonuç: ${result.riskLabel}
Karar özeti: ${result.decision}

Öne çıkan bulgular:
${topFindings}

Kullanıcıya Türkçe, kısa, kesin hüküm vermeyen ve profesyonel ekspertizin yerine geçmediğini belirten bir karar destek notu yaz.`;
}

export async function createAiAnalysisNote(result: AnalysisResult): Promise<OpenRouterChatResult> {
  return requestOpenRouterChat({
    messages: [
      {
        role: "system",
        content:
          "Sen EksperIQ için çalışan dikkatli bir ikinci el araç karar destek asistanısın. Kesin ekspertiz, hasarsızlık veya satın alma garantisi verme.",
      },
      {
        role: "user",
        content: buildAnalysisNotePrompt(result),
      },
    ],
  });
}
