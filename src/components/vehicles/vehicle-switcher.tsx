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
    <div className="rounded-theme border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground/90">
        <Car aria-hidden="true" className="h-4 w-4 text-accent" />
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
            className="min-h-11 flex-1 rounded-theme border border-border bg-input px-3 text-foreground shadow-sm focus:border-accent focus:ring-4 focus:ring-accent/15"
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
            className="inline-flex min-h-11 items-center gap-1 rounded-theme transition active:scale-95 border border-border px-3 text-sm font-semibold text-foreground/90 hover:border-accent"
          >
            <Pencil aria-hidden="true" className="h-4 w-4" />
            Yeniden adlandır
          </button>
          <button
            type="button"
            onClick={startAdding}
            className="inline-flex min-h-11 items-center gap-1 rounded-theme transition active:scale-95 border border-accent px-3 text-sm font-semibold text-accent"
          >
            <Plus aria-hidden="true" className="h-4 w-4" />
            Araç ekle
          </button>
          {canDelete ? (
            <button
              type="button"
              onClick={() => setMode("confirming-delete")}
              className="inline-flex min-h-11 items-center gap-1 rounded-theme transition active:scale-95 border border-destructive/30 px-3 text-sm font-semibold text-destructive hover:border-destructive"
            >
              <Trash2 aria-hidden="true" className="h-4 w-4" />
              Bu aracı ve kayıtlarını sil
            </button>
          ) : null}
        </div>
      ) : mode === "confirming-delete" ? (
        <div role="alert" className="mt-3 rounded-theme border border-destructive/30 bg-destructive/10 p-3">
          <p className="text-sm text-destructive">
            {selectedVehicle?.label ?? "Bu araç"} silinecek; bu araca ait tüm hatırlatma, gider ve sağlık kaydı da
            birlikte silinecek. Bu işlem geri alınamaz.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={confirmDelete}
              className="inline-flex min-h-11 items-center rounded-theme transition active:scale-95 bg-destructive px-4 text-sm font-semibold text-destructive-foreground hover:opacity-90"
            >
              Evet, sil
            </button>
            <button
              type="button"
              onClick={() => setMode("idle")}
              className="inline-flex min-h-11 items-center rounded-theme transition active:scale-95 border border-border px-4 text-sm font-semibold text-foreground/90"
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
            className="min-h-11 flex-1 rounded-theme border border-border bg-input px-3 text-foreground shadow-sm focus:border-accent focus:ring-4 focus:ring-accent/15"
          />
          <button
            type="button"
            onClick={submitDraft}
            className="inline-flex min-h-11 items-center rounded-theme transition active:scale-95 bg-primary px-4 text-sm font-semibold text-primary-foreground"
          >
            {mode === "adding" ? "Ekle" : "Kaydet"}
          </button>
          <button
            type="button"
            onClick={() => setMode("idle")}
            className="inline-flex min-h-11 items-center rounded-theme transition active:scale-95 border border-border px-4 text-sm font-semibold text-foreground/90"
          >
            Vazgeç
          </button>
        </div>
      )}
    </div>
  );
}
