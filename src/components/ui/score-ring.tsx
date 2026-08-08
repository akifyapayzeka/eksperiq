import { riskBucket, type RiskBucket } from "@/lib/analysis/risk-bucket";

const STROKE_CLASS: Record<RiskBucket, string> = {
  low: "stroke-success",
  medium: "stroke-warning",
  high: "stroke-destructive",
};

const LABEL: Record<RiskBucket, string> = {
  low: "Düşük risk",
  medium: "Orta risk",
  high: "Yüksek risk",
};

/**
 * Visual ring plus an always-rendered textual summary (score + label) next
 * to it — the ring alone is decorative (aria-hidden), so screen reader users
 * get the same information as sighted users via the text.
 */
export function ScoreRing({
  score,
  size = 48,
  withSummary = true,
  className,
}: {
  score: number;
  size?: number;
  withSummary?: boolean;
  className?: string;
}) {
  const bucket = riskBucket(score);
  const clamped = Math.max(0, Math.min(100, score));
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);

  return (
    <div className={`inline-flex items-center gap-3 ${className ?? ""}`}>
      <div className="relative flex shrink-0 items-center justify-center" style={{ height: size, width: size }}>
        <svg viewBox="0 0 44 44" className="-rotate-90" style={{ height: size, width: size }} aria-hidden="true">
          <circle cx="22" cy="22" r={radius} fill="none" className="stroke-muted" strokeWidth="4" />
          <circle
            cx="22"
            cy="22"
            r={radius}
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={STROKE_CLASS[bucket]}
          />
        </svg>
        <span aria-hidden="true" className="absolute font-heading text-xs font-bold text-foreground">
          {clamped}
        </span>
      </div>
      {withSummary ? (
        <div className="text-sm leading-tight">
          <p className="font-semibold text-foreground">{clamped}/100 risk skoru</p>
          <p className="text-muted-foreground">{LABEL[bucket]}</p>
        </div>
      ) : (
        <span className="sr-only">{`Risk skoru ${clamped}/100, ${LABEL[bucket]}`}</span>
      )}
    </div>
  );
}
