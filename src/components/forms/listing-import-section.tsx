"use client";

import { useState } from "react";
import type { UseFormSetValue } from "react-hook-form";
import { Capacitor } from "@capacitor/core";
import { ClipboardPaste, LinkIcon, X } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Field } from "@/components/ui/field";
import type { VehicleFormInput } from "@/lib/schemas/vehicle";
import { detectListingSource } from "@/lib/listing-import/url";
import { importListingFromUrl, type ImportStage } from "@/lib/listing-import/import-listing";
import { applyImportedFieldsToForm } from "@/lib/listing-import/apply-to-form";
import type { ListingImportResult } from "@/lib/listing-import/types";
import { acceptAiConsent, hasAcceptedAiConsent } from "@/lib/consent/ai-consent";

const isListingImportEnabled = process.env.NEXT_PUBLIC_LISTING_IMPORT_ENABLED === "true";

const stageLabels: Record<ImportStage, string> = {
  "checking-url": "Bağlantı kontrol ediliyor",
  "opening-page": "İlan sayfası açılıyor",
  extracting: "Araç bilgileri çıkarılıyor",
  normalizing: "Bilgiler düzenleniyor",
  done: "İlan bilgileri hazır",
};

const stageOrder: ImportStage[] = ["checking-url", "opening-page", "extracting", "normalizing", "done"];

const errorMessages: Record<string, string> = {
  "invalid-url":
    "Bu bağlantı desteklenmiyor. Şu an yalnızca sahibinden.com ve arabam.com ilan bağlantıları desteklenir.",
  "unsupported-platform": "İlan linkiyle otomatik doldurma yalnızca mobil uygulamada kullanılabilir.",
  "fetch-failed": "İlan sayfası açılamadı. Bağlantıyı kontrol edip tekrar deneyin.",
  blocked: "Bu ilan otomatik olarak alınamadı. Ekran görüntüsü, ekspertiz raporu veya manuel girişle devam edebilirsiniz.",
  "ai-failed": "İlan bilgileri işlenemedi. Birazdan tekrar deneyin veya manuel doldurun.",
  "rate-limited": "Çok fazla içe aktarma denemesi yapıldı. Birazdan tekrar deneyin.",
};

export function ListingImportSection({ setValue }: { setValue: UseFormSetValue<VehicleFormInput> }) {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [stage, setStage] = useState<ImportStage | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState<ListingImportResult | null>(null);
  const [consent, setConsent] = useState(() => hasAcceptedAiConsent());
  const [showConsentPrompt] = useState(() => !hasAcceptedAiConsent());

  if (!isListingImportEnabled || !Capacitor.isNativePlatform()) return null;

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setUrl(text.trim());
    } catch {
      // Clipboard read can be denied by the OS — user can still paste manually.
    }
  }

  async function handleImport() {
    if (!url.trim()) return;
    if (!consent) {
      setStatus("error");
      setErrorMessage("İlan sayfası içeriğinin üçüncü taraf bir AI sağlayıcısına gönderilmesini onaylamadan devam edilemez.");
      return;
    }

    setStatus("loading");
    setErrorMessage("");
    setResult(null);
    setStage("checking-url");

    const outcome = await importListingFromUrl(url, (nextStage) => setStage(nextStage));

    if (!outcome.ok) {
      setStatus("error");
      setErrorMessage(errorMessages[outcome.reason] ?? errorMessages["ai-failed"]);
      setStage(null);
      return;
    }

    applyImportedFieldsToForm(outcome.result.fields, setValue);
    const detected = detectListingSource(url);
    setValue("listingUrl", detected.ok ? detected.url : url.trim(), { shouldDirty: true, shouldValidate: true });

    setResult(outcome.result);
    setStatus("success");
    setStage(null);
  }

  function handleClear() {
    setUrl("");
    setStatus("idle");
    setResult(null);
    setErrorMessage("");
    setStage(null);
  }

  const stageIndex = stage ? stageOrder.indexOf(stage) : -1;

  return (
    <section className="rounded-theme border border-accent/20 bg-card p-4 shadow-sm" aria-labelledby="listing-import-title">
      <div className="flex items-center gap-2">
        <LinkIcon aria-hidden="true" className="h-5 w-5 text-accent" />
        <h2 id="listing-import-title" className="font-semibold text-foreground">
          İlan linkiyle otomatik doldur
        </h2>
      </div>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">
        Sahibinden veya Arabam ilanının bağlantısını yapıştırın; araç bilgileri otomatik doldurulsun.
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
            İlan sayfasından çıkarılan metnin üçüncü taraf bir AI sağlayıcısına geçici olarak gönderileceğini anladım
            ve onaylıyorum.
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
            onChange={(event) => setUrl(event.target.value)}
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
        {status === "loading" && stage ? stageLabels[stage] : "İlanı getir"}
      </button>

      {status === "loading" && stageIndex >= 0 ? (
        <div className="mt-3 h-1.5 rounded-full bg-muted" aria-hidden="true">
          <div
            className="h-1.5 rounded-full bg-accent transition-[width] duration-300"
            style={{ width: `${((stageIndex + 1) / stageOrder.length) * 100}%` }}
          />
        </div>
      ) : null}

      {status === "error" && errorMessage ? (
        <p className="mt-3 rounded-theme-sm border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive" role="status">
          {errorMessage}
        </p>
      ) : null}

      {status === "success" && result ? (
        <div className="mt-3 rounded-theme-sm border border-accent/30 bg-accent/10 p-3" role="status">
          <p className="text-sm font-semibold text-foreground">
            {result.missingFields.length > 5
              ? "İlanın bazı bilgileri alınamadı. Bulunan alanlar dolduruldu; eksik alanları elle tamamlayabilirsiniz."
              : "İlan bilgileri getirildi. Analizden önce işaretli alanları kontrol edin."}
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
