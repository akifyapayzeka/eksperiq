import type { VehicleProfile } from "./types";

type VehicleTagged = { vehicleId?: string };

/**
 * Records created before multi-vehicle support have no vehicleId. Treat them as
 * belonging to the first (default) vehicle profile so existing single-car users
 * see no change and lose no data.
 */
export function recordVehicleId<T extends VehicleTagged>(record: T, vehicles: VehicleProfile[]): string | undefined {
  return record.vehicleId ?? vehicles[0]?.id;
}

export function filterByVehicle<T extends VehicleTagged>(
  records: T[],
  vehicleId: string,
  vehicles: VehicleProfile[],
): T[] {
  return records.filter((record) => recordVehicleId(record, vehicles) === vehicleId);
}
