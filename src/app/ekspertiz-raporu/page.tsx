"use client";

import { useState } from "react";
import { FileSearch, Upload } from "lucide-react";
import { HeroCard } from "@/components/cards/hero-card";
import { AppShell } from "@/components/layout/app-shell";
import { Spinner } from "@/components/ui/spinner";
import { WarningAlert, DisclaimerCard, InfoAlert } from "@/components/ui/alert";
import { apiFetch } from "@/lib/api/client";
import { prepareAiImages } from "@/lib/photo-analysis/prepare-ai-image";
import { renderPdfPagesToImages } from "@/lib/pdf/render-pdf-pages";
import { acceptAiConsent, hasAcceptedAiConsent } from "@/lib/consent/ai-consent";

const isExpertiseReportAiEnabled = process.env.NEXT_PUBLIC_EXPERTISE_REPORT_AI_ENABLED === "true";

type ReportFinding = {
  id: string;
  category: string;
  area: string;
  status: string;
  explanation: string;
  recommendation: string;
};

type ReportAnalysis = {
  isReportReadable: boolean;
  overallRisk: "low" | "medium" | "high";
  summary: string;
  findings: ReportFinding[];
  disclaimer: string;
};

const riskLabel: Record<ReportAnalysis["overallRisk"], string> = {
  low: "Düşük risk",
  medium: "Orta risk",
  high: "Yüksek risk",
};

