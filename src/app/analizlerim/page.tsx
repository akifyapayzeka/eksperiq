"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowUpRight, Camera, FileText, Search, SlidersHorizontal, Trash2 } from "lucide-react";
import { openAnalysisFromHistory } from "@/lib/storage/analysis-storage";
import {
  type AnalysisHistoryRecord,
  deleteAnalysisHistory,
  loadAnalysisHistory,
} from "@/lib/storage/analysis-history-storage";
import { deletePhotoAnalysis, loadPhotoAnalyses } from "@/lib/storage/photo-analysis-storage";
import { loadVehicles } from "@/lib/storage/vehicle-storage";
import { riskBucket } from "@/lib/analysis/risk-bucket";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { SectionHeader } from "@/components/layout/section-header";
import { StatGrid } from "@/components/cards/stat-card";
import { RiskBadge } from "@/components/ui/risk-badge";
import { VehiclePlaceholder } from "@/components/ui/vehicle-placeholder";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { PrimaryButton, IconButton } from "@/components/ui/button";
import type { AnalysisResult } from "@/lib/analysis/types";
import type { PhotoAnalysisRecord } from "@/lib/photo-analysis/types";

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
  [
    "/arac-deger-takibi",
    "Araç Değer Takibi",
    "Kullanıcı girdisine dayalı fiyat aralığını karar desteği olarak takip et.",
  ],
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
    let cancelled = false;
    const frame = window.requestAnimationFrame(() => {
      setHistory(loadAnalysisHistory());
      setVehicleCount(loadVehicles().length);
      setIsReady(true);
    });
    void loadPhotoAnalyses().then((records) => {
      if (!cancelled) setPhotoAnalyses(records);
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
    };
  }, []);

  async function removePhotoAnalysis(id: string) {
    setPhotoAnalyses(await deletePhotoAnalysis(id));
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
    <AppShell>
      <PageHeader eyebrow="Kayıtlı incelemelerin" title="Analizlerim" />

      <section className="rounded-theme border border-border bg-card p-4 shadow-sm sm:p-5">
        {isReady ? (
          <StatGrid
            items={[
              { key: "count", value: history.length, label: "analiz" },
              { key: "score", value: averageScore ?? "—", label: "ort. risk skoru" },
              { key: "vehicles", value: vehicleCount, label: "araç takipte" },
            ]}
          />
        ) : (
          <Skeleton className="h-16 w-full" />
        )}

        <div className="mt-5 flex min-h-12 items-center gap-3 rounded-theme border border-border bg-muted px-4">
          <Search aria-hidden="true" className="h-5 w-5 text-muted-foreground" />
          <label htmlFor="analysis-search" className="sr-only">
            Marka veya model ara
          </label>
          <input
            id="analysis-search"
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Marka, model veya ilan ara"
            className="min-h-11 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <IconButton
            icon={SlidersHorizontal}
            label="Filtreleri temizle"
            onClick={clearFilters}
            className="ml-auto h-9 w-9 border-0 bg-transparent shadow-none"
          />
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
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground/80 hover:border-accent hover:text-accent"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="mt-6 flex items-end justify-between gap-4">
          <SectionHeader
            className="mb-0"
            title={history.length ? `${history.length} analiz` : "Henüz analiz yok"}
            description="En yeniden eskiye"
          />
          {history.length ? (
            <span className="rounded-full bg-muted px-3 py-1 text-sm font-semibold text-muted-foreground">
              {visibleRecords.length} / {history.length}
            </span>
          ) : null}
        </div>

        {visibleRecords.length ? (
          <div className="mt-3 grid gap-3">
            {visibleRecords.map((record) => (
              <article key={record.id} className="overflow-hidden rounded-theme border border-border bg-card shadow-sm">
                <div className="flex gap-4 p-5">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-theme">
                    {record.result.listingImages?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element -- External listing CDNs are not known at build time.
                      <img src={record.result.listingImages[0]} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <VehiclePlaceholder />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col items-start gap-2 sm:flex-row sm:justify-between">
                      <h3 className="text-lg font-semibold leading-tight text-foreground">
                        {record.result.input.year} {record.result.input.brand} {record.result.input.model}
                      </h3>
                      <RiskBadge score={record.result.totalScore} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatAnalysisDate(record.result.generatedAt)}
                    </p>
                    <p className="mt-2 flex items-start gap-2 text-sm text-foreground/80">
                      <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                      {record.result.findings[0]?.title ?? "Öncelikli bulgu yok"}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <PrimaryButton onClick={() => openReport(record.result)} className="min-h-10">
                        Raporu Aç
                        <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                      </PrimaryButton>
                      <button
                        type="button"
                        onClick={() => removeAnalysis(record.id)}
                        className="inline-flex min-h-10 items-center gap-1 rounded-full px-3 text-sm font-semibold text-destructive transition hover:bg-destructive/10"
                      >
                        <Trash2 aria-hidden="true" className="h-4 w-4" />
                        Sil
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-3">
            <EmptyState
              icon={FileText}
              title={history.length ? "Eşleşen analiz bulunamadı" : "Henüz analiz yok"}
              description={
                history.length
                  ? "Bu arama veya filtreyle eşleşen analiz bulunamadı. Filtreleri temizleyip tekrar deneyin."
                  : "Henüz analiz oluşturulmadı. Araç bilgilerini girerek ilk raporu oluşturabilirsiniz."
              }
              action={
                history.length ? (
                  <PrimaryButton onClick={clearFilters}>Filtreleri temizle</PrimaryButton>
                ) : (
                  <PrimaryButton href="/">Ana sayfaya dön</PrimaryButton>
                )
              }
            />
          </div>
        )}

        <p className="mt-5 rounded-theme-sm bg-muted p-3 text-sm leading-6 text-muted-foreground">
          Risk skorları mevcut kanıtlara göre hesaplanır; kesin hüküm yerine inceleme önceliği sunar. Analizler
          hesabınıza değil, yalnızca bu cihaza kaydedilir.
        </p>
      </section>

      <section className="mt-6 rounded-theme border border-border bg-card p-5 shadow-sm">
        <SectionHeader
          title="Fotoğraf analizlerim"
          description="Fotoğraftan Hasar Analizi ekranında kaydettiğiniz analizler burada listelenir."
        />
        {photoAnalyses.length ? (
          <div className="mt-4 grid gap-3">
            {photoAnalyses.map((record) => (
              <article key={record.id} className="rounded-theme-sm border border-border bg-muted p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">{formatAnalysisDate(record.createdAt)}</p>
                  <button
                    type="button"
                    onClick={() => removePhotoAnalysis(record.id)}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-destructive hover:underline"
                  >
                    <Trash2 aria-hidden="true" className="h-4 w-4" />
                    Sil
                  </button>
                </div>
                {record.thumbnails.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {record.thumbnails.map((thumbnail, index) => (
                      // eslint-disable-next-line @next/next/no-img-element -- locally generated thumbnail data URL, not a remote image
                      <img
                        key={`${record.id}-${index}`}
                        src={thumbnail}
                        alt="Kaydedilen fotoğraf"
                        className="h-20 w-20 rounded-theme-sm object-cover"
                      />
                    ))}
                  </div>
                ) : null}
                {record.aiSummary ? (
                  <p className="mt-3 text-sm leading-6 text-foreground/80">{record.aiSummary}</p>
                ) : null}
                {record.findings.length ? (
                  <ul className="mt-3 grid gap-1 text-sm text-foreground/80">
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
          <div className="mt-4 flex items-center gap-3 rounded-theme-sm border border-dashed border-border bg-muted p-4">
            <Camera aria-hidden="true" className="h-6 w-6 shrink-0 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Henüz kaydedilmiş fotoğraf analizi yok.{" "}
              <Link href="/fotograf-hasar" className="font-semibold text-accent hover:underline">
                Fotoğraftan Hasar Analizi&apos;ni aç
              </Link>
              .
            </p>
          </div>
        )}
      </section>

      <section className="mt-6 rounded-theme border border-border bg-card p-5 shadow-sm">
        <SectionHeader
          title="EksperIQ araçları"
          description="Araç yolculuğunu daha şeffaf kılacak ücretsiz karar destek ekranları."
        />
        <div className="grid gap-3 sm:grid-cols-2">
          {assistantModules.map(([href, title, description]) => (
            <Link
              key={title}
              href={href}
              className="rounded-theme border border-border bg-muted p-4 transition hover:border-accent"
            >
              <span className="rounded-full bg-card px-3 py-1 text-xs font-semibold text-accent ring-1 ring-border">
                Aç
              </span>
              <h3 className="mt-4 font-semibold text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
            </Link>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
