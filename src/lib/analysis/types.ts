import type { VehicleFormData } from "@/lib/schemas/vehicle";
import type { MatchedIssue } from "@/lib/chronic-issues/match";

export type Severity = "low" | "medium" | "high";

export type AnalysisFinding = {
  id: string;
  category: string;
  severity: Severity;
  title: string;
  explanation: string;
  recommendation: string;
};

export type ScoreCategory =
  | "damageHistory"
  | "maintenance"
  | "mileageAgeBalance"
  | "descriptionTransparency"
  | "documentsExpertise"
  | "sellerTrust";

export type ScoreBreakdown = Record<ScoreCategory, number>;

export type MileageEvaluation = {
  vehicleAge: number;
  annualMileage: number;
  label: string;
};

export type CostSignal = {
  item: string;
  level: "Düşük" | "Orta" | "Yüksek" | "Bilgi yetersiz" | "Yakın tarihli";
};

export type PriorityAction = {
  title: string;
  reason: string;
};

export type DataCompleteness = {
  completed: number;
  total: number;
  percentage: number;
  missing: string[];
};

export type AnalysisResult = {
  input: VehicleFormData;
  listingImages?: string[];
  totalScore: number;
  riskLabel: string;
  decision: string;
  breakdown: ScoreBreakdown;
  findings: AnalysisFinding[];
  strengths: string[];
  costs: CostSignal[];
  priorityActions: PriorityAction[];
  sellerQuestions: string[];
  inspectionFocus: string[];
  finalChecklist: string[];
  mileage: MileageEvaluation;
  completeness: DataCompleteness;
  /**
   * Bu markanın/modelin/motorun genelinde bilinen kronik sorunlar —
   * BU aracın kendi durumu/geçmişiyle ilgili değil, o yüzden risk skorunu
   * etkilemez. Eşleşme bulunamazsa boş dizi.
   */
  knownIssues: MatchedIssue[];
  generatedAt: string;
};
