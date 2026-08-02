"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowUpRight,
  CalendarDays,
  CarFront,
  FileText,
  Plus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Wrench,
} from "lucide-react";
import { loadAnalysis } from "@/lib/storage/analysis-storage";
import type { AnalysisResult } from "@/lib/analysis/types";

type AnalysisFilter = "all" | "high" | "medium" | "low";

const filters: Array<{ id: AnalysisFilter; label: string }> = [
  { id: "all", label: "Tümü" },
  { id: "high", label: "Yüksek Risk" },
  { id: "medium", label: "Orta Risk" },
  { id: "low", label: "Düşük Risk" },
];

const assistantModules = [
  ["/fotograf-hasar", "Fotoğraftan Hasar Analizi", "Olası çizik, göçük ve panel uyumsuzluğu işaretleri."],
  ["/bakim-odeme-takvimi", "Bakım ve Ödeme Takvimi", "MTV, sigorta, muayene ve bakım tarihlerini bildirimle takip et."],
  ["/arac-saglik-karnesi", "Araç Sağlık Karnesi", "Bakım, ekspertiz ve kontrol geçmişini sade ekranda tut."],
  ["/arac-deger-takibi", "Araç Değer Takibi", "Piyasa hareketlerini karar desteği olarak takip et."],
] as const;

