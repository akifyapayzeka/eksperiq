import type { ModuleId } from "@/lib/modules/types";

export type VehiclePhotoArea =
  | "front-bumper"
  | "rear-bumper"
  | "right-fender"
  | "left-fender"
  | "doors"
  | "hood"
  | "trunk-lid"
  | "roof"
  | "headlights"
  | "tail-lights"
  | "wheels"
  | "tires"
  | "windows"
  | "dashboard"
  | "instrument-cluster";

export type PhotoDamageSignal =
  | "dent"
  | "scratch"
  | "paint-crack"
  | "color-mismatch"
  | "panel-misalignment"
  | "headlight-replacement"
  | "rust"
  | "crack"
  | "broken-part"
  | "warning-light"
  | "check-engine-light"
  | "oil-pressure-warning"
  | "temperature-warning"
  | "battery-charge-warning"
  | "brake-abs-warning"
  | "tire-pressure-warning"
  | "airbag-warning";

export type ConfidenceLevel = "low" | "medium" | "high";

export type PhotoDamageFinding = {
  id: string;
  area: VehiclePhotoArea;
  signal: PhotoDamageSignal;
  confidence: ConfidenceLevel;
  probability: number;
  title: string;
  explanation: string;
  recommendation: string;
};

export type PhotoDamageAnalysisInput = {
  imageCount: number;
  areas: VehiclePhotoArea[];
  userNote?: string;
};

export type PhotoDamageAnalysisDraft = {
  moduleId: Extract<ModuleId, "photo-damage-analysis">;
  status: "planned";
  input: PhotoDamageAnalysisInput;
  findings: PhotoDamageFinding[];
  disclaimer: string;
};
