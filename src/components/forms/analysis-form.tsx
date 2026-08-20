"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, ClipboardCheck, FileText, ShieldCheck, Wrench } from "lucide-react";
import { saveAnalysis } from "@/lib/storage/analysis-storage";
import { recordListingAnalysisUsed } from "@/lib/pro/listing-quota";
import { vehicleSchema, type VehicleFormData, type VehicleFormInput } from "@/lib/schemas/vehicle";
import { createAnalysis } from "@/lib/services/analysis-service";
import { appConfig } from "@/lib/constants/app";
import { buildVehicleInputFromListingImport } from "@/lib/listing-import/analysis-input";
import { detectListingSource } from "@/lib/listing-import/url";
import { useImportSession } from "@/lib/listing-import/import-session-store";
import {
  BooleanInfoSection,
  DamageInfoSection,
  MaintenanceInfoSection,
  SellerDescriptionSection,
  VehicleInfoSection,
} from "@/components/forms/analysis-form-sections";
import { ListingImportSection } from "@/components/forms/listing-import-section";

type ProgressField = keyof VehicleFormInput;

const requiredProgressFields: Array<{ name: ProgressField; label: string }> = [
  { name: "brand", label: "Marka" },
  { name: "model", label: "Model" },
  { name: "year", label: "Model yılı" },
  { name: "fuelType", label: "Yakıt türü" },
  { name: "transmission", label: "Vites türü" },
  { name: "mileage", label: "Kilometre" },
  { name: "price", label: "İstenen fiyat" },
  { name: "city", label: "Şehir" },
  { name: "sellerDescription", label: "Satıcı açıklaması" },
];

const detailProgressFields: Array<{ name: ProgressField; label: string }> = [
  { name: "trim", label: "Paket" },
  { name: "bodyType", label: "Kasa tipi" },
  { name: "engineSize", label: "Motor hacmi" },
  { name: "enginePower", label: "Motor gücü" },
  { name: "drivetrain", label: "Çekiş tipi" },
  { name: "ownerInfo", label: "Ruhsat sahibi" },
  { name: "tradeStatus", label: "Takas durumu" },
  { name: "paintedParts", label: "Boyalı parçalar" },
  { name: "replacedParts", label: "Değişen parçalar" },
  { name: "localPaintedParts", label: "Lokal boya" },
  { name: "airbagStatus", label: "Airbag" },
  { name: "lastMaintenanceDate", label: "Son bakım" },
  { name: "timingBeltInfo", label: "Triger" },
  { name: "transmissionMaintenanceInfo", label: "Şanzıman" },
  { name: "batteryStatus", label: "Akü" },
  { name: "tireStatus", label: "Lastik" },
  { name: "inspectionEndDate", label: "Muayene" },
  { name: "lpgStatus", label: "LPG" },
];

const formSections = [
  { href: "#vehicle-info", label: "Araç", step: "1" },
  { href: "#damage-info", label: "Hasar", step: "2" },
  { href: "#maintenance-info", label: "Bakım", step: "3" },
  { href: "#control-options", label: "Kontroller", step: "4" },
  { href: "#seller-description", label: "Açıklama", step: "5" },
] as const;

function isFilled(value: unknown): boolean {
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return Number.isFinite(value) && value > 0;
  if (typeof value === "boolean") return value;
  return false;
}

function progressPercent(completed: number, total: number): number {
  return total > 0 ? Math.round((completed / total) * 100) : 0;
}

