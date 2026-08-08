import { ChevronRight } from "lucide-react";
import { RiskBadge } from "@/components/ui/risk-badge";
import { VehiclePlaceholder } from "@/components/ui/vehicle-placeholder";

export function AnalysisCard({
  title,
  dateLabel,
  score,
  findingLabel,
  onOpen,
  action,
}: {
  title: string;
  dateLabel: string;
  score: number;
  findingLabel: string;
  onOpen?: () => void;
  action?: React.ReactNode;
}) {
  const body = (
    <div className="flex min-h-[92px] items-center gap-3 bg-card px-4 py-4">
      <div className="h-[68px] w-[72px] shrink-0 overflow-hidden rounded-theme">
        <VehiclePlaceholder />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate font-heading text-[14px] font-bold leading-5 text-foreground">{title}</h3>
          <RiskBadge score={score} className="text-[10px]" />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{dateLabel}</p>
        <p className="mt-1.5 truncate text-xs font-medium text-foreground">{findingLabel}</p>
      </div>
      {onOpen ? (
        <ChevronRight aria-hidden="true" className="h-5 w-5 shrink-0 text-muted-foreground" strokeWidth={1.8} />
      ) : null}
    </div>
  );

  return (
    <article className="overflow-hidden rounded-theme border border-border bg-card shadow-sm">
      {onOpen ? (
        <button type="button" onClick={onOpen} className="block w-full text-left">
          {body}
        </button>
      ) : (
        body
      )}
      {action ? <div className="border-t border-border">{action}</div> : null}
    </article>
  );
}
