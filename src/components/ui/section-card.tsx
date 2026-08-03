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
    <section
      id={id}
      className="scroll-mt-24 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-slate-950 dark:text-white">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
