import type { ReactNode } from "react";

/**
 * Standard top-of-page header: small eyebrow, big heading, optional trailing
 * actions (icon buttons, etc). Used across every route so page tops feel
 * consistent instead of each screen inventing its own header markup.
 */
export function PageHeader({
  eyebrow,
  title,
  actions,
  className = "",
}: {
  eyebrow?: string;
  title: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header className={`flex items-start justify-between gap-4 px-4 pb-6 pt-8 sm:px-6 lg:px-8 ${className}`}>
      <div className="min-w-0">
        {eyebrow ? <p className="text-sm text-muted-foreground">{eyebrow}</p> : null}
        <h1 className="mt-1 font-heading text-[26px] font-bold tracking-tight text-foreground sm:text-3xl">{title}</h1>
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-3">{actions}</div> : null}
    </header>
  );
}
