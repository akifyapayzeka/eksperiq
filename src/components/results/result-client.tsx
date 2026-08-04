"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  BadgeCheck,
  CheckCircle2,
  ClipboardCopy,
  FileText,
  Gauge,
  GitCompareArrows,
  RotateCcw,
  Share2,
  ShieldCheck,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Trash2,
} from "lucide-react";
import { appConfig } from "@/lib/constants/app";
import { apiFetch } from "@/lib/api/client";
import { shareContent } from "@/lib/share/share";
import { RISK_LEVELS, SCORE_WEIGHTS } from "@/lib/constants/analysis";
import { formatAnalysisSummary, formatSellerQuestionMessage } from "@/lib/analysis/report-summary";
import { buildAiAnalysisNoteInput } from "@/lib/ai/analysis-note";
import {
  clearAiNoteFeedback,
  loadAiNoteFeedback,
  saveAiNoteFeedback,
  type AiNoteFeedback,
} from "@/lib/storage/ai-feedback-storage";
import {
  clearAnalysis,
  loadAnalysis,
  loadChecklist,
  loadFindingFilter,
  saveChecklist,
  saveFindingFilter,
  type StoredFindingFilter,
} from "@/lib/storage/analysis-storage";
import { addToComparison } from "@/lib/storage/comparison-storage";
import type { AnalysisResult, ScoreCategory } from "@/lib/analysis/types";
import { isAiAnalysisNoteVisible } from "@/lib/ai/feature-flags";
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
  if (severity === "high")
    return "border-red-200 bg-red-50 text-red-950 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200";
  if (severity === "medium")
    return "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200";
  return "border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200";
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

function riskToneClass(score: number): string {
  if (score >= 80)
    return "bg-emerald-50 text-emerald-800 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-800";
  if (score >= 60)
    return "bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-800";
  if (score >= 40)
    return "bg-orange-50 text-orange-800 ring-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:ring-orange-800";
  return "bg-red-50 text-red-800 ring-red-200 dark:bg-red-950 dark:text-red-300 dark:ring-red-800";
}

function priorityToneClass(severity: string): string {
  if (severity === "high")
    return "border-red-200 bg-red-50 text-red-950 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200";
  if (severity === "medium")
    return "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200";
  return "border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200";
}

const SCORE_RING_RADIUS = 16;
const SCORE_RING_CIRCUMFERENCE = 2 * Math.PI * SCORE_RING_RADIUS;

function scoreRingOffset(score: number): number {
  const clamped = Math.min(100, Math.max(0, score));
  return SCORE_RING_CIRCUMFERENCE - (clamped / 100) * SCORE_RING_CIRCUMFERENCE;
}

function scoreRingColorClass(score: number): string {
  if (score >= 80) return "stroke-emerald-600 dark:stroke-emerald-400";
  if (score >= 60) return "stroke-amber-500 dark:stroke-amber-400";
  if (score >= 40) return "stroke-orange-500 dark:stroke-orange-400";
  return "stroke-red-600 dark:stroke-red-400";
}

function compactShareSummary(result: AnalysisResult): string {
  const vehicle = `${result.input.year} ${result.input.brand} ${result.input.model}`;
  const topFindings = result.findings
    .slice(0, 3)
    .map((finding) => `- ${finding.title}`)
    .join("\n");
  const questions = result.sellerQuestions
    .slice(0, 3)
    .map((question, index) => `${index + 1}. ${question}`)
    .join("\n");

  return `${vehicle}
EksperIQ risk skoru: ${result.totalScore}/100
Sonuç: ${result.riskLabel}
Karar özeti: ${result.decision}

Öncelikli bulgular:
${topFindings}

Satıcıya ilk sorular:
${questions}

Not: Bu özet kesin ekspertiz sonucu değildir.`;
}

