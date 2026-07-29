export function isAiAnalysisNoteEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.NEXT_PUBLIC_AI_ANALYSIS_NOTE_ENABLED === "true";
}

export function isAiAnalysisNoteVisible(): boolean {
  return process.env.NEXT_PUBLIC_AI_ANALYSIS_NOTE_ENABLED === "true";
}
