"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  ClipboardCopy,
  Minus,
  Plus,
  Share2,
  X,
} from "lucide-react";
import { appConfig } from "@/lib/constants/app";
import { shareReportPdf } from "@/lib/report/pdf-share";
import { BUYER_EDUCATION_NOTES } from "@/lib/analysis/buyer-education";
import { SCORE_WEIGHTS } from "@/lib/constants/analysis";
import {
  loadAnalysis,
  loadChecklist,
  loadFindingFilter,
  saveChecklist,
  saveFindingFilter,
  type StoredFindingFilter,
} from "@/lib/storage/analysis-storage";
import type { AnalysisResult, ScoreCategory } from "@/lib/analysis/types";
import { riskBucket } from "@/lib/analysis/risk-bucket";
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

type ReportTab = "ozet" | "arac" | "bulgular" | "kronik" | "sorular" | "rehber" | "kontrol";

const reportTabs: Array<{ id: ReportTab; label: string }> = [
  { id: "ozet", label: "Özet" },
  { id: "arac", label: "Araç" },
  { id: "bulgular", label: "Bulgular" },
  { id: "kronik", label: "Kronik/Masraf" },
  { id: "sorular", label: "Sorular" },
  { id: "rehber", label: "Alım Rehberi" },
  { id: "kontrol", label: "Kontrol Listesi" },
];

