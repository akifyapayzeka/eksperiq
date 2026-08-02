"use client";

import { appConfig } from "@/lib/constants/app";
import { DEFAULT_VEHICLE_LABEL } from "@/lib/vehicles/types";
import type { VehicleProfile } from "@/lib/vehicles/types";

function isVehicleProfile(value: unknown): value is VehicleProfile {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return typeof record.id === "string" && typeof record.label === "string" && typeof record.createdAt === "string";
}

function readRaw(): VehicleProfile[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(appConfig.vehiclesStorageKey);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isVehicleProfile);
  } catch {
    window.localStorage.removeItem(appConfig.vehiclesStorageKey);
    return [];
  }
}

function writeRaw(vehicles: VehicleProfile[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(appConfig.vehiclesStorageKey, JSON.stringify(vehicles));
}

export function createVehicleId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `vehicle-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Guarantees at least one vehicle profile exists so single-car users never see
 * the switcher or lose access to their existing (untagged) records.
 */
export function ensureDefaultVehicle(): VehicleProfile[] {
  const current = readRaw();
  if (current.length > 0) return current;

  const defaultVehicle: VehicleProfile = {
    id: createVehicleId(),
    label: DEFAULT_VEHICLE_LABEL,
    createdAt: new Date().toISOString(),
  };
  writeRaw([defaultVehicle]);
  return [defaultVehicle];
}

export function loadVehicles(): VehicleProfile[] {
  return ensureDefaultVehicle();
}

export function upsertVehicle(vehicle: VehicleProfile): VehicleProfile[] {
  const current = ensureDefaultVehicle();
  const index = current.findIndex((item) => item.id === vehicle.id);
  const next = index === -1 ? [...current, vehicle] : current.map((item, i) => (i === index ? vehicle : item));
  writeRaw(next);
  return next;
}

export type DeleteVehicleResult = { ok: true; vehicles: VehicleProfile[] } | { ok: false; reason: "last-vehicle" };

/** Refuses to delete the last remaining vehicle so there is always at least one profile. */
export function deleteVehicle(id: string): DeleteVehicleResult {
  const current = ensureDefaultVehicle();
  if (current.length <= 1) return { ok: false, reason: "last-vehicle" };

  const next = current.filter((item) => item.id !== id);
  writeRaw(next);
  return { ok: true, vehicles: next };
}
