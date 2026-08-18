"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Camera } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Field, SelectField } from "@/components/ui/field";
import { PrimaryButton, SecondaryButton } from "@/components/ui/button";
import { VehiclePlaceholder } from "@/components/ui/vehicle-placeholder";
import { createVehicleId, upsertVehicle } from "@/lib/storage/vehicle-storage";
import { VEHICLE_BRANDS, modelsForBrand } from "@/lib/vehicles/brand-catalog";
import {
  VEHICLE_FUEL_LABELS,
  VEHICLE_TRANSMISSION_LABELS,
  type VehicleFuelType,
  type VehicleProfile,
  type VehicleTransmissionType,
} from "@/lib/vehicles/types";

const FUEL_OPTIONS = Object.entries(VEHICLE_FUEL_LABELS) as [VehicleFuelType, string][];
const TRANSMISSION_OPTIONS = Object.entries(VEHICLE_TRANSMISSION_LABELS) as [VehicleTransmissionType, string][];
const OTHER_BRAND = "Diğer";
const OTHER_MODEL = "Diğer";
const CURRENT_YEAR = new Date().getFullYear();
const VEHICLE_YEARS = Array.from({ length: CURRENT_YEAR - 1979 }, (_, index) => String(CURRENT_YEAR + 1 - index));

type DraftState = {
  label: string;
  brand: string;
  model: string;
  modelYear: string;
  mileage: string;
  fuel: string;
  transmission: string;
  plate: string;
  photoDataUrl: string;
};

function toDraft(vehicle: VehicleProfile | null): DraftState {
  return {
    label: vehicle?.label ?? "",
    brand: vehicle?.brand ?? "",
    model: vehicle?.model ?? "",
    modelYear: vehicle?.modelYear ? String(vehicle.modelYear) : "",
    mileage: vehicle?.mileage ? String(vehicle.mileage) : "",
    fuel: vehicle?.fuel ?? "",
    transmission: vehicle?.transmission ?? "",
    plate: vehicle?.plate ?? "",
    photoDataUrl: vehicle?.photoDataUrl ?? "",
  };
}

/**
 * Shared vehicle add/edit sheet — wired to the real vehicle storage module.
 * Reused from: new-vehicle flow, edit-vehicle flow, Garajım, Bakım ve Ödeme
 * Takvimi, Gider Defteri, Araç Sağlık Karnesi.
 */
