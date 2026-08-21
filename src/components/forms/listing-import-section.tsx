"use client";

import { useEffect, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { Clipboard } from "@capacitor/clipboard";
import { ClipboardPaste, LinkIcon, X } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Field } from "@/components/ui/field";
import { importListingFromUrl, type ImportStage } from "@/lib/listing-import/import-listing";
import { getImportSession, setImportSession, useImportSession } from "@/lib/listing-import/import-session-store";
import { prepareListingImportNotifications } from "@/lib/listing-import/notifications";
import { computeDisplayPercent } from "@/lib/listing-import/progress";
import { acceptAiConsent, hasAcceptedAiConsent } from "@/lib/consent/ai-consent";
import type { ListingImportResult } from "@/lib/listing-import/types";

const isListingImportEnabled = process.env.NEXT_PUBLIC_LISTING_IMPORT_ENABLED === "true";

const stageLabels: Record<ImportStage, string> = {
  "checking-url": "Bağlantı kontrol ediliyor",
  "opening-page": "İlan sayfası açılıyor",
  normalizing: "Araç bilgileri analiz ediliyor",
  done: "İlan analizi tamamlandı",
};

const loadingDetails: Record<Exclude<ImportStage, "done">, string[]> = {
  "checking-url": ["Link kaynağı doğrulanıyor", "İlan sitesi hazırlanıyor", "Analiz oturumu başlatılıyor"],
  "opening-page": ["Sayfa cihazınızda açılıyor", "İlan metni ve konum alanları okunuyor", "Araç fotoğrafları ayrıştırılıyor"],
  normalizing: ["İlan bilgileri düzenleniyor", "Eksik alanlar açıklamadan tamamlanıyor", "Rapor için kronik sorunlar eşleştiriliyor"],
};

const errorMessages: Record<string, string> = {
  "invalid-url": "Bu bağlantı desteklenmiyor. Desteklenen ilan sitelerinden birinin bağlantısını yapıştırın.",
  "unsupported-platform": "İlan linkiyle otomatik doldurma yalnızca mobil uygulamada kullanılabilir.",
  "fetch-failed":
    "İlan sayfası açılamadı. Bağlantı kaldırılmış, geçici olarak engellenmiş veya ağ zayıf olabilir; tekrar deneyin.",
  blocked:
    "Bu ilan sayfası güvenlik doğrulaması veya site engeli nedeniyle otomatik alınamadı. Aynı linki birazdan tekrar deneyin; devam ederse manuel analiz kullanın.",
  "ai-failed":
    "İlan metni alındı ama araç bilgisine çevrilemedi. Birazdan tekrar deneyin; aynı hata sürerse manuel analizle rapor oluşturabilirsiniz.",
  "rate-limited": "Çok fazla içe aktarma denemesi yapıldı. Birazdan tekrar deneyin.",
};