export default function MyAnalysesPage() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [activeFilter, setActiveFilter] = useState<AnalysisFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setResult(loadAnalysis());
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const completedCount = result ? 1 : 0;
  const visibleResult =
    result && matchesSearch(result, searchQuery) && matchesFilter(result, activeFilter) ? result : null;
  const filteredCount = visibleResult ? 1 : 0;

  function clearFilters() {
    setActiveFilter("all");
    setSearchQuery("");
  }

  return (
    <main className="flex-1 bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">Kayıtlı incelemelerin</p>
            <h1 className="mt-1 text-4xl font-semibold text-slate-950">Analizlerim</h1>
          </div>
          <Link
            href="/analiz"
            className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white"
          >
            <Plus aria-hidden="true" className="h-4 w-4" />
            Yeni Analiz
          </Link>
        </div>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="grid grid-cols-3 divide-x divide-slate-200 overflow-hidden rounded-2xl border border-slate-200">
            <div className="p-4">
              <strong className="block text-2xl text-slate-950">{completedCount}</strong>
              <span className="text-sm text-slate-600">analiz</span>
            </div>
            <div className="p-4">
              <strong className="block text-2xl text-slate-950">{result?.totalScore ?? "-"}</strong>
              <span className="text-sm text-slate-600">son skor</span>
            </div>
            <div className="p-4">
              <strong className="block text-2xl text-slate-950">{result ? result.findings.length : "-"}</strong>
              <span className="text-sm text-slate-600">bulgu</span>
            </div>
          </div>

          <div className="mt-5 flex min-h-12 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4">
            <Search aria-hidden="true" className="h-5 w-5 text-slate-500" />
            <label htmlFor="analysis-search" className="sr-only">
              Marka veya model ara
            </label>
            <input
              id="analysis-search"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Marka veya model ara"
              className="min-h-11 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-500"
            />
            <button
              type="button"
              onClick={clearFilters}
              className="ml-auto inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-slate-500 hover:bg-white hover:text-slate-900"
              aria-label="Filtreleri temizle"
            >
              <SlidersHorizontal aria-hidden="true" className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:flex" role="group" aria-label="Analiz filtreleri">
            {filters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                aria-pressed={activeFilter === filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`min-h-11 rounded-full border px-3 text-sm font-semibold sm:shrink-0 sm:px-4 ${
                  activeFilter === filter.id
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-teal-700 hover:text-teal-800"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="mt-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">
                {result ? "Son oturum analizi" : "Henüz analiz yok"}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Veriler kalıcı hesaba kaydedilmez; yalnızca bu oturumda görünür.
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">
              {filteredCount} / {completedCount} analiz
            </span>
          </div>

          {visibleResult ? (
            <article className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="bg-sky-50 p-5">
                <div className="flex gap-4">
                  <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-white">
                    <CarFront aria-hidden="true" className="h-10 w-10 text-slate-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col items-start gap-2 sm:flex-row sm:justify-between">
                      <h3 className="text-xl font-semibold leading-tight text-slate-950">
                        {visibleResult.input.year} {visibleResult.input.brand} {visibleResult.input.model}
                      </h3>
                      <span className="shrink-0 rounded-full bg-amber-50 px-2 py-1 text-sm font-semibold text-amber-700 ring-1 ring-amber-200">
                        {visibleResult.totalScore} - {visibleResult.riskLabel}
                      </span>
                    </div>
                    <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-600">
                      <span>{visibleResult.input.city || "Şehir belirtilmedi"}</span>
                      <span>{visibleResult.input.mileage.toLocaleString("tr-TR")} km</span>
                      <span>{visibleResult.input.fuelType}</span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <p className="flex items-start gap-2 text-sm font-semibold text-slate-700">
                  <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  {visibleResult.findings[0]?.title ?? "Öncelikli bulgu bulunamadı"}
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <CalendarDays aria-hidden="true" className="h-4 w-4 text-slate-500" />
                    <p className="mt-2 text-sm font-semibold text-slate-950">Oturum raporu</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <ShieldCheck aria-hidden="true" className="h-4 w-4 text-slate-500" />
                    <p className="mt-2 text-sm font-semibold text-slate-950">
                      {visibleResult.completeness.completed}/{visibleResult.completeness.total} bilgi dolu
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <Wrench aria-hidden="true" className="h-4 w-4 text-slate-500" />
                    <p className="mt-2 text-sm font-semibold text-slate-950">
                      {visibleResult.inspectionFocus.length} kontrol başlığı
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Link
                    href="/sonuc"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white"
                  >
                    Raporu Aç
                    <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/kontrol-listesi"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-sky-50 px-4 text-sm font-semibold text-slate-900 ring-1 ring-sky-100"
                  >
                    Kontrol listesi
                    <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </article>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <FileText aria-hidden="true" className="mx-auto h-10 w-10 text-slate-400" />
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {result
                  ? "Bu arama veya filtreyle eşleşen analiz bulunamadı. Filtreleri temizleyip tekrar deneyin."
                  : "Henüz analiz oluşturulmadı. Araç bilgilerini girerek ilk raporu oluşturabilirsiniz."}
              </p>
              {result ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-teal-700 px-4 text-sm font-semibold text-white"
                >
                  Filtreleri temizle
                </button>
              ) : (
                <Link
                  href="/analiz"
                  className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-teal-700 px-4 text-sm font-semibold text-white"
                >
                  Analiz başlat
                </Link>
              )}
            </div>
          )}
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-950">EksperIQ araçları</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Araç yolculuğunu daha şeffaf kılacak ücretsiz karar destek ekranları.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {assistantModules.map(([href, title, description]) => (
              <Link key={title} href={href} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-teal-800 ring-1 ring-slate-200">
                  Aç
                </span>
                <h3 className="mt-4 font-semibold text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function normalize(value: string): string {
  return value.toLocaleLowerCase("tr-TR").trim();
}

function matchesSearch(result: AnalysisResult, query: string): boolean {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return true;

  const haystack = normalize(
    [
      result.input.brand,
      result.input.model,
      result.input.year,
      result.input.city,
      result.input.fuelType,
      result.input.sellerDescription,
    ].join(" "),
  );

  return haystack.includes(normalizedQuery);
}

function riskBucket(score: number): Exclude<AnalysisFilter, "all"> {
  if (score >= 80) return "low";
  if (score >= 60) return "medium";
  return "high";
}

function matchesFilter(result: AnalysisResult, filter: AnalysisFilter): boolean {
  if (filter === "all") return true;
  return riskBucket(result.totalScore) === filter;
}