export default function ExpertiseReportPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // KVKK/gizlilik/AI onayı normalde üye ol/giriş yap ekranında bir kez
  // alınır (RequireAuthGate); burada tekrar sorulmaz. Yalnızca o onay hiç
  // alınmamışsa (örn. hesap sistemi yapılandırılı değilse) yedek olarak
  // gösterilir.
  const [consent, setConsent] = useState(() => hasAcceptedAiConsent());
  // Checking the box flips consent to true; the prompt's visibility must
  // not depend on the same value or it unmounts itself mid-click.
  const [showConsentPrompt] = useState(() => !hasAcceptedAiConsent());
  const [status, setStatus] = useState<"idle" | "preparing" | "loading" | "ready" | "error">("idle");
  const [message, setMessage] = useState("");
  const [analysis, setAnalysis] = useState<ReportAnalysis | null>(null);

  const canRunAi = isExpertiseReportAiEnabled && Boolean(selectedFile) && consent && status !== "loading" && status !== "preparing";

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0] ?? null;
    setSelectedFile(file);
    setStatus("idle");
    setMessage("");
    setAnalysis(null);
  }

  function formatError(error: string | undefined, status: number) {
    if (status === 429) {
      return error?.includes("limit")
        ? "Bugünkü rapor analizi hakkı doldu. Birazdan tekrar deneyin."
        : "Rapor analizi şu anda kapalı.";
    }
    if (status === 400 || status === 413) {
      return "Rapor işlenemedi. Lütfen okunaklı bir PDF veya fotoğraf seçip tekrar deneyin.";
    }
    return "Rapor analizi şu anda tamamlanamadı. Birazdan tekrar deneyebilirsiniz.";
  }

  async function analyzeReportWithAi() {
    if (!selectedFile) {
      setStatus("error");
      setMessage("Önce ekspertiz raporu (PDF veya fotoğraf) seçin.");
      return;
    }

    setStatus("preparing");
    setMessage("");
    setAnalysis(null);

    try {
      const images =
        selectedFile.type === "application/pdf"
          ? (await renderPdfPagesToImages(selectedFile)).map((page) => ({
              name: page.name,
              mimeType: "image/jpeg",
              dataUrl: page.dataUrl,
            }))
          : (await prepareAiImages([selectedFile])).images;

      if (!images.length) {
        setStatus("error");
        setMessage("Dosya işlenemedi. Lütfen PDF veya net bir fotoğraf ile tekrar deneyin.");
        return;
      }

      setStatus("loading");

      const response = await apiFetch("/api/ai/expertise-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aiProviderConsent: true, images }),
      });

      const payload = (await response.json()) as { analysis?: ReportAnalysis; error?: string; remaining?: number };
      if (!response.ok || !payload.analysis) {
        setStatus("error");
        setMessage(formatError(payload.error, response.status));
        return;
      }

      setAnalysis(payload.analysis);
      setStatus("ready");
      setMessage(
        payload.analysis.isReportReadable
          ? `Rapor analizi tamamlandı.${typeof payload.remaining === "number" ? ` Bugün kalan hak: ${payload.remaining}` : ""}`
          : "Yüklenen dosya ekspertiz raporu olarak okunamadı. Daha net bir PDF/fotoğraf deneyin.",
      );
    } catch {
      setStatus("error");
      setMessage("Rapor analizine şu anda ulaşılamadı. Birazdan tekrar deneyin.");
    }
  }

  return (
    <AppShell>
      <div className="max-w-3xl pt-6">
        <HeroCard
          icon={FileSearch}
          eyebrow="Ekspertiz Raporu Analizi"
          title="Ekspertiz raporunu kontrol notuna çevir"
          description="PDF veya rapor fotoğrafını seçin; boya/değişen, mekanik, elektronik ve şasi bulgularını okuyup önceliklendirelim. Elle metin yapıştırmanız gerekmez."
          tone="accent"
        />

        <div className="mt-5">
          <InfoAlert>
            <p className="font-semibold text-foreground">Raporu okumadan önce bilmeniz gereken 3 şey</p>
            <ul className="mt-2 grid gap-1 text-sm leading-6">
              <li>
                <strong className="text-foreground">Orijinal</strong> normaldir. <strong className="text-foreground">Boyalı</strong>{" "}
                genelde kozmetiktir (tampon/çamurluk gibi darbe alan parçalarda sık görülür). Kaput, tavan, direk veya
                şaside <strong className="text-foreground">değişen/işlem</strong> görülmesi ise ağır kaza geçmişine
                işaret edebilir — bu bölgelere özellikle dikkat edin.
              </li>
              <li>Ekspertiz firmasını her zaman siz (alıcı) seçin; satıcının anlaşmalı olduğu firma kusur gizleyebilir.</li>
              <li>1 yıldan eski bir ekspertiz raporuna güvenmeyin, aracın durumu değişmiş olabilir.</li>
            </ul>
          </InfoAlert>
        </div>

        <section className="mt-5 rounded-theme border border-border bg-card p-5 shadow-sm">
          <label className="grid min-h-28 cursor-pointer place-items-center rounded-theme border border-dashed border-border bg-muted p-4 text-center">
            <Upload aria-hidden="true" className="h-8 w-8 text-accent" />
            <span className="mt-2 text-sm font-semibold text-foreground">Ekspertiz raporu veya fotoğraf seç</span>
            <span className="mt-1 text-xs leading-5 text-muted-foreground">
              Tek bir PDF (ilk 4 sayfası okunur) veya tek bir JPG/PNG fotoğraf seçebilirsiniz.
            </span>
            <input type="file" accept="application/pdf,image/*" className="sr-only" onChange={handleFileChange} />
          </label>
          {selectedFile ? <p className="mt-3 text-sm font-semibold text-foreground">{selectedFile.name}</p> : null}
        </section>

        <section className="mt-5 rounded-theme border border-accent/20 bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <FileSearch aria-hidden="true" className="h-5 w-5 text-accent" />
            <h2 className="text-xl font-semibold text-foreground">Rapor analizi</h2>
          </div>
          {!isExpertiseReportAiEnabled ? (
            <p className="mt-3 rounded-theme-sm border border-warning/30 bg-warning/10 px-3 py-2 text-sm font-medium text-foreground">
              Rapor analizi şu anda kapalı.
            </p>
          ) : showConsentPrompt ? (
            <label className="mt-4 flex items-start gap-3 rounded-theme-sm border border-border bg-muted p-3 text-sm font-semibold text-foreground/90">
              <input
                type="checkbox"
                checked={consent}
                onChange={(event) => {
                  setConsent(event.target.checked);
                  if (event.target.checked) acceptAiConsent();
                }}
                className="mt-1 h-4 w-4 shrink-0 accent-primary"
              />
              <span>
                Seçtiğim rapor/fotoğrafın üçüncü taraf bir AI sağlayıcısına geçici olarak gönderileceğini anladım ve
                onaylıyorum.
              </span>
            </label>
          ) : null}
          <button
            type="button"
            onClick={analyzeReportWithAi}
            disabled={!canRunAi}
            className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-accent px-5 font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {status === "preparing" || status === "loading" ? (
              <>
                <Spinner />
                {status === "preparing" ? "Dosya hazırlanıyor" : "İnceleniyor"}
              </>
            ) : (
              "Analiz et"
            )}
          </button>
          {message ? (
            <p className={`mt-3 text-sm font-medium ${status === "error" ? "text-destructive" : "text-foreground"}`}>
              {message}
            </p>
          ) : null}
        </section>

        {analysis ? (
          <section className="mt-5 rounded-theme border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-foreground">Öne çıkan maddeler</h2>
              {analysis.isReportReadable ? (
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">
                  {riskLabel[analysis.overallRisk]}
                </span>
              ) : null}
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{analysis.summary}</p>
            <div className="mt-4 grid gap-3">
              {analysis.findings.length ? (
                analysis.findings.map((finding) => (
                  <div key={finding.id} className="rounded-theme-sm border border-warning/30 bg-warning/10 p-4">
                    <p className="text-sm font-bold text-foreground">
                      {finding.category} · {finding.area}
                    </p>
                    {finding.status ? <p className="mt-0.5 text-sm text-foreground/90">{finding.status}</p> : null}
                    <p className="mt-2 text-sm leading-6 text-foreground/90">{finding.explanation}</p>
                    <p className="mt-2 text-sm font-semibold text-foreground">Öneri: {finding.recommendation}</p>
                  </div>
                ))
              ) : (
                <p className="rounded-theme-sm bg-muted p-4 text-sm text-muted-foreground">
                  {analysis.isReportReadable
                    ? "Kritik bir bulgu işaretlenmedi. Bu, raporun tamamen temiz olduğu anlamına gelmez."
                    : "Bu dosya bir ekspertiz raporu olarak okunamadı."}
                </p>
              )}
            </div>
            <div className="mt-4">
              <WarningAlert>{analysis.disclaimer}</WarningAlert>
            </div>
          </section>
        ) : null}

        <div className="mt-5">
          <DisclaimerCard>
            Rapor bu cihazda işlenir ve kalıcı olarak sunucuya kaydedilmez; yalnızca analiz sırasında AI sağlayıcısına
            geçici olarak gönderilir.
          </DisclaimerCard>
        </div>
      </div>
    </AppShell>
  );
}