function severityClass(severity: string) {
  if (severity === "high") return "border-destructive/30 bg-destructive/10 text-destructive";
  if (severity === "medium") return "border-warning/30 bg-warning/10 text-warning";
  return "border-success/30 bg-success/10 text-success";
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

/**
 * Reuses riskBucket() (the single source of truth for score thresholds) —
 * previously this had its own 4-band 80/60/40 scale, which could disagree
 * with RiskBadge/ScoreRing. Now always the same 3-band low/medium/high.
 */
function riskToneClass(score: number): string {
  const bucket = riskBucket(score);
  if (bucket === "low") return "bg-success/10 text-success ring-success/30";
  if (bucket === "medium") return "bg-warning/10 text-warning ring-warning/30";
  return "bg-destructive/10 text-destructive ring-destructive/30";
}

function simpleFindingMeaning(category: string): string {
  const normalized = category.toLocaleLowerCase("tr-TR");
  if (normalized.includes("hasar")) {
    return "Bu başlık aracın güvenliği, ikinci el değeri ve satarken alıcı bulması açısından önemlidir.";
  }
  if (normalized.includes("bakım")) {
    return "Bakım belgesi yoksa küçük ihmal ileride motor, şanzıman veya soğutma masrafına dönüşebilir.";
  }
  if (normalized.includes("evrak") || normalized.includes("ekspertiz")) {
    return "Belgeyle doğrulanmayan bilgi satıcı beyanı olarak kalır; satın almadan önce kanıt görmek gerekir.";
  }
  if (normalized.includes("satıcı")) {
    return "Satıcı açıklaması ne kadar belirsizse, yazılı soru ve bağımsız kontrol o kadar önem kazanır.";
  }
  if (normalized.includes("kilometre")) {
    return "Kilometre, yaş ve kullanım tipi birlikte değerlendirilmezse gerçek yıpranma seviyesi kaçabilir.";
  }
  return "Bu bulgu tek başına kesin karar verdirmez; pazarlık, ekspertiz ve belge kontrolünde öncelik verir.";
}

const SCORE_RING_RADIUS = 16;
const SCORE_RING_CIRCUMFERENCE = 2 * Math.PI * SCORE_RING_RADIUS;
const MIN_IMAGE_ZOOM = 1;
const MAX_IMAGE_ZOOM = 4;
const IMAGE_ZOOM_STEP = 0.5;

function scoreRingOffset(score: number): number {
  const clamped = Math.min(100, Math.max(0, score));
  return SCORE_RING_CIRCUMFERENCE - (clamped / 100) * SCORE_RING_CIRCUMFERENCE;
}

function scoreRingColorClass(score: number): string {
  const bucket = riskBucket(score);
  if (bucket === "low") return "stroke-success";
  if (bucket === "medium") return "stroke-warning";
  return "stroke-destructive";
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
    "idle" | "summary-copied" | "shared" | "downloaded" | "failed"
  >("idle");
  const [findingFilter, setFindingFilter] = useState<FindingFilter>("all");
  const [checkedChecklist, setCheckedChecklist] = useState<Set<string>>(new Set());
  const [scoreRingFilled, setScoreRingFilled] = useState(false);
  const [toastNonce, setToastNonce] = useState(0);
  const [activeTab, setActiveTab] = useState<ReportTab>("ozet");
  const [selectedListingImageIndex, setSelectedListingImageIndex] = useState<number | null>(null);
  const [listingImageZoom, setListingImageZoom] = useState(MIN_IMAGE_ZOOM);

  const listingImages = result?.listingImages ?? [];
  const selectedListingImage =
    selectedListingImageIndex !== null ? (listingImages[selectedListingImageIndex] ?? null) : null;

  // setCopyStatus alone doesn't restart the toast if the same action is
  // repeated within 3s (React bails out on setting an identical primitive
  // value, so the animation would silently never replay) — bump a nonce
  // alongside every real status change and key the toast element on it.
  function announceCopyStatus(status: Exclude<typeof copyStatus, "idle">) {
    setCopyStatus(status);
    setToastNonce((current) => current + 1);
  }

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const current = loadAnalysis();
      setResult(current);
      setFindingFilter(loadFindingFilter());
      setCheckedChecklist(new Set(current ? loadChecklist(current.finalChecklist) : []));
      setIsReady(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!result) return;
    const timer = window.setTimeout(() => setScoreRingFilled(true), 80);
    return () => window.clearTimeout(timer);
  }, [result]);

  useEffect(() => {
    if (copyStatus === "idle") return;
    const timer = window.setTimeout(() => setCopyStatus("idle"), 3000);
    return () => window.clearTimeout(timer);
  }, [copyStatus]);

  useEffect(() => {
    if (selectedListingImageIndex === null) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setSelectedListingImageIndex(null);
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedListingImageIndex]);

  function openListingImage(index: number) {
    setSelectedListingImageIndex(index);
    setListingImageZoom(MIN_IMAGE_ZOOM);
  }

  function closeListingImage() {
    setSelectedListingImageIndex(null);
    setListingImageZoom(MIN_IMAGE_ZOOM);
  }

  function changeListingImageZoom(delta: number) {
    setListingImageZoom((current) =>
      Math.min(MAX_IMAGE_ZOOM, Math.max(MIN_IMAGE_ZOOM, Number((current + delta).toFixed(1)))),
    );
  }

  async function copyText(text: string, successStatus: "summary-copied") {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        copyTextWithFallback(text);
      }
      announceCopyStatus(successStatus);
    } catch {
      try {
        copyTextWithFallback(text);
        announceCopyStatus(successStatus);
      } catch {
        announceCopyStatus("failed");
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

  async function copyCompactSummary() {
    if (!result) return;
    await copyText(compactShareSummary(result), "summary-copied");
  }

  async function shareSummary() {
    if (!result) return;

    const outcome = await shareReportPdf(result);

    if (outcome === "shared") {
      announceCopyStatus("shared");
    } else if (outcome === "downloaded") {
      announceCopyStatus("downloaded");
    } else {
      announceCopyStatus("failed");
    }
  }

  function actionStatusMessage() {
    if (copyStatus === "summary-copied") return "Rapor özeti panoya kopyalandı.";
    if (copyStatus === "shared") return "Rapor PDF'i paylaşım paneline gönderildi.";
    if (copyStatus === "downloaded") return "Rapor PDF olarak indirildi.";
    if (copyStatus === "failed") return "Paylaşma veya kopyalama tarayıcı tarafından engellendi.";
    return "";
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

  if (!isReady) {
    return (
      <main className="flex-1 bg-background">
        <div className="mx-auto max-w-3xl px-4 pb-28 pt-12 text-center sm:px-6 sm:pb-12 lg:px-8">
          <h1 className="text-3xl font-semibold text-foreground">Rapor hazırlanıyor</h1>
          <p className="mt-3 leading-7 text-foreground/80">Mevcut tarayıcı oturumundaki analiz kontrol ediliyor.</p>
        </div>
      </main>
    );
  }

  if (!result) {
    return (
      <main className="flex-1 bg-background">
        <div className="mx-auto max-w-3xl px-4 pb-28 pt-12 text-center sm:px-6 sm:pb-12 lg:px-8">
          <h1 className="text-3xl font-semibold text-foreground">Analiz bulunamadı</h1>
          <p className="mt-3 leading-7 text-foreground/80">
            Sayfa yenilenmiş olabilir. Sonuç verisi URL içine yazılmaz ve yalnızca mevcut tarayıcı oturumunda tutulur.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex min-h-12 items-center rounded-full bg-primary px-5 font-semibold text-primary-foreground"
          >
            Ana sayfaya dön
          </Link>
        </div>
      </main>
    );
  }

  const visibleFindings =
    findingFilter === "all" ? result.findings : result.findings.filter((finding) => finding.severity === findingFilter);

  return (
    <>
    <main className="flex-1 bg-background">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 pb-28 pt-6 sm:px-6 sm:pb-6 lg:px-8">
        <div className="print-only mb-2 flex items-center justify-between border-b border-border pb-3">
          <p className="text-lg font-semibold text-foreground">{appConfig.name}</p>
          <p className="text-sm text-muted-foreground">Rapor oluşturma: {formatReportDate(result.generatedAt)}</p>
        </div>
        <section className="overflow-hidden rounded-theme border border-border bg-card shadow-sm">
          <div className="bg-secondary p-5 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Araç Risk Skoru</p>
                <h1 className="mt-2 text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
                  {result.input.year} {result.input.brand} {result.input.model}
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
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
              <div className="rounded-theme border border-border bg-card p-5 shadow-sm">
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
                      className="stroke-muted"
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
                      strokeDashoffset={scoreRingFilled ? scoreRingOffset(result.totalScore) : SCORE_RING_CIRCUMFERENCE}
                    />
                  </svg>
                  <div className="absolute inset-0 grid place-items-center text-center">
                    <div>
                      <strong className="block text-3xl text-foreground">{result.totalScore}</strong>
                      <span className="text-sm font-medium text-muted-foreground">/100</span>
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-center text-sm font-medium text-foreground/80">
                  Skor kesin hüküm değil, inceleme önceliği verir.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-theme border border-border bg-card p-4 shadow-sm">
                  <p className="text-sm text-muted-foreground">Kısa karar özeti</p>
                  <p className="mt-2 text-lg font-semibold leading-snug text-foreground">{result.decision}</p>
                </div>
                <div className="rounded-theme border border-border bg-card p-4 shadow-sm">
                  <p className="text-sm text-muted-foreground">Riskli bulgu</p>
                  <p className="mt-2 text-lg font-semibold text-foreground">
                    {findingCount(result, "high")} yüksek, {findingCount(result, "medium")} orta
                  </p>
                </div>
                <div className="rounded-theme border border-border bg-card p-4 shadow-sm">
                  <p className="text-sm text-muted-foreground">Bilgi durumu</p>
                  <p className="mt-2 text-lg font-semibold text-foreground">
                    {result.completeness.completed} / {result.completeness.total}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="no-print grid gap-3 border-t border-border bg-card p-4 sm:grid-cols-2">
            {/* Raporu Aç: kullanıcının göndereceği referans ekran görüntüsü bekleniyor (kart içinde PDF görüntüleyici). */}
            <button
              type="button"
              onClick={shareSummary}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full transition active:scale-95 bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              <Share2 aria-hidden="true" className="h-4 w-4" />
              Raporu paylaş
            </button>
          </div>
          {copyStatus !== "idle" ? (
            <div
              key={toastNonce}
              role="status"
              className="animate-toast-pop no-print fixed inset-x-0 bottom-24 z-40 flex justify-center px-4"
            >
              <p
                className={`rounded-full px-4 py-2 text-sm font-semibold shadow-lg ${
                  copyStatus === "failed"
                    ? "bg-destructive text-destructive-foreground"
                    : "bg-accent text-primary-foreground"
                }`}
              >
                {actionStatusMessage()}
              </p>
            </div>
          ) : null}
        </section>
        <div
          role="tablist"
          aria-label="Rapor bölümleri"
          className="no-print flex gap-2 overflow-x-auto rounded-theme border border-border bg-card p-1.5 shadow-sm"
        >
          {reportTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`rapor-sekme-${tab.id}`}
              aria-selected={activeTab === tab.id}
              aria-controls={`rapor-panel-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`min-h-11 shrink-0 rounded-theme-sm px-4 text-sm font-semibold transition ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/80 hover:bg-secondary hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div
          role="tabpanel"
          id="rapor-panel-ozet"
          aria-labelledby="rapor-sekme-ozet"
          className={`report-tab-panel ${activeTab === "ozet" ? "contents" : "hidden"}`}
        >
          <SectionCard
            title="Paylaşılabilir kısa özet"
            description="Uzun rapor yerine satıcıya, ekspertize veya kendinize gönderebileceğiniz kısa karar desteği özeti."
          >
            <div className="rounded-theme border border-border bg-muted p-4">
              <div className="grid gap-3 text-sm leading-6 text-foreground/80">
                <p>
                  <strong className="text-foreground">
                    {result.input.year} {result.input.brand} {result.input.model}
                  </strong>{" "}
                  için EksperIQ skoru {result.totalScore}/100, sonuç: {result.riskLabel}.
                </p>
                <p>
                  Karar özeti: <strong className="text-foreground">{result.decision}</strong>
                </p>
                <div>
                  <p className="font-semibold text-foreground">İlk kontrol edilecek bulgular</p>
                  <ul className="mt-2 grid gap-1">
                    {result.findings.slice(0, 3).map((finding) => (
                      <li key={finding.id}>- {finding.title}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Satıcıya ilk sorular</p>
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
                className="no-print mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90"
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
            <div className="rounded-lg border border-border bg-muted p-4">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-foreground/90">Dolu bilgi alanları</span>
                <strong
                  className="text-foreground"
                  aria-label={`Bilgi doluluğu ${result.completeness.completed} / ${result.completeness.total}`}
                >
                  {result.completeness.completed} / {result.completeness.total}
                </strong>
              </div>
              <div
                className="mt-3 h-2 rounded-full bg-muted"
                role="progressbar"
                aria-label="Bilgi doluluğu yüzdesi"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={result.completeness.percentage}
              >
                <div className="h-2 rounded-full bg-accent" style={{ width: `${result.completeness.percentage}%` }} />
              </div>
              {result.completeness.missing.length ? (
                <div className="mt-4">
                  <p className="text-sm font-medium text-foreground/90">Satıcıdan tamamlanması istenecek bilgiler</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {result.completeness.missing.slice(0, 10).map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-border bg-card px-3 py-1 text-sm text-foreground/80"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-sm text-foreground/80">Temel bilgi alanları dolu görünüyor.</p>
              )}
            </div>
          </SectionCard>
        </div>
        <div
          role="tabpanel"
          id="rapor-panel-arac"
          aria-labelledby="rapor-sekme-arac"
          className={`report-tab-panel ${activeTab === "arac" ? "contents" : "hidden"}`}
        >
          <SectionCard title="Araç ve ilan özeti">
            <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-border p-3">
                <dt className="text-sm text-muted-foreground">Araç</dt>
                <dd className="mt-1 font-semibold text-foreground">
                  {result.input.brand} {result.input.model}
                </dd>
              </div>
              <div className="rounded-lg border border-border p-3">
                <dt className="text-sm text-muted-foreground">Yıl / km</dt>
                <dd className="mt-1 font-semibold text-foreground">
                  {result.input.year} / {result.input.mileage.toLocaleString("tr-TR")} km
                </dd>
              </div>
              <div className="rounded-lg border border-border p-3">
                <dt className="text-sm text-muted-foreground">Fiyat</dt>
                <dd className="mt-1 font-semibold text-foreground">{formatCurrency(result.input.price)}</dd>
              </div>
              <div className="rounded-lg border border-border p-3">
                <dt className="text-sm text-muted-foreground">Şehir</dt>
                <dd className="mt-1 font-semibold text-foreground">{result.input.city}</dd>
              </div>
            </dl>
            <div className="mt-4 rounded-lg border border-border bg-muted p-4">
              <p className="font-medium text-foreground">{result.mileage.label}</p>
              <p className="mt-1 text-sm leading-6 text-foreground/80">
                Araç yaşı yaklaşık {result.mileage.vehicleAge} yıl, yıllık ortalama kullanım yaklaşık{" "}
                {result.mileage.annualMileage.toLocaleString("tr-TR")} km. Bu değerler yalnızca genel referanstır.
              </p>
            </div>
            {result.listingImages?.length ? (
              <div className="mt-4">
                <p className="text-sm font-semibold text-foreground">İlandan alınan fotoğraflar</p>
                <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {result.listingImages.slice(0, 8).map((imageUrl, index) => (
                    <button
                      key={imageUrl}
                      type="button"
                      onClick={() => openListingImage(index)}
                      className="block aspect-square overflow-hidden rounded-lg border border-border bg-muted text-left transition hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      aria-label={`İlan fotoğrafını büyüt: ${index + 1}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element -- Listing image hosts vary by source site. */}
                      <img src={imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </SectionCard>
        </div>
        <div
          id="rapor-panel-ozet-devam"
          className={`report-tab-panel ${activeTab === "ozet" ? "contents" : "hidden"}`}
        >
          <SectionCard title="Kategori skorları">
            <div className="grid gap-3 md:grid-cols-2">
              {Object.entries(result.breakdown).map(([key, value]) => {
                const category = key as ScoreCategory;
                const label = scoreLabels[category];

                return (
                  <div key={key} className="rounded-lg border border-border p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium text-foreground/90">{label}</span>
                      <span className="font-semibold text-foreground">
                        {value} / {SCORE_WEIGHTS[category]}
                      </span>
                    </div>
                    <div
                      className="mt-3 h-2 rounded-full bg-muted"
                      role="progressbar"
                      aria-label={`${label} skoru`}
                      aria-valuemin={0}
                      aria-valuemax={SCORE_WEIGHTS[category]}
                      aria-valuenow={value}
                    >
                      <div
                        className="h-2 rounded-full bg-accent"
                        style={{ width: `${scorePercent(category, value)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>
          <SectionCard
            title="Güçlü taraflar"
            description="Bu maddeler girdiğiniz bilgiye dayanır; TRAMER veya e-Devlet'ten doğrulanmadıkça kesin kabul edilmemelidir."
          >
            <ul className="grid gap-2">
              {result.strengths.map((item) => (
                <li key={item} className="flex gap-2">
                  <CheckCircle2 aria-hidden="true" className="mt-0.5 h-5 w-5 text-accent" />
                  {item}
                </li>
              ))}
            </ul>
          </SectionCard>
          <SectionCard
            id="rapor-aksiyonlar"
            title="Öncelikli ilk aksiyonlar"
            description="Satıcıyla görüşmeden veya ekspertize gitmeden önce netleştirmeniz gereken başlıklar."
          >
            <ol className="grid list-decimal gap-3 pl-5">
              {result.priorityActions.map((action) => (
                <li key={action.title} className="pl-1">
                  <span className="font-semibold text-foreground">{action.title}</span>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">Neden: {action.reason}</p>
                </li>
              ))}
            </ol>
          </SectionCard>
        </div>
        <div
          role="tabpanel"
          id="rapor-panel-bulgular"
          aria-labelledby="rapor-sekme-bulgular"
          className={`report-tab-panel ${activeTab === "bulgular" ? "contents" : "hidden"}`}
        >
          <SectionCard id="rapor-bulgular" title="Riskli noktalar">
            <div className="mb-4 grid gap-3 sm:grid-cols-3" aria-label="Risk bulgusu dağılımı">
              <div className="rounded-theme-sm border border-destructive/30 bg-destructive/10 p-3">
                <p className="text-sm font-medium text-destructive">Yüksek riskli bulgu</p>
                <strong className="mt-1 block text-2xl text-destructive">{findingCount(result, "high")}</strong>
              </div>
              <div className="rounded-theme-sm border border-warning/30 bg-warning/10 p-3">
                <p className="text-sm font-medium text-warning">Orta riskli bulgu</p>
                <strong className="mt-1 block text-2xl text-warning">{findingCount(result, "medium")}</strong>
              </div>
              <div className="rounded-theme-sm border border-success/30 bg-success/10 p-3">
                <p className="text-sm font-medium text-success">Düşük riskli bulgu</p>
                <strong className="mt-1 block text-2xl text-success">{findingCount(result, "low")}</strong>
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
                    className={`min-h-11 rounded-theme-sm border px-4 text-sm font-semibold ${
                      isActive
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-foreground/90 hover:border-accent hover:text-accent"
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
                  <p className="mt-2 rounded-theme-sm border border-current/20 bg-white/40 p-3 text-sm leading-6 text-current">
                    Basit anlamı: {simpleFindingMeaning(finding.category)}
                  </p>
                  <p className="mt-2 text-sm font-medium">{finding.recommendation}</p>
                </article>
              ))}
            </div>
          </SectionCard>
        </div>
        <div
          role="tabpanel"
          id="rapor-panel-kronik"
          aria-labelledby="rapor-sekme-kronik"
          className={`report-tab-panel ${activeTab === "kronik" ? "contents" : "hidden"}`}
        >
          {result.knownIssues.length > 0 ? (
            <SectionCard
              id="rapor-kronik-sorunlar"
              title="Bu motor için bilinen kronik sorunlar"
              description="Bu bölüm BU aracın kendi durumuyla değil, aynı marka/model/motoru kullanan araçlarda genel olarak bildirilen sorunlarla ilgilidir — risk skorunu etkilemez, ekspertizde nelere özellikle bakılması gerektiğine dair bir rehberdir."
            >
              {result.knownIssues.some((issue) => issue.broadMatch) ? (
                <p className="mb-3 rounded-theme-sm border border-border bg-muted p-3 text-sm text-muted-foreground">
                  Motor hacmi/kodu belirtilmediği için bu marka/modelin bu yıl aralığındaki tüm motor seçeneklerinin
                  bilinen sorunları gösteriliyor. Motor bilgisini eklerseniz liste daralır.
                </p>
              ) : null}
              <div className="grid gap-3">
                {result.knownIssues.map((issue) => (
                  <article
                    key={`${issue.engineLabel}-${issue.id}`}
                    className={`rounded-lg border p-4 ${severityClass(issue.severity)}`}
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide">
                      {issue.engineLabel} / {severityLabels[issue.severity]}
                    </p>
                    <h3 className="mt-1 font-semibold">{issue.title}</h3>
                    <p className="mt-2 text-sm leading-6">{issue.detail}</p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium opacity-80">
                      {issue.typicalOnset ? <span>Tipik görülme: {issue.typicalOnset}</span> : null}
                      {issue.costLevel ? <span>Tahmini maliyet: {issue.costLevel}</span> : null}
                    </div>
                    <p className="mt-2 text-xs italic opacity-70">{issue.sourceNote}</p>
                  </article>
                ))}
              </div>
            </SectionCard>
          ) : (
            <SectionCard
              id="rapor-kronik-sorunlar"
              title="Kronik sorun eşleşmesi"
              description="Bu bölüm yalnızca EksperIQ veritabanında marka/model/yıl/motor bilgisiyle eşleşen, araştırılmış kayıtları gösterir."
            >
              <div className="rounded-lg border border-border bg-muted p-4">
                <p className="font-semibold text-foreground">Bu araç için eşleşen kronik sorun kaydı gösterilemedi.</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Bu sonuç aracın sorunsuz olduğu anlamına gelmez. Model henüz rehbere eklenmemiş olabilir, ilan motor
                  kodunu yeterince açık vermemiş olabilir veya sorunlar sadece ekspertiz/servis kontrolünde görülebilir.
                  Motor hacmi, motor kodu, şanzıman ve paket bilgisini netleştirerek yeniden analiz yapmak listeyi
                  daraltır.
                </p>
                <Link
                  href="/model-rehberi"
                  className="mt-3 inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-border px-4 text-sm font-semibold text-foreground/90 hover:border-accent hover:text-accent"
                >
                  Model rehberini aç
                  <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </div>
            </SectionCard>
          )}
          <SectionCard id="rapor-masraflar" title="Yakın zamanda çıkabilecek masraflar">
            <ul className="grid gap-2">
              {result.costs.map((cost) => (
                <li key={cost.item} className="flex justify-between gap-3 rounded-lg border border-border p-3">
                  <span>{cost.item}</span>
                  <strong>{cost.level}</strong>
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>
        <div
          role="tabpanel"
          id="rapor-panel-sorular"
          aria-labelledby="rapor-sekme-sorular"
          className={`report-tab-panel ${activeTab === "sorular" ? "contents" : "hidden"}`}
        >
          <SectionCard id="rapor-sorular" title="Satıcıya sorulacak sorular">
            <ol className="grid list-decimal gap-2 pl-5">
              {result.sellerQuestions.map((question) => (
                <li key={question}>{question}</li>
              ))}
            </ol>
          </SectionCard>
          <SectionCard id="rapor-ekspertiz-kontrol" title="Ekspertizde özellikle kontrol edilmesi gerekenler">
            <div className="grid gap-2 sm:grid-cols-2">
              {result.inspectionFocus.map((item) => (
                <span key={item} className="rounded-lg border border-border bg-card p-3">
                  {item}
                </span>
              ))}
            </div>
            <Link
              href="/yakinimdaki-hizmetler"
              className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full border border-accent px-4 text-sm font-semibold text-accent"
            >
              Yakınımdaki ekspertiz ve noter firmalarını bul
              <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </SectionCard>
        </div>
        <div
          role="tabpanel"
          id="rapor-panel-rehber"
          aria-labelledby="rapor-sekme-rehber"
          className={`report-tab-panel ${activeTab === "rehber" ? "contents" : "hidden"}`}
        >
          <SectionCard
            id="rapor-alim-rehberi"
            title="Araç alırken bunlar neden önemli?"
            description="Kısa açıklamalar raporu okuyan kişinin teknik terimleri ezberlemeden doğru soruyu sormasına yardım eder."
          >
            <div className="grid gap-3">
              {BUYER_EDUCATION_NOTES.map((note) => (
                <article key={note.title} className="rounded-lg border border-border bg-card p-4">
                  <h3 className="font-semibold text-foreground">{note.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">Neden önemli: {note.why}</p>
                  <p className="mt-2 text-sm font-medium leading-6 text-foreground/90">Ne yapmalı: {note.check}</p>
                </article>
              ))}
            </div>
          </SectionCard>
        </div>
        <div
          role="tabpanel"
          id="rapor-panel-kontrol"
          aria-labelledby="rapor-sekme-kontrol"
          className={`report-tab-panel ${activeTab === "kontrol" ? "contents" : "hidden"}`}
        >
          <SectionCard
            id="rapor-kontrol-listesi"
            title="Son kontrol listesi"
            description="Bu liste yalnızca mevcut tarayıcı oturumunda saklanır; oturum verisini silerseniz işaretler de temizlenir."
          >
            <div className="mb-4 rounded-lg border border-border bg-muted p-4">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-foreground/90">Tamamlanan kontroller</span>
                <strong
                  className="text-foreground"
                  aria-label={`Tamamlanan kontroller ${checkedChecklist.size} / ${result.finalChecklist.length}`}
                >
                  {checkedChecklist.size} / {result.finalChecklist.length}
                </strong>
              </div>
              <div className="mt-3 h-2 rounded-full bg-muted" aria-hidden="true">
                <div
                  className="h-2 rounded-full bg-accent transition-all"
                  style={{ width: `${Math.round((checkedChecklist.size / result.finalChecklist.length) * 100)}%` }}
                />
              </div>
              <p className="mt-2 text-sm text-muted-foreground" role="status">
                {checkedChecklist.size === result.finalChecklist.length
                  ? "Tüm kontrol maddeleri işaretlendi. Yine de nihai karar öncesi belge ve ekspertiz sonuçlarını birlikte değerlendirin."
                  : "Satın alma öncesi doğruladığınız maddeleri işaretleyin."}
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {result.finalChecklist.map((item) => (
                <label key={item} className="flex min-h-12 items-center gap-3 rounded-lg border border-border p-3">
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
      </div>
    </main>
    {selectedListingImage ? (
      <div
        className="fixed inset-0 z-50 bg-foreground/80 p-3 backdrop-blur-sm sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-label="İlan fotoğrafı görüntüleyici"
        onClick={closeListingImage}
      >
        <div
          className="mx-auto flex h-full max-w-5xl flex-col overflow-hidden rounded-theme border border-border bg-card shadow-xl"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex min-h-14 items-center justify-between gap-2 border-b border-border px-3 py-2 sm:px-4">
            <div>
              <p className="text-sm font-semibold text-foreground">Araç fotoğrafı</p>
              <p className="text-xs text-muted-foreground">
                {selectedListingImageIndex !== null ? selectedListingImageIndex + 1 : 1} / {listingImages.length}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => changeListingImageZoom(-IMAGE_ZOOM_STEP)}
                disabled={listingImageZoom <= MIN_IMAGE_ZOOM}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground/80 disabled:opacity-40"
                aria-label="Fotoğrafı küçült"
              >
                <Minus aria-hidden="true" className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setListingImageZoom(MIN_IMAGE_ZOOM)}
                className="inline-flex h-10 min-w-14 items-center justify-center rounded-full border border-border px-3 text-xs font-semibold text-foreground/80"
                aria-label="Yakınlaştırmayı sıfırla"
              >
                {Math.round(listingImageZoom * 100)}%
              </button>
              <button
                type="button"
                onClick={() => changeListingImageZoom(IMAGE_ZOOM_STEP)}
                disabled={listingImageZoom >= MAX_IMAGE_ZOOM}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground/80 disabled:opacity-40"
                aria-label="Fotoğrafı büyüt"
              >
                <Plus aria-hidden="true" className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={closeListingImage}
                className="ml-1 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground"
                aria-label="Fotoğraf görüntüleyiciyi kapat"
              >
                <X aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-auto bg-muted p-3">
            <div className="flex min-h-full items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element -- Listing image hosts vary by source site. */}
              <img
                src={selectedListingImage}
                alt="İlandan alınan araç fotoğrafı"
                className="max-h-none max-w-none rounded-theme-sm object-contain shadow-sm"
                style={{
                  width: `${listingImageZoom * 100}%`,
                  maxWidth: listingImageZoom === MIN_IMAGE_ZOOM ? "100%" : "none",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    ) : null}
    </>
  );
}
