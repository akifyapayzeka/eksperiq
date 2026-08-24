export type ListingSource = "sahibinden" | "arabam";

export type ImportedListingFields = {
  brand: string | null;
  model: string | null;
  year: number | null;
  trim: string | null;
  fuelType: string | null;
  transmission: string | null;
  mileage: number | null;
  price: number | null;
  city: string | null;
  bodyType: string | null;
  engineSize: string | null;
  enginePower: string | null;
  drivetrain: string | null;
  ownerInfo: string | null;
  tradeStatus: string | null;
  tramerAmount: number | null;
  paintedParts: string | null;
  replacedParts: string | null;
  localPaintedParts: string | null;
  airbagStatus: string | null;
  lpgStatus: string | null;
  hasHeavyDamage: boolean | null;
  hasChassisRepair: boolean | null;
  hasTotalLossHistory: boolean | null;
  hasCommercialHistory: boolean | null;
  hasExpertiseReport: boolean | null;
  lpgRegistered: boolean | null;
  hasSpareKey: boolean | null;
  hasMaintenanceInvoices: boolean | null;
  lastMaintenanceDate: string | null;
  timingBeltInfo: string | null;
  transmissionMaintenanceInfo: string | null;
  batteryStatus: string | null;
  tireStatus: string | null;
  inspectionEndDate: string | null;
  sellerDescription: string | null;
};

export type ListingImageData = {
  url: string;
  dataUrl: string;
};

export type ListingImportResult = {
  title: string;
  fields: ImportedListingFields;
  lowConfidenceFields: string[];
  missingFields: string[];
  warnings: string[];
  images: string[];
  /** Base64 bytes for a subset of `images`, fetched on-device — see AnalysisResult.listingImageData. */
  imageData?: ListingImageData[];
};

export type ListingImportOutcome =
  | { ok: true; result: ListingImportResult }
  | {
      ok: false;
      reason: "invalid-url" | "unsupported-platform" | "fetch-failed" | "blocked" | "ai-failed" | "rate-limited";
      detail?: string;
    };