export function ListingImportSection({
  onAnalyzeImported,
}: {
  onAnalyzeImported?: (result: ListingImportResult, rawUrl: string) => void;
}) {
  const { url, status, stage, stageStartedAt, errorMessage, errorDetail, result } = useImportSession();
  const [consent, setConsent] = useState(() => hasAcceptedAiConsent());
  const [showConsentPrompt] = useState(() => !hasAcceptedAiConsent());
  const [notificationMessage, setNotificationMessage] = useState("");
  const appliedResultRef = useRef<typeof result>(null);

  // Ticks while loading so the eased percentage below keeps creeping up
  // between real stage-change events, instead of sitting frozen at a fixed
  // per-stage value for however long that stage takes.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (status !== "loading") return;
    const interval = window.setInterval(() => setNow(Date.now()), 400);
    return () => window.clearInterval(interval);
  }, [status]);

  // Re-applies the last successful import's fields whenever this section (re)mounts —
  // covers the case where the import finished natively while the user was on another
  // tab, so the freshly mounted form still picks up the result once they come back.
  useEffect(() => {
    if (status === "success" && result && appliedResultRef.current !== result) {
      appliedResultRef.current = result;
    }
  }, [status, result]);

  if (!isListingImportEnabled || !Capacitor.isNativePlatform()) return null;

  async function handlePaste() {
    try {
      // The web Clipboard API (navigator.clipboard.readText()) always
      // triggers iOS's "Would Like to Paste" confirmation banner inside a
      // WKWebView, even right after a tap on this very button — WebKit
      // treats web content as untrusted for cross-app paste regardless of
      // gesture timing. The native Capacitor plugin reads UIPasteboard
      // directly from Swift, which iOS credits as the same user gesture
      // that triggered it and pastes immediately, no extra confirmation.
      const { value } = await Clipboard.read();
      if (value) setImportSession({ url: value.trim() });
    } catch {
      // Clipboard read can be denied by the OS — user can still paste manually.
    }
  }

  async function handleImport() {
    const currentUrl = getImportSession().url;
    if (!currentUrl.trim()) return;
    if (!consent) {
      setImportSession({
        status: "error",
        errorMessage:
          "İlan sayfası içeriğinin üçüncü taraf bir AI sağlayıcısına gönderilmesini onaylamadan devam edilemez.",
      });
      return;
    }

    setImportSession({
      status: "loading",
      errorMessage: "",
      errorDetail: "",
      result: null,
      stage: "checking-url",
      stageStartedAt: new Date().toISOString(),
    });
    setNotificationMessage("");

    prepareListingImportNotifications()
      .then((permission) => {
        if (permission === "denied") {
          setNotificationMessage(
            "Bildirim izni kapalı. İlan analizi devam eder; ancak uygulama arka plandayken biterse bildirim gönderilemeyebilir.",
          );
        }
      })
      .catch(() => {
        setNotificationMessage("");
      });

    // Whatever importListingFromUrl does internally, this call must always
    // end in a terminal UI state — an uncaught rejection here (from the
    // native bridge or anything else) previously left the progress bar
    // frozen forever with no error shown, since nothing was listening for
    // the throw. That was the actual production hang, not a slow network.
    try {
      const outcome = await importListingFromUrl(currentUrl, (nextStage) =>
        setImportSession({ stage: nextStage, stageStartedAt: new Date().toISOString() }),
      );

      if (!outcome.ok) {
        setImportSession({
          status: "error",
          errorMessage: errorMessages[outcome.reason] ?? errorMessages["ai-failed"],
          errorDetail: "detail" in outcome ? (outcome.detail ?? "") : "",
          stage: null,
        });
        return;
      }

      setImportSession({ status: "success", result: outcome.result, stage: null });
      onAnalyzeImported?.(outcome.result, currentUrl);
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      setImportSession({
        status: "error",
        errorMessage: errorMessages["ai-failed"],
        errorDetail: detail,
        stage: null,
      });
    }
  }

  function handleClear() {
    setImportSession({ url: "", status: "idle", result: null, errorMessage: "", errorDetail: "", stage: null });
  }

  const progressPercent = computeDisplayPercent(stage, stageStartedAt, now);
  const loadingDetail =
    status === "loading" && stage && stage !== "done"
      ? loadingDetails[stage][Math.floor(now / 2200) % loadingDetails[stage].length]
      : "";

  return (
    <section
      className="rounded-theme border border-accent/20 bg-card p-4 shadow-sm"
      aria-labelledby="listing-import-title"
    >
      <div className="flex items-center gap-2">
        <LinkIcon aria-hidden="true" className="h-5 w-5 text-accent" />
        <h2 id="listing-import-title" className="font-semibold text-foreground">
          İlan linkiyle analiz et
        </h2>
      </div>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">
        Bir araç ilanının bağlantısını yapıştırın; EksperIQ bilgileri ve fotoğrafları çekip tek seferde rapor oluşturur.
      </p>

      {showConsentPrompt ? (
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
            İlan sayfasından çıkarılan metnin üçüncü taraf bir AI sağlayıcısına geçici olarak gönderileceğini anladım ve
            onaylıyorum.
          </span>
        </label>
      ) : null}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <div className="flex-1">
          <Field
            id="listing-import-url"
            label=""
            aria-label="Araç ilanı bağlantısı"
            placeholder="Araç ilanı bağlantısını yapıştırın"
            value={url}
            onChange={(event) => setImportSession({ url: event.target.value })}
            disabled={status === "loading"}
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handlePaste}
            disabled={status === "loading"}
            className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-full border border-border px-4 text-sm font-semibold text-foreground/90 disabled:opacity-50"
          >
            <ClipboardPaste aria-hidden="true" className="h-4 w-4" />
            Yapıştır
          </button>
          {url ? (
            <button
              type="button"
              onClick={handleClear}
              disabled={status === "loading"}
              aria-label="Bağlantıyı temizle"
              className="inline-flex min-h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border text-foreground/90 disabled:opacity-50"
            >
              <X aria-hidden="true" className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>

      <button
        type="button"
        onClick={handleImport}
        disabled={!url.trim() || status === "loading"}
        className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        {status === "loading" ? <Spinner /> : <LinkIcon aria-hidden="true" className="h-4 w-4" />}
        {status === "loading" && stage ? `${stageLabels[stage]} (%${progressPercent})` : "İlanı analiz et"}
      </button>

      {status === "loading" && stage ? (
        <div className="mt-3">
          <div className="h-1.5 rounded-full bg-muted" aria-hidden="true">
            <div
              className="h-1.5 rounded-full bg-accent transition-[width] duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {loadingDetail ? (
            <div className="mt-2 flex items-center gap-2 text-xs font-medium text-foreground/80" role="status">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              {loadingDetail}
            </div>
          ) : null}
          <p className="mt-2 text-xs text-muted-foreground">Bu işlem 1-5 dakika içinde gerçekleşecektir.</p>
          {notificationMessage ? <p className="mt-2 text-xs text-warning">{notificationMessage}</p> : null}
        </div>
      ) : null}

      {status === "error" && errorMessage ? (
        <div className="mt-3 rounded-theme-sm border border-destructive/30 bg-destructive/10 px-3 py-2" role="status">
          <p className="text-sm font-medium text-destructive">{errorMessage}</p>
          {errorDetail ? <p className="mt-1 text-xs text-destructive/70">Teknik detay: {errorDetail}</p> : null}
        </div>
      ) : null}

      {status === "success" && result ? (
        <div className="mt-3 rounded-theme-sm border border-accent/30 bg-accent/10 p-3" role="status">
          <p className="text-sm font-semibold text-foreground">
            {result.missingFields.length > 5
              ? "İlanın bazı bilgileri alınamadı. EksperIQ yine de bulunan bilgilerle rapor hazırlamayı deneyecek."
              : "İlan bilgileri getirildi. Analiz raporu oluşturuluyor."}
          </p>
          {result.warnings.length ? (
            <ul className="mt-2 grid gap-1 text-sm text-warning">
              {result.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          ) : null}
          {result.lowConfidenceFields.length ? (
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              Düşük güvenle dolduruldu: {result.lowConfidenceFields.join(", ")}
            </p>
          ) : null}
          {result.images.length ? (
            <div className="mt-3">
              <p className="text-xs font-semibold text-foreground/80">
                İlandan alınan fotoğraflar ({Math.min(result.images.length, 8)})
              </p>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {result.images.slice(0, 8).map((imageUrl) => (
                  <a
                    key={imageUrl}
                    href={imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block aspect-square overflow-hidden rounded-theme-sm border border-border bg-muted"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- External listing CDNs are not known at build time. */}
                    <img src={imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
                  </a>
                ))}
              </div>
            </div>
          ) : null}
          {result.missingFields.length ? (
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Bulunamadı: {result.missingFields.join(", ")}
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
