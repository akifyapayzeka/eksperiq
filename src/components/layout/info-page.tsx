import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";

export function InfoPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <AppShell>
      <PageHeader title={title} />
      <article className="rounded-theme border border-border bg-card px-4 py-6 shadow-sm sm:px-8 sm:py-8">
        <div className="space-y-5 leading-7 text-foreground/90 [&_h2]:font-heading [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-foreground [&_a]:text-accent [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5">
          {children}
        </div>
      </article>
    </AppShell>
  );
}
