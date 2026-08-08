import { CarFront } from "lucide-react";

/**
 * Local, neutral vehicle placeholder — no remote image domain involved.
 * Used whenever a vehicle/analysis record has no user-uploaded photo.
 */
export function VehiclePlaceholder({ className = "h-full w-full" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center bg-secondary text-secondary-foreground ${className}`}>
      <CarFront aria-hidden="true" className="h-1/2 w-1/2" strokeWidth={1.5} />
    </div>
  );
}
