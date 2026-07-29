import { CheckCircle2, Clock3 } from "lucide-react";
import { activeModules, plannedModules } from "@/lib/modules/registry";
import type { ProductModule } from "@/lib/modules/types";

function ModuleCard({ module }: { module: ProductModule }) {
  const isActive = module.status === "active";

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">{module.title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">{module.summary}</p>
        </div>
        <span
          className={`inline-flex min-h-9 shrink-0 items-center gap-2 rounded-full border px-3 text-sm font-semibold ${
            isActive ? "border-teal-200 bg-teal-50 text-teal-900" : "border-amber-200 bg-amber-50 text-amber-950"
          }`}
        >
          {isActive ? (
            <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
          ) : (
            <Clock3 aria-hidden="true" className="h-4 w-4" />
          )}
          {isActive ? "Aktif" : "Planlı"}
        </span>
      </div>
      <div className="mt-5 grid gap-3">
        {module.capabilities.map((capability) => (
          <div key={capability.title} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <h3 className="font-semibold text-slate-950">{capability.title}</h3>
            <p className="mt-1 text-sm leading-6 text-slate-700">{capability.description}</p>
          </div>
        ))}
      </div>
      <dl className="mt-5 grid gap-3 text-sm">
        <div>
          <dt className="font-semibold text-slate-950">Veri politikası</dt>
          <dd className="mt-1 leading-6 text-slate-700">{module.dataPolicy}</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-950">Kesinlik sınırı</dt>
          <dd className="mt-1 leading-6 text-slate-700">{module.certaintyPolicy}</dd>
        </div>
      </dl>
    </article>
  );
}

export default function ModulesPage() {
  const active = activeModules();
  const planned = plannedModules();

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-800">Uzun vadeli ürün mimarisi</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950 sm:text-4xl">
            EksperIQ modülleri bağımsız geliştirilecek.
          </h1>
          <p className="mt-4 text-lg leading-8 text-slate-700">
            İlk sürüm yalnızca ilan analizini aktif tutar. Gelecek modüller aynı servis ve güvenlik ilkelerini paylaşır,
            ancak birbirlerinin iç mantığına bağımlı olmadan eklenir.
          </p>
        </div>

        <section className="mt-8" aria-labelledby="active-modules-title">
          <h2 id="active-modules-title" className="text-2xl font-semibold text-slate-950">
            Aktif modül
          </h2>
          <div className="mt-4 grid gap-4">
            {active.map((module) => (
              <ModuleCard key={module.id} module={module} />
            ))}
          </div>
        </section>

        <section className="mt-10" aria-labelledby="planned-modules-title">
          <h2 id="planned-modules-title" className="text-2xl font-semibold text-slate-950">
            Planlanan modüller
          </h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {planned.map((module) => (
              <ModuleCard key={module.id} module={module} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
