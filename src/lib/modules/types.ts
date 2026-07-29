export type ModuleStatus = "active" | "planned";

export type ModuleId =
  | "listing-analysis"
  | "photo-damage-analysis"
  | "repair-cost-estimation"
  | "expertise-report-analysis"
  | "maintenance-tracking"
  | "vehicle-health-record"
  | "vehicle-value-tracking"
  | "smart-sale-preparation";

export type ModuleCapability = {
  title: string;
  description: string;
};

export type ProductModule = {
  id: ModuleId;
  title: string;
  status: ModuleStatus;
  summary: string;
  capabilities: ModuleCapability[];
  dataPolicy: string;
  certaintyPolicy: string;
};
