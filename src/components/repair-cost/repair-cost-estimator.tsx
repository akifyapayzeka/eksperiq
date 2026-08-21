"use client";

import { useMemo, useState } from "react";
import { Calculator, MapPin, ShieldAlert, Wrench } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { CITY_DISPLAY_NAMES, getCityCostMultiplier } from "@/lib/geo/city-cost-index";
import { locateCity } from "@/lib/geo/reverse-geocode";

const repairCatalog = {
  "Tampon boya": {
    category: "Kaporta/Boya",
    range: [3500, 9000],
    partsShare: 0.2,
    urgency: "Kozmetik",
    typicalDuration: "1-2 gün",
    note: "Tampon plastik parça olduğu için boya/değişim tek başına ağır kaza kanıtı değildir; renk tutması ve bağlantı ayakları kontrol edilmeli.",
    check: "Tampon iç bağlantıları, sis/far yuvaları, park sensörü ve boya tonu farkını kontrol ettirin.",
  },
  "Kapı boya": {
    category: "Kaporta/Boya",
    range: [5000, 15000],
    partsShare: 0.18,
    urgency: "Kontrol edilmeli",
    typicalDuration: "2-3 gün",
    note: "Kapı boyası kullanım çizikleri veya lokal hasardan olabilir; direk/eşik tarafında işlem varsa risk büyür.",
    check: "Boya kalınlığı, kapı içi puntalar, menteşe civataları, fitil altları ve direk geçişlerini ölçtürün.",
  },
  "Lokal boya": {
    category: "Kaporta/Boya",
    range: [2500, 7500],
    partsShare: 0.15,
    urgency: "Kozmetik",
    typicalDuration: "1 gün",
    note: "Lokal boya genelde sınırlı yüzey işlemidir; alımda en kritik konu işlemin hangi parçaya ve ne kadar alana yapıldığıdır.",
    check: "Lokal alanın panel geneline yayılıp yayılmadığını, macun izi ve renk farkını kontrol ettirin.",
  },
  "Göçük düzeltme": {
    category: "Kaporta",
    range: [2500, 12000],
    partsShare: 0.1,
    urgency: "Kontrol edilmeli",
    typicalDuration: "1-2 gün",
    note: "Boyasız göçük düzeltme mümkünse değer kaybı daha sınırlı kalabilir; keskin kat izi varsa boya gerekebilir.",
    check: "Boyasız onarım mümkün mü, panelde boya çatlağı/macun var mı ve iç destek zarar görmüş mü sorun.",
  },
  "Pasta cila": {
    category: "Kozmetik",
    range: [2500, 10000],
    partsShare: 0.08,
    urgency: "Kozmetik",
    typicalDuration: "Yarım-1 gün",
    note: "Yüzey çizikleri için düşük risklidir; tırnağa takılan derin çizikte boya gerekebilir.",
    check: "Çiziğin vernikte mi boyada mı olduğunu ve lokal boya gerekip gerekmediğini netleştirin.",
  },
  "Far değişimi": {
    category: "Aydınlatma",
    range: [6000, 35000],
    partsShare: 0.78,
    urgency: "Güvenlik",
    typicalDuration: "Aynı gün-1 gün",
    note: "LED/matrix farlarda parça maliyeti hızla yükselir; yan sanayi-orijinal farkı fiyatı ciddi değiştirir.",
    check: "Far ayarı, su alma, kırık ayak, orijinal parça kodu ve varsa adaptif far hatasını kontrol ettirin.",
  },
  "Stop değişimi": {
    category: "Aydınlatma",
    range: [3500, 20000],
    partsShare: 0.72,
    urgency: "Güvenlik",
    typicalDuration: "Aynı gün",
    note: "Stop çatlağı su alma ve muayene sorunu doğurabilir; LED stoplarda komple değişim gerekebilir.",
    check: "Su alma, soket oksidi, gövde çatlağı ve muayene kusuru oluşturup oluşturmadığını kontrol ettirin.",
  },
  "Cam değişimi": {
    category: "Cam",
    range: [4000, 18000],
    partsShare: 0.65,
    urgency: "Güvenlik",
    typicalDuration: "Aynı gün",
    note: "Ön camda yağmur/far sensörü, kamera ve şerit takip varsa kalibrasyon maliyeti eklenebilir.",
    check: "Sensör/kamera kalibrasyonu, cam markası, fitil-sızdırmazlık ve kasko cam hakkını sorun.",
  },
  "Jant tamiri": {
    category: "Yürüyen aksam",
    range: [1500, 8000],
    partsShare: 0.25,
    urgency: "Kontrol edilmeli",
    typicalDuration: "Aynı gün-1 gün",
    note: "Eğik veya kaynaklı jant balans/titreme yapabilir; güvenlik açısından lastikle birlikte bakılmalı.",
    check: "Jantta kaynak, çatlak, balans tutmama ve lastik yanağı hasarı var mı kontrol ettirin.",
  },
  "Lastik seti": {
    category: "Yürüyen aksam",
    range: [12000, 45000],
    partsShare: 0.9,
    urgency: "Güvenlik",
    typicalDuration: "Aynı gün",
    note: "Diş derinliği, üretim tarihi ve marka kalite seviyesi fiyatı çok değiştirir.",
    check: "DOT tarihi, diş derinliği, dört lastiğin aynı marka/ölçü olup olmadığı ve yanak çatlaklarını kontrol edin.",
  },
  "Akü değişimi": {
    category: "Elektrik",
    range: [3000, 12000],
    partsShare: 0.85,
    urgency: "Yakın takip",
    typicalDuration: "Aynı gün",
    note: "Start-stop aküler standart aküden pahalıdır; yanlış akü elektronik arıza uyarısı doğurabilir.",
    check: "Akü test değeri, üretim tarihi, start-stop uyumu ve şarj dinamosu voltajını kontrol ettirin.",
  },
  "Fren disk/balata": {
    category: "Mekanik",
    range: [6000, 28000],
    partsShare: 0.68,
    urgency: "Güvenlik",
    typicalDuration: "Aynı gün",
    note: "Fren titremesi, ötme veya zayıf tutma varsa satın alma öncesi pazarlık kalemidir.",
    check: "Disk kalınlığı, balata ömrü, fren hidroliği ve ABS uyarısı var mı kontrol ettirin.",
  },
  "Triger seti": {
    category: "Ağır bakım",
    range: [10000, 45000],
    partsShare: 0.55,
    urgency: "Kritik",
    typicalDuration: "1 gün",
    note: "Triger kayışı koparsa motorda ağır hasar oluşabilir; kayıt yoksa alım sonrası ilk iş planlanmalı.",
    check: "Değişim faturası, km/tarih, devirdaim dahil mi ve kullanılan parça markasını sorun.",
  },
  "Turbo revizyon/değişim": {
    category: "Motor",
    range: [18000, 90000],
    partsShare: 0.7,
    urgency: "Kritik",
    typicalDuration: "1-3 gün",
    note: "Yağ eksiltme, çekiş düşüklüğü ve duman varsa motor tarafında ek masraf çıkabilir.",
    check: "Turbo boşluğu, yağ kaçağı, intercooler hattı, DPF/EGR durumu ve arıza kodlarını okutun.",
  },
  "EGR/DPF temizliği": {
    category: "Emisyon",
    range: [5000, 30000],
    partsShare: 0.45,
    urgency: "Yakın takip",
    typicalDuration: "Aynı gün-2 gün",
    note: "Dizel araçta şehir içi kullanım ve ihmal, DPF/EGR masrafını büyütebilir.",
    check: "Rejenerasyon durumu, doluluk oranı, EGR arıza kodu ve muayene emisyon riskini kontrol ettirin.",
  },
  "Şanzıman bakım/onarım": {
    category: "Şanzıman",
    range: [12000, 120000],
    partsShare: 0.55,
    urgency: "Kritik",
    typicalDuration: "1-5 gün",
    note: "Vuruntu, kaçırma veya gecikmeli geçiş varsa küçük bakım değil yüksek masraf riski olabilir.",
    check: "Yağ değişim geçmişi, kavrama/beyin durumu, test sürüşünde vuruntu ve arıza kodlarını kontrol ettirin.",
  },
} as const;