export function ResultClient() {
  const [isReady, setIsReady] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [copyStatus, setCopyStatus] = useState<
    | "idle"
    | "questions-copied"
    | "seller-message-copied"
    | "summary-copied"
    | "shared"
    | "print-opened"
    | "failed"
    | "comparison-added"
    | "comparison-full"
  >("idle");
  const [addedToComparison, setAddedToComparison] = useState(false);
  const [findingFilter, setFindingFilter] = useState<FindingFilter>("all");
  const [checkedChecklist, setCheckedChecklist] = useState<Set<string>>(new Set());
  const [aiNote, setAiNote] = useState<string | null>(null);
  const [aiNoteStatus, setAiNoteStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [aiNoteMessage, setAiNoteMessage] = useState<string>("");
  const [aiNoteFeedback, setAiNoteFeedback] = useState<AiNoteFeedback | null>(null);
  const [scoreRingFilled, setScoreRingFilled] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const current = loadAnalysis();
      setResult(current);
      setFindingFilter(loadFindingFilter());
      setCheckedChecklist(new Set(current ? loadChecklist(current.finalChecklist) : []));
      setAiNoteFeedback(loadAiNoteFeedback());
      setIsReady(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!result) return;
    const timer = window.setTimeout(() => setScoreRingFilled(true), 80);
    return () => window.clearTimeout(timer);
  }, [result]);

  async function copyText(
    text: string,
    successStatus: "questions-copied" | "seller-message-copied" | "summary-copied",
  ) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        copyTextWithFallback(text);
      }
      setCopyStatus(successStatus);
    } catch {
      try {
        copyTextWithFallback(text);
        setCopyStatus(successStatus);
      } catch {
        setCopyStatus("failed");
      }
    }
  }

  function copyTextWithFallback(text: string) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "true");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    document.body.removeChild(textarea);

    if (!copied) {
      throw new Error("Copy fallback failed");
    }
  }

  function printReport() {
    setCopyStatus("print-opened");
    window.setTimeout(() => window.print(), 0);
  }

  async function copyQuestions() {
    if (!result) return;
    const text = result.sellerQuestions.map((question, index) => `${index + 1}. ${question}`).join("\n");
    await copyText(text, "questions-copied");
  }

  async function copySellerMessage() {
    if (!result) return;
    await copyText(formatSellerQuestionMessage(result), "seller-message-copied");
  }

  async function copySummary() {
    if (!result) return;
    await copyText(formatAnalysisSummary(result), "summary-copied");
  }

  async function copyCompactSummary() {
    if (!result) return;
    await copyText(compactShareSummary(result), "summary-copied");
  }

  async function shareSummary() {
    if (!result) return;

    const summary = formatAnalysisSummary(result);
    const outcome = await shareContent({
      title: `${appConfig.name} araç analiz özeti`,
      text: summary,
    });

    if (outcome === "shared") {
      setCopyStatus("shared");
    } else if (outcome === "copied") {
      setCopyStatus("summary-copied");
    } else {
      setCopyStatus("failed");
    }
  }

  function actionStatusMessage() {
    if (copyStatus === "questions-copied") return "Satıcı soruları panoya kopyalandı.";
    if (copyStatus === "seller-message-copied") return "Satıcı mesajı panoya kopyalandı.";
    if (copyStatus === "summary-copied") return "Rapor özeti panoya kopyalandı.";
    if (copyStatus === "shared") return "Rapor özeti paylaşım paneline gönderildi.";
    if (copyStatus === "print-opened")
      return "Yazdırma penceresi açıldı. Açılmadıysa tarayıcının paylaş menüsünden yazdırmayı deneyin.";
    if (copyStatus === "failed") return "Paylaşma veya kopyalama tarayıcı tarafından engellendi.";
    if (copyStatus === "comparison-added") return "İlan karşılaştırma listesine eklendi.";
    if (copyStatus === "comparison-full")
      return "Karşılaştırma listesi dolu (en fazla 3 ilan). Karşılaştırma sayfasından bir kaydı kaldırın.";
    return "";
  }

  function addCurrentToComparison() {
    if (!result || addedToComparison) return;
    const outcome = addToComparison(result);
    setCopyStatus(outcome.ok ? "comparison-added" : "comparison-full");
    if (outcome.ok) setAddedToComparison(true);
  }

  async function requestAiNote() {
    if (!result || aiNoteStatus === "loading") return;

    setAiNoteStatus("loading");
    setAiNoteMessage("");

    try {
      const response = await apiFetch("/api/ai/analysis-note", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(buildAiAnalysisNoteInput(result)),
      });
      const payload = (await response.json()) as { note?: string; error?: string; remaining?: number };

      if (!response.ok || !payload.note) {
        setAiNoteStatus("error");
        setAiNoteMessage(payload.error ?? "AI notu şu anda oluşturulamadı.");
        return;
      }

      setAiNote(payload.note);
      setAiNoteStatus("ready");
      setAiNoteMessage(
        typeof payload.remaining === "number" ? `Bugün kalan AI deneme hakkı: ${payload.remaining}` : "",
      );
    } catch {
      setAiNoteStatus("error");
      setAiNoteMessage("AI notu alınamadı. Kural tabanlı rapor kullanılmaya devam edebilir.");
    }
  }

  function clearCurrentAnalysis() {
    clearAnalysis();
    clearAiNoteFeedback();
    setResult(null);
    setCheckedChecklist(new Set());
    setFindingFilter("all");
    setAiNoteFeedback(null);
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

  function recordAiNoteFeedback(value: AiNoteFeedback) {
    saveAiNoteFeedback(value);
    setAiNoteFeedback(value);
  }

  if (!isReady) {
    return (
      <main className="flex-1 bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto max-w-3xl px-4 py-12 text-center sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">Rapor hazırlanıyor</h1>
          <p className="mt-3 leading-7 text-slate-700 dark:text-slate-300">
            Mevcut tarayıcı oturumundaki analiz kontrol ediliyor.
          </p>
        </div>
      </main>
    );
  }

  if (!result) {
    return (
      <main className="flex-1 bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto max-w-3xl px-4 py-12 text-center sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">Analiz bulunamadı</h1>
          <p className="mt-3 leading-7 text-slate-700 dark:text-slate-300">
            Sayfa yenilenmiş olabilir. Sonuç verisi URL içine yazılmaz ve yalnızca mevcut tarayıcı oturumunda tutulur.
          </p>
          <Link
            href="/analiz"
            className="mt-6 inline-flex min-h-12 items-center rounded-full bg-slate-950 px-5 font-semibold text-white dark:bg-white dark:text-slate-950"
          >
            Analizi yeniden başlat
          </Link>
        </div>
      </main>
    );
  }

  const visibleFindings =
    findingFilter === "all" ? result.findings : result.findings.filter((finding) => finding.severity === findingFilter);
  const showAiAnalysisNote = isAiAnalysisNoteVisible();

  return (
    <main className="flex-1 bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="print-only mb-2 flex items-center justify-between border-b border-slate-300 pb-3 dark:border-slate-700">
          <p className="text-lg font-semibold text-slate-950 dark:text-white">{appConfig.name}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Rapor oluşturma: {formatReportDate(result.generatedAt)}
          </p>
        </div>
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="bg-sky-50 p-5 sm:p-7 dark:bg-slate-800">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Araç Risk Skoru</p>
                <h1 className="mt-2 text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl dark:text-white">
                  {result.input.year} {result.input.brand} {result.input.model}
                </h1>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Rapor tarihi: {formatReportDate(result.generatedAt)}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-sm font-semibold ring-1 ${riskToneClass(
                  result.totalScore,
                )}`}
              >
                {result.riskLabel}
              </span>
            </div>
            <div className="mt-6 grid gap-4 lg:grid-cols-[220px_1fr] lg:items-stretch">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div
                  className="relative mx-auto h-32 w-32"
                  role="img"
                  aria-label={`Araç risk skoru ${result.totalScore} / 100, ${result.riskLabel}`}
                >
                  <svg viewBox="0 0 40 40" className="h-32 w-32 -rotate-90">
                    <circle
                      cx="20"
                      cy="20"
                      r={SCORE_RING_RADIUS}
                      fill="none"
                      strokeWidth="4"
                      className="stroke-slate-100 dark:stroke-slate-800"
                    />
                    <circle
                      cx="20"
                      cy="20"
                      r={SCORE_RING_RADIUS}
                      fill="none"
                      strokeWidth="4"
                      strokeLinecap="round"
                      className={`transition-[stroke-dashoffset] duration-700 ease-out ${scoreRingColorClass(
                        result.totalScore,
                      )}`}
                      strokeDasharray={SCORE_RING_CIRCUMFERENCE}
                      strokeDashoffset={
                        scoreRingFilled ? scoreRingOffset(result.totalScore) : SCORE_RING_CIRCUMFERENCE
                      }
                    />
                  </svg>
                  <div className="absolute inset-0 grid place-items-center text-center">
                    <div>
                      <strong className="block text-3xl text-slate-950 dark:text-white">{result.totalScore}</strong>
                      <span className="text-sm font-medium text-slate-500 dark:text-slate-400">/100</span>
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-center text-sm font-medium text-slate-700 dark:text-slate-300">
                  Skor kesin hüküm değil, inceleme önceliği verir.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Kısa karar özeti</p>
                  <p className="mt-2 text-lg font-semibold leading-snug text-slate-950 dark:text-white">
                    {result.decision}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Riskli bulgu</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">
                    {findingCount(result, "high")} yüksek, {findingCount(result, "medium")} orta
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Bilgi durumu</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">
                    {result.completeness.completed} / {result.completeness.total}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="grid gap-3 border-t border-slate-200 bg-white p-4 md:grid-cols-3 dark:border-slate-800 dark:bg-slate-900">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <Gauge aria-hidden="true" className="h-4 w-4 text-teal-700" />
                Öncelik
              </div>
              <p className="mt-2 text-lg font-semibold leading-snug text-slate-950 dark:text-white">
                {result.decision}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                Satın alma kararı vermeden önce bulguları belge ve bağımsız ekspertizle doğrulayın.
              </p>
            </div>
            <div
              className={`rounded-2xl border p-4 ${priorityToneClass(result.findings[0]?.severity ?? "low")}`}
              aria-label="İlk kontrol edilecek risk"
            >
              <div className="flex items-center gap-2 text-sm font-semibold">
                <AlertTriangle aria-hidden="true" className="h-4 w-4" />
                İlk kontrol
              </div>
              <p className="mt-2 text-lg font-semibold leading-snug">
                {result.findings[0]?.title ?? "Öncelikli risk bulgusu oluşmadı"}
              </p>
              <p className="mt-2 text-sm leading-6">
                {result.findings[0]?.recommendation ?? "Yine de ekspertiz ve belge kontrolünü tamamlayın."}
              </p>
            </div>
            <div className="rounded-2xl border border-teal-100 bg-teal-50 p-4 text-teal-950 dark:bg-teal-950/40 dark:text-teal-200 dark:border-teal-900">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <BadgeCheck aria-hidden="true" className="h-4 w-4" />
                Sonraki adım
              </div>
              <p className="mt-2 text-lg font-semibold leading-snug">
                {result.priorityActions[0]?.title ?? "Satıcıdan belge isteyin"}
              </p>
              <p className="mt-2 text-sm leading-6">
                {result.priorityActions[0]?.reason ??
                  "Eksik veya belirsiz bilgileri yazılı belge ve ekspertiz raporuyla netleştirin."}
              </p>
            </div>
          </div>
          <div className="no-print grid gap-3 border-t border-slate-200 bg-white p-4 sm:grid-cols-2 xl:grid-cols-4 dark:border-slate-800 dark:bg-slate-900">
            <button
              type="button"
              onClick={printReport}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full transition active:scale-95 bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950"
            >
              <FileText aria-hidden="true" className="h-4 w-4" />
              Raporu yazdır
            </button>
            <button
              type="button"
              onClick={copyQuestions}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full transition active:scale-95 border border-slate-200 px-4 text-sm font-semibold text-slate-800 hover:border-teal-700 hover:text-teal-800 dark:border-slate-800 dark:text-slate-300"
            >
              <ClipboardCopy aria-hidden="true" className="h-4 w-4" />
              Soruları kopyala
            </button>
            <button
              type="button"
              onClick={copySellerMessage}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full transition active:scale-95 border border-slate-200 px-4 text-sm font-semibold text-slate-800 hover:border-teal-700 hover:text-teal-800 dark:border-slate-800 dark:text-slate-300"
            >
              <ClipboardCopy aria-hidden="true" className="h-4 w-4" />
              Satıcı mesajını kopyala
            </button>
            <button
              type="button"
              onClick={copySummary}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full transition active:scale-95 border border-slate-200 px-4 text-sm font-semibold text-slate-800 hover:border-teal-700 hover:text-teal-800 dark:border-slate-800 dark:text-slate-300"
            >
              <ClipboardCopy aria-hidden="true" className="h-4 w-4" />
              Rapor özetini kopyala
            </button>
            <button
              type="button"
              onClick={shareSummary}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full transition active:scale-95 border border-slate-200 px-4 text-sm font-semibold text-slate-800 hover:border-teal-700 hover:text-teal-800 dark:border-slate-800 dark:text-slate-300"
            >
              <Share2 aria-hidden="true" className="h-4 w-4" />
              Raporu paylaş
            </button>
            <Link
              href="/analiz"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full transition active:scale-95 border border-slate-200 px-4 text-sm font-semibold text-slate-800 hover:border-teal-700 hover:text-teal-800 dark:border-slate-800 dark:text-slate-300"
            >
              <RotateCcw aria-hidden="true" className="h-4 w-4" />
              Yeni analiz
            </Link>
            <button
              type="button"
              onClick={addCurrentToComparison}
              disabled={addedToComparison}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full transition active:scale-95 border border-slate-200 px-4 text-sm font-semibold text-slate-800 hover:border-teal-700 hover:text-teal-800 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:text-slate-300"
            >
              <GitCompareArrows aria-hidden="true" className="h-4 w-4" />
              {addedToComparison ? "Karşılaştırmaya eklendi" : "Karşılaştırmaya ekle"}
            </button>
            <button
              type="button"
              onClick={clearCurrentAnalysis}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full transition active:scale-95 border border-red-200 px-4 text-sm font-semibold text-red-700 hover:bg-red-50 dark:bg-red-950 dark:text-red-300 dark:border-red-900"
            >
              <Trash2 aria-hidden="true" className="h-4 w-4" />
              Oturum verisini sil
            </button>
          </div>
          <p
            className={`no-print min-h-5 px-4 pb-4 text-sm font-medium ${
              copyStatus === "failed" ? "text-red-700 dark:text-red-400" : "text-teal-800 dark:text-teal-300"
            }`}
            role="status"
          >
            {actionStatusMessage()}
          </p>
          <div className="no-print border-t border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-slate-950 dark:text-white">
                  Bu raporda eksik veya fazla sert görünen bir uyarı var mı?
                </p>
                <p className="mt-1">
                  Kural setlerini gerçek kullanıcı geri bildirimiyle geliştiriyoruz. Kişisel veri paylaşmadan not
                  bırakabilirsiniz.
                </p>
              </div>
              <Link
                href="/geri-bildirim"
                className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full transition active:scale-95 bg-white px-4 font-semibold text-slate-950 ring-1 ring-slate-200 hover:ring-teal-700 dark:bg-slate-900 dark:text-white dark:ring-slate-700"
              >
                Geri bildirim gönder
                <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-900">
          <div className="flex gap-3">
            <AlertTriangle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
            <p>{appConfig.disclaimer}</p>
          </div>
        </div>
        <div className="no-print rounded-2xl border border-teal-100 bg-white p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-teal-50 text-teal-700">
              <ShieldCheck aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold text-slate-950 dark:text-white">Ekspertiz öncesi hızlı okuma</p>
              <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                Önce öncelikli bulguları, sonra satıcı sorularını ve son kontrol listesini tamamlayın.
              </p>
            </div>
          </div>
        </div>
        {showAiAnalysisNote ? (
          <SectionCard
            title="AI karar destek notu"
            description="Kural tabanlı raporu bozmadan, riskleri daha sade açıklayan opsiyonel bir not üretir."
          >
            <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4 dark:bg-slate-800">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-teal-700">
                  <Sparkles aria-hidden="true" className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-slate-950 dark:text-white">Ek açıklama üret</p>
                  <p className="mt-1 text-sm leading-6 text-slate-700 dark:text-slate-300">
                    Kural tabanlı rapor ana karar desteği olarak kalır. AI notu yalnızca riskleri sadeleştiren ek bir
                    açıklama üretir ve kesin ekspertiz sonucu vermez.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={requestAiNote}
                disabled={aiNoteStatus === "loading"}
                className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60 dark:bg-white dark:text-slate-950"
              >
                <Sparkles aria-hidden="true" className="h-4 w-4" />
                {aiNoteStatus === "loading" ? "Not hazırlanıyor" : "AI notu oluştur"}
              </button>
              {aiNote ? (
                <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                  {aiNote}
                </div>
              ) : null}
              {aiNote ? (
                <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">Bu AI notu faydalı mı?</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => recordAiNoteFeedback("helpful")}
                      aria-pressed={aiNoteFeedback === "helpful"}
                      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold ${
                        aiNoteFeedback === "helpful"
                          ? "border-teal-700 bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-300"
                          : "border-slate-200 text-slate-800 hover:border-teal-700 dark:border-slate-800 dark:text-slate-300"
                      }`}
                    >
                      <ThumbsUp aria-hidden="true" className="h-4 w-4" />
                      Faydalı
                    </button>
                    <button
                      type="button"
                      onClick={() => recordAiNoteFeedback("needs-improvement")}
                      aria-pressed={aiNoteFeedback === "needs-improvement"}
                      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold ${
                        aiNoteFeedback === "needs-improvement"
                          ? "border-amber-700 bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-300"
                          : "border-slate-200 text-slate-800 hover:border-amber-700 dark:border-slate-800 dark:text-slate-300"
                      }`}
                    >
                      <ThumbsDown aria-hidden="true" className="h-4 w-4" />
                      Geliştirilmeli
                    </button>
                  </div>
                  {aiNoteFeedback ? (
                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-400" role="status">
                      Geri bildiriminiz bu tarayıcı oturumunda tutuldu.
                    </p>
                  ) : null}
                </div>
              ) : null}
              {aiNoteMessage ? (
                <p
                  className={`mt-3 text-sm ${aiNoteStatus === "error" ? "font-medium text-red-700 dark:text-red-400" : "text-slate-600 dark:text-slate-400"}`}
                  role="status"
                >
                  {aiNoteMessage}
                </p>
              ) : null}
            </div>
          </SectionCard>
        ) : null}
        <SectionCard
          title="Paylaşılabilir kısa özet"
          description="Uzun rapor yerine satıcıya, ekspertize veya kendinize gönderebileceğiniz kısa karar desteği özeti."
        >
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
            <div className="grid gap-3 text-sm leading-6 text-slate-700 dark:text-slate-300">
              <p>
                <strong className="text-slate-950 dark:text-white">
                  {result.input.year} {result.input.brand} {result.input.model}
                </strong>{" "}
                için EksperIQ skoru {result.totalScore}/100, sonuç: {result.riskLabel}.
              </p>
              <p>
                Karar özeti: <strong className="text-slate-950 dark:text-white">{result.decision}</strong>
              </p>
              <div>
                <p className="font-semibold text-slate-950 dark:text-white">İlk kontrol edilecek bulgular</p>
                <ul className="mt-2 grid gap-1">
                  {result.findings.slice(0, 3).map((finding) => (
                    <li key={finding.id}>- {finding.title}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-semibold text-slate-950 dark:text-white">Satıcıya ilk sorular</p>
                <ol className="mt-2 grid list-decimal gap-1 pl-5">
                  {result.sellerQuestions.slice(0, 3).map((question) => (
                    <li key={question}>{question}</li>
                  ))}
                </ol>
              </div>
            </div>
            <button
              type="button"
              onClick={copyCompactSummary}
              className="no-print mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950"
            >
              <ClipboardCopy aria-hidden="true" className="h-4 w-4" />
              Kısa özeti kopyala
            </button>
          </div>
        </SectionCard>
        <SectionCard
          title="Bilgi doluluğu"
          description="Daha fazla doğrulanabilir bilgi girildikçe raporun karar desteği değeri artar."
        >
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium text-slate-800 dark:text-slate-300">Dolu bilgi alanları</span>
              <strong
                className="text-slate-950 dark:text-white"
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
                <p className="text-sm font-medium text-slate-800 dark:text-slate-300">
                  Satıcıdan tamamlanması istenecek bilgiler
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {result.completeness.missing.slice(0, 10).map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">Temel bilgi alanları dolu görünüyor.</p>
            )}
          </div>
        </SectionCard>
        <SectionCard title="Araç ve ilan özeti">
          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
              <dt className="text-sm text-slate-600 dark:text-slate-400">Araç</dt>
              <dd className="mt-1 font-semibold text-slate-950 dark:text-white">
                {result.input.brand} {result.input.model}
              </dd>
            </div>
            <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
              <dt className="text-sm text-slate-600 dark:text-slate-400">Yıl / km</dt>
              <dd className="mt-1 font-semibold text-slate-950 dark:text-white">
                {result.input.year} / {result.input.mileage.toLocaleString("tr-TR")} km
              </dd>
            </div>
            <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
              <dt className="text-sm text-slate-600 dark:text-slate-400">Fiyat</dt>
              <dd className="mt-1 font-semibold text-slate-950 dark:text-white">
                {formatCurrency(result.input.price)}
              </dd>
            </div>
            <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
              <dt className="text-sm text-slate-600 dark:text-slate-400">Şehir</dt>
              <dd className="mt-1 font-semibold text-slate-950 dark:text-white">{result.input.city}</dd>
            </div>
          </dl>
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
            <p className="font-medium text-slate-950 dark:text-white">{result.mileage.label}</p>
            <p className="mt-1 text-sm leading-6 text-slate-700 dark:text-slate-300">
              Araç yaşı yaklaşık {result.mileage.vehicleAge} yıl, yıllık ortalama kullanım yaklaşık{" "}
              {result.mileage.annualMileage.toLocaleString("tr-TR")} km. Bu değerler yalnızca genel referanstır.
            </p>
            {result.input.listingUrl ? (
              <p className="mt-3 break-words text-sm text-slate-700 dark:text-slate-300">
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
                <div key={key} className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-slate-800 dark:text-slate-300">{label}</span>
                    <span className="font-semibold text-slate-950 dark:text-white">
                      {value} / {SCORE_WEIGHTS[category]}
                    </span>
                  </div>
                  <div
                    className="mt-3 h-2 rounded-full bg-slate-100 dark:bg-slate-800"
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
            <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
              <h3 className="font-semibold text-slate-950 dark:text-white">Risk aralıkları</h3>
              <ul className="mt-3 grid gap-2 text-sm text-slate-700 dark:text-slate-300">
                {RISK_LEVELS.map((level) => (
                  <li
                    key={level.label}
                    className="flex items-center justify-between gap-3 rounded-md bg-slate-50 px-3 py-2 dark:bg-slate-800/50"
                  >
                    <span>
                      {level.min}-{level.max}
                    </span>
                    <strong className="text-slate-950 dark:text-white">{level.label}</strong>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
              <h3 className="font-semibold text-slate-950 dark:text-white">Kategori ağırlıkları</h3>
              <ul className="mt-3 grid gap-2 text-sm text-slate-700 dark:text-slate-300">
                {Object.entries(SCORE_WEIGHTS).map(([key, value]) => (
                  <li
                    key={key}
                    className="flex items-center justify-between gap-3 rounded-md bg-slate-50 px-3 py-2 dark:bg-slate-800/50"
                  >
                    <span>{scoreLabels[key as keyof typeof scoreLabels]}</span>
                    <strong className="text-slate-950 dark:text-white">{value} puan</strong>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </SectionCard>
        <SectionCard
          title="Güçlü taraflar"
          description="Bu maddeler girdiğiniz bilgiye dayanır; TRAMER veya e-Devlet'ten doğrulanmadıkça kesin kabul edilmemelidir."
        >
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
                <span className="font-semibold text-slate-950 dark:text-white">{action.title}</span>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">Neden: {action.reason}</p>
              </li>
            ))}
          </ol>
        </SectionCard>
        <SectionCard title="Riskli noktalar">
          <div className="mb-4 grid gap-3 sm:grid-cols-3" aria-label="Risk bulgusu dağılımı">
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900">
              <p className="text-sm font-medium text-red-950">Yüksek riskli bulgu</p>
              <strong className="mt-1 block text-2xl text-red-950">{findingCount(result, "high")}</strong>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900">
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
                      ? "border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950"
                      : "border-slate-200 bg-white text-slate-800 hover:border-teal-700 hover:text-teal-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
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
              <li
                key={cost.item}
                className="flex justify-between gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-800"
              >
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
              <span
                key={item}
                className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"
              >
                {item}
              </span>
            ))}
          </div>
        </SectionCard>
        <SectionCard
          title="Son kontrol listesi"
          description="Bu liste yalnızca mevcut tarayıcı oturumunda saklanır; oturum verisini silerseniz işaretler de temizlenir."
        >
          <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium text-slate-800 dark:text-slate-300">Tamamlanan kontroller</span>
              <strong
                className="text-slate-950 dark:text-white"
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
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400" role="status">
              {checkedChecklist.size === result.finalChecklist.length
                ? "Tüm kontrol maddeleri işaretlendi. Yine de nihai karar öncesi belge ve ekspertiz sonuçlarını birlikte değerlendirin."
                : "Satın alma öncesi doğruladığınız maddeleri işaretleyin."}
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {result.finalChecklist.map((item) => (
              <label
                key={item}
                className="flex min-h-12 items-center gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-800"
              >
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
