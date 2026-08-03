"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, ClipboardCheck, FileSearch, FileText, ShieldCheck, Wrench } from "lucide-react";
import { saveAnalysis } from "@/lib/storage/analysis-storage";
import { vehicleSchema, type VehicleFormData, type VehicleFormInput } from "@/lib/schemas/vehicle";
import { createAnalysis } from "@/lib/services/analysis-service";
import { appConfig } from "@/lib/constants/app";
import {
  BooleanInfoSection,
  DamageInfoSection,
  MaintenanceInfoSection,
  SellerDescriptionSection,
  VehicleInfoSection,
} from "@/components/forms/analysis-form-sections";

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

function FormProgress({ values }: { values: Partial<Record<ProgressField, unknown>> }) {
  const requiredCompleted = requiredProgressFields.filter((field) => isFilled(values[field.name])).length;
  const detailsCompleted = detailProgressFields.filter((field) => isFilled(values[field.name])).length;
  const requiredPercent = progressPercent(requiredCompleted, requiredProgressFields.length);
  const detailsPercent = progressPercent(detailsCompleted, detailProgressFields.length);
  const missingRequired = requiredProgressFields.filter((field) => !isFilled(values[field.name])).slice(0, 4);

  return (
    <section
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      aria-labelledby="form-progress-title"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 id="form-progress-title" className="text-lg font-semibold text-slate-950">
            Form ilerlemesi
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Zorunlu alanlar tamamlandığında analiz oluşturabilirsiniz; detaylar raporun kalitesini artırır.
          </p>
        </div>
        <strong
          className="text-sm text-slate-950"
          aria-label={`Zorunlu alanlar ${requiredCompleted} / ${requiredProgressFields.length}`}
        >
          {requiredCompleted} / {requiredProgressFields.length} zorunlu
        </strong>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-medium text-slate-800">Zorunlu alanlar</span>
            <span className="text-slate-700">{requiredPercent}%</span>
          </div>
          <div
            className="mt-2 h-2 rounded-full bg-slate-100"
            role="progressbar"
            aria-label="Zorunlu alan ilerlemesi"
            aria-valuemin={0}
            aria-valuemax={requiredProgressFields.length}
            aria-valuenow={requiredCompleted}
          >
            <div className="h-2 rounded-full bg-teal-700" style={{ width: `${requiredPercent}%` }} />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-medium text-slate-800">Detay alanları</span>
            <span className="text-slate-700">{detailsPercent}%</span>
          </div>
          <div
            className="mt-2 h-2 rounded-full bg-slate-100"
            role="progressbar"
            aria-label="Detay alan ilerlemesi"
            aria-valuemin={0}
            aria-valuemax={detailProgressFields.length}
            aria-valuenow={detailsCompleted}
          >
            <div className="h-2 rounded-full bg-amber-500" style={{ width: `${detailsPercent}%` }} />
          </div>
        </div>
      </div>
      {missingRequired.length ? (
        <p className="mt-4 text-sm leading-6 text-slate-700">
          Eksik zorunlu alanlar: {missingRequired.map((field) => field.label).join(", ")}
          {requiredProgressFields.length - requiredCompleted > missingRequired.length ? "..." : ""}
        </p>
      ) : (
        <p className="mt-4 text-sm font-medium text-teal-800">Zorunlu alanlar tamamlandı.</p>
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
      stat: "Analiz et",
    },
  ] as const;

  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Analiz adımları">
      {steps.map((step, index) => {
        const Icon = step.icon;
        return (
          <article key={step.title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-sky-50 text-sm font-semibold text-slate-900">
                {index + 1}
              </span>
              <Icon aria-hidden="true" className="h-5 w-5 text-teal-700" />
            </div>
            <h2 className="mt-4 text-base font-semibold text-slate-950">{step.title}</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">{step.description}</p>
            <p className="mt-3 text-sm font-semibold text-slate-700">{step.stat}</p>
          </article>
        );
      })}
    </section>
  );
}

function FormSectionLinks() {
  return (
    <nav
      className="max-w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
      aria-label="Analiz formu bölümleri"
    >
      <div className="flex gap-2 overflow-x-auto pb-1">
        {formSections.map((section) => (
          <a
            key={section.href}
            href={section.href}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-slate-200 px-3 text-sm font-semibold text-slate-800 hover:border-teal-700 hover:text-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 sm:px-4"
          >
            <span className="grid h-6 w-6 place-items-center rounded-full bg-slate-100 text-xs text-slate-700">
              {section.step}
            </span>
            {section.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

export function AnalysisForm() {
  const router = useRouter();
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
    router.push("/sonuc");
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
      <div className="rounded-2xl border border-teal-200 bg-teal-50 p-4 text-sm leading-6 text-teal-950">
        {appConfig.privacy}
      </div>
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" aria-labelledby="analysis-start">
        <h2 id="analysis-start" className="font-semibold text-slate-950">
          Analiz için araç bilgilerini doldurun
        </h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          Link gerekmez. Araç almadan önce bildiğiniz bilgileri seçin; eksik kalanlar raporda satıcıya sorulacak bilgi
          olarak yer alır.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Link
            href="/fotograf-hasar"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-slate-200 px-4 text-sm font-semibold text-slate-900 hover:border-teal-700"
          >
            <Camera aria-hidden="true" className="h-4 w-4" />
            Fotoğrafla hasar notu
          </Link>
          <Link
            href="/ekspertiz-raporu"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-slate-200 px-4 text-sm font-semibold text-slate-900 hover:border-teal-700"
          >
            <FileSearch aria-hidden="true" className="h-4 w-4" />
            Ekspertiz raporu ekle
          </Link>
        </div>
      </section>
      <FormStepOverview values={progressValues} />
      <FormProgress values={progressValues} />
      <FormSectionLinks />
      <VehicleInfoSection register={register} errors={errors} setValue={setValue} watch={watch} />
      <DamageInfoSection register={register} errors={errors} setValue={setValue} watch={watch} />
      <MaintenanceInfoSection register={register} errors={errors} />
      <BooleanInfoSection register={register} errors={errors} />
      <SellerDescriptionSection register={register} errors={errors} />
      <button
        type="button"
        onClick={() => void handleSubmit(onSubmit)()}
        disabled={isSubmitting}
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3 font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
      >
        <ClipboardCheck aria-hidden="true" className="h-5 w-5" />
        Analiz oluştur
      </button>
    </form>
  );
}
