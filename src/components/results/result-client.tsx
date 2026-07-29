"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, ClipboardCopy, FileText, RotateCcw, Trash2 } from "lucide-react";
import { appConfig } from "@/lib/constants/app";
import { RISK_LEVELS, SCORE_WEIGHTS } from "@/lib/constants/analysis";
import { formatAnalysisSummary } from "@/lib/analysis/report-summary";
import {
  clearAnalysis,
  loadAnalysis,
  loadChecklist,
  loadFindingFilter,
  saveChecklist,
  saveFindingFilter,
  type StoredFindingFilter,
} from "@/lib/storage/analysis-storage";
import type { AnalysisResult, ScoreCategory } from "@/lib/analysis/types";
import { SectionCard } from "@/components/ui/section-card";

const scoreLabels = {
  damageHistory: "Hasar geçmişi",
  maintenance: "Bakım durumu",
  mileageAgeBalance: "Kilometre ve yaş dengesi",
  descriptionTransparency: "İlan açıklamasının şeffaflığı",
  documentsExpertise: "Evrak ve ekspertiz bilgileri",
  sellerTrust: "Satıcı güven işaretleri",
};

const severityLabels = {
  low: "Düşük",
  medium: "Orta",
  high: "Yüksek",
};

type FindingFilter = StoredFindingFilter;

const findingFilters: Array<{ value: FindingFilter; label: string }> = [
  { value: "all", label: "Tümü" },
  { value: "high", label: "Yüksek" },
  { value: "medium", label: "Orta" },
  { value: "low", label: "Düşük" },
];

function severityClass(severity: string) {
  if (severity === "high") return "border-red-200 bg-red-50 text-red-950";
  if (severity === "medium") return "border-amber-200 bg-amber-50 text-amber-950";
  return "border-emerald-200 bg-emerald-50 text-emerald-950";
}

