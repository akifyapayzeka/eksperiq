import type { FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { Field, SelectField, TextareaField } from "@/components/ui/field";
import { SectionCard } from "@/components/ui/section-card";
import type { VehicleFormInput } from "@/lib/schemas/vehicle";
import { cn } from "@/lib/utils/cn";

type SectionProps = {
  register: UseFormRegister<VehicleFormInput>;
  errors: FieldErrors<VehicleFormInput>;
  setValue?: UseFormSetValue<VehicleFormInput>;
  watch?: UseFormWatch<VehicleFormInput>;
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
const brandOptions = [
  "Audi",
  "BMW",
  "BYD",
  "Chery",
  "Chevrolet",
  "Citroen",
  "Cupra",
  "Dacia",
  "Fiat",
  "Ford",
  "Honda",
  "Hyundai",
  "Jeep",
  "Kia",
  "Lexus",
  "Mazda",
  "Mercedes-Benz",
  "MG",
  "Mini",
  "Nissan",
  "Opel",
  "Peugeot",
  "Renault",
  "Seat",
  "Skoda",
  "Suzuki",
  "Tesla",
  "Toyota",
  "Volkswagen",
  "Volvo",
  "Diğer / listede yok",
];
const otherModelOption = "Diğer / listede yok";
const modelsByBrand: Record<string, string[]> = {
  Audi: ["A1", "A3", "A4", "A5", "A6", "A7", "A8", "Q2", "Q3", "Q5", "Q7", "Q8", "TT"],
  BMW: [
    "1 Serisi",
    "2 Serisi",
    "3 Serisi",
    "4 Serisi",
    "5 Serisi",
    "6 Serisi",
    "7 Serisi",
    "X1",
    "X2",
    "X3",
    "X4",
    "X5",
    "X6",
  ],
  BYD: ["Atto 3", "Dolphin", "Han", "Seal", "Song Plus", "Tang"],
  Chery: ["Tiggo 2", "Tiggo 4", "Tiggo 7", "Tiggo 8", "Tiggo 9"],
  Chevrolet: ["Aveo", "Captiva", "Cruze", "Epica", "Lacetti", "Malibu", "Spark", "Trax"],
  Citroen: ["Berlingo", "C-Elysée", "C3", "C4", "C4 Cactus", "C5", "C5 Aircross", "Jumpy"],
  Cupra: ["Ateca", "Born", "Formentor", "Leon"],
  Dacia: ["Dokker", "Duster", "Jogger", "Lodgy", "Logan", "Sandero", "Sandero Stepway", "Spring"],
  Fiat: ["500", "Doblo", "Egea", "Egea Cross", "Fiorino", "Linea", "Panda", "Punto", "Tipo"],
  Ford: [
    "B-Max",
    "C-Max",
    "Courier",
    "EcoSport",
    "Fiesta",
    "Focus",
    "Kuga",
    "Mondeo",
    "Puma",
    "Ranger",
    "Tourneo Connect",
    "Tourneo Courier",
  ],
  Honda: ["City", "Civic", "CR-V", "HR-V", "Jazz"],
  Hyundai: ["Accent Blue", "Bayon", "Elantra", "i10", "i20", "i30", "Kona", "Santa Fe", "Tucson"],
  Jeep: ["Cherokee", "Compass", "Grand Cherokee", "Renegade", "Wrangler"],
  Kia: ["Ceed", "Cerato", "Picanto", "Rio", "Sorento", "Soul", "Sportage", "Stonic"],
  Lexus: ["CT", "ES", "IS", "NX", "RX", "UX"],
  Mazda: ["2", "3", "6", "CX-3", "CX-30", "CX-5"],
  "Mercedes-Benz": [
    "A Serisi",
    "B Serisi",
    "C Serisi",
    "CLA",
    "CLS",
    "E Serisi",
    "GLA",
    "GLB",
    "GLC",
    "GLE",
    "S Serisi",
    "Vito",
  ],
  MG: ["HS", "MG3", "MG5", "ZS"],
  Mini: ["Clubman", "Cooper", "Countryman"],
  Nissan: ["Juke", "Micra", "Navara", "Note", "Qashqai", "X-Trail"],
  Opel: ["Astra", "Combo", "Corsa", "Grandland", "Insignia", "Mokka", "Vectra", "Zafira"],
  Peugeot: ["2008", "208", "3008", "301", "306", "307", "308", "407", "508"],
  Renault: ["Broadway", "Captur", "Clio", "Fluence", "Kadjar", "Megane", "Symbol", "Taliant", "Talisman"],
  Seat: ["Arona", "Ateca", "Ibiza", "Leon", "Toledo"],
  Skoda: ["Fabia", "Kamiq", "Karoq", "Kodiaq", "Octavia", "Rapid", "Superb"],
  Suzuki: ["Baleno", "Ignis", "S-Cross", "Swift", "Vitara"],
  Tesla: ["Model 3", "Model S", "Model X", "Model Y"],
  Toyota: ["Auris", "C-HR", "Corolla", "Corolla Cross", "Hilux", "RAV4", "Yaris", "Yaris Cross"],
  Volkswagen: [
    "Bora",
    "Caddy",
    "Golf",
    "Jetta",
    "Passat",
    "Polo",
    "T-Cross",
    "T-Roc",
    "Tiguan",
    "Touran",
    "Transporter",
  ],
  Volvo: ["S60", "S90", "V40", "V60", "XC40", "XC60", "XC90"],
};

export function modelOptionsForBrand(brand: string | undefined): string[] {
  if (!brand) return [];
  const models = modelsByBrand[brand];
  return models ? [...models, otherModelOption] : [otherModelOption];
}

export { brandOptions };
const trimOptions = [
  "Baz paket",
  "Orta paket",
  "Üst paket",
  "Business",
  "Comfort",
  "Dream",
  "Dynamic",
  "Elegance",
  "Executive",
  "Joy",
  "Life",
  "Premium",
  "Style",
  "Touch",
  "Trend",
  "Belirtilmemiş",
  "Diğer / listede yok",
];
const cityOptions = [
  "Adana",
  "Adıyaman",
  "Afyonkarahisar",
  "Ağrı",
  "Amasya",
  "Ankara",
  "Antalya",
  "Artvin",
  "Aydın",
  "Balıkesir",
  "Bilecik",
  "Bingöl",
  "Bitlis",
  "Bolu",
  "Burdur",
  "Bursa",
  "Çanakkale",
  "Çankırı",
  "Çorum",
  "Denizli",
  "Diyarbakır",
  "Edirne",
  "Elazığ",
  "Erzincan",
  "Erzurum",
  "Eskişehir",
  "Gaziantep",
  "Giresun",
  "Gümüşhane",
  "Hakkari",
  "Hatay",
  "Isparta",
  "Mersin",
  "İstanbul",
  "İzmir",
  "Kars",
  "Kastamonu",
  "Kayseri",
  "Kırklareli",
  "Kırşehir",
  "Kocaeli",
  "Konya",
  "Kütahya",
  "Malatya",
  "Manisa",
  "Kahramanmaraş",
  "Mardin",
  "Muğla",
  "Muş",
  "Nevşehir",
  "Niğde",
  "Ordu",
  "Rize",
  "Sakarya",
  "Samsun",
  "Siirt",
  "Sinop",
  "Sivas",
  "Tekirdağ",
  "Tokat",
  "Trabzon",
  "Tunceli",
  "Şanlıurfa",
  "Uşak",
  "Van",
  "Yozgat",
  "Zonguldak",
  "Aksaray",
  "Bayburt",
  "Karaman",
  "Kırıkkale",
  "Batman",
  "Şırnak",
  "Bartın",
  "Ardahan",
  "Iğdır",
  "Yalova",
  "Karabük",
  "Kilis",
  "Osmaniye",
  "Düzce",
];
const bodyTypes = [
  "Sedan",
  "Hatchback",
  "Station wagon",
  "SUV",
  "Crossover",
  "Coupe",
  "Cabrio",
  "MPV",
  "Pickup",
  "Panelvan",
];
const drivetrains = ["Önden çekiş", "Arkadan itiş", "4x4", "AWD", "Bilinmiyor"];
const ownerInfoOptions = [
  "Ruhsat sahibi satıcı olduğunu belirtiyor",
  "Araç aile bireyi üzerine",
  "Vekaletle satış yapılacak",
  "Galeriden satış",
  "Ruhsat sahibi bilgisi belirsiz",
];
const tradeStatuses = ["Takas yok", "Takas var", "Takas değerlendirilebilir", "Sadece satış", "Belirtilmemiş"];
const airbagStatuses = ["Açmamış", "Açmış", "Değişmiş", "Bilinmiyor"];
const batteryStatuses = ["İyi", "Orta", "Zayıf", "Yeni değişmiş", "Bilinmiyor"];
const tireStatuses = ["İyi", "Orta", "Kötü", "Yeni", "Mevsimlik değişim gerekli", "Bilinmiyor"];
const lpgStatuses = ["Yok", "Var", "Sökülmüş", "Bilinmiyor"];
const timingBeltStatuses = [
  "Değişmiş, fatura mevcut",
  "Değişmiş, belge yok",
  "Zincirli motor olduğu belirtiliyor",
  "Değişim zamanı yaklaşmış olabilir",
  "Bilinmiyor",
  "Belirtilmemiş",
];
const transmissionMaintenanceStatuses = [
  "Bakım yapılmış, fatura mevcut",
  "Bakım yapılmış, belge yok",
  "Manuel şanzıman",
  "Bakım zamanı yaklaşmış olabilir",
  "Bilinmiyor",
  "Belirtilmemiş",
];
const damagePartOptions = [
  "Ön tampon",
  "Arka tampon",
  "Kaput",
  "Bagaj kapağı",
  "Tavan",
  "Sağ ön çamurluk",
  "Sol ön çamurluk",
  "Sağ arka çamurluk",
  "Sol arka çamurluk",
  "Sağ ön kapı",
  "Sol ön kapı",
  "Sağ arka kapı",
  "Sol arka kapı",
  "Sağ marşpiyel",
  "Sol marşpiyel",
];
const booleanFields: Array<{ name: CheckboxName; label: string }> = [
  { name: "hasHeavyDamage", label: "Ağır hasar kaydı var" },
  { name: "hasChassisRepair", label: "Şasi veya podye işlemi var" },
  { name: "hasTotalLossHistory", label: "Pert geçmişi var" },
  { name: "hasExpertiseReport", label: "Ekspertiz raporu var" },
  { name: "lpgRegistered", label: "LPG ruhsata işli" },
  { name: "hasSpareKey", label: "Yedek anahtar var" },
  { name: "hasMaintenanceInvoices", label: "Bakım faturaları var" },
];

type DamagePartFieldName = "paintedParts" | "replacedParts" | "localPaintedParts";

function parseParts(value: unknown): string[] {
  if (typeof value !== "string") return [];

  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function DamagePartPicker({
  name,
  label,
  register,
  setValue,
  watch,
}: {
  name: DamagePartFieldName;
  label: string;
  register: UseFormRegister<VehicleFormInput>;
  setValue?: UseFormSetValue<VehicleFormInput>;
  watch?: UseFormWatch<VehicleFormInput>;
}) {
  const selectedParts = parseParts(watch?.(name));
  const hiddenValue = selectedParts.join(", ");

  function togglePart(part: string) {
    if (!setValue) return;

    const nextParts = selectedParts.includes(part)
      ? selectedParts.filter((selectedPart) => selectedPart !== part)
      : [...selectedParts, part];

    setValue(name, nextParts.join(", "), {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  }

  return (
    <fieldset className="grid gap-3 md:col-span-2">
      <legend className="text-sm font-medium text-slate-800">{label}</legend>
      <input type="hidden" {...register(name)} value={hiddenValue} readOnly />
      <div className="flex flex-wrap gap-2" aria-label={`${label} seçenekleri`}>
        {damagePartOptions.map((part) => {
          const checked = selectedParts.includes(part);

          return (
            <label
              key={`${name}-${part}`}
              className={cn(
                "inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-3 text-sm font-semibold transition",
                checked
                  ? "border-teal-700 bg-teal-50 text-teal-900"
                  : "border-slate-200 bg-white text-slate-700 hover:border-teal-700",
              )}
            >
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-teal-700"
                checked={checked}
                onChange={() => togglePart(part)}
              />
              {part}
            </label>
          );
        })}
      </div>
      <p className="text-xs leading-5 text-slate-500">
        Bilinmiyorsa boş bırakın; raporda satıcıdan parça detayı istemeniz önerilir.
      </p>
    </fieldset>
  );
}

export function VehicleInfoSection({ register, errors, setValue, watch }: SectionProps) {
  const selectedBrand = watch?.("brand");
  const brandField = register("brand");

  return (
    <SectionCard id="vehicle-info" title="Araç bilgileri" description="Temel araç bilgilerini seçin veya yazın.">
      <div className="grid gap-4 md:grid-cols-2">
        <SelectField
          id="brand"
          label="Marka"
          options={brandOptions}
          {...brandField}
          onChange={(event) => {
            brandField.onChange(event);
            setValue?.("model", "", { shouldDirty: true, shouldTouch: true, shouldValidate: true });
          }}
          error={errors.brand?.message}
        />
        <SelectField
          id="model"
          label="Model"
          options={modelOptionsForBrand(selectedBrand)}
          disabled={!selectedBrand}
          {...register("model")}
          error={errors.model?.message}
        />
        <Field
          id="year"
          label="Model yılı"
          type="number"
          inputMode="numeric"
          {...register("year")}
          error={errors.year?.message}
        />
        <SelectField id="trim" label="Paket" options={trimOptions} {...register("trim")} />
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
          label="İstenen fiyat"
          type="number"
          inputMode="numeric"
          {...register("price")}
          error={errors.price?.message}
        />
        <SelectField id="city" label="Şehir" options={cityOptions} {...register("city")} error={errors.city?.message} />
        <SelectField id="bodyType" label="Kasa tipi" options={bodyTypes} {...register("bodyType")} />
        <Field id="engineSize" label="Motor hacmi" type="number" inputMode="decimal" {...register("engineSize")} />
        <Field id="enginePower" label="Motor gücü" type="number" inputMode="numeric" {...register("enginePower")} />
        <SelectField id="drivetrain" label="Çekiş tipi" options={drivetrains} {...register("drivetrain")} />
        <SelectField
          id="ownerInfo"
          label="Ruhsat sahibi bilgisi"
          options={ownerInfoOptions}
          {...register("ownerInfo")}
        />
        <SelectField id="tradeStatus" label="Takas durumu" options={tradeStatuses} {...register("tradeStatus")} />
      </div>
    </SectionCard>
  );
}

export function DamageInfoSection({ register, setValue, watch }: SectionProps) {
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
        <DamagePartPicker
          name="paintedParts"
          label="Boyalı parçalar"
          register={register}
          setValue={setValue}
          watch={watch}
        />
        <DamagePartPicker
          name="replacedParts"
          label="Değişen parçalar"
          register={register}
          setValue={setValue}
          watch={watch}
        />
        <DamagePartPicker
          name="localPaintedParts"
          label="Lokal boyalı parçalar"
          register={register}
          setValue={setValue}
          watch={watch}
        />
        <SelectField id="airbagStatus" label="Airbag durumu" options={airbagStatuses} {...register("airbagStatus")} />
      </div>
    </SectionCard>
  );
}

export function MaintenanceInfoSection({ register }: SectionProps) {
  return (
    <SectionCard id="maintenance-info" title="Bakım ve evrak bilgileri">
      <div className="grid gap-4 md:grid-cols-2">
        <Field id="lastMaintenanceDate" label="Son bakım tarihi" type="date" {...register("lastMaintenanceDate")} />
        <SelectField
          id="timingBeltInfo"
          label="Triger değişim bilgisi"
          options={timingBeltStatuses}
          {...register("timingBeltInfo")}
        />
        <SelectField
          id="transmissionMaintenanceInfo"
          label="Şanzıman bakım bilgisi"
          options={transmissionMaintenanceStatuses}
          {...register("transmissionMaintenanceInfo")}
        />
        <SelectField id="batteryStatus" label="Akü durumu" options={batteryStatuses} {...register("batteryStatus")} />
        <SelectField id="tireStatus" label="Lastik durumu" options={tireStatuses} {...register("tireStatus")} />
        <Field id="inspectionEndDate" label="Muayene bitiş tarihi" type="date" {...register("inspectionEndDate")} />
        <SelectField id="lpgStatus" label="LPG durumu" options={lpgStatuses} {...register("lpgStatus")} />
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
    <SectionCard id="seller-description" title="Satıcı açıklaması ve notlar">
      <div className="grid gap-4 md:grid-cols-2">
        <TextareaField
          id="sellerDescription"
          label="Satıcı açıklaması veya araç notu"
          {...register("sellerDescription")}
          error={errors.sellerDescription?.message}
        />
      </div>
    </SectionCard>
  );
}
