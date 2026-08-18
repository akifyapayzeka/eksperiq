"use client";

import { useMemo, useState } from "react";
import { Calculator, MapPin } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { CITY_DISPLAY_NAMES, getCityCostMultiplier } from "@/lib/geo/city-cost-index";
import { locateCity } from "@/lib/geo/reverse-geocode";

const repairBase = {
  "Tampon boya": [3500, 9000],
  "Göçük düzeltme": [2500, 12000],
  "Far değişimi": [6000, 35000],
  "Cam değişimi": [4000, 18000],
  "Jant tamiri": [1500, 8000],
  "Kapı boya": [5000, 15000],
  "Pasta cila": [2500, 10000],
} as const;

const serviceFactors = {
  "Özel servis": 1,
  "Yetkili servis": 1.7,
  "Usta/kaporta atölyesi": 0.85,
} as const;

const locateMessages: Record<string, string> = {
  "permission-denied": "Konum izni verilmedi. Şehri aşağıdan elle seçebilirsiniz.",
  unavailable: "Bu cihazda konum servisi kullanılamıyor. Şehri aşağıdan elle seçebilirsiniz.",
  "not-found": "Konumunuz bir şehre çevrilemedi. Lütfen aşağıdan seçin.",
  "network-error": "Konum servisine şu anda ulaşılamadı. Lütfen aşağıdan seçin.",
};

type RepairKey = keyof typeof repairBase;

/**
 * AI bulgusundaki serbest metni (alan + sinyal) mevcut sabit işlem
 * listesiyle eşleştirmeye çalışır. Kesin değildir — yalnızca başlangıç
 * seçimini AI'nin gördüğü hasara yaklaştırır, kullanıcı her zaman değiştirebilir.
 */
function suggestRepairKey(hint: { area: string; signal: string } | undefined): RepairKey | undefined {
  if (!hint) return undefined;
  const text = `${hint.area} ${hint.signal}`.toLocaleLowerCase("tr-TR");
  if (text.includes("cam")) return "Cam değişimi";
  if (text.includes("far") || text.includes("stop")) return "Far değişimi";
  if (text.includes("jant")) return "Jant tamiri";
  if (text.includes("kapı")) return "Kapı boya";
  if (text.includes("göçük") || text.includes("çökme") || text.includes("ezik")) return "Göçük düzeltme";
  if (text.includes("tampon")) return "Tampon boya";
  if (text.includes("çizik") || text.includes("sıyrık")) return "Pasta cila";
  return undefined;
}

/**
 * Önceden ayrı bir "/onarim-maliyeti" modülüydü; her zaman Fotoğraftan Hasar
 * Analizi bulgularına bağımlı olduğu için ayrı bir üst düzey modül olmayı
 * hak etmiyordu — artık o sayfanın bir bölümü.
 */
export function RepairCostEstimator({ hint }: { hint?: { area: string; signal: string } }) {
  const [repair, setRepair] = useState<RepairKey>(() => suggestRepairKey(hint) ?? "Tampon boya");
  const [service, setService] = useState<keyof typeof serviceFactors>("Özel servis");
  const [city, setCity] = useState<string | null>(null);
  const [locateStatus, setLocateStatus] = useState<"idle" | "locating" | "error">("idle");
  const [locateMessage, setLocateMessage] = useState("");

  const range = useMemo(() => {
    const [low, high] = repairBase[repair];
    const factor = serviceFactors[service] * getCityCostMultiplier(city);
    return [Math.round(low * factor), Math.round(high * factor)];
  }, [repair, service, city]);

  async function handleLocateCity() {
    setLocateStatus("locating");
    setLocateMessage("");
    const result = await locateCity();
    if (result.ok) {
      setCity(result.city);
      setLocateStatus("idle");
      return;
    }
    setLocateStatus("error");
    setLocateMessage(locateMessages[result.reason]);
  }

  return (
    <section className="mt-5 rounded-theme border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <Calculator aria-hidden="true" className="h-5 w-5 text-accent" />
        <h2 className="text-xl font-semibold text-foreground">Tahmini onarım maliyeti</h2>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        İşlem, servis tipi ve şehre göre yaklaşık maliyet aralığını görün. Bu net bir fiyat teklifi değildir; canlı
        piyasa araştırması yapmaz, bilinen bölgesel maliyet farklarına göre kaba bir aralık verir.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-foreground/90">
          İşlem
          <select
            value={repair}
            onChange={(event) => setRepair(event.target.value as RepairKey)}
            className="min-h-12 rounded-theme-sm border border-border px-3"
          >
            {Object.keys(repairBase).map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-foreground/90">
          Servis tipi
          <select
            value={service}
            onChange={(event) => setService(event.target.value as keyof typeof serviceFactors)}
            className="min-h-12 rounded-theme-sm border border-border px-3"
          >
            {Object.keys(serviceFactors).map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-foreground/90 sm:col-span-2">
          Şehir
          <select
            value={city ?? ""}
            onChange={(event) => setCity(event.target.value || null)}
            className="min-h-12 rounded-theme-sm border border-border px-3"
          >
            <option value="">Seçilmedi (Türkiye ortalaması)</option>
            {CITY_DISPLAY_NAMES.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
      </div>
      <button
        type="button"
        onClick={handleLocateCity}
        disabled={locateStatus === "locating"}
        className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-4 text-sm font-semibold text-foreground/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {locateStatus === "locating" ? <Spinner /> : <MapPin aria-hidden="true" className="h-4 w-4 text-accent" />}
        {locateStatus === "locating" ? "Konum alınıyor..." : "Konumuma göre tahmin et"}
      </button>
      {locateMessage ? <p className="mt-2 text-sm font-medium text-destructive">{locateMessage}</p> : null}
      <div className="mt-4 rounded-theme-sm border border-accent/20 bg-accent/10 p-4 text-foreground">
        <p className="text-sm font-medium">
          Yaklaşık aralık{city ? ` · ${city}` : ""}
        </p>
        <p className="mt-1 text-2xl font-semibold">
          {range[0].toLocaleString("tr-TR")} - {range[1].toLocaleString("tr-TR")} TL
        </p>
      </div>
    </section>
  );
}