const serviceFactors = {
  "Özel servis": { factor: 1, note: "Denge seçenek; fiyat/kalite araştırması önemli." },
  "Yetkili servis": { factor: 1.7, note: "Orijinal parça ve kayıt avantajı var; fiyat aralığı yükselir." },
  "Usta/kaporta atölyesi": { factor: 0.85, note: "Daha ekonomik olabilir; işçilik ve garanti şartı net sorulmalı." },
} as const;

const locateMessages: Record<string, string> = {
  "permission-denied": "Konum izni verilmedi. Şehri aşağıdan elle seçebilirsiniz.",
  unavailable: "Bu cihazda konum servisi kullanılamıyor. Şehri aşağıdan elle seçebilirsiniz.",
  "not-found": "Konumunuz bir şehre çevrilemedi. Lütfen aşağıdan seçin.",
  "network-error": "Konum servisine şu anda ulaşılamadı. Lütfen aşağıdan seçin.",
};

type RepairKey = keyof typeof repairCatalog;
type ServiceKey = keyof typeof serviceFactors;

/**
 * AI bulgusundaki serbest metni (alan + sinyal) mevcut sabit işlem
 * listesiyle eşleştirmeye çalışır. Kesin değildir — yalnızca başlangıç
 * seçimini AI'nin gördüğü hasara yaklaştırır, kullanıcı her zaman değiştirebilir.
 */
