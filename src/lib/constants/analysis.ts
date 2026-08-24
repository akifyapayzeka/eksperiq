export const CURRENT_YEAR = new Date().getFullYear();

export const SCORE_WEIGHTS = {
  damageHistory: 30,
  maintenance: 20,
  mileageAgeBalance: 15,
  descriptionTransparency: 15,
  documentsExpertise: 10,
  sellerTrust: 10,
} as const;

// "decision" is meant to answer the buyer's actual question — alınır mı,
// alınmaz mı — not just restate the risk label. "Yüksek risk"/"Çok yüksek
// risk" are gated in scoring.ts's riskLevel(): they only apply when at
// least one real high-severity finding exists (ağır hasar, şasi/podye,
// airbag, pert, komple boya vb.); otherwise the label is capped at
// "Dikkatli incelenmeli", so this copy only has to represent listings that
// genuinely earned it.
export const RISK_LEVELS = [
  { min: 80, max: 100, label: "Düşük risk", decision: "Standart ekspertiz sonrası alınabilir." },
  { min: 60, max: 79, label: "Dikkatli incelenmeli", decision: "Ekspertiz ve belge kontrolü sonrası alınabilir." },
  { min: 40, max: 59, label: "Yüksek risk", decision: "Ciddi bulgular var; bağımsız ekspertiz olmadan almayın." },
  {
    min: 0,
    max: 39,
    label: "Çok yüksek risk",
    decision: "Ciddi bulgular var; mevcut bilgilerle satın almanız önerilmez.",
  },
] as const;

export const MILEAGE_BANDS = {
  veryLowMax: 5000,
  normalMax: 25000,
  highMax: 40000,
} as const;

export const HIGH_TRAMER_AMOUNT = 100000;
export const MEDIUM_TRAMER_PRICE_RATIO = 0.1;
export const HIGH_TRAMER_PRICE_RATIO = 0.2;
export const HIGH_MILEAGE_TIMING_HISTORY_KM = 120000;
export const INSPECTION_SOON_DAYS = 60;
export const MAX_PRIORITY_ACTIONS = 5;
