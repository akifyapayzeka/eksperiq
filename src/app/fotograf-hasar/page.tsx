"use client";

import { useEffect, useMemo, useState } from "react";
import { Calculator, Camera, ImageIcon, ImagePlus, Save } from "lucide-react";
import { HeroCard } from "@/components/cards/hero-card";
import { AppShell } from "@/components/layout/app-shell";
import { Spinner } from "@/components/ui/spinner";
import { RepairCostEstimator } from "@/components/repair-cost/repair-cost-estimator";
import { chooseFromGalleryAsFiles, takePhotoAsFile } from "@/lib/media/pick-photos";
import { downscaleImage } from "@/lib/photo-analysis/downscale-image";
import { prepareAiImages } from "@/lib/photo-analysis/prepare-ai-image";
import { createPhotoAnalysisId, upsertPhotoAnalysis } from "@/lib/storage/photo-analysis-storage";
import type { PhotoAnalysisRecord } from "@/lib/photo-analysis/types";
import { apiFetch } from "@/lib/api/client";
import { acceptAiConsent, hasAcceptedAiConsent } from "@/lib/consent/ai-consent";

const areas = [
  "Ön tampon",
  "Arka tampon",
  "Sağ ön çamurluk",
  "Sol ön çamurluk",
  "Kapılar",
  "Kaput",
  "Bagaj kapağı",
  "Tavan",
  "Farlar",
  "Stop lambaları",
  "Jantlar",
  "Lastikler",
  "Camlar",
  "Gösterge paneli",
  "Kadran",
];

const findings = [
  "Çizik",
  "Göçük",
  "Boya çatlağı",
  "Renk farkı",
  "Panel hizasızlığı",
  "Pas",
  "Çatlak",
  "Kırık",
  "Uyarı ışığı",
  "Motor arıza lambası",
  "Yağ basıncı uyarısı",
  "Hararet uyarısı",
  "Akü/şarj uyarısı",
  "Fren/ABS uyarısı",
  "Lastik basıncı uyarısı",
  "Airbag uyarısı",
];
const confidenceLevels = ["Düşük olasılık", "Orta olasılık", "Yüksek olasılık"];
const isPhotoAiEnabled = process.env.NEXT_PUBLIC_AI_PHOTO_DAMAGE_ENABLED === "true";
// A real ilan listing usually has 10-15+ photos. The backend caps a single
// request at 4 images (Vercel's ~4.5MB serverless body limit), so more than
// 4 photos are sent as sequential batches and the findings are merged.
const MAX_ANALYZED_PHOTOS = 20;
const BATCH_SIZE = 4;

type DamageFinding = {
  area: string;
  finding: string;
  confidence: string;
  note: string;
};

type AiPhotoFinding = {
  id: string;
  area: string;
  signal: string;
  confidence: "low" | "medium" | "high";
  explanation: string;
  recommendation: string;
};

type AiPhotoQuality = {
  status: "good" | "usable" | "poor";
  issues: string[];
  retakeTips: string[];
};

type AiPhotoAnalysis = {
  isVehiclePhoto: boolean;
  summary: string;
  findings: AiPhotoFinding[];
  photoQuality?: AiPhotoQuality;
  disclaimer: string;
};

const defaultRetakeTips = [
  "Aynı bölgeyi bir genel, bir yakın fotoğrafla çekin.",
  "Çizik için parçayı düz, sağ çapraz ve sol çapraz açıdan tekrar çekin.",
  "Parlama varsa aracı gölgeye alın veya kamerayı hafif yana kaydırın.",
];