function suggestRepairKey(hint: { area: string; signal: string } | undefined): RepairKey | undefined {
  if (!hint) return undefined;
  const text = `${hint.area} ${hint.signal}`.toLocaleLowerCase("tr-TR");
  if (text.includes("cam")) return "Cam değişimi";
  if (text.includes("stop")) return "Stop değişimi";
  if (text.includes("far")) return "Far değişimi";
  if (text.includes("lastik")) return "Lastik seti";
  if (text.includes("akü") || text.includes("aku")) return "Akü değişimi";
  if (text.includes("fren") || text.includes("abs")) return "Fren disk/balata";
  if (text.includes("jant")) return "Jant tamiri";
  if (text.includes("kapı")) return "Kapı boya";
  if (text.includes("göçük") || text.includes("çökme") || text.includes("ezik")) return "Göçük düzeltme";
  if (text.includes("tampon")) return "Tampon boya";
  if (text.includes("çizik") || text.includes("sıyrık")) return "Pasta cila";
  return undefined;
}

/**
 * Yalnızca Garajım'da (kendi aracınız) gösterilir — satın alma öncesi akıştan
 * kasıtlı olarak ayrı tutulur, çünkü bu bir masraf tahminidir, alım kararını
 * etkileyecek bir bulgu değildir.
 */
