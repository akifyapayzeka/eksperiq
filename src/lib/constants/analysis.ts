export const CURRENT_YEAR = new Date().getFullYear();

export const SCORE_WEIGHTS = {
  damageHistory: 30,
  maintenance: 20,
  mileageAgeBalance: 15,
  descriptionTransparency: 15,
  documentsExpertise: 10,
  sellerTrust: 10,
} as const;

export const RISK_LEVELS = [
  { min: 80, max: 100, label: "Düşük risk", decision: "İncelenebilir" },
  { min: 60, max: 79, label: "Dikkatli incelenmeli", decision: "Ekspertiz ve belge kontrolü şart" },
  { min: 40, max: 59, label: "Yüksek risk", decision: "Mevcut bilgilerle yüksek riskli" },
  { min: 0, max: 39, label: "Çok yüksek risk", decision: "Mevcut bilgilerle yüksek riskli" },
] as const;

export const MILEAGE_BANDS = {
  veryLowMax: 5000,
  normalMax: 25000,
  highMax: 40000,
} as const;

export const HIGH_TRAMER_AMOUNT = 100000;
export const MEDIUM_TRAMER_PRICE_RATIO = 0.1;
export const HIGH_TRAMER_PRICE_RATIO = 0.2;
export const INSPECTION_SOON_DAYS = 60;
export const MAX_PRIORITY_ACTIONS = 5;
