"use client";

import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ClipboardCheck } from "lucide-react";
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
  { name: "price", label: "İlan fiyatı" },
  { name: "city", label: "Şehir" },
  { name: "sellerDescription", label: "İlan açıklaması" },
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
  { name: "listingUrl", label: "İlan bağlantısı" },
];

const formSections = [
  { href: "#vehicle-info", label: "Araç" },
  { href: "#damage-info", label: "Hasar" },
  { href: "#maintenance-info", label: "Bakım" },
  { href: "#control-options", label: "Kontroller" },
  { href: "#seller-description", label: "Açıklama" },
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
      className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
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

function FormSectionLinks() {
  return (
    <nav className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm" aria-label="Analiz formu bölümleri">
      <div className="flex flex-wrap gap-2">
        {formSections.map((section) => (
          <a
            key={section.href}
            href={section.href}
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-800 hover:border-teal-700 hover:text-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 sm:flex-none sm:px-4"
          >
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
    <form className="grid gap-6" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="rounded-lg border border-teal-200 bg-teal-50 p-4 text-sm leading-6 text-teal-950">
        {appConfig.privacy}
      </div>
      <FormProgress values={progressValues} />
      <FormSectionLinks />
      <VehicleInfoSection register={register} errors={errors} />
      <DamageInfoSection register={register} errors={errors} />
      <MaintenanceInfoSection register={register} errors={errors} />
      <BooleanInfoSection register={register} errors={errors} />
      <SellerDescriptionSection register={register} errors={errors} />
      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-slate-950 px-6 py-3 font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
      >
        <ClipboardCheck aria-hidden="true" className="h-5 w-5" />
        Analiz oluştur
      </button>
    </form>
  );
}
