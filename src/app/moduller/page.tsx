import Link from "next/link";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { activeModules } from "@/lib/modules/registry";
import type { ProductModule } from "@/lib/modules/types";
import { AppShell } from "@/components/layout/app-shell";
import { HeroCard } from "@/components/cards/hero-card";
import { SectionHeader } from "@/components/layout/section-header";

function ModuleCard({ module }: { module: ProductModule }) {
  return (
    <article className="rounded-theme border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
          <CheckCircle2 aria-hidden="true" className="h-6 w-6" />
        </span>
        <span className="inline-flex min-h-8 shrink-0 items-center rounded-full bg-success/10 px-3 text-xs font-semibold text-success">
          Aktif
        </span>
      </div>
      <h2 className="mt-5 font-heading text-xl font-bold leading-tight text-foreground">{module.title}</h2>
      <p className="mt-2 text-sm leading-6 text-foreground/80">{module.summary}</p>
      <div className="mt-5 grid gap-2">
        {module.capabilities.slice(0, 3).map((capability) => (
          <div key={capability.title} className="rounded-theme-sm bg-muted p-3">
            <h3 className="text-sm font-semibold text-foreground">{capability.title}</h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{capability.description}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-theme-sm border border-border bg-card p-3 text-sm leading-6 text-muted-foreground">
        <p>
          <span className="font-semibold text-foreground">Kesinlik sınırı:</span> {module.certaintyPolicy}
        </p>
      </div>
      <Link
        href={module.href}
        className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90"
      >
        Modülü aç
        <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
      </Link>
    </article>
  );
}

export default function ModulesPage() {
  const active = activeModules();

  return (
    <AppShell>
      <div className="pt-6">
        <HeroCard
          icon={CheckCircle2}
          title="Sadece ilan analizi değil, araç yolculuğu asistanı."
          description="İlan analizi ana akıştır. Fotoğraftan hasar notu, bakım takibi, sağlık karnesi, değer takibi ve satış hazırlığı gibi tüm modüller şu anda kullanıma açık ve ücretsiz karar destek ekranları olarak çalışır."
        />
      </div>

      <section className="mt-8">
        <SectionHeader title="Tüm modüller" description={`${active.length} modül aktif`} />
        <div className="grid gap-4 sm:grid-cols-2">
          {active.map((module) => (
            <ModuleCard key={module.id} module={module} />
          ))}
        </div>
      </section>
    </AppShell>
  );
}