function scorePercent(category: ScoreCategory, value: number): number {
  return Math.round((value / SCORE_WEIGHTS[category]) * 100);
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatReportDate(value: string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function findingCount(result: AnalysisResult, severity: keyof typeof severityLabels): number {
  return result.findings.filter((finding) => finding.severity === severity).length;
}

export function ResultClient() {
  const [result, setResult] = useState<AnalysisResult | null>(() => loadAnalysis());
  const [copyStatus, setCopyStatus] = useState<"idle" | "questions-copied" | "summary-copied" | "failed">("idle");
  const [findingFilter, setFindingFilter] = useState<FindingFilter>(() => loadFindingFilter());
  const [checkedChecklist, setCheckedChecklist] = useState<Set<string>>(() => {
    const current = loadAnalysis();
    return new Set(current ? loadChecklist(current.finalChecklist) : []);
  });

  async function copyText(text: string, successStatus: "questions-copied" | "summary-copied") {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus(successStatus);
    } catch {
      setCopyStatus("failed");
    }
  }

  async function copyQuestions() {
    if (!result) return;
    const text = result.sellerQuestions.map((question, index) => `${index + 1}. ${question}`).join("\n");
    await copyText(text, "questions-copied");
  }

  async function copySummary() {
    if (!result) return;
    await copyText(formatAnalysisSummary(result), "summary-copied");
  }

  function clearCurrentAnalysis() {
    clearAnalysis();
    setResult(null);
    setCheckedChecklist(new Set());
    setFindingFilter("all");
  }

  function selectFindingFilter(filter: FindingFilter) {
    setFindingFilter(filter);
    saveFindingFilter(filter);
  }

  function toggleChecklistItem(item: string) {
    setCheckedChecklist((current) => {
      const next = new Set(current);
      if (next.has(item)) {
        next.delete(item);
      } else {
        next.add(item);
      }
      saveChecklist([...next]);
      return next;
    });
  }

  if (!result) {
    return (
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-12 text-center sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold text-slate-950">Analiz bulunamadı</h1>
          <p className="mt-3 leading-7 text-slate-700">
            Sayfa yenilenmiş olabilir. Sonuç verisi URL içine yazılmaz ve yalnızca mevcut tarayıcı oturumunda tutulur.
          </p>
          <Link
            href="/analiz"
            className="mt-6 inline-flex min-h-12 items-center rounded-lg bg-slate-950 px-5 font-semibold text-white"
          >
            Analizi yeniden başlat
          </Link>
        </div>
      </main>
    );
  }

  const visibleFindings =
    findingFilter === "all" ? result.findings : result.findings.filter((finding) => finding.severity === findingFilter);

  return (
    <main className="flex-1">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-lg bg-slate-950 p-5 text-white sm:p-8">
          <p className="text-sm text-slate-300">Araç Risk Skoru</p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-5xl font-semibold">{result.totalScore} / 100</h1>
              <p className="mt-3 text-xl text-amber-200">{result.riskLabel}</p>
              <p className="mt-2 text-sm text-slate-300">Rapor tarihi: {formatReportDate(result.generatedAt)}</p>
            </div>
            <div className="rounded-lg border border-white/20 p-4">
              <p className="text-sm text-slate-300">Kısa karar özeti</p>
              <p className="mt-1 text-lg font-semibold">{result.decision}</p>
            </div>
          </div>
          <div className="no-print mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-slate-950 hover:bg-slate-100"
            >
              <FileText aria-hidden="true" className="h-4 w-4" />
              Raporu yazdır
            </button>
            <button
              type="button"
              onClick={copyQuestions}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-white/25 px-4 text-sm font-semibold text-white hover:bg-white/10"
            >
              <ClipboardCopy aria-hidden="true" className="h-4 w-4" />
              Soruları kopyala
            </button>
            <button
              type="button"
              onClick={copySummary}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-white/25 px-4 text-sm font-semibold text-white hover:bg-white/10"
            >
              <ClipboardCopy aria-hidden="true" className="h-4 w-4" />
              Rapor özetini kopyala
            </button>
            <Link
              href="/analiz"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-white/25 px-4 text-sm font-semibold text-white hover:bg-white/10"
            >
              <RotateCcw aria-hidden="true" className="h-4 w-4" />
              Yeni analiz
            </Link>
            <button
              type="button"
              onClick={clearCurrentAnalysis}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-red-300 px-4 text-sm font-semibold text-red-100 hover:bg-red-950/40"
            >
              <Trash2 aria-hidden="true" className="h-4 w-4" />
              Oturum verisini sil
            </button>
          </div>
          <p className="no-print mt-3 min-h-5 text-sm text-slate-300" role="status">
            {copyStatus === "questions-copied" ? "Satıcı soruları panoya kopyalandı." : null}
            {copyStatus === "summary-copied" ? "Rapor özeti panoya kopyalandı." : null}
            {copyStatus === "failed" ? "Panoya kopyalama tarayıcı tarafından engellendi." : null}
          </p>
        </section>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          <AlertTriangle aria-hidden="true" className="mr-2 inline h-5 w-5" />
          {appConfig.disclaimer}
        </div>
        <SectionCard
          title="Bilgi doluluğu"
          description="Daha fazla doğrulanabilir bilgi girildikçe raporun karar desteği değeri artar."
        >
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium text-slate-800">Dolu bilgi alanları</span>
              <strong
                className="text-slate-950"
                aria-label={`Bilgi doluluğu ${result.completeness.completed} / ${result.completeness.total}`}
              >
                {result.completeness.completed} / {result.completeness.total}
              </strong>
            </div>
            <div
              className="mt-3 h-2 rounded-full bg-slate-200"
              role="progressbar"
              aria-label="Bilgi doluluğu yüzdesi"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={result.completeness.percentage}
            >
              <div className="h-2 rounded-full bg-teal-700" style={{ width: `${result.completeness.percentage}%` }} />
            </div>
            {result.completeness.missing.length ? (
              <div className="mt-4">
                <p className="text-sm font-medium text-slate-800">Satıcıdan tamamlanması istenecek bilgiler</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {result.completeness.missing.slice(0, 10).map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-700">Temel bilgi alanları dolu görünüyor.</p>
            )}
          </div>
        </SectionCard>
        <SectionCard title="Araç ve ilan özeti">
          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-slate-200 p-3">
              <dt className="text-sm text-slate-600">Araç</dt>
              <dd className="mt-1 font-semibold text-slate-950">
                {result.input.brand} {result.input.model}
              </dd>
            </div>
            <div className="rounded-lg border border-slate-200 p-3">
              <dt className="text-sm text-slate-600">Yıl / km</dt>
              <dd className="mt-1 font-semibold text-slate-950">
                {result.input.year} / {result.input.mileage.toLocaleString("tr-TR")} km
              </dd>
            </div>
            <div className="rounded-lg border border-slate-200 p-3">
              <dt className="text-sm text-slate-600">Fiyat</dt>
              <dd className="mt-1 font-semibold text-slate-950">{formatCurrency(result.input.price)}</dd>
            </div>
            <div className="rounded-lg border border-slate-200 p-3">
              <dt className="text-sm text-slate-600">Şehir</dt>
              <dd className="mt-1 font-semibold text-slate-950">{result.input.city}</dd>
            </div>
          </dl>
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="font-medium text-slate-950">{result.mileage.label}</p>
            <p className="mt-1 text-sm leading-6 text-slate-700">
              Araç yaşı yaklaşık {result.mileage.vehicleAge} yıl, yıllık ortalama kullanım yaklaşık{" "}
              {result.mileage.annualMileage.toLocaleString("tr-TR")} km. Bu değerler yalnızca genel referanstır.
            </p>
            {result.input.listingUrl ? (
              <p className="mt-3 break-words text-sm text-slate-700">
                İlan referansı:{" "}
                <a
                  className="font-medium text-teal-800 underline"
                  href={result.input.listingUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  {result.input.listingUrl}
                </a>
              </p>
            ) : null}
          </div>
        </SectionCard>
        <SectionCard title="Kategori skorları">
          <div className="grid gap-3 md:grid-cols-2">
            {Object.entries(result.breakdown).map(([key, value]) => {
              const category = key as ScoreCategory;
              const label = scoreLabels[category];

              return (
                <div key={key} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-slate-800">{label}</span>
                    <span className="font-semibold text-slate-950">
                      {value} / {SCORE_WEIGHTS[category]}
                    </span>
                  </div>
                  <div
                    className="mt-3 h-2 rounded-full bg-slate-100"
                    role="progressbar"
                    aria-label={`${label} skoru`}
                    aria-valuemin={0}
                    aria-valuemax={SCORE_WEIGHTS[category]}
                    aria-valuenow={value}
                  >
                    <div
                      className="h-2 rounded-full bg-teal-700"
                      style={{ width: `${scorePercent(category, value)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
        <SectionCard
          title="Skor nasıl okunmalı?"
          description="Skor, kullanıcının girdiği bilgiye göre çalışan kural tabanlı bir karar desteğidir; kesin ekspertiz sonucu değildir."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-slate-200 p-4">
              <h3 className="font-semibold text-slate-950">Risk aralıkları</h3>
              <ul className="mt-3 grid gap-2 text-sm text-slate-700">
                {RISK_LEVELS.map((level) => (
                  <li
                    key={level.label}
                    className="flex items-center justify-between gap-3 rounded-md bg-slate-50 px-3 py-2"
                  >
                    <span>
                      {level.min}-{level.max}
                    </span>
                    <strong className="text-slate-950">{level.label}</strong>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <h3 className="font-semibold text-slate-950">Kategori ağırlıkları</h3>
              <ul className="mt-3 grid gap-2 text-sm text-slate-700">
                {Object.entries(SCORE_WEIGHTS).map(([key, value]) => (
                  <li key={key} className="flex items-center justify-between gap-3 rounded-md bg-slate-50 px-3 py-2">
                    <span>{scoreLabels[key as keyof typeof scoreLabels]}</span>
                    <strong className="text-slate-950">{value} puan</strong>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </SectionCard>
        <SectionCard title="Güçlü taraflar">
          <ul className="grid gap-2">
            {result.strengths.map((item) => (
              <li key={item} className="flex gap-2">
                <CheckCircle2 aria-hidden="true" className="mt-0.5 h-5 w-5 text-teal-700" />
                {item}
              </li>
            ))}
          </ul>
        </SectionCard>
        <SectionCard
          title="Öncelikli ilk aksiyonlar"
          description="Satıcıyla görüşmeden veya ekspertize gitmeden önce netleştirmeniz gereken başlıklar."
        >
          <ol className="grid list-decimal gap-3 pl-5">
            {result.priorityActions.map((action) => (
              <li key={action.title} className="pl-1">
                <span className="font-semibold text-slate-950">{action.title}</span>
                <p className="mt-1 text-sm leading-6 text-slate-600">Neden: {action.reason}</p>
              </li>
            ))}
          </ol>
        </SectionCard>
        <SectionCard title="Riskli noktalar">
          <div className="mb-4 grid gap-3 sm:grid-cols-3" aria-label="Risk bulgusu dağılımı">
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm font-medium text-red-950">Yüksek riskli bulgu</p>
              <strong className="mt-1 block text-2xl text-red-950">{findingCount(result, "high")}</strong>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="text-sm font-medium text-amber-950">Orta riskli bulgu</p>
              <strong className="mt-1 block text-2xl text-amber-950">{findingCount(result, "medium")}</strong>
            </div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
              <p className="text-sm font-medium text-emerald-950">Düşük riskli bulgu</p>
              <strong className="mt-1 block text-2xl text-emerald-950">{findingCount(result, "low")}</strong>
            </div>
          </div>
          <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Risk bulgusu filtresi">
            {findingFilters.map((filter) => {
              const isActive = findingFilter === filter.value;
              const count = filter.value === "all" ? result.findings.length : findingCount(result, filter.value);

              return (
                <button
                  key={filter.value}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => selectFindingFilter(filter.value)}
                  className={`min-h-11 rounded-lg border px-4 text-sm font-semibold ${
                    isActive
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-200 bg-white text-slate-800 hover:border-teal-700 hover:text-teal-800"
                  }`}
                >
                  {filter.label} ({count})
                </button>
              );
            })}
          </div>
          <div className="grid gap-3">
            {visibleFindings.map((finding) => (
              <article key={finding.id} className={`rounded-lg border p-4 ${severityClass(finding.severity)}`}>
                <p className="text-xs font-semibold uppercase tracking-wide">
                  {finding.category} / {severityLabels[finding.severity]}
                </p>
                <h3 className="mt-1 font-semibold">{finding.title}</h3>
                <p className="mt-2 text-sm leading-6">{finding.explanation}</p>
                <p className="mt-2 text-sm font-medium">{finding.recommendation}</p>
              </article>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Yakın zamanda çıkabilecek masraflar">
          <ul className="grid gap-2">
            {result.costs.map((cost) => (
              <li key={cost.item} className="flex justify-between gap-3 rounded-lg border border-slate-200 p-3">
                <span>{cost.item}</span>
                <strong>{cost.level}</strong>
              </li>
            ))}
          </ul>
        </SectionCard>
        <SectionCard title="Satıcıya sorulacak sorular">
          <ol className="grid list-decimal gap-2 pl-5">
            {result.sellerQuestions.map((question) => (
              <li key={question}>{question}</li>
            ))}
          </ol>
        </SectionCard>
        <SectionCard title="Ekspertizde özellikle kontrol edilmesi gerekenler">
          <div className="grid gap-2 sm:grid-cols-2">
            {result.inspectionFocus.map((item) => (
              <span key={item} className="rounded-lg border border-slate-200 bg-white p-3">
                {item}
              </span>
            ))}
          </div>
        </SectionCard>
        <SectionCard
          title="Son kontrol listesi"
          description="Bu liste yalnızca mevcut tarayıcı oturumunda saklanır; oturum verisini silerseniz işaretler de temizlenir."
        >
          <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium text-slate-800">Tamamlanan kontroller</span>
              <strong
                className="text-slate-950"
                aria-label={`Tamamlanan kontroller ${checkedChecklist.size} / ${result.finalChecklist.length}`}
              >
                {checkedChecklist.size} / {result.finalChecklist.length}
              </strong>
            </div>
            <div className="mt-3 h-2 rounded-full bg-slate-200" aria-hidden="true">
              <div
                className="h-2 rounded-full bg-teal-700 transition-all"
                style={{ width: `${Math.round((checkedChecklist.size / result.finalChecklist.length) * 100)}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-slate-600" role="status">
              {checkedChecklist.size === result.finalChecklist.length
                ? "Tüm kontrol maddeleri işaretlendi. Yine de nihai karar öncesi belge ve ekspertiz sonuçlarını birlikte değerlendirin."
                : "Satın alma öncesi doğruladığınız maddeleri işaretleyin."}
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {result.finalChecklist.map((item) => (
              <label key={item} className="flex min-h-12 items-center gap-3 rounded-lg border border-slate-200 p-3">
                <input
                  type="checkbox"
                  checked={checkedChecklist.has(item)}
                  onChange={() => toggleChecklistItem(item)}
                  className="h-5 w-5"
                />
                {item}
              </label>
            ))}
          </div>
        </SectionCard>
      </div>
    </main>
  );
}
