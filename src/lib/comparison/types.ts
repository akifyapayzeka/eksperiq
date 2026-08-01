import type { AnalysisResult } from "@/lib/analysis/types";

export type ComparisonEntry = {
  id: string;
  label: string;
  addedAt: string;
  result: AnalysisResult;
};

export const MAX_COMPARISON_ENTRIES = 3;
