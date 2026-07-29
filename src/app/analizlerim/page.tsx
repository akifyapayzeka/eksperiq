"use client";

import { useMemo } from "react";
import Link from "next/link";
import { AlertCircle, ArrowUpRight, CarFront, FileText, Plus } from "lucide-react";
import { loadAnalysis } from "@/lib/storage/analysis-storage";

export default function MyAnalysesPage() {
  const result = useMemo(() => loadAnalysis(), []);

  return (
    <main className="flex-1 bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">Kayıtlı incelemelerin</p>
            <h1 className="mt-1 text-4xl font-semibold text-slate-950">Analizlerim</h1>
          </div>
          <Link
            href="/analiz"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white"
          >
            <Plus aria-hidden="true" className="h-4 w-4" />
            Yeni
          </Link>
        </div>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">{result ? "Son oturum analizi" : "Analiz yok"}</h2>
              <p className="mt-1 text-sm text-slate-600">Veriler bu MVP aşamasında kalıcı hesaba kaydedilmez.</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">
              {result ? "1 analiz" : "0 analiz"}
            </span>
          </div>

          {result ? (
            <article className="mt-5 rounded-2xl border border-slate-200 bg-sky-50 p-5">
              <div className="flex gap-4">
                <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-white">
                  <CarFront aria-hidden="true" className="h-10 w-10 text-slate-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-xl font-semibold leading-tight text-slate-950">
                      {result.input.year} {result.input.brand} {result.input.model}
                    </h3>
                    <span className="shrink-0 text-sm font-semibold text-amber-700">
                      {result.totalScore} - {result.riskLabel}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{result.input.city || "Şehir belirtilmedi"}</p>
                  <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <AlertCircle aria-hidden="true" className="h-4 w-4 text-amber-600" />
                    {result.findings[0]?.title ?? "Öncelikli bulgu bulunamadı"}
                  </p>
                  <Link
                    href="/sonuc"
                    className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white"
                  >
                    Raporu Aç
                    <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </article>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <FileText aria-hidden="true" className="mx-auto h-10 w-10 text-slate-400" />
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Henüz analiz oluşturulmadı. Bir ilan girerek ilk raporu oluşturabilirsiniz.
              </p>
              <Link
                href="/analiz"
                className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-teal-700 px-4 text-sm font-semibold text-white"
              >
                Analiz başlat
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
