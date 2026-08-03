"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowUpRight,
  CarFront,
  Camera,
  FileText,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { openAnalysisFromHistory } from "@/lib/storage/analysis-storage";
import {
  type AnalysisHistoryRecord,
  deleteAnalysisHistory,
  loadAnalysisHistory,
} from "@/lib/storage/analysis-history-storage";
import { deletePhotoAnalysis, loadPhotoAnalyses } from "@/lib/storage/photo-analysis-storage";
import { loadVehicles } from "@/lib/storage/vehicle-storage";
import { riskBucket } from "@/lib/analysis/risk-bucket";
import { Skeleton } from "@/components/ui/skeleton";
import type { AnalysisResult } from "@/lib/analysis/types";
import type { PhotoAnalysisRecord } from "@/lib/photo-analysis/types";

type AnalysisFilter = "all" | "high" | "medium" | "low";

const filters: Array<{ id: AnalysisFilter; label: string }> = [
  { id: "all", label: "Tümü" },
  { id: "high", label: "Yüksek Risk" },
  { id: "medium", label: "Orta Risk" },
  { id: "low", label: "Düşük Risk" },
];

const riskBadgeStyles: Record<AnalysisFilter, string> = {
  all: "bg-slate-100 text-slate-600",
  high: "bg-red-50 text-red-700",
  medium: "bg-amber-50 text-amber-800",
  low: "bg-emerald-50 text-emerald-700",
};

const assistantModules = [
  ["/fotograf-hasar", "Fotoğraftan Hasar Analizi", "Olası çizik, göçük ve panel uyumsuzluğu işaretleri."],
  ["/bakim-odeme-takvimi", "Bakım ve Ödeme Takvimi", "MTV, sigorta, muayene ve bakım tarihlerini bildirimle takip et."],
  ["/arac-saglik-karnesi", "Araç Sağlık Karnesi", "Bakım, ekspertiz ve kontrol geçmişini sade ekranda tut."],
  ["/arac-deger-takibi", "Araç Değer Takibi", "Piyasa hareketlerini karar desteği olarak takip et."],
] as const;

function normalize(value: string): string {
  return value.toLocaleLowerCase("tr-TR").trim();
}

function matchesSearch(result: AnalysisResult, query: string): boolean {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return true;

  const haystack = normalize(
    [result.input.brand, result.input.model, result.input.year, result.input.city, result.input.fuelType].join(" "),
  );

  return haystack.includes(normalizedQuery);
}

function matchesFilter(result: AnalysisResult, filter: AnalysisFilter): boolean {
  if (filter === "all") return true;
  return riskBucket(result.totalScore) === filter;
}

function formatAnalysisDate(value: string): string {
  return new Date(value).toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" });
}

