import { analyzeVehicle } from "@/lib/analysis/engine";
import type { AnalysisResult } from "@/lib/analysis/types";
import type { VehicleFormData } from "@/lib/schemas/vehicle";

export function createAnalysis(input: VehicleFormData): AnalysisResult {
  return analyzeVehicle(input);
}
