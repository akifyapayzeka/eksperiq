import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function HeroCard({
  icon: Icon,
  title,
  description,
  action,
  decorative = true,
  className,
}: {
  icon: LucideIcon;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  decorative?: boolean;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-theme bg-primary px-6 py-6 text-primary-foreground shadow-sm",
        className,
      )}
    >
      {decorative ? (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full border border-primary-foreground/10"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-2 top-16 h-24 w-24 rounded-full border border-primary-foreground/10"
          />
        </>
      ) : null}
      <div className="relative">
        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-primary-foreground/10">
          <Icon aria-hidden="true" className="h-[22px] w-[22px]" strokeWidth={1.8} />
        </div>
        <h2 className="font-heading text-[22px] font-bold leading-tight tracking-tight">{title}</h2>
        {description ? (
          <p className="mt-2 max-w-[300px] text-sm leading-5 text-primary-foreground/75">{description}</p>
        ) : null}
        {action ? <div className="mt-6">{action}</div> : null}
      </div>
    </section>
  );
}
