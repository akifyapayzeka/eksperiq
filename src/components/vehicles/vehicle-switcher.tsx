"use client";

import { useState } from "react";
import { Car, Pencil, Plus, Trash2 } from "lucide-react";
import type { VehicleProfile } from "@/lib/vehicles/types";

type VehicleSwitcherProps = {
  vehicles: VehicleProfile[];
  selectedVehicleId: string;
  onSelect: (id: string) => void;
  onAdd: (label: string) => void;
  onRename: (id: string, label: string) => void;
  onDelete: (id: string) => void;
};

export function VehicleSwitcher({
  vehicles,
  selectedVehicleId,
  onSelect,
  onAdd,
  onRename,
  onDelete,
}: VehicleSwitcherProps) {
  const [mode, setMode] = useState<"idle" | "adding" | "renaming">("idle");
  const [draftLabel, setDraftLabel] = useState("");

  const selectedVehicle = vehicles.find((vehicle) => vehicle.id === selectedVehicleId);
  const canDelete = vehicles.length > 1;

  function startAdding() {
    setDraftLabel("");
    setMode("adding");
  }

  function startRenaming() {
    if (!selectedVehicle) return;
    setDraftLabel(selectedVehicle.label);
    setMode("renaming");
  }

  function submitDraft() {
    const label = draftLabel.trim();
    if (!label) {
      setMode("idle");
      return;
    }
    if (mode === "adding") onAdd(label);
    else if (mode === "renaming" && selectedVehicle) onRename(selectedVehicle.id, label);
    setMode("idle");
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
        <Car aria-hidden="true" className="h-4 w-4 text-teal-700" />
        Araç
      </div>
      {mode === "idle" ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="vehicle-switcher-select">
            Araç seç
          </label>
          <select
            id="vehicle-switcher-select"
            value={selectedVehicleId}
            onChange={(event) => onSelect(event.target.value)}
            className="min-h-11 flex-1 rounded-lg border border-slate-300 bg-white px-3 text-slate-950 shadow-sm focus:border-teal-700 focus:ring-4 focus:ring-teal-100"
          >
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={startRenaming}
            className="inline-flex min-h-11 items-center gap-1 rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-800 hover:border-teal-700"
          >
            <Pencil aria-hidden="true" className="h-4 w-4" />
            Yeniden adlandır
          </button>
          <button
            type="button"
            onClick={startAdding}
            className="inline-flex min-h-11 items-center gap-1 rounded-lg border border-teal-700 px-3 text-sm font-semibold text-teal-800"
          >
            <Plus aria-hidden="true" className="h-4 w-4" />
            Araç ekle
          </button>
          {canDelete ? (
            <button
              type="button"
              onClick={() => onDelete(selectedVehicleId)}
              className="inline-flex min-h-11 items-center gap-1 rounded-lg border border-red-200 px-3 text-sm font-semibold text-red-700 hover:border-red-400"
            >
              <Trash2 aria-hidden="true" className="h-4 w-4" />
              Bu aracı ve kayıtlarını sil
            </button>
          ) : null}
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="vehicle-switcher-draft">
            Araç adı
          </label>
          <input
            id="vehicle-switcher-draft"
            value={draftLabel}
            onChange={(event) => setDraftLabel(event.target.value)}
            placeholder="Örn. İkinci Arabam"
            className="min-h-11 flex-1 rounded-lg border border-slate-300 px-3 text-slate-950 shadow-sm focus:border-teal-700 focus:ring-4 focus:ring-teal-100"
          />
          <button
            type="button"
            onClick={submitDraft}
            className="inline-flex min-h-11 items-center rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white"
          >
            {mode === "adding" ? "Ekle" : "Kaydet"}
          </button>
          <button
            type="button"
            onClick={() => setMode("idle")}
            className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-800"
          >
            Vazgeç
          </button>
        </div>
      )}
    </div>
  );
}
