import { z } from "zod";
import { CURRENT_YEAR } from "@/lib/constants/analysis";

const optionalText = z.string().trim().optional();
const optionalDate = z.string().optional();

export const vehicleSchema = z.object({
  brand: z.string().trim().min(1, "Marka zorunludur."),
  model: z.string().trim().min(1, "Model zorunludur."),
  year: z.coerce
    .number()
    .int()
    .min(1980, "Model yılı 1980 veya sonrası olmalı.")
    .max(CURRENT_YEAR, "Model yılı geçerli olmalı."),
  trim: optionalText,
  fuelType: z.string().trim().min(1, "Yakıt türü seçin."),
  transmission: z.string().trim().min(1, "Vites türü seçin."),
  mileage: z.coerce.number().int().min(0, "Kilometre negatif olamaz.").max(2000000, "Kilometre gerçekçi olmalı."),
  price: z.coerce.number().int().min(0, "İlan fiyatı negatif olamaz."),
  city: z.string().trim().min(1, "Şehir zorunludur."),
  bodyType: optionalText,
  engineSize: optionalText,
  enginePower: optionalText,
  drivetrain: optionalText,
  ownerInfo: optionalText,
  tradeStatus: optionalText,
  tramerAmount: z.coerce.number().min(0).optional().default(0),
  paintedParts: optionalText,
  replacedParts: optionalText,
  localPaintedParts: optionalText,
  hasHeavyDamage: z.boolean().default(false),
  hasChassisRepair: z.boolean().default(false),
  airbagStatus: optionalText,
  hasTotalLossHistory: z.boolean().default(false),
  hasExpertiseReport: z.boolean().default(false),
  lastMaintenanceDate: optionalDate,
  timingBeltInfo: optionalText,
  transmissionMaintenanceInfo: optionalText,
  batteryStatus: optionalText,
  tireStatus: optionalText,
  inspectionEndDate: optionalDate,
  lpgStatus: optionalText,
  lpgRegistered: z.boolean().default(false),
  hasSpareKey: z.boolean().default(false),
  hasMaintenanceInvoices: z.boolean().default(false),
  sellerDescription: z.string().trim().min(20, "İlan açıklaması en az 20 karakter olmalı."),
  listingUrl: z.string().url("Geçerli bir bağlantı girin.").or(z.literal("")).optional(),
});

export type VehicleFormInput = z.input<typeof vehicleSchema>;
export type VehicleFormData = z.infer<typeof vehicleSchema>;
