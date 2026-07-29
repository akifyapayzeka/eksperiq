import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { Field, SelectField, TextareaField } from "@/components/ui/field";
import { SectionCard } from "@/components/ui/section-card";
import type { VehicleFormInput } from "@/lib/schemas/vehicle";

type SectionProps = {
  register: UseFormRegister<VehicleFormInput>;
  errors: FieldErrors<VehicleFormInput>;
};

type CheckboxName =
  | "hasHeavyDamage"
  | "hasChassisRepair"
  | "hasTotalLossHistory"
  | "hasExpertiseReport"
  | "lpgRegistered"
  | "hasSpareKey"
  | "hasMaintenanceInvoices";

const fuelTypes = ["Benzin", "Dizel", "Hibrit", "Elektrik", "LPG"];
const transmissions = ["Manuel", "Otomatik", "Yarı otomatik"];
const booleanFields: Array<{ name: CheckboxName; label: string }> = [
  { name: "hasHeavyDamage", label: "Ağır hasar kaydı var" },
  { name: "hasChassisRepair", label: "Şasi veya podye işlemi var" },
  { name: "hasTotalLossHistory", label: "Pert geçmişi var" },
  { name: "hasExpertiseReport", label: "Ekspertiz raporu var" },
  { name: "lpgRegistered", label: "LPG ruhsata işli" },
  { name: "hasSpareKey", label: "Yedek anahtar var" },
  { name: "hasMaintenanceInvoices", label: "Bakım faturaları var" },
];

export function VehicleInfoSection({ register, errors }: SectionProps) {
  return (
    <SectionCard id="vehicle-info" title="Araç bilgileri" description="İlandaki temel araç bilgilerini manuel girin.">
      <div className="grid gap-4 md:grid-cols-2">
        <Field id="brand" label="Marka" {...register("brand")} error={errors.brand?.message} />
        <Field id="model" label="Model" {...register("model")} error={errors.model?.message} />
        <Field
          id="year"
          label="Model yılı"
          type="number"
          inputMode="numeric"
          {...register("year")}
          error={errors.year?.message}
        />
        <Field id="trim" label="Paket" {...register("trim")} />
        <SelectField
          id="fuelType"
          label="Yakıt türü"
          options={fuelTypes}
          {...register("fuelType")}
          error={errors.fuelType?.message}
        />
        <SelectField
          id="transmission"
          label="Vites türü"
          options={transmissions}
          {...register("transmission")}
          error={errors.transmission?.message}
        />
        <Field
          id="mileage"
          label="Kilometre"
          type="number"
          inputMode="numeric"
          {...register("mileage")}
          error={errors.mileage?.message}
        />
        <Field
          id="price"
          label="İlan fiyatı"
          type="number"
          inputMode="numeric"
          {...register("price")}
          error={errors.price?.message}
        />
        <Field id="city" label="Şehir" {...register("city")} error={errors.city?.message} />
        <Field id="bodyType" label="Kasa tipi" {...register("bodyType")} />
        <Field id="engineSize" label="Motor hacmi" {...register("engineSize")} />
        <Field id="enginePower" label="Motor gücü" {...register("enginePower")} />
        <Field id="drivetrain" label="Çekiş tipi" {...register("drivetrain")} />
        <Field id="ownerInfo" label="Ruhsat sahibi bilgisi" {...register("ownerInfo")} />
        <Field id="tradeStatus" label="Takas durumu" {...register("tradeStatus")} />
        <Field
          id="listingUrl"
          label="Opsiyonel ilan bağlantısı"
          {...register("listingUrl")}
          error={errors.listingUrl?.message}
        />
      </div>
    </SectionCard>
  );
}

export function DamageInfoSection({ register }: SectionProps) {
  return (
    <SectionCard id="damage-info" title="Hasar bilgileri">
      <div className="grid gap-4 md:grid-cols-2">
        <Field
          id="tramerAmount"
          label="Tramer tutarı"
          type="number"
          inputMode="numeric"
          {...register("tramerAmount")}
        />
        <Field id="paintedParts" label="Boyalı parçalar" {...register("paintedParts")} />
        <Field id="replacedParts" label="Değişen parçalar" {...register("replacedParts")} />
        <Field id="localPaintedParts" label="Lokal boyalı parçalar" {...register("localPaintedParts")} />
        <Field id="airbagStatus" label="Airbag durumu" {...register("airbagStatus")} />
      </div>
    </SectionCard>
  );
}

export function MaintenanceInfoSection({ register }: SectionProps) {
  return (
    <SectionCard id="maintenance-info" title="Bakım ve evrak bilgileri">
      <div className="grid gap-4 md:grid-cols-2">
        <Field id="lastMaintenanceDate" label="Son bakım tarihi" type="date" {...register("lastMaintenanceDate")} />
        <Field id="timingBeltInfo" label="Triger değişim bilgisi" {...register("timingBeltInfo")} />
        <Field
          id="transmissionMaintenanceInfo"
          label="Şanzıman bakım bilgisi"
          {...register("transmissionMaintenanceInfo")}
        />
        <Field id="batteryStatus" label="Akü durumu" {...register("batteryStatus")} />
        <Field id="tireStatus" label="Lastik durumu" {...register("tireStatus")} />
        <Field id="inspectionEndDate" label="Muayene bitiş tarihi" type="date" {...register("inspectionEndDate")} />
        <Field id="lpgStatus" label="LPG durumu" {...register("lpgStatus")} />
      </div>
    </SectionCard>
  );
}

export function BooleanInfoSection({ register }: SectionProps) {
  return (
    <SectionCard id="control-options" title="Kontrol seçenekleri">
      <div className="grid gap-3 md:grid-cols-2">
        {booleanFields.map((item) => (
          <label
            key={item.name}
            className="flex min-h-12 items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800"
          >
            <input
              type="checkbox"
              className="h-5 w-5 rounded border-slate-300 text-teal-700"
              {...register(item.name)}
            />
            {item.label}
          </label>
        ))}
      </div>
    </SectionCard>
  );
}

export function SellerDescriptionSection({ register, errors }: SectionProps) {
  return (
    <SectionCard id="seller-description" title="Satıcı açıklaması">
      <div className="grid gap-4 md:grid-cols-2">
        <TextareaField
          id="sellerDescription"
          label="İlan açıklaması"
          {...register("sellerDescription")}
          error={errors.sellerDescription?.message}
        />
      </div>
    </SectionCard>
  );
}
