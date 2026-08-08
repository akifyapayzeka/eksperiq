import type { ReactNode } from "react";

export type StatItem = {
  key: string;
  value: ReactNode;
  label: string;
};

/** Row of small stat tiles, divided by thin borders — used on home/profile/garage summaries. */
export function StatGrid({ items }: { items: StatItem[] }) {
  return (
    <div
      className="grid rounded-theme border border-border bg-card shadow-sm"
      style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
    >
      {items.map((item, index) => (
        <div key={item.key} className={`px-3 py-4 text-center ${index > 0 ? "border-l border-border" : ""}`}>
          <p className="font-heading text-xl font-bold text-foreground">{item.value}</p>
          <p className="mt-1 text-[11px] leading-4 text-muted-foreground">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
