export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} />;
}

/** Card-shaped loading placeholder for list/card layouts (analysis cards, vehicle cards, reminders). */
export function LoadingSkeleton({ rows = 1, className = "" }: { rows?: number; className?: string }) {
  return (
    <div className={`space-y-3 ${className}`} role="status" aria-label="Yükleniyor">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="rounded-theme border border-border bg-card p-4 shadow-sm">
          <div className="flex gap-4">
            <Skeleton className="h-16 w-16 shrink-0 rounded-theme" />
            <div className="flex-1 space-y-2 py-1">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