export function RepairCostEstimator({ hint }: { hint?: { area: string; signal: string } }) {
  const [repair, setRepair] = useState<RepairKey>(() => suggestRepairKey(hint) ?? "Tampon boya");
  const [service, setService] = useState<ServiceKey>("Özel servis");
  const [city, setCity] = useState<string | null>(null);
  const [locateStatus, setLocateStatus] = useState<"idle" | "locating" | "error">("idle");
  const [locateMessage, setLocateMessage] = useState("");

  const estimate = useMemo(() => {
    const detail = repairCatalog[repair];
    const [low, high] = detail.range;
    const factor = serviceFactors[service].factor * getCityCostMultiplier(city);
    const estimatedLow = Math.round(low * factor);
    const estimatedHigh = Math.round(high * factor);
    const midpoint = Math.round((estimatedLow + estimatedHigh) / 2);
    const parts = Math.round(midpoint * detail.partsShare);
    const labor = Math.max(0, midpoint - parts);
    const negotiationLow = Math.round(estimatedLow * 0.8);
    const negotiationHigh = Math.round(estimatedHigh * 1.15);
    return { low: estimatedLow, high: estimatedHigh, midpoint, parts, labor, negotiationLow, negotiationHigh };
  }, [repair, service, city]);

  const selectedRepair = repairCatalog[repair];
  const selectedService = serviceFactors[service];
  const repairOptionsByCategory = useMemo(() => {
    const groups = new Map<string, RepairKey[]>();
    for (const key of Object.keys(repairCatalog) as RepairKey[]) {
      const category = repairCatalog[key].category;
      groups.set(category, [...(groups.get(category) ?? []), key]);
    }
    return Array.from(groups.entries());
  }, []);

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
    <section className="mt-5 overflow-hidden rounded-theme border border-warning/25 bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <Calculator aria-hidden="true" className="h-5 w-5 text-accent" />
        <h2 className="text-xl font-semibold text-foreground">Tahmini onarım maliyeti</h2>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        İşlem, servis tipi ve şehre göre yaklaşık maliyet aralığını, parça/işçilik kırılımını ve satın alma öncesi
        sorulacak noktaları görün. Bu net fiyat teklifi değildir; canlı piyasa araştırması yapmaz.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-foreground/90">
          İşlem
          <select
            value={repair}
            onChange={(event) => setRepair(event.target.value as RepairKey)}
            className="min-h-12 rounded-theme-sm border border-border px-3"
          >
            {repairOptionsByCategory.map(([category, items]) => (
              <optgroup key={category} label={category}>
                {items.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-foreground/90">
          Servis tipi
          <select
            value={service}
            onChange={(event) => setService(event.target.value as ServiceKey)}
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
      <div className="mt-4 rounded-theme-sm border border-warning/30 bg-warning/10 p-4 text-foreground">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Yaklaşık aralık{city ? ` · ${city}` : ""}</p>
            <p className="mt-1 text-2xl font-semibold">
              {estimate.low.toLocaleString("tr-TR")} - {estimate.high.toLocaleString("tr-TR")} TL
            </p>
          </div>
          <span className="rounded-full bg-warning px-3 py-1 text-xs font-semibold text-warning-foreground">
            {selectedRepair.urgency}
          </span>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <div className="rounded-theme-sm bg-card/70 p-3">
            <p className="text-xs text-muted-foreground">Orta tahmin</p>
            <p className="mt-1 font-semibold">{estimate.midpoint.toLocaleString("tr-TR")} TL</p>
          </div>
          <div className="rounded-theme-sm bg-card/70 p-3">
            <p className="text-xs text-muted-foreground">Parça payı</p>
            <p className="mt-1 font-semibold">{estimate.parts.toLocaleString("tr-TR")} TL</p>
          </div>
          <div className="rounded-theme-sm bg-card/70 p-3">
            <p className="text-xs text-muted-foreground">İşçilik payı</p>
            <p className="mt-1 font-semibold">{estimate.labor.toLocaleString("tr-TR")} TL</p>
          </div>
        </div>
        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          Pazarlıkta güvenli tampon: {estimate.negotiationLow.toLocaleString("tr-TR")} -{" "}
          {estimate.negotiationHigh.toLocaleString("tr-TR")} TL. Süre: {selectedRepair.typicalDuration}.
        </p>
      </div>
      <div className="mt-4 grid gap-3">
        <div className="rounded-theme-sm border border-warning/25 bg-warning/5 p-4">
          <div className="flex items-center gap-2">
            <ShieldAlert aria-hidden="true" className="h-4 w-4 text-warning" />
            <p className="text-sm font-semibold text-foreground">Bu kalem neden önemli?</p>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{selectedRepair.note}</p>
        </div>
        <div className="rounded-theme-sm border border-success/25 bg-success/5 p-4">
          <div className="flex items-center gap-2">
            <Wrench aria-hidden="true" className="h-4 w-4 text-accent" />
            <p className="text-sm font-semibold text-foreground">Serviste ne sorulmalı?</p>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{selectedRepair.check}</p>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">{selectedService.note}</p>
        </div>
      </div>
    </section>
  );
}
