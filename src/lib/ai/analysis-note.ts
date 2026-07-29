import type { AnalysisResult } from "@/lib/analysis/types";
import { requestOpenRouterChat, type OpenRouterChatResult } from "@/lib/ai/openrouter";

export type AiAnalysisNoteInput = {
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

export function buildAiAnalysisNoteInput(result: AnalysisResult): AiAnalysisNoteInput {
  return {
    vehicleLabel: `${result.input.year} ${result.input.brand} ${result.input.model}`,
    totalScore: result.totalScore,
    riskLabel: result.riskLabel,
    decision: result.decision,
    findings: result.findings.slice(0, 6).map((finding) => ({
      severity: finding.severity,
      title: finding.title,
      explanation: finding.explanation,
    })),
  };
}

export function buildAnalysisNotePrompt(input: AiAnalysisNoteInput): string {
  const topFindings = input.findings
    .slice(0, 6)
    .map((finding) => `${finding.severity.toUpperCase()} - ${finding.title}: ${finding.explanation}`)
    .join("\n");

  return `Araç: ${input.vehicleLabel}
Risk skoru: ${input.totalScore}/100
Sonuç: ${input.riskLabel}
Karar özeti: ${input.decision}

Öne çıkan bulgular:
${topFindings}

Kullanıcıya Türkçe, kısa, kesin hüküm vermeyen ve profesyonel ekspertizin yerine geçmediğini belirten bir karar destek notu yaz.`;
}

export async function createAiAnalysisNote(result: AnalysisResult): Promise<OpenRouterChatResult> {
  return createAiAnalysisNoteFromInput(buildAiAnalysisNoteInput(result));
}

export async function createAiAnalysisNoteFromInput(input: AiAnalysisNoteInput): Promise<OpenRouterChatResult> {
  return requestOpenRouterChat({
    messages: [
      {
        role: "system",
        content:
          "Sen EksperIQ için çalışan dikkatli bir ikinci el araç karar destek asistanısın. Kesin ekspertiz, hasarsızlık veya satın alma garantisi verme.",
      },
      {
        role: "user",
        content: buildAnalysisNotePrompt(input),
      },
    ],
  });
}
