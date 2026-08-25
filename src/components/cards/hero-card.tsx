import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const TONE_CLASSES = {
  primary: {
    surface: "bg-primary text-primary-foreground",
    ring: "border-primary-foreground/10",
    glow: "bg-accent/20",
  },
  accent: {
    surface: "bg-accent text-accent-foreground",
    ring: "border-accent-foreground/10",
    glow: "bg-warning/20",
  },
  success: {
    surface: "bg-success text-success-foreground",
    ring: "border-success-foreground/10",
    glow: "bg-accent/20",
  },
  warning: {
    surface: "bg-warning text-warning-foreground",
    ring: "border-warning-foreground/10",
    glow: "bg-primary/15",
  },
} as const;

export function HeroCard({
  icon: Icon,
  eyebrow,
  title,
  description,
  action,
  decorative = true,
  tone = "primary",
  className,
}: {
  icon: LucideIcon;
  /** Small bold label above the title, e.g. the module/section name. */
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  decorative?: boolean;
  /** Distinguishes this screen's hero from the home page's — same family, different weight. */
  tone?: keyof typeof TONE_CLASSES;
  className?: string;
}) {
  const { surface, ring, glow } = TONE_CLASSES[tone];
  return (
    <section className={cn("relative overflow-hidden rounded-theme px-5 py-5 shadow-sm", surface, className)}>
      {decorative ? (
        <>
          <div
            aria-hidden="true"
            className={cn("pointer-events-none absolute -right-6 -top-8 h-28 w-28 rounded-full border", ring)}
          />
          <div
            aria-hidden="true"
            className={cn("pointer-events-none absolute -bottom-10 left-8 h-20 w-20 rounded-full blur-2xl", glow)}
          />
        </>
      ) : null}
      <div className="relative">
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-current/10">
          <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} />
        </div>
        {eyebrow ? <p className="mb-1 text-sm font-semibold opacity-70">{eyebrow}</p> : null}
        <h2 className="font-heading text-[20px] font-bold leading-tight tracking-tight">{title}</h2>
        {description ? <p className="mt-2 max-w-[300px] text-sm leading-5 opacity-75">{description}</p> : null}
        {action ? <div className="mt-5">{action}</div> : null}
      </div>
    </section>
  );
}
