import { AlertCircle, CalendarClock, CheckCircle2, Clock } from "lucide-react";
import type { ReminderUrgency } from "@/lib/reminders/types";
import { cn } from "@/lib/utils/cn";

const URGENCY_CONFIG: Record<
  ReminderUrgency,
  { label: (days: number) => string; icon: typeof Clock; className: string }
> = {
  overdue: { label: (days) => `${Math.abs(days)} gün gecikti`, icon: AlertCircle, className: "text-destructive" },
  urgent: { label: (days) => `${days} gün kaldı`, icon: AlertCircle, className: "text-warning" },
  upcoming: { label: (days) => `${days} gün kaldı`, icon: CalendarClock, className: "text-accent" },
  later: { label: (days) => `${days} gün kaldı`, icon: CheckCircle2, className: "text-success" },
};

export function ReminderCard({
  title,
  subtitle,
  days,
  urgency,
  amountLabel,
}: {
  title: string;
  subtitle?: string;
  days: number;
  urgency: ReminderUrgency;
  amountLabel?: string;
}) {
  const config = URGENCY_CONFIG[urgency];
  const Icon = config.icon;

  return (
    <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-4 last:border-b-0">
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-theme bg-muted", config.className)}
        >
          <Icon aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={1.8} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{title}</p>
          {subtitle ? <p className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</p> : null}
        </div>
      </div>
      <div className="shrink-0 text-right">
        {amountLabel ? <p className="text-sm font-bold text-foreground">{amountLabel}</p> : null}
        <p className={cn("mt-1 flex items-center justify-end gap-1 text-xs font-semibold", config.className)}>
          {config.label(days)}
        </p>
      </div>
    </div>
  );
}