const RING_RADIUS = 16;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function FormProgress({ values }: { values: Partial<Record<ProgressField, unknown>> }) {
  const requiredCompleted = requiredProgressFields.filter((field) => isFilled(values[field.name])).length;
  const detailsCompleted = detailProgressFields.filter((field) => isFilled(values[field.name])).length;
  const requiredPercent = progressPercent(requiredCompleted, requiredProgressFields.length);
  const detailsPercent = progressPercent(detailsCompleted, detailProgressFields.length);
  const missingRequired = requiredProgressFields.filter((field) => !isFilled(values[field.name])).slice(0, 4);
  const ringOffset = RING_CIRCUMFERENCE - (requiredPercent / 100) * RING_CIRCUMFERENCE;

  return (
    <section className="rounded-theme border border-border bg-card p-4 shadow-sm" aria-labelledby="form-progress-title">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 id="form-progress-title" className="text-lg font-semibold text-foreground">
            Form ilerlemesi
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Zorunlu alanlar tamamlandığında analiz oluşturabilirsiniz; detaylar raporun kalitesini artırır.
          </p>
        </div>
        <strong
          className="text-sm text-foreground"
          aria-label={`Zorunlu alanlar ${requiredCompleted} / ${requiredProgressFields.length}`}
        >
          {requiredCompleted} / {requiredProgressFields.length} zorunlu
        </strong>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
        <div
          className="relative mx-auto h-24 w-24 shrink-0 sm:mx-0"
          role="progressbar"
          aria-label="Zorunlu alan ilerlemesi"
          aria-valuemin={0}
          aria-valuemax={requiredProgressFields.length}
          aria-valuenow={requiredCompleted}
        >
          <svg viewBox="0 0 40 40" className="h-24 w-24 -rotate-90">
            <circle cx="20" cy="20" r={RING_RADIUS} fill="none" strokeWidth="4" className="stroke-muted" />
            <circle
              cx="20"
              cy="20"
              r={RING_RADIUS}
              fill="none"
              strokeWidth="4"
              strokeLinecap="round"
              className="stroke-accent transition-[stroke-dashoffset] duration-500"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={ringOffset}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <span className="text-lg font-bold text-foreground">{requiredPercent}%</span>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-medium text-foreground/90">Detay alanları</span>
            <span className="text-foreground/80">{detailsPercent}%</span>
          </div>
          <div
            className="mt-2 h-2 rounded-full bg-muted"
            role="progressbar"
            aria-label="Detay alan ilerlemesi"
            aria-valuemin={0}
            aria-valuemax={detailProgressFields.length}
            aria-valuenow={detailsCompleted}
          >
            <div
              className="h-2 rounded-full bg-warning transition-[width] duration-500"
              style={{ width: `${detailsPercent}%` }}
            />
          </div>
        </div>
      </div>
      {missingRequired.length ? (
        <p className="mt-4 text-sm leading-6 text-foreground/80">
          Eksik zorunlu alanlar: {missingRequired.map((field) => field.label).join(", ")}
          {requiredProgressFields.length - requiredCompleted > missingRequired.length ? "..." : ""}
        </p>
      ) : (
        <p className="mt-4 text-sm font-medium text-accent">Zorunlu alanlar tamamlandı.</p>
      )}
    </section>
  );
}

function FormStepOverview({ values }: { values: Partial<Record<ProgressField, unknown>> }) {
  const requiredCompleted = requiredProgressFields.filter((field) => isFilled(values[field.name])).length;
  const detailsCompleted = detailProgressFields.filter((field) => isFilled(values[field.name])).length;

  const steps = [
    {
      title: "Araç bilgileri",
      description: "Marka, model, yıl, km ve fiyat.",
      icon: FileText,
      stat: `${requiredCompleted}/${requiredProgressFields.length}`,
    },
    {
      title: "Fotoğraf",
      description: "Çizik veya hasar notu ayrı ekranda.",
      icon: Camera,
      stat: "Opsiyonel",
    },
    {
      title: "Risk kayıtları",
      description: "Hasar, bakım ve evrak iddiaları.",
      icon: ShieldCheck,
      stat: `${detailsCompleted} detay`,
    },
    {
      title: "Ekspertiz hazırlığı",
      description: "Sorular ve kontrol listesi üretilir.",
      icon: Wrench,
      stat: "Formu bitirince otomatik",
    },
  ] as const;

  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Analiz adımları">
      {steps.map((step, index) => {
        const Icon = step.icon;
        return (
          <article key={step.title} className="rounded-theme border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-sm font-semibold text-foreground">
                {index + 1}
              </span>
              <Icon aria-hidden="true" className="h-5 w-5 text-accent" />
            </div>
            <h2 className="mt-4 text-base font-semibold text-foreground">{step.title}</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{step.description}</p>
            <p className="mt-3 text-sm font-semibold text-foreground/80">{step.stat}</p>
          </article>
        );
      })}
    </section>
  );
}

