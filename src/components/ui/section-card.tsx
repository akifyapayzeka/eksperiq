import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

const ACCENT_CLASSES = {
  default: "before:bg-accent/40",
  success: "before:bg-success/60",
  warning: "before:bg-warning/70",
  danger: "before:bg-destructive/70",
  violet: "before:bg-chart-4/70",
} as const;

export function SectionCard({
  id,
  title,
  description,
  children,
  accent = "default",
}: {
  id?: string;
  title: string;
  description?: string;
  children: ReactNode;
  accent?: keyof typeof ACCENT_CLASSES;
}) {
  return (
    <section
      id={id}
      className={cn(
        "relative scroll-mt-24 overflow-hidden rounded-theme border border-border bg-card p-4 shadow-sm before:absolute before:inset-x-0 before:top-0 before:h-1 sm:p-6",
        ACCENT_CLASSES[accent],
      )}
    >
      <div className="mb-5">
        <h2 className="font-heading text-xl font-bold text-foreground">{title}</h2>
        {description ? <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}
