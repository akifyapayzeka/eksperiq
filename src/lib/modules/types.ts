export type ModuleStatus = "active" | "planned";

export type ModuleId =
  | "listing-analysis"
  | "purchase-guide"
  | "photo-damage-analysis"
  | "repair-cost-estimation"
  | "maintenance-tracking"
  | "maintenance-payment-calendar"
  | "test-drive-checklist"
  | "official-lookup-guide"
  | "expense-ledger"
  | "listing-comparison"
  | "vehicle-health-record"
  | "vehicle-value-tracking"
  | "smart-sale-preparation"
  | "nearby-services"
  | "model-guide";

export type ModuleCapability = {
  title: string;
  description: string;
};

export type ProductModule = {
  id: ModuleId;
  title: string;
  status: ModuleStatus;
  href: string;
  summary: string;
  capabilities: ModuleCapability[];
  dataPolicy: string;
  certaintyPolicy: string;
};
