import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Clock3 } from "lucide-react";
import { activeModules, plannedModules } from "@/lib/modules/registry";
import type { ProductModule } from "@/lib/modules/types";

function ModuleCard({ module }: { module: ProductModule }) {
  const isActive = module.status === "active";

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-sky-50 text-teal-800">
          {isActive ? (
            <CheckCircle2 aria-hidden="true" className="h-6 w-6" />
          ) : (
            <Clock3 aria-hidden="true" className="h-6 w-6" />
          )}
        </span>
        <span
          className={`inline-flex min-h-8 shrink-0 items-center rounded-full px-3 text-xs font-semibold ${
            isActive ? "bg-teal-50 text-teal-800" : "bg-slate-100 text-slate-500"
          }`}
        >
          {isActive ? "Aktif" : "Yakında"}
        </span>
      </div>
      <h2 className="mt-5 text-xl font-semibold leading-tight text-slate-950">{module.title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-700">{module.summary}</p>
      <div className="mt-5 grid gap-2">
        {module.capabilities.slice(0, 3).map((capability) => (
          <div key={capability.title} className="rounded-xl bg-slate-50 p-3">
            <h3 className="text-sm font-semibold text-slate-950">{capability.title}</h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">{capability.description}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-xl border border-slate-200 bg-white p-3 text-sm leading-6 text-slate-600">
        <p>
          <span className="font-semibold text-slate-900">Kesinlik sınırı:</span> {module.certaintyPolicy}
        </p>
      </div>
      <Link
        href={module.href}
        className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800"
      >
        {isActive ? "Modülü aç" : "Detayları gör"}
        <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
      </Link>
    </article>
  );
}

export default function ModulesPage() {
  const active = activeModules();
  const planned = plannedModules();

  return (
    <main className="flex-1 bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-2xl bg-slate-900 p-6 text-white shadow-sm sm:p-8">
          <p className="text-sm font-semibold text-teal-200">EksperIQ vizyonu</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight sm:text-5xl">
            Sadece ilan analizi değil, araç yolculuğu asistanı.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-200">
            İlan analizi ana akıştır. Fotoğraftan hasar notu, bakım takibi, sağlık karnesi, değer takibi ve satış
            hazırlığı ücretsiz karar destek modülleri olarak ayrı çalışır.
          </p>
        </section>

        <section className="mt-8" aria-labelledby="active-modules-title">
          <h2 id="active-modules-title" className="text-2xl font-semibold text-slate-950">
            Aktif modüller
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {active.map((module) => (
              <ModuleCard key={module.id} module={module} />
            ))}
          </div>
        </section>

        {planned.length ? (
          <section className="mt-10" aria-labelledby="planned-modules-title">
            <h2 id="planned-modules-title" className="text-2xl font-semibold text-slate-950">
              Yakında gelecek özellikler
            </h2>
            <p className="mt-2 text-base leading-7 text-slate-600">
              Aracını tanıdıkça daha faydalı öneriler sunacak bağımsız modüller.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {planned.map((module) => (
                <ModuleCard key={module.id} module={module} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
