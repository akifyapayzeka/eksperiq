import { ArrowUpRight, Fuel, Gauge, Hash } from "lucide-react";
import { VEHICLE_FUEL_LABELS, VEHICLE_TRANSMISSION_LABELS, type VehicleProfile } from "@/lib/vehicles/types";
import { VehiclePlaceholder } from "@/components/ui/vehicle-placeholder";

function vehicleTitle(vehicle: VehicleProfile): string {
  const parts = [vehicle.modelYear ? String(vehicle.modelYear) : null, vehicle.brand, vehicle.model].filter(Boolean);
  return parts.length ? parts.join(" ") : vehicle.label;
}

function vehicleSpec(vehicle: VehicleProfile): string {
  return [
    vehicle.brand,
    vehicle.model,
    vehicle.engineSize,
    vehicle.trim,
    vehicle.modelYear ? String(vehicle.modelYear) : null,
  ]
    .filter(Boolean)
    .join(" ");
}

export function VehicleCard({
  vehicle,
  onOpen,
  action,
}: {
  vehicle: VehicleProfile;
  onOpen?: () => void;
  action?: React.ReactNode;
}) {
  const title = vehicleTitle(vehicle);

  return (
    <article className="overflow-hidden rounded-theme border border-success/20 bg-card shadow-sm">
      <div className="h-1 bg-success/60" />
      <div className="flex items-center gap-4 p-4">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-theme">
          {vehicle.photoDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- local data: URL, not a remote/next/image source
            <img src={vehicle.photoDataUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <VehiclePlaceholder />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-heading text-[15px] font-bold leading-5 text-foreground">{title}</h3>
          {title !== vehicle.label ? (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{vehicle.label}</p>
          ) : null}
          {vehicleSpec(vehicle) ? (
            <p className="mt-0.5 truncate text-xs font-normal text-muted-foreground">{vehicleSpec(vehicle)}</p>
          ) : null}
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {vehicle.plate ? (
              <span className="flex items-center gap-1">
                <Hash aria-hidden="true" className="h-3.5 w-3.5" />
                {vehicle.plate}
              </span>
            ) : null}
            {typeof vehicle.mileage === "number" ? (
              <span className="flex items-center gap-1">
                <Gauge aria-hidden="true" className="h-3.5 w-3.5" />
                {vehicle.mileage.toLocaleString("tr-TR")} km
              </span>
            ) : null}
            {vehicle.fuel ? (
              <span className="flex items-center gap-1">
                <Fuel aria-hidden="true" className="h-3.5 w-3.5" />
                {[
                  VEHICLE_FUEL_LABELS[vehicle.fuel],
                  vehicle.transmission ? VEHICLE_TRANSMISSION_LABELS[vehicle.transmission] : null,
                ]
                  .filter(Boolean)
                  .join(" / ")}
              </span>
            ) : null}
          </div>
        </div>
        {onOpen ? (
          <button
            type="button"
            onClick={onOpen}
            aria-label={`${title} detaylarını aç`}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground"
          >
            <ArrowUpRight aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
          </button>
        ) : null}
      </div>
      {action ? <div className="border-t border-border px-4 py-3">{action}</div> : null}
    </article>
  );
}
