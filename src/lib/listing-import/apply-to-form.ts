"use client";

import type { UseFormSetValue } from "react-hook-form";
import type { VehicleFormInput } from "@/lib/schemas/vehicle";
import { modelOptionsForBrand } from "@/components/forms/analysis-form-sections";
import type { ImportedListingFields } from "./types";

const setOpts = { shouldDirty: true, shouldTouch: true, shouldValidate: true } as const;

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
  if (fields.brand) setValue("brand", fields.brand, setOpts);

  if (fields.model && fields.brand) {
    const modelOptions = modelOptionsForBrand(fields.brand);
    const matched = modelOptions.find(
      (option) => option.toLocaleLowerCase("tr-TR") === fields.model?.toLocaleLowerCase("tr-TR"),
    );
    if (matched) setValue("model", matched, setOpts);
  }

  if (fields.year !== null) setValue("year", fields.year, setOpts);
  if (fields.trim) setValue("trim", fields.trim, setOpts);
  if (fields.fuelType) setValue("fuelType", fields.fuelType, setOpts);
  if (fields.transmission) setValue("transmission", fields.transmission, setOpts);
  if (fields.mileage !== null) setValue("mileage", fields.mileage, setOpts);
  if (fields.price !== null) setValue("price", fields.price, setOpts);
  if (fields.city) setValue("city", fields.city, setOpts);
  if (fields.bodyType) setValue("bodyType", fields.bodyType, setOpts);
  if (fields.engineSize) setValue("engineSize", fields.engineSize, setOpts);
  if (fields.enginePower) setValue("enginePower", fields.enginePower, setOpts);
  if (fields.drivetrain) setValue("drivetrain", fields.drivetrain, setOpts);
  if (fields.ownerInfo) setValue("ownerInfo", fields.ownerInfo, setOpts);
  if (fields.tradeStatus) setValue("tradeStatus", fields.tradeStatus, setOpts);
  if (fields.airbagStatus) setValue("airbagStatus", fields.airbagStatus, setOpts);
  if (fields.lpgStatus) setValue("lpgStatus", fields.lpgStatus, setOpts);
  if (fields.hasHeavyDamage !== null) setValue("hasHeavyDamage", fields.hasHeavyDamage, setOpts);
  if (fields.hasChassisRepair !== null) setValue("hasChassisRepair", fields.hasChassisRepair, setOpts);
  if (fields.hasSpareKey !== null) setValue("hasSpareKey", fields.hasSpareKey, setOpts);
  if (fields.sellerDescription) setValue("sellerDescription", fields.sellerDescription, setOpts);
}
