import type { ReactNode } from "react";

export function SectionHeader({
  title,
  description,
  action,
  className = "",
  headingId,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  /** Pass this to the wrapping <section>'s aria-labelledby to keep the a11y link valid. */
  headingId?: string;
}) {
  return (
    <div className={`mb-3 flex items-end justify-between gap-3 ${className}`}>
      <div className="min-w-0">
        <h2 id={headingId} className="font-heading text-lg font-bold text-foreground">
          {title}
        </h2>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0 text-sm font-semibold text-accent">{action}</div> : null}
    </div>
  );
}
