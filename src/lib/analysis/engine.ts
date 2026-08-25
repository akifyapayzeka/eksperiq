import type { VehicleFormData } from "@/lib/schemas/vehicle";
import { findChronicIssues } from "@/lib/chronic-issues/match";
import { damageRules } from "./rules/damage-rules";
import { documentRules } from "./rules/document-rules";
import { evaluateMileage, mileageRules } from "./rules/mileage-rules";
import { maintenanceRules } from "./rules/maintenance-rules";
import { priceRules } from "./rules/price-rules";
import { sellerRules } from "./rules/seller-rules";
import { calculateDataCompleteness } from "./completeness";
import { riskLevel, scoreFindings, totalScore } from "./scoring";
import { costSignals, dynamicInspectionFocus, finalChecklist, priorityActions, strengths } from "./recommendations";
import { generateSellerQuestions } from "./questions";
import { buildNegotiationGuidance } from "./negotiation";
import type { AnalysisFinding, AnalysisResult } from "./types";

const severityOrder = {
  high: 0,
  medium: 1,
  low: 2,
} as const;

export function sortFindings(findings: AnalysisFinding[]): AnalysisFinding[] {
  return [...findings].sort((first, second) => severityOrder[first.severity] - severityOrder[second.severity]);
}

export function analyzeVehicle(input: VehicleFormData): AnalysisResult {
  const findings = sortFindings([
    ...damageRules(input),
    ...priceRules(input),
    ...maintenanceRules(input),
    ...mileageRules(input),
    ...sellerRules(input),
    ...documentRules(input),
  ]);
  const breakdown = scoreFindings(findings);
  const score = totalScore(breakdown);
  const level = riskLevel(score, findings);
  const costs = costSignals(input);
  const completeness = calculateDataCompleteness(input);
  return {
    input,
    totalScore: score,
    riskLabel: level.label,
    decision: level.decision,
    breakdown,
    findings,
    strengths: strengths(input),
    costs,
    priorityActions: priorityActions(findings, costs, completeness),
    sellerQuestions: generateSellerQuestions(input, findings),
    inspectionFocus: dynamicInspectionFocus(input, findings),
    finalChecklist,
    mileage: evaluateMileage(input),
    completeness,
    knownIssues: findChronicIssues(input).issues,
    negotiation: buildNegotiationGuidance(input.price, findings, costs, completeness),
    generatedAt: new Date().toISOString(),
  };
}
