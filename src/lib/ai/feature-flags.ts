/**
 * api/ai/analysis-note.js'in sunucu tarafındaki kapısının aynısı. Bu AI notu
 * şu an hiçbir ekrana bağlı değil; bayrak yalnızca sunucuda (Vercel env)
 * anlam taşıyor, istemci tarafında bir kullanıcı yok. Fonksiyon, sunucu
 * mantığını test edilebilir tutmak için duruyor (tests/unit/ai-usage-guard).
 *
 * Buradaki ikinci kopya (isAiAnalysisNoteVisible) hiçbir yerden
 * çağrılmıyordu — aynı ifadeyi iki kez tanımlamak, ileride birini değiştirip
 * diğerini unutma riskinden başka bir şey vermiyordu.
 */
export function isAiAnalysisNoteEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.NEXT_PUBLIC_AI_ANALYSIS_NOTE_ENABLED === "true";
}
