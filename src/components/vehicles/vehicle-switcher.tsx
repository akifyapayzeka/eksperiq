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
  const [mode, setMode] = useState<"idle" | "adding" | "renaming" | "confirming-delete">("idle");
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

  function confirmDelete() {
    onDelete(selectedVehicleId);
    setMode("idle");
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-300">
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
            className="min-h-11 flex-1 rounded-lg border border-slate-300 bg-white px-3 text-slate-950 shadow-sm focus:border-teal-700 focus:ring-4 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
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
            className="inline-flex min-h-11 items-center gap-1 rounded-full transition active:scale-95 border border-slate-300 px-3 text-sm font-semibold text-slate-800 hover:border-teal-700 dark:border-slate-700 dark:text-slate-300"
          >
            <Pencil aria-hidden="true" className="h-4 w-4" />
            Yeniden adlandır
          </button>
          <button
            type="button"
            onClick={startAdding}
            className="inline-flex min-h-11 items-center gap-1 rounded-full transition active:scale-95 border border-teal-700 px-3 text-sm font-semibold text-teal-800"
          >
            <Plus aria-hidden="true" className="h-4 w-4" />
            Araç ekle
          </button>
          {canDelete ? (
            <button
              type="button"
              onClick={() => setMode("confirming-delete")}
              className="inline-flex min-h-11 items-center gap-1 rounded-full transition active:scale-95 border border-red-200 px-3 text-sm font-semibold text-red-700 hover:border-red-400 dark:hover:border-red-700"
            >
              <Trash2 aria-hidden="true" className="h-4 w-4" />
              Bu aracı ve kayıtlarını sil
            </button>
          ) : null}
        </div>
      ) : mode === "confirming-delete" ? (
        <div role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900">
          <p className="text-sm text-red-900">
            {selectedVehicle?.label ?? "Bu araç"} silinecek; bu araca ait tüm hatırlatma, gider ve sağlık kaydı da
            birlikte silinecek. Bu işlem geri alınamaz.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={confirmDelete}
              className="inline-flex min-h-11 items-center rounded-full transition active:scale-95 bg-red-700 px-4 text-sm font-semibold text-white hover:bg-red-800"
            >
              Evet, sil
            </button>
            <button
              type="button"
              onClick={() => setMode("idle")}
              className="inline-flex min-h-11 items-center rounded-full transition active:scale-95 border border-slate-300 px-4 text-sm font-semibold text-slate-800 dark:border-slate-700 dark:text-slate-300"
            >
              Vazgeç
            </button>
          </div>
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
            className="min-h-11 flex-1 rounded-lg border border-slate-300 px-3 text-slate-950 shadow-sm focus:border-teal-700 focus:ring-4 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          <button
            type="button"
            onClick={submitDraft}
            className="inline-flex min-h-11 items-center rounded-full transition active:scale-95 bg-slate-950 px-4 text-sm font-semibold text-white dark:bg-white dark:text-slate-950"
          >
            {mode === "adding" ? "Ekle" : "Kaydet"}
          </button>
          <button
            type="button"
            onClick={() => setMode("idle")}
            className="inline-flex min-h-11 items-center rounded-full transition active:scale-95 border border-slate-300 px-4 text-sm font-semibold text-slate-800 dark:border-slate-700 dark:text-slate-300"
          >
            Vazgeç
          </button>
        </div>
      )}
    </div>
  );
}
