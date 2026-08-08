import type { ReactNode } from "react";

export function SectionCard({
  id,
  title,
  description,
  children,
}: {
  id?: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 rounded-theme border border-border bg-card p-4 shadow-sm sm:p-6">
      <div className="mb-5">
        <h2 className="font-heading text-xl font-bold text-foreground">{title}</h2>
        {description ? <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}
