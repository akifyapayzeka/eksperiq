export type PhotoAnalysisFinding = {
  area: string;
  finding: string;
  confidence: string;
  note: string;
};

export type PhotoAnalysisRecord = {
  id: string;
  createdAt: string;
  thumbnails: string[];
  findings: PhotoAnalysisFinding[];
  aiSummary?: string;
};
