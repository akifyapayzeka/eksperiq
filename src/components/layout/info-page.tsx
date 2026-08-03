import type { ReactNode } from "react";

export function InfoPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="flex-1">
      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">{title}</h1>
        <div className="mt-6 space-y-5 leading-7 text-slate-700 dark:text-slate-300">{children}</div>
      </article>
    </main>
  );
}
