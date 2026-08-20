import type { VehicleFormData } from "@/lib/schemas/vehicle";
import type { DataCompleteness } from "./types";

type CompletenessField = {
  label: string;
  isComplete: (input: VehicleFormData) => boolean;
};

const completenessFields: CompletenessField[] = [
  { label: "Marka", isComplete: (input) => Boolean(input.brand) },
  { label: "Model", isComplete: (input) => Boolean(input.model) },
  { label: "Model yılı", isComplete: (input) => input.year > 0 },
  { label: "Yakıt türü", isComplete: (input) => Boolean(input.fuelType) && input.fuelType !== "Bilinmiyor" },
  { label: "Vites türü", isComplete: (input) => Boolean(input.transmission) && input.transmission !== "Bilinmiyor" },
  { label: "Kilometre", isComplete: (input) => input.mileage > 0 },
  { label: "İlan fiyatı", isComplete: (input) => input.price > 0 },
  { label: "Şehir", isComplete: (input) => Boolean(input.city) && input.city !== "Bilinmiyor" },
  { label: "Paket", isComplete: (input) => Boolean(input.trim) },
  { label: "Kasa tipi", isComplete: (input) => Boolean(input.bodyType) },
  { label: "Motor bilgisi", isComplete: (input) => Boolean(input.engineSize || input.enginePower) },
  { label: "Ruhsat sahibi bilgisi", isComplete: (input) => Boolean(input.ownerInfo) },
  {
    label: "Boya/değişen bilgisi",
    isComplete: (input) => Boolean(input.paintedParts || input.replacedParts || input.localPaintedParts),
  },
  { label: "Airbag durumu", isComplete: (input) => Boolean(input.airbagStatus) },
  { label: "Son bakım tarihi", isComplete: (input) => Boolean(input.lastMaintenanceDate) },
  { label: "Triger bilgisi", isComplete: (input) => Boolean(input.timingBeltInfo) },
  { label: "Şanzıman bakım bilgisi", isComplete: (input) => Boolean(input.transmissionMaintenanceInfo) },
  { label: "Lastik durumu", isComplete: (input) => Boolean(input.tireStatus) },
  { label: "Muayene bitiş tarihi", isComplete: (input) => Boolean(input.inspectionEndDate) },
  { label: "İlan açıklaması", isComplete: (input) => input.sellerDescription.length >= 20 },
];

export function calculateDataCompleteness(input: VehicleFormData): DataCompleteness {
  const missing = completenessFields.filter((field) => !field.isComplete(input)).map((field) => field.label);
  const total = completenessFields.length;
  const completed = total - missing.length;

  return {
    completed,
    total,
    percentage: Math.round((completed / total) * 100),
    missing,
  };
}
