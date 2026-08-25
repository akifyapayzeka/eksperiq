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

export type ListingImageData = {
  url: string;
  dataUrl: string;
};

/**
 * Bu araç piyasada ne eder sorusuna DEĞİL — bu ilanın kendi fiyatından ne
 * kadar aşağı inilmesi makul olduğuna cevap verir. Benzer ilanlarla canlı
 * piyasa karşılaştırması yapmaz (uygulamanın hiçbir yerinde böyle bir veri
 * kaynağı yok — sahibinden.com/arabam.com veri merkezi IP'lerinden gelen
 * istekleri reddediyor), yalnızca BU ilandaki bulgulara (hasar/boya/değişen,
 * KM-yaş dengesizliği, eksik evrak vb.) dayalı yerel, deterministik bir
 * pazarlık payı hesaplar.
 */
export type NegotiationGuidance = {
  listingPrice: number;
  discountPercentLow: number;
  discountPercentHigh: number;
  suggestedOfferLow: number;
  suggestedOfferHigh: number;
  reasons: string[];
};

export type AnalysisResult = {
  input: VehicleFormData;
  listingImages?: string[];
  /**
   * Base64 photo bytes fetched natively on-device (see
   * EksperIQListingFetchPlugin.swift) for a subset of listingImages.
   * sahibinden.com/arabam.com reject image fetches from a server-side
   * datacenter IP outright, so the PDF report (api/report/pdf.js) can't
   * reliably download these itself — this lets it embed real photos
   * without a network fetch when present, falling back to a best-effort
   * server fetch by URL for any image without a matching entry here.
   */
  listingImageData?: ListingImageData[];
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
  negotiation: NegotiationGuidance;
  generatedAt: string;
};
