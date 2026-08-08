import { AlertTriangle, ShieldAlert, ShieldCheck } from "lucide-react";
import { riskBucket, type RiskBucket } from "@/lib/analysis/risk-bucket";
import { cn } from "@/lib/utils/cn";

const CONFIG: Record<RiskBucket, { label: string; icon: typeof ShieldCheck; className: string }> = {
  low: { label: "Düşük risk", icon: ShieldCheck, className: "bg-success/10 text-success" },
  medium: { label: "Orta risk", icon: ShieldAlert, className: "bg-warning/10 text-warning" },
  high: { label: "Yüksek risk", icon: AlertTriangle, className: "bg-destructive/10 text-destructive" },
};

/**
 * Single source of truth for risk color/label is `riskBucket()` from
 * src/lib/analysis/risk-bucket.ts — this component only renders its output.
 * Never color-only: always pairs an icon + text label so risk is legible
 * without relying on hue.
 */
export function RiskBadge({
  score,
  showScore = true,
  className,
}: {
  score: number;
  showScore?: boolean;
  className?: string;
}) {
  const bucket = riskBucket(score);
  const config = CONFIG[bucket];
  const Icon = config.icon;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold",
        config.className,
        className,
      )}
    >
      <Icon aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2.2} />
      {showScore ? `${score} — ${config.label}` : config.label}
    </span>
  );
}

export function riskBadgeConfig(score: number) {
  return CONFIG[riskBucket(score)];
}