export default function MyAnalysesPage() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [history, setHistory] = useState<AnalysisHistoryRecord[]>([]);
  const [vehicleCount, setVehicleCount] = useState(0);
  const [activeFilter, setActiveFilter] = useState<AnalysisFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [photoAnalyses, setPhotoAnalyses] = useState<PhotoAnalysisRecord[]>([]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setHistory(loadAnalysisHistory());
      setVehicleCount(loadVehicles().length);
      setPhotoAnalyses(loadPhotoAnalyses());
      setIsReady(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  function removePhotoAnalysis(id: string) {
    setPhotoAnalyses(deletePhotoAnalysis(id));
  }

  function removeAnalysis(id: string) {
    setHistory(deleteAnalysisHistory(id));
  }

  function openReport(result: AnalysisResult) {
    openAnalysisFromHistory(result);
    router.push("/sonuc");
  }

  function clearFilters() {
    setActiveFilter("all");
    setSearchQuery("");
  }

  const visibleRecords = useMemo(
    () =>
      history.filter(
        (record) => matchesSearch(record.result, searchQuery) && matchesFilter(record.result, activeFilter),
      ),
    [history, searchQuery, activeFilter],
  );

  const averageScore = useMemo(() => {
    if (!history.length) return null;
    const total = history.reduce((sum, record) => sum + record.result.totalScore, 0);
    return Math.round(total / history.length);
  }, [history]);

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
            className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full transition active:scale-95 bg-slate-900 px-4 text-sm font-semibold text-white"
          >
            <Plus aria-hidden="true" className="h-4 w-4" />
            Yeni Analiz
          </Link>
        </div>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="grid grid-cols-3 divide-x divide-slate-200 overflow-hidden rounded-2xl border border-slate-200">
            <div className="p-4">
              {isReady ? (
                <strong className="block text-2xl text-slate-950">{history.length}</strong>
              ) : (
                <Skeleton className="h-8 w-10" />
              )}
              <span className="text-sm text-slate-600">analiz</span>
            </div>
            <div className="p-4">
              {isReady ? (
                <strong className="block text-2xl text-slate-950">{averageScore ?? "-"}</strong>
              ) : (
                <Skeleton className="h-8 w-10" />
              )}
              <span className="text-sm text-slate-600">ort. risk skoru</span>
            </div>
            <div className="p-4">
              {isReady ? (
                <strong className="block text-2xl text-slate-950">{vehicleCount}</strong>
              ) : (
                <Skeleton className="h-8 w-10" />
              )}
              <span className="text-sm text-slate-600">araç takipte</span>
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
              placeholder="Marka, model veya ilan ara"
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
                {history.length ? `${history.length} analiz` : "Henüz analiz yok"}
              </h2>
              <p className="mt-1 text-sm text-slate-600">En yeniden eskiye</p>
            </div>
            {history.length ? (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">
                {visibleRecords.length} / {history.length}
              </span>
            ) : null}
          </div>

          {visibleRecords.length ? (
            <div className="mt-5 grid gap-3">
              {visibleRecords.map((record) => {
                const bucket = riskBucket(record.result.totalScore);
                return (
                  <article
                    key={record.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                  >
                    <div className="flex gap-4 p-5">
                      <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-slate-50">
                        <CarFront aria-hidden="true" className="h-8 w-8 text-slate-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col items-start gap-2 sm:flex-row sm:justify-between">
                          <h3 className="text-lg font-semibold leading-tight text-slate-950">
                            {record.result.input.year} {record.result.input.brand} {record.result.input.model}
                          </h3>
                          <span
                            className={`shrink-0 rounded-full px-2 py-1 text-sm font-semibold ${riskBadgeStyles[bucket]}`}
                          >
                            {record.result.totalScore} — {record.result.riskLabel}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">{formatAnalysisDate(record.result.generatedAt)}</p>
                        <p className="mt-2 flex items-start gap-2 text-sm text-slate-700">
                          <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                          {record.result.findings[0]?.title ?? "Öncelikli bulgu yok"}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => openReport(record.result)}
                            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full transition active:scale-95 bg-slate-900 px-4 text-sm font-semibold text-white"
                          >
                            Raporu Aç
                            <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeAnalysis(record.id)}
                            className="inline-flex min-h-10 items-center gap-1 rounded-full transition active:scale-95 px-3 text-sm font-semibold text-red-700 hover:bg-red-50"
                          >
                            <Trash2 aria-hidden="true" className="h-4 w-4" />
                            Sil
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <FileText aria-hidden="true" className="mx-auto h-10 w-10 text-slate-400" />
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {history.length
                  ? "Bu arama veya filtreyle eşleşen analiz bulunamadı. Filtreleri temizleyip tekrar deneyin."
                  : "Henüz analiz oluşturulmadı. Araç bilgilerini girerek ilk raporu oluşturabilirsiniz."}
              </p>
              {history.length ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 inline-flex min-h-11 items-center rounded-full bg-teal-700 px-4 text-sm font-semibold text-white"
                >
                  Filtreleri temizle
                </button>
              ) : (
                <Link
                  href="/analiz"
                  className="mt-4 inline-flex min-h-11 items-center rounded-full bg-teal-700 px-4 text-sm font-semibold text-white"
                >
                  Analiz başlat
                </Link>
              )}
            </div>
          )}

          <p className="mt-5 rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-600">
            Risk skorları mevcut kanıtlara göre hesaplanır; kesin hüküm yerine inceleme önceliği sunar. Analizler
            hesabınıza değil, yalnızca bu cihaza kaydedilir.
          </p>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-950">Fotoğraf analizlerim</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Fotoğraftan Hasar Analizi ekranında kaydettiğiniz analizler burada listelenir.
          </p>
          {photoAnalyses.length ? (
            <div className="mt-4 grid gap-3">
              {photoAnalyses.map((record) => (
                <article key={record.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-950">{formatAnalysisDate(record.createdAt)}</p>
                    <button
                      type="button"
                      onClick={() => removePhotoAnalysis(record.id)}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-red-700 hover:underline"
                    >
                      <Trash2 aria-hidden="true" className="h-4 w-4" />
                      Sil
                    </button>
                  </div>
                  {record.thumbnails.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {record.thumbnails.map((thumbnail, index) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={`${record.id}-${index}`}
                          src={thumbnail}
                          alt="Kaydedilen fotoğraf"
                          className="h-20 w-20 rounded-lg object-cover"
                        />
                      ))}
                    </div>
                  ) : null}
                  {record.aiSummary ? (
                    <p className="mt-3 text-sm leading-6 text-slate-700">{record.aiSummary}</p>
                  ) : null}
                  {record.findings.length ? (
                    <ul className="mt-3 grid gap-1 text-sm text-slate-700">
                      {record.findings.map((item, index) => (
                        <li key={index}>
                          {item.area}: {item.finding}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
              <Camera aria-hidden="true" className="h-6 w-6 shrink-0 text-slate-400" />
              <p className="text-sm text-slate-600">
                Henüz kaydedilmiş fotoğraf analizi yok.{" "}
                <Link href="/fotograf-hasar" className="font-semibold text-teal-800 hover:underline">
                  Fotoğraftan Hasar Analizi&apos;ni aç
                </Link>
                .
              </p>
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