export function VehicleFormSheet({
  open,
  vehicle,
  onClose,
  onSaved,
}: {
  open: boolean;
  vehicle: VehicleProfile | null;
  onClose: () => void;
  onSaved: (vehicle: VehicleProfile) => void;
}) {
  const [draft, setDraft] = useState<DraftState>(() => toDraft(vehicle));

  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => {
      setDraft(toDraft(vehicle));
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open, vehicle]);

  function update<K extends keyof DraftState>(key: K, value: DraftState[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  const isKnownBrand = (VEHICLE_BRANDS as readonly string[]).includes(draft.brand);
  const brandSelectValue = draft.brand ? (isKnownBrand ? draft.brand : OTHER_BRAND) : "";

  const modelOptions = modelsForBrand(draft.brand);
  const isKnownModel = modelOptions.includes(draft.model);
  const modelSelectValue = draft.model ? (isKnownModel ? draft.model : OTHER_MODEL) : "";

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") update("photoDataUrl", reader.result);
    };
    reader.readAsDataURL(file);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const label = draft.label.trim() || [draft.brand, draft.model].filter(Boolean).join(" ") || "Aracım";

    const saved: VehicleProfile = {
      id: vehicle?.id ?? createVehicleId(),
      label,
      createdAt: vehicle?.createdAt ?? new Date().toISOString(),
      brand: draft.brand.trim() || undefined,
      model: draft.model.trim() || undefined,
      modelYear: draft.modelYear ? Number(draft.modelYear) : undefined,
      mileage: draft.mileage ? Number(draft.mileage) : undefined,
      fuel: (draft.fuel as VehicleFuelType) || undefined,
      transmission: (draft.transmission as VehicleTransmissionType) || undefined,
      plate: draft.plate.trim() || undefined,
      photoDataUrl: draft.photoDataUrl || undefined,
    };

    upsertVehicle(saved);
    onSaved(saved);
    onClose();
  }

  return (
    <BottomSheet open={open} title={vehicle ? "Aracı Düzenle" : "Araç Ekle"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-theme">
            {draft.photoDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- user-picked local data URL, not a remote/next/image source
              <img src={draft.photoDataUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <VehiclePlaceholder />
            )}
          </div>
          <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-theme border border-border px-4 text-sm font-semibold text-foreground/90 hover:border-accent">
            <Camera aria-hidden="true" className="h-4 w-4" />
            Fotoğraf ekle (opsiyonel)
            <input type="file" accept="image/*" onChange={handlePhotoChange} className="sr-only" />
          </label>
        </div>

        <Field
          id="vehicle-label"
          label="Araç adı"
          placeholder="Örn. Ailenin Arabası"
          value={draft.label}
          onChange={(event) => update("label", event.target.value)}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            id="vehicle-brand"
            label="Marka"
            options={[...VEHICLE_BRANDS]}
            value={brandSelectValue}
            onChange={(event) => {
              const value = event.target.value;
              update("brand", value === OTHER_BRAND ? "" : value);
            }}
          />
          {brandSelectValue === OTHER_BRAND ? (
            <Field
              id="vehicle-brand-custom"
              label="Marka (elle gir)"
              placeholder="Örn. Başka bir marka"
              value={draft.brand}
              onChange={(event) => update("brand", event.target.value)}
            />
          ) : (
            <>
              <SelectField
                id="vehicle-model"
                label="Model"
                options={[...modelOptions, OTHER_MODEL]}
                value={modelSelectValue}
                onChange={(event) => {
                  const value = event.target.value;
                  update("model", value === OTHER_MODEL ? "" : value);
                }}
              />
              {modelSelectValue === OTHER_MODEL ? (
                <Field
                  id="vehicle-model-custom"
                  label="Model (elle gir)"
                  placeholder="Örn. model adı"
                  value={draft.model}
                  onChange={(event) => update("model", event.target.value)}
                />
              ) : null}
            </>
          )}
          {brandSelectValue === OTHER_BRAND ? (
            <Field
              id="vehicle-model"
              label="Model"
              placeholder="Örn. model adı"
              value={draft.model}
              onChange={(event) => update("model", event.target.value)}
            />
          ) : null}
          <SelectField
            id="vehicle-year"
            label="Model yılı"
            options={VEHICLE_YEARS}
            value={draft.modelYear}
            onChange={(event) => update("modelYear", event.target.value)}
          />
          <Field
            id="vehicle-mileage"
            label="Kilometre"
            type="number"
            inputMode="numeric"
            value={draft.mileage}
            onChange={(event) => update("mileage", event.target.value)}
          />
          <SelectField
            id="vehicle-fuel"
            label="Yakıt"
            options={FUEL_OPTIONS.map(([, label]) => label)}
            value={draft.fuel ? VEHICLE_FUEL_LABELS[draft.fuel as VehicleFuelType] : ""}
            onChange={(event) => {
              const match = FUEL_OPTIONS.find(([, label]) => label === event.target.value);
              update("fuel", match?.[0] ?? "");
            }}
          />
          <SelectField
            id="vehicle-transmission"
            label="Vites"
            options={TRANSMISSION_OPTIONS.map(([, label]) => label)}
            value={draft.transmission ? VEHICLE_TRANSMISSION_LABELS[draft.transmission as VehicleTransmissionType] : ""}
            onChange={(event) => {
              const match = TRANSMISSION_OPTIONS.find(([, label]) => label === event.target.value);
              update("transmission", match?.[0] ?? "");
            }}
          />
          <Field
            id="vehicle-plate"
            label="Plaka (opsiyonel)"
            value={draft.plate}
            onChange={(event) => update("plate", event.target.value)}
            className="sm:col-span-2"
          />
        </div>

        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <SecondaryButton onClick={onClose} type="button" className="sm:order-1">
            Vazgeç
          </SecondaryButton>
          <PrimaryButton type="submit" className="sm:order-2">
            {vehicle ? "Değişiklikleri Kaydet" : "Aracı Ekle"}
          </PrimaryButton>
        </div>
      </form>
    </BottomSheet>
  );
}