export default function PhotoDamagePage() {
  const [area, setArea] = useState("");
  const [finding, setFinding] = useState("");
  const [confidence, setConfidence] = useState("");
  const [note, setNote] = useState("");
  const [items, setItems] = useState<DamageFinding[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [fileCount, setFileCount] = useState(0);
  const [formMessage, setFormMessage] = useState("");
  const [aiStatus, setAiStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [aiMessage, setAiMessage] = useState("");
  const [aiAnalysis, setAiAnalysis] = useState<AiPhotoAnalysis | null>(null);
  const [aiBatchProgress, setAiBatchProgress] = useState<{ done: number; total: number } | null>(null);
  // KVKK/gizlilik/AI onayı normalde üye ol/giriş yap ekranında bir kez
  // alınır (RequireAuthGate); burada tekrar sorulmaz. Yalnızca o onay hiç
  // alınmamışsa (örn. hesap sistemi yapılandırılı değilse) yedek olarak
  // gösterilir.
  const [aiConsent, setAiConsent] = useState(() => hasAcceptedAiConsent());
  // Checking the box flips aiConsent to true; the prompt's visibility must
  // not depend on the same value or it unmounts itself mid-click.
  const [showConsentPrompt] = useState(() => !hasAcceptedAiConsent());
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveMessage, setSaveMessage] = useState("");
  // Which finding cards (AI-generated, keyed by finding id; manual, keyed
  // by "manual-{index}") currently show their cost estimator expanded.
  const [costEstimatorOpenFor, setCostEstimatorOpenFor] = useState<Set<string>>(new Set());
  const canRunAi = isPhotoAiEnabled && Boolean(files.length) && aiConsent && aiStatus !== "loading";
  const canSave = Boolean(fileCount) && (items.length > 0 || Boolean(aiAnalysis)) && saveStatus !== "saving";

  const previewUrls = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);
  useEffect(() => {
    return () => {
      for (const url of previewUrls) URL.revokeObjectURL(url);
    };
  }, [previewUrls]);

  const priority = useMemo(() => {
    if (items.some((item) => item.confidence === "Yüksek olasılık")) return "Ekspertizde öncelikli kontrol edilmeli";
    if (items.length) return "Fotoğraflar ekspertiz öncesi notlandı";
    return "Henüz bulgu eklenmedi";
  }, [items]);

  function addFinding() {
    if (!fileCount) {
      setFormMessage("Önce fotoğraf seçin.");
      return;
    }

    if (!area || !finding || !confidence) {
      setFormMessage("Bölge, bulgu ve güven seviyesi seçin.");
      return;
    }

    setItems((current) => [...current, { area, finding, confidence, note: note.trim() }]);
    setFormMessage("Bulgu eklendi.");
    setArea("");
    setFinding("");
    setConfidence("");
    setNote("");
  }

  async function saveAnalysis() {
    if (!fileCount) {
      setSaveStatus("error");
      setSaveMessage("Önce fotoğraf seçin.");
      return;
    }

    if (!items.length && !aiAnalysis) {
      setSaveStatus("error");
      setSaveMessage("Kaydedilecek bir bulgu yok. Önce bulgu ekleyin veya analiz edin.");
      return;
    }

    setSaveStatus("saving");
    setSaveMessage("");

    const thumbnails = (await Promise.all(files.map(downscaleImage))).filter((value): value is string =>
      Boolean(value),
    );

    const record: PhotoAnalysisRecord = {
      id: createPhotoAnalysisId(),
      createdAt: new Date().toISOString(),
      thumbnails,
      findings: items,
      aiSummary: aiAnalysis?.summary,
    };

    const result = await upsertPhotoAnalysis(record);
    if (!result.ok) {
      setSaveStatus("error");
      setSaveMessage(
        result.reason === "quota-exceeded"
          ? "Fotoğraflar cihazda depolanamadı: depolama alanı dolu. Analizlerim'den eski kayıtları silip tekrar deneyin."
          : "Fotoğraflar bu cihazda depolanamıyor. Bulgular yine de kaydedildi; fotoğraflar görünmeyebilir.",
      );
      return;
    }
    setSaveStatus("saved");
    setSaveMessage("Analiz kaydedildi. Analizlerim sayfasında görebilirsiniz.");
  }

  function applySelectedFiles(selectedFiles: File[]) {
    if (!selectedFiles.length) return;
    const capped = selectedFiles.slice(0, MAX_ANALYZED_PHOTOS);
    setFiles(capped);
    setFileCount(capped.length);
    setFormMessage("");
    setItems([]);
    setAiStatus("idle");
    setAiMessage("");
    setAiAnalysis(null);
  }

  async function handleTakePhoto() {
    const file = await takePhotoAsFile();
    if (file) applySelectedFiles([file]);
  }

  async function handleChooseFromGallery() {
    const selectedFiles = await chooseFromGalleryAsFiles(MAX_ANALYZED_PHOTOS);
    applySelectedFiles(selectedFiles);
  }

  async function analyzePhotosWithAi() {
    if (!files.length) {
      setAiStatus("error");
      setAiMessage("Önce fotoğraf seçin.");
      return;
    }

    if (!isPhotoAiEnabled) {
      setAiStatus("error");
      setAiMessage("Fotoğraf kontrolü şu anda kapalı. Manuel kontrol notu ekleyebilirsiniz.");
      return;
    }

    if (!aiConsent) {
      setAiStatus("error");
      setAiMessage("Fotoğrafı AI sağlayıcısına göndermeyi onaylamadan fotoğraf kontrolü başlatılamaz.");
      return;
    }

    setAiStatus("loading");
    setAiMessage("");
    setAiAnalysis(null);
    setAiBatchProgress(null);

    try {
      const { images, skippedCount } = await prepareAiImages(files.slice(0, MAX_ANALYZED_PHOTOS));

      if (!images.length) {
        setAiStatus("error");
        setAiMessage(
          "Fotoğraflar işlenemedi veya boyut sınırını aştı. Lütfen daha küçük/az fotoğrafla tekrar deneyin.",
        );
        return;
      }

      const batches: (typeof images)[] = [];
      for (let i = 0; i < images.length; i += BATCH_SIZE) {
        batches.push(images.slice(i, i + BATCH_SIZE));
      }

      const combinedFindings: AiPhotoFinding[] = [];
      let anyVehiclePhoto = false;
      let summary = "";
      let disclaimer = "";
      let remaining: number | undefined;
      let photoQuality: AiPhotoQuality | null = null;

      for (let batchIndex = 0; batchIndex < batches.length; batchIndex += 1) {
        setAiBatchProgress({ done: batchIndex, total: batches.length });

        const response = await apiFetch("/api/ai/photo-damage", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            aiProviderConsent: true,
            images: batches[batchIndex],
            userNote: note,
          }),
        });

        if (response.status === 413) {
          setAiStatus("error");
          setAiMessage("Fotoğraf verisi hâlâ çok büyük. Daha az fotoğraf seçip tekrar deneyin.");
          return;
        }

        const payload = (await response.json()) as { analysis?: AiPhotoAnalysis; error?: string; remaining?: number };
        if (!response.ok || !payload.analysis) {
          setAiStatus("error");
          setAiMessage(formatAiError(payload.error, response.status));
          return;
        }

        if (payload.analysis.isVehiclePhoto) {
          anyVehiclePhoto = true;
          combinedFindings.push(
            ...payload.analysis.findings.map((item) => ({ ...item, id: `b${batchIndex}-${item.id}` })),
          );
        }
        summary = payload.analysis.summary || summary;
        disclaimer = payload.analysis.disclaimer || disclaimer;
        remaining = payload.remaining;
        photoQuality = mergePhotoQuality(photoQuality, payload.analysis.photoQuality);
      }

      setAiBatchProgress(null);
      const skippedNote = skippedCount > 0 ? ` ${skippedCount} fotoğraf boyut sınırı nedeniyle dahil edilemedi.` : "";
      setAiAnalysis({
        isVehiclePhoto: anyVehiclePhoto,
        summary,
        findings: combinedFindings,
        photoQuality: photoQuality ?? {
          status: anyVehiclePhoto ? "usable" : "poor",
          issues: anyVehiclePhoto ? [] : ["Araç veya araç parçası güvenle seçilemedi."],
          retakeTips: anyVehiclePhoto ? defaultRetakeTips.slice(0, 2) : [defaultRetakeTips[0]],
        },
        disclaimer,
      });
      setAiStatus("ready");
      setAiMessage(
        (anyVehiclePhoto
          ? `Fotoğraf kontrolü tamamlandı.${typeof remaining === "number" ? ` Bugün kalan hak: ${remaining}` : ""}`
          : "Bu görsellerde araç veya araç parçası güvenle tespit edilemedi. Hasar bulgusu oluşturulmadı.") +
          skippedNote,
      );
    } catch {
      setAiStatus("error");
      setAiBatchProgress(null);
      setAiMessage(
        "Fotoğraf kontrolüne şu anda ulaşılamadı. Fotoğrafınız kaybolmadı; manuel bulgu ekleyebilir veya biraz sonra tekrar deneyebilirsiniz.",
      );
    }
  }

  function formatAiError(error: string | undefined, status: number) {
    if (status === 429) {
      return error?.includes("limit")
        ? "Bugünkü fotoğraf kontrol hakkı doldu. Manuel bulgu ekleyerek devam edebilirsiniz."
        : "Fotoğraf kontrolü şu anda kapalı. Manuel bulgu ekleyerek devam edebilirsiniz.";
    }

    if (status === 400) {
      return "Fotoğraf işlenemedi. Lütfen araç görünen JPG/PNG fotoğraf seçin veya manuel bulgu ekleyin.";
    }

    const normalizedError = error?.toLocaleLowerCase("tr-TR") ?? "";
    if (
      normalizedError.includes("openrouter") ||
      normalizedError.includes("ai fotoğraf sonucu işlenemedi") ||
      normalizedError.includes("ai yanıtı okunamadı")
    ) {
      return "Fotoğraf modeli şu anda okunabilir sonuç veremedi. Biraz sonra tekrar deneyebilir veya manuel bulgu ekleyerek rapora devam edebilirsiniz.";
    }

    return "Fotoğraf analizi şu anda tamamlanamadı. Manuel bulgu ekleyerek devam edebilirsiniz.";
  }

  function confidenceLabel(value: AiPhotoFinding["confidence"]) {
    if (value === "high") return "Yüksek güven";
    if (value === "medium") return "Orta güven";
    return "Düşük güven";
  }

  function mergePhotoQuality(current: AiPhotoQuality | null, next: AiPhotoQuality | undefined): AiPhotoQuality | null {
    if (!next) return current;
    if (!current)
      return { status: next.status, issues: next.issues.slice(0, 4), retakeTips: next.retakeTips.slice(0, 4) };
    const rank = { good: 0, usable: 1, poor: 2 } as const;
    const status = rank[next.status] > rank[current.status] ? next.status : current.status;
    return {
      status,
      issues: Array.from(new Set([...current.issues, ...next.issues])).slice(0, 4),
      retakeTips: Array.from(new Set([...current.retakeTips, ...next.retakeTips])).slice(0, 4),
    };
  }

  function photoQualityLabel(status: AiPhotoQuality["status"]) {
    if (status === "good") return "Fotoğraf kalitesi iyi";
    if (status === "usable") return "Fotoğraf kullanılabilir";
    return "Fotoğraf netliği zayıf";
  }

  function toggleCostEstimator(key: string) {
    setCostEstimatorOpenFor((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  return (
    <AppShell>
      <div className="max-w-4xl pt-6">
        <HeroCard
          icon={Camera}
          eyebrow="Fotoğraftan Araç Kontrolü"
          title="Hasar ve uyarı ışıklarını inceleme notuna çevir"
          tone="accent"
        />

        <section className="mt-5 rounded-theme border border-border bg-card p-5 shadow-sm">
          <div className="grid min-h-24 place-items-center gap-3 rounded-theme border border-dashed border-border bg-muted p-4 text-center">
            <div className="flex items-center gap-2">
              <ImagePlus aria-hidden="true" className="h-6 w-6 text-accent" />
              <span className="text-sm font-semibold text-foreground">Fotoğraf seç</span>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={handleTakePhoto}
                className="inline-flex min-h-11 items-center gap-2 rounded-theme border border-border bg-card px-4 text-sm font-semibold text-foreground/90 hover:border-accent"
              >
                <Camera aria-hidden="true" className="h-4 w-4" />
                Fotoğraf çek
              </button>
              <button
                type="button"
                onClick={handleChooseFromGallery}
                className="inline-flex min-h-11 items-center gap-2 rounded-theme border border-border bg-card px-4 text-sm font-semibold text-foreground/90 hover:border-accent"
              >
                <ImageIcon aria-hidden="true" className="h-4 w-4" />
                Galeriden seç
              </button>
            </div>
          </div>
          {fileCount ? (
            <>
              <p className="mt-3 text-sm font-semibold text-foreground">{fileCount} fotoğraf seçildi.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {previewUrls.map((url, index) => (
                  // eslint-disable-next-line @next/next/no-img-element -- local blob: preview, not a remote asset
                  <img
                    key={url}
                    src={url}
                    alt={`Seçilen fotoğraf ${index + 1}`}
                    className="h-20 w-20 rounded-theme-sm border border-border object-cover"
                  />
                ))}
              </div>
              <div className="mt-4 rounded-theme-sm border border-accent/20 bg-accent/5 p-4">
                <p className="text-sm font-semibold text-foreground">İnce çizik ve boya farkı için çekim rehberi</p>
                <ul className="mt-2 grid gap-1.5 text-sm leading-6 text-muted-foreground">
                  {defaultRetakeTips.map((tip) => (
                    <li key={tip}>- {tip}</li>
                  ))}
                  <li>- Lens temiz olsun; flaş veya güneş parlaması varsa açıyı değiştirin.</li>
                </ul>
              </div>
            </>
          ) : null}
        </section>

        <section className="mt-5 rounded-theme border border-accent/20 bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Camera aria-hidden="true" className="h-5 w-5 text-accent" />
            <h2 className="text-xl font-semibold text-foreground">Fotoğraf kontrolü</h2>
          </div>
          {!isPhotoAiEnabled ? (
            <p className="mt-3 rounded-theme-sm border border-warning/30 bg-warning/10 px-3 py-2 text-sm font-medium text-foreground">
              Canlı fotoğraf kontrolü şu anda kapalı. Bu ekranda manuel kontrol notu oluşturabilirsiniz.
            </p>
          ) : null}
          {isPhotoAiEnabled && showConsentPrompt ? (
            <label className="mt-4 flex items-start gap-3 rounded-theme-sm border border-border bg-muted p-3 text-sm font-semibold text-foreground/90">
              <input
                type="checkbox"
                checked={aiConsent}
                onChange={(event) => {
                  setAiConsent(event.target.checked);
                  if (event.target.checked) acceptAiConsent();
                }}
                className="mt-1 h-4 w-4 shrink-0 accent-primary"
              />
              <span>
                Fotoğrafla araç kontrolü için seçtiğim görsellerin üçüncü taraf bir AI sağlayıcısına geçici olarak
                gönderileceğini anladım ve onaylıyorum.
              </span>
            </label>
          ) : null}
          <button
            type="button"
            onClick={analyzePhotosWithAi}
            disabled={!canRunAi}
            className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-accent px-5 font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {aiStatus === "loading" ? (
              <>
                <Spinner />
                {aiBatchProgress && aiBatchProgress.total > 1
                  ? `İnceleniyor (${aiBatchProgress.done}/${aiBatchProgress.total})`
                  : "İnceleniyor"}
              </>
            ) : (
              "Fotoğrafları analiz et"
            )}
          </button>
          {aiMessage ? (
            <p
              className={`mt-3 rounded-theme-sm px-3 py-2 text-sm font-medium ${
                aiStatus === "error" ? "bg-destructive/10 text-destructive" : "bg-accent/10 text-accent"
              }`}
              role="status"
            >
              {aiMessage}
            </p>
          ) : null}
          {aiAnalysis ? (
            <div className="mt-4 grid gap-3">
              <p className="rounded-theme-sm border border-border bg-muted p-4 text-sm leading-6 text-foreground/80">
                {aiAnalysis.summary}
              </p>
              {aiAnalysis.photoQuality ? (
                <article
                  className={`rounded-theme-sm border p-4 ${
                    aiAnalysis.photoQuality.status === "poor"
                      ? "border-warning/30 bg-warning/10"
                      : "border-accent/20 bg-accent/5"
                  }`}
                >
                  <p className="text-sm font-semibold text-foreground">
                    {photoQualityLabel(aiAnalysis.photoQuality.status)}
                  </p>
                  {aiAnalysis.photoQuality.issues.length ? (
                    <ul className="mt-2 grid gap-1 text-sm leading-6 text-muted-foreground">
                      {aiAnalysis.photoQuality.issues.map((issue) => (
                        <li key={issue}>- {issue}</li>
                      ))}
                    </ul>
                  ) : null}
                  <p className="mt-3 text-sm font-semibold text-foreground/90">Daha net sonuç için</p>
                  <ul className="mt-1 grid gap-1 text-sm leading-6 text-muted-foreground">
                    {(aiAnalysis.photoQuality.retakeTips.length
                      ? aiAnalysis.photoQuality.retakeTips
                      : defaultRetakeTips
                    ).map((tip) => (
                      <li key={tip}>- {tip}</li>
                    ))}
                  </ul>
                </article>
              ) : null}
              {aiAnalysis.findings.length ? (
                aiAnalysis.findings.map((item) => (
                  <article key={item.id} className="rounded-theme-sm border border-border bg-card p-4">
                    <p className="text-xs font-semibold uppercase text-accent">{confidenceLabel(item.confidence)}</p>
                    <h3 className="mt-1 font-semibold text-foreground">
                      {item.area}: {item.signal}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.explanation}</p>
                    <p className="mt-2 text-sm font-medium text-foreground/90">{item.recommendation}</p>
                    <button
                      type="button"
                      onClick={() => toggleCostEstimator(item.id)}
                      className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-full border border-accent/40 px-4 text-sm font-semibold text-accent"
                    >
                      <Calculator aria-hidden="true" className="h-4 w-4" />
                      {costEstimatorOpenFor.has(item.id)
                        ? "Maliyet tahminini gizle"
                        : "Bu bulgu için tahmini maliyeti gör"}
                    </button>
                    {costEstimatorOpenFor.has(item.id) ? (
                      <RepairCostEstimator hint={{ area: item.area, signal: item.signal }} />
                    ) : null}
                  </article>
                ))
              ) : (
                <p className="rounded-theme-sm border border-border bg-muted p-4 text-sm text-muted-foreground">
                  Bu fotoğraf için hasar veya uyarı bulgusu üretilmedi.
                </p>
              )}
            </div>
          ) : null}
        </section>

        <section className="mt-5 rounded-theme border border-border bg-card p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-foreground">Olası bulgu ekle</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <label className="grid gap-2 text-sm font-medium text-foreground/90">
              Bölge
              <select
                value={area}
                onChange={(event) => setArea(event.target.value)}
                className="min-h-12 rounded-theme-sm border border-border px-3"
              >
                <option value="">Bölge seçin</option>
                {areas.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium text-foreground/90">
              Bulgu
              <select
                value={finding}
                onChange={(event) => setFinding(event.target.value)}
                className="min-h-12 rounded-theme-sm border border-border px-3"
              >
                <option value="">Bulgu seçin</option>
                {findings.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium text-foreground/90">
              Güven seviyesi
              <select
                value={confidence}
                onChange={(event) => setConfidence(event.target.value)}
                className="min-h-12 rounded-theme-sm border border-border px-3"
              >
                <option value="">Güven seviyesi seçin</option>
                {confidenceLevels.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="mt-4 grid gap-2 text-sm font-medium text-foreground/90">
            Not
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              className="min-h-24 rounded-theme-sm border border-border px-3 py-3"
              placeholder="Örn. sağ ön kapıda renk farkı var veya gösterge panelinde motor arıza lambası yanıyor."
            />
          </label>
          <button
            type="button"
            onClick={addFinding}
            disabled={!fileCount}
            className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-primary px-5 font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto dark:bg-card dark:text-foreground"
          >
            Bulguyu ekle
          </button>
          {formMessage ? (
            <p
              className={`mt-3 rounded-theme-sm px-3 py-2 text-sm font-medium ${
                formMessage.includes("eklendi") ? "bg-accent/10 text-accent" : "bg-warning/10 text-warning"
              }`}
              role="status"
            >
              {formMessage}
            </p>
          ) : null}
        </section>

        <section className="mt-5 rounded-theme border border-border bg-card p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-foreground">Foto kontrol özeti</h2>
          <p className="mt-2 text-sm font-medium text-foreground/80">{priority}</p>
          <div className="mt-4 grid gap-3">
            {items.length ? (
              items.map((item, index) => {
                const key = `manual-${index}`;
                return (
                  <article
                    key={`${item.area}-${item.finding}-${index}`}
                    className="rounded-theme-sm border border-border bg-muted p-4"
                  >
                    <p className="font-semibold text-foreground">
                      {item.area}: {item.finding}
                    </p>
                    <p className="mt-1 text-sm text-foreground/80">{item.confidence}</p>
                    {item.note ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.note}</p> : null}
                    <button
                      type="button"
                      onClick={() => toggleCostEstimator(key)}
                      className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-full border border-accent/40 px-4 text-sm font-semibold text-accent"
                    >
                      <Calculator aria-hidden="true" className="h-4 w-4" />
                      {costEstimatorOpenFor.has(key) ? "Maliyet tahminini gizle" : "Bu bulgu için tahmini maliyeti gör"}
                    </button>
                    {costEstimatorOpenFor.has(key) ? (
                      <RepairCostEstimator hint={{ area: item.area, signal: item.finding }} />
                    ) : null}
                  </article>
                );
              })
            ) : (
              <p className="rounded-theme-sm border border-border bg-muted p-4 text-sm text-muted-foreground">
                Henüz bulgu eklenmedi.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={saveAnalysis}
            disabled={!canSave}
            className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-accent px-5 font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            <Save aria-hidden="true" className="h-4 w-4" />
            {saveStatus === "saving" ? "Kaydediliyor" : "Analizi kaydet"}
          </button>
          {saveMessage ? (
            <p
              className={`mt-3 rounded-theme-sm px-3 py-2 text-sm font-medium ${
                saveStatus === "error" ? "bg-warning/10 text-warning" : "bg-accent/10 text-accent"
              }`}
              role="status"
            >
              {saveMessage}
            </p>
          ) : null}
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            Bu ekran kesin hasar veya arıza kararı vermez; uyarı ışıkları servis/OBD kontrolüyle doğrulanmalıdır.
          </p>
        </section>
      </div>
    </AppShell>
  );
}