function FormSectionLinks() {
  const [activeHref, setActiveHref] = useState<string>(formSections[0].href);

  useEffect(() => {
    const elements = formSections
      .map((section) => document.getElementById(section.href.slice(1)))
      .filter((element): element is HTMLElement => element !== null);
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveHref(`#${visible[0].target.id}`);
      },
      { rootMargin: "-96px 0px -70% 0px", threshold: 0 },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      className="sticky top-16 z-10 max-w-full overflow-hidden rounded-theme border border-border bg-card/95 p-3 shadow-sm backdrop-blur"
      aria-label="Analiz formu bölümleri"
    >
      <div className="flex gap-2 overflow-x-auto pb-1">
        {formSections.map((section) => {
          const isActive = section.href === activeHref;
          return (
            <a
              key={section.href}
              href={section.href}
              aria-current={isActive ? "step" : undefined}
              className={`inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full transition active:scale-95 border px-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:px-4 ${
                isActive
                  ? "border-accent bg-accent text-primary-foreground"
                  : "border-border text-foreground/90 hover:border-accent hover:text-accent "
              }`}
            >
              <span
                className={`grid h-6 w-6 place-items-center rounded-full text-xs ${
                  isActive ? "bg-card/20 text-primary-foreground" : "bg-muted text-foreground/80 "
                }`}
              >
                {section.step}
              </span>
              {section.label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}

export function AnalysisForm() {
  const router = useRouter();
  const importSession = useImportSession();
  const [listingSubmitError, setListingSubmitError] = useState("");
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<VehicleFormInput, unknown, VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      fuelType: "",
      transmission: "",
      tramerAmount: 0,
      hasHeavyDamage: false,
      hasChassisRepair: false,
      hasTotalLossHistory: false,
      hasExpertiseReport: false,
      lpgRegistered: false,
      hasSpareKey: false,
      hasMaintenanceInvoices: false,
      listingUrl: "",
    },
  });
  const progressValues = useWatch({ control }) as Partial<Record<ProgressField, unknown>>;

  function onSubmit(values: VehicleFormData) {
    const parsed = vehicleSchema.parse(values);
    saveAnalysis(createAnalysis(parsed));
    recordListingAnalysisUsed();
    router.push("/sonuc");
  }

  function submitImportedAnalysis(): boolean {
    if (importSession.status !== "success" || !importSession.result) return false;
    const detected = detectListingSource(importSession.url);
    const listingUrl = detected.ok ? detected.url : importSession.url.trim();
    const imported = buildVehicleInputFromListingImport(importSession.result, listingUrl);

    if (!imported.ok) {
      setListingSubmitError(
        `İlandan rapor oluşturmak için yeterli çekirdek bilgi alınamadı: ${imported.missingFields.join(", ")}.`,
      );
      return true;
    }

    const analysis = createAnalysis(imported.data);
    saveAnalysis({ ...analysis, listingImages: imported.images });
    recordListingAnalysisUsed();
    router.push("/sonuc");
    return true;
  }

  function handlePrimarySubmit() {
    setListingSubmitError("");
    if (submitImportedAnalysis()) return;
    void handleSubmit(onSubmit)();
  }

  return (
    <form
      className="grid gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        void handleSubmit(onSubmit)(event);
      }}
      noValidate
    >
      <section className="rounded-theme border border-border bg-card p-4 shadow-sm" aria-labelledby="analysis-start">
        <h2 id="analysis-start" className="font-semibold text-foreground">
          Analiz için araç bilgilerini doldurun
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          İlan linkiyle otomatik doldurabilir veya bildiğiniz bilgileri kendiniz girebilirsiniz. Eksik bilgiler raporda
          satıcıya sorulacak noktalar olarak gösterilir.
        </p>
        <p className="mt-4 text-xs leading-5 text-muted-foreground">{appConfig.privacy}</p>
      </section>
      <ListingImportSection />
      {listingSubmitError ? (
        <div className="rounded-theme-sm border border-destructive/30 bg-destructive/10 px-3 py-2" role="status">
          <p className="text-sm font-medium text-destructive">{listingSubmitError}</p>
        </div>
      ) : null}
      <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <span className="h-px flex-1 bg-border" aria-hidden="true" />
        veya bilgileri kendiniz girin
        <span className="h-px flex-1 bg-border" aria-hidden="true" />
      </div>
      <FormStepOverview values={progressValues} />
      <FormProgress values={progressValues} />
      <FormSectionLinks />
      <VehicleInfoSection register={register} errors={errors} setValue={setValue} watch={watch} />
      <DamageInfoSection register={register} errors={errors} setValue={setValue} watch={watch} />
      <MaintenanceInfoSection register={register} errors={errors} />
      <BooleanInfoSection register={register} errors={errors} />
      <SellerDescriptionSection register={register} errors={errors} />
      <div className="fixed inset-x-0 bottom-24 z-30 border-t border-border bg-card/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur sm:static sm:inset-auto sm:z-auto sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none sm:backdrop-blur-none sm:dark:bg-transparent">
        <button
          type="button"
          onClick={handlePrimarySubmit}
          disabled={isSubmitting}
          className="mx-auto flex min-h-12 w-full max-w-md items-center justify-center gap-2 rounded-full transition active:scale-95 bg-primary px-6 py-3 font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60 sm:w-auto"
        >
          <ClipboardCheck aria-hidden="true" className="h-5 w-5" />
          Analiz oluştur
        </button>
      </div>
    </form>
  );
}
