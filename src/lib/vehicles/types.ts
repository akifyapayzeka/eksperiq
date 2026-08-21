export type VehicleFuelType = "benzin" | "dizel" | "lpg" | "hibrit" | "elektrik";
export type VehicleTransmissionType = "manuel" | "otomatik" | "yari-otomatik";

export const VEHICLE_FUEL_LABELS: Record<VehicleFuelType, string> = {
  benzin: "Benzin",
  dizel: "Dizel",
  lpg: "LPG",
  hibrit: "Hibrit",
  elektrik: "Elektrik",
};

export const VEHICLE_TRANSMISSION_LABELS: Record<VehicleTransmissionType, string> = {
  manuel: "Manuel",
  otomatik: "Otomatik",
  "yari-otomatik": "Yarı Otomatik",
};

export type VehicleProfile = {
  id: string;
  label: string;
  createdAt: string;
  /**
   * Optional descriptive fields, added for the shared vehicle add/edit sheet.
   * All optional and additive so records created before this existed (which
   * only ever had id/label/createdAt) remain valid without migration.
   */
  brand?: string;
  model?: string;
  engineSize?: string;
  trim?: string;
  modelYear?: number;
  mileage?: number;
  fuel?: VehicleFuelType;
  transmission?: VehicleTransmissionType;
  plate?: string;
  /** Local data URL only (user-picked file read via FileReader) — never a remote URL. */
  photoDataUrl?: string;
};

export const DEFAULT_VEHICLE_LABEL = "Aracım";
