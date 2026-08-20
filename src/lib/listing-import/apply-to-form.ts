"use client";

import type { UseFormSetValue } from "react-hook-form";
import type { VehicleFormInput } from "@/lib/schemas/vehicle";
import { modelOptionsForBrand } from "@/components/forms/analysis-form-sections";
import type { ImportedListingFields } from "./types";

const setOpts = { shouldDirty: true, shouldTouch: true, shouldValidate: true } as const;

function importedString(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value;
  if (typeof value !== "object" || value === null) return null;
  const candidate = value as { value?: unknown; label?: unknown };
  if (typeof candidate.value === "string" && candidate.value.trim()) return candidate.value;
  if (typeof candidate.label === "string" && candidate.label.trim()) return candidate.label;
  return null;
}

function importedNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function importedBoolean(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

/**
 * Writes AI-imported listing fields into the analysis form. Every enum-style
 * field (brand, fuelType, city, ...) was already constrained server-side to
 * the exact <select> option lists in analysis-form-sections.tsx, so any
 * non-null value here is safe to set directly. model is the one exception —
 * it's free text from the AI, cross-checked here against the chosen
 * brand's real model catalog so an unmatched guess is left blank instead of
 * silently corrupting the field.
 */
export function applyImportedFieldsToForm(
  fields: ImportedListingFields,
  setValue: UseFormSetValue<VehicleFormInput>,
): void {
  const brand = importedString(fields.brand);
  const model = importedString(fields.model);
  const year = importedNumber(fields.year);
  const trim = importedString(fields.trim);
  const fuelType = importedString(fields.fuelType);
  const transmission = importedString(fields.transmission);
  const mileage = importedNumber(fields.mileage);
  const price = importedNumber(fields.price);
  const city = importedString(fields.city);
  const bodyType = importedString(fields.bodyType);
  const engineSize = importedString(fields.engineSize);
  const enginePower = importedString(fields.enginePower);
  const drivetrain = importedString(fields.drivetrain);
  const ownerInfo = importedString(fields.ownerInfo);
  const tradeStatus = importedString(fields.tradeStatus);
  const tramerAmount = importedNumber(fields.tramerAmount);
  const paintedParts = importedString(fields.paintedParts);
  const replacedParts = importedString(fields.replacedParts);
  const localPaintedParts = importedString(fields.localPaintedParts);
  const airbagStatus = importedString(fields.airbagStatus);
  const lpgStatus = importedString(fields.lpgStatus);
  const hasHeavyDamage = importedBoolean(fields.hasHeavyDamage);
  const hasChassisRepair = importedBoolean(fields.hasChassisRepair);
  const hasTotalLossHistory = importedBoolean(fields.hasTotalLossHistory);
  const hasExpertiseReport = importedBoolean(fields.hasExpertiseReport);
  const lpgRegistered = importedBoolean(fields.lpgRegistered);
  const hasSpareKey = importedBoolean(fields.hasSpareKey);
  const hasMaintenanceInvoices = importedBoolean(fields.hasMaintenanceInvoices);
  const lastMaintenanceDate = importedString(fields.lastMaintenanceDate);
  const timingBeltInfo = importedString(fields.timingBeltInfo);
  const transmissionMaintenanceInfo = importedString(fields.transmissionMaintenanceInfo);
  const batteryStatus = importedString(fields.batteryStatus);
  const tireStatus = importedString(fields.tireStatus);
  const inspectionEndDate = importedString(fields.inspectionEndDate);
  const sellerDescription = importedString(fields.sellerDescription);

  if (brand) setValue("brand", brand, setOpts);

  if (model && brand) {
    const modelOptions = modelOptionsForBrand(brand);
    const matched = modelOptions.find(
      (option) => option.toLocaleLowerCase("tr-TR") === model.toLocaleLowerCase("tr-TR"),
    );
    if (matched) setValue("model", matched, setOpts);
  }

  if (year !== null) setValue("year", year, setOpts);
  if (trim) setValue("trim", trim, setOpts);
  if (fuelType) setValue("fuelType", fuelType, setOpts);
  if (transmission) setValue("transmission", transmission, setOpts);
  if (mileage !== null) setValue("mileage", mileage, setOpts);
  if (price !== null) setValue("price", price, setOpts);
  if (city) setValue("city", city, setOpts);
  if (bodyType) setValue("bodyType", bodyType, setOpts);
  if (engineSize) setValue("engineSize", engineSize, setOpts);
  if (enginePower) setValue("enginePower", enginePower, setOpts);
  if (drivetrain) setValue("drivetrain", drivetrain, setOpts);
  if (ownerInfo) setValue("ownerInfo", ownerInfo, setOpts);
  if (tradeStatus) setValue("tradeStatus", tradeStatus, setOpts);
  if (tramerAmount !== null) setValue("tramerAmount", tramerAmount, setOpts);
  if (paintedParts) setValue("paintedParts", paintedParts, setOpts);
  if (replacedParts) setValue("replacedParts", replacedParts, setOpts);
  if (localPaintedParts) setValue("localPaintedParts", localPaintedParts, setOpts);
  if (airbagStatus) setValue("airbagStatus", airbagStatus, setOpts);
  if (lpgStatus) setValue("lpgStatus", lpgStatus, setOpts);
  if (hasHeavyDamage !== null) setValue("hasHeavyDamage", hasHeavyDamage, setOpts);
  if (hasChassisRepair !== null) setValue("hasChassisRepair", hasChassisRepair, setOpts);
  if (hasTotalLossHistory !== null) setValue("hasTotalLossHistory", hasTotalLossHistory, setOpts);
  if (hasExpertiseReport !== null) setValue("hasExpertiseReport", hasExpertiseReport, setOpts);
  if (lpgRegistered !== null) setValue("lpgRegistered", lpgRegistered, setOpts);
  if (hasSpareKey !== null) setValue("hasSpareKey", hasSpareKey, setOpts);
  if (hasMaintenanceInvoices !== null) setValue("hasMaintenanceInvoices", hasMaintenanceInvoices, setOpts);
  if (lastMaintenanceDate) setValue("lastMaintenanceDate", lastMaintenanceDate, setOpts);
  if (timingBeltInfo) setValue("timingBeltInfo", timingBeltInfo, setOpts);
  if (transmissionMaintenanceInfo) setValue("transmissionMaintenanceInfo", transmissionMaintenanceInfo, setOpts);
  if (batteryStatus) setValue("batteryStatus", batteryStatus, setOpts);
  if (tireStatus) setValue("tireStatus", tireStatus, setOpts);
  if (inspectionEndDate) setValue("inspectionEndDate", inspectionEndDate, setOpts);
  if (sellerDescription) setValue("sellerDescription", sellerDescription, setOpts);
}
