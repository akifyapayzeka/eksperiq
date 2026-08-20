"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, BookOpen, ChevronDown, Search } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { HeroCard } from "@/components/cards/hero-card";
import { CHRONIC_ISSUES_DB } from "@/lib/chronic-issues/data";
import type { IssueSeverity } from "@/lib/chronic-issues/types";

const severityLabels: Record<IssueSeverity, string> = { high: "Yüksek", medium: "Orta", low: "Düşük" };

function severityClass(severity: IssueSeverity): string {
  if (severity === "high") return "border-destructive/30 bg-destructive/10 text-destructive";
  if (severity === "medium") return "border-warning/30 bg-warning/10 text-warning";
  return "border-success/30 bg-success/10 text-success";
}

export default function ModelGuidePage() {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const filteredModels = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("tr-TR");
    if (!normalized) return CHRONIC_ISSUES_DB;
    return CHRONIC_ISSUES_DB.filter((entry) =>
      `${entry.brand} ${entry.model}`.toLocaleLowerCase("tr-TR").includes(normalized),
    );
  }, [query]);

  function toggle(key: string) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const totalIssueCount = CHRONIC_ISSUES_DB.reduce(
    (sum, entry) => sum + entry.engines.reduce((engineSum, engine) => engineSum + engine.issues.length, 0),
    0,
  );

  return (
    <AppShell>
      <div className="pt-6">
        <HeroCard
          icon={BookOpen}
          eyebrow="Model Rehberi"
          title="Motor bazında bilinen kronik sorunlar"
          description="Bir araç analiz etmeden de gezebileceğiniz, marka/model/motor bazında derlenmiş bilinen sorun rehberi. Bu, ilanın kendi durumu değil, o motor ailesinin genel eğilimidir."
        />
      </div>

      <div className="mt-6 rounded-theme border border-warning/30 bg-warning/10 p-4 text-sm leading-6 text-foreground">
        <div className="flex gap-3">
          <AlertTriangle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
          <p>
            Bu liste henüz Türkiye&apos;de en yaygın ~25-30 modeli kapsıyor ve zamanla genişletiliyor. Her bulgu forum
            konsensüsü, teknik servis bültenleri veya resmi geri çağırma kayıtları gibi kaynaklara dayanır; kesin arıza
            teşhisi değildir — bağımsız ekspertizin yerini tutmaz. Modeliniz burada yoksa bu genel rehberde henüz
            araştırılmamış demektir, o motorda sorun olmadığı anlamına gelmez.
          </p>
        </div>
      </div>

      <section className="mt-6">
        <div className="relative">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Marka veya model ara (ör. Fiat Egea, Seat Ibiza)"
            aria-label="Marka veya model ara"
            className="min-h-12 w-full rounded-full border border-border bg-card pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {filteredModels.length} model listeleniyor, toplam {totalIssueCount} bilinen sorun kaydı.
        </p>
      </section>

      <section className="mt-4 grid gap-3">
        {filteredModels.map((entry) => {
          const key = `${entry.brand}-${entry.model}`;
          const isOpen = expanded.has(key);
          const issueCount = entry.engines.reduce((sum, engine) => sum + engine.issues.length, 0);

          return (
            <article key={key} className="overflow-hidden rounded-theme border border-border bg-card shadow-sm">
              <button
                type="button"
                onClick={() => toggle(key)}
                aria-expanded={isOpen}
                className="flex min-h-14 w-full items-center justify-between gap-3 px-4 py-3 text-left"
              >
                <div>
                  <p className="font-semibold text-foreground">
                    {entry.brand} {entry.model}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {entry.yearFrom}-{entry.yearTo} · {entry.engines.length} motor seçeneği · {issueCount} bilinen sorun
                  </p>
                </div>
                <ChevronDown
                  aria-hidden="true"
                  className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isOpen ? (
                <div className="border-t border-border p-4">
                  {entry.generalNote ? (
                    <p className="mb-4 text-sm leading-6 text-muted-foreground">{entry.generalNote}</p>
                  ) : null}
                  <div className="grid gap-4">
                    {entry.engines.map((engine) => (
                      <div key={engine.engineLabel} className="rounded-theme-sm border border-border p-3">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <h3 className="font-semibold text-foreground">
                            {engine.engineLabel} · {engine.fuelType}
                            {engine.transmission ? ` · ${engine.transmission}` : ""}
                          </h3>
                          {engine.yearFrom || engine.yearTo ? (
                            <span className="text-xs text-muted-foreground">
                              {engine.yearFrom ?? entry.yearFrom}-{engine.yearTo ?? entry.yearTo}
                            </span>
                          ) : null}
                        </div>
                        {engine.reliabilityNote ? (
                          <p className="mt-1 text-sm leading-6 text-muted-foreground">{engine.reliabilityNote}</p>
                        ) : null}
                        {engine.issues.length ? (
                          <div className="mt-3 grid gap-2">
                            {engine.issues.map((issue) => (
                              <div
                                key={issue.id}
                                className={`rounded-theme-sm border p-3 ${severityClass(issue.severity)}`}
                              >
                                <p className="text-xs font-semibold uppercase tracking-wide">
                                  {severityLabels[issue.severity]}
                                </p>
                                <h4 className="mt-1 font-semibold">{issue.title}</h4>
                                <p className="mt-1 text-sm leading-6">{issue.detail}</p>
                                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium opacity-80">
                                  {issue.typicalOnset ? <span>Tipik görülme: {issue.typicalOnset}</span> : null}
                                  {issue.costLevel ? <span>Tahmini maliyet: {issue.costLevel}</span> : null}
                                </div>
                                <p className="mt-2 text-xs italic opacity-70">{issue.sourceNote}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-2 text-sm text-muted-foreground">
                            Bu motor için yaygın olarak bildirilen bir kronik sorun tespit edilemedi.
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </article>
          );
        })}
        {filteredModels.length === 0 ? (
          <p className="rounded-theme border border-border bg-card p-4 text-sm text-muted-foreground">
            Aramanızla eşleşen bir model bulunamadı.
          </p>
        ) : null}
      </section>
    </AppShell>
  );
}
