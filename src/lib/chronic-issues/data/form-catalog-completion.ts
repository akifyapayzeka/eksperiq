import type { EngineVariant, ModelEntry } from "../types";

type Profile =
  | "alfa-small"
  | "alfa-premium"
  | "byd-ev"
  | "chery-suv"
  | "chevrolet"
  | "cupra-vag"
  | "ds-psa"
  | "ev"
  | "honda"
  | "japanese"
  | "jeep"
  | "kia"
  | "lada"
  | "land-rover"
  | "lexus-hybrid"
  | "mg"
  | "mini"
  | "mitsubishi"
  | "nissan"
  | "pickup"
  | "porsche"
  | "skoda-vag"
  | "ssangyong"
  | "subaru"
  | "suzuki"
  | "vag-seat"
  | "volvo";

type Spec = {
  brand: string;
  model: string;
  yearFrom: number;
  yearTo: number;
  profile: Profile;
  generation?: string;
};

function slug(value: string): string {
  return value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function issueId(spec: Spec, suffix: string): string {
  return `${slug(spec.brand)}-${slug(spec.model)}-${suffix}`;
}

function profileEngines(spec: Spec): EngineVariant[] {
  const common = `${spec.brand} ${spec.model} ikinci el alım rehberleri, bağımsız servis kayıtları ve aynı motor/platform ailesi kullanıcı deneyimlerinde tekrar eden kontrol başlığı.`;

  switch (spec.profile) {
    case "alfa-small":
      return [
        {
          engineLabel: "1.4 MultiAir / T-Jet",
          fuelType: "Benzin",
          transmission: "Manuel",
          yearFrom: spec.yearFrom,
          yearTo: spec.yearTo,
          issues: [
            {
              id: issueId(spec, "multiair-tjet"),
              severity: "medium",
              title: "MultiAir/ turbo yağ bakımı ve elektronik kontrolü",
              detail:
                "1.4 MultiAir/T-Jet motorlarda yağ kalitesi, turbo hortumları, bobinler ve yaşa bağlı elektrik aksamı kontrol edilmeli; bakım gecikmesi MultiAir modülü ve turbo masrafını büyütür.",
              typicalOnset: "90.000 km sonrası",
              costLevel: "Orta",
              sourceNote: common,
            },
          ],
        },
        {
          engineLabel: "1.3/1.6 JTDm",
          fuelType: "Dizel",
          yearFrom: spec.yearFrom,
          yearTo: spec.yearTo,
          issues: [
            {
              id: issueId(spec, "jtdm-egr-dpf"),
              severity: "medium",
              title: "JTDm EGR/DPF ve turbo hortumu kontrolü",
              detail:
                "JTDm dizellerde EGR, DPF doluluk, turbo hortumu kaçakları, debriyaj-volan ve kısa mesafe kullanım geçmişi kontrol edilmelidir.",
              typicalOnset: "120.000 km sonrası",
              costLevel: "Orta",
              sourceNote: common,
            },
          ],
        },
      ];
    case "alfa-premium":
      return [
        {
          engineLabel: "1.5 MHEV / 1.3 PHEV",
          fuelType: "Hibrit",
          transmission: "Otomatik",
          yearFrom: 2022,
          yearTo: spec.yearTo,
          issues: [
            {
              id: issueId(spec, "hybrid-software"),
              severity: "medium",
              title: "Hibrit batarya, yazılım ve garanti devri kontrolü",
              detail:
                "Tonale gibi hibrit Alfa modellerinde batarya sağlığı, şarj/hibrit sistem yazılımı, garanti devri, servis kampanyaları ve elektronik donanım kontrol edilmelidir.",
              typicalOnset: "Garanti devri ve ikinci el alım öncesi",
              costLevel: "Orta",
              sourceNote: common,
            },
          ],
        },
        {
          engineLabel: "2.0 Turbo benzin",
          fuelType: "Benzin",
          transmission: "Otomatik",
          yearFrom: spec.yearFrom,
          yearTo: spec.yearTo,
          issues: [
            {
              id: issueId(spec, "20-turbo-q4"),
              severity: "medium",
              title: "2.0 turbo, ZF otomatik ve Q4 aktarma kontrolü",
              detail:
                "2.0 turbo Alfa modellerinde yağ kaçakları, turbo/soğutma sistemi, ZF otomatik bakım geçmişi ve Q4 varsa aktarma organları kontrol edilmelidir.",
              typicalOnset: "100.000 km sonrası",
              costLevel: "Orta",
              sourceNote: common,
            },
          ],
        },
        {
          engineLabel: "2.2 JTDm",
          fuelType: "Dizel",
          transmission: "Otomatik",
          yearFrom: spec.yearFrom,
          yearTo: spec.yearTo,
          issues: [
            {
              id: issueId(spec, "22-jtdm-emission"),
              severity: "medium",
              title: "2.2 JTDm EGR/DPF/AdBlue ve ZF bakım kontrolü",
              detail:
                "2.2 JTDm motorlarda EGR/DPF/AdBlue, turbo, yağ kaçakları ve ZF otomatik yağ bakım geçmişi alım öncesi kontrol edilmelidir.",
              typicalOnset: "120.000 km sonrası",
              costLevel: "Orta",
              sourceNote: common,
            },
          ],
        },
      ];
    case "byd-ev":
      return [
        {
          engineLabel: "Elektrikli / Blade Battery",
          fuelType: "Elektrik",
          transmission: "Otomatik",
          yearFrom: spec.yearFrom,
          yearTo: spec.yearTo,
          issues: [
            {
              id: issueId(spec, "battery-software"),
              severity: "medium",
              title: "Batarya sağlığı, şarj geçmişi ve yazılım/garanti devri",
              detail:
                "BYD modellerinde uzun dönem saha verisi yeni oluştuğu için batarya sağlık raporu, hızlı şarj geçmişi, servis yazılım güncellemeleri, garanti devri ve ADAS kalibrasyonu kontrol edilmelidir.",
              typicalOnset: "İkinci el devir öncesi",
              costLevel: "Orta",
              sourceNote: common,
            },
          ],
        },
        {
          engineLabel: "DM-i plug-in hibrit",
          fuelType: "Hibrit",
          transmission: "Otomatik",
          yearFrom: spec.yearFrom,
          yearTo: spec.yearTo,
          issues: [
            {
              id: issueId(spec, "dmi-hybrid"),
              severity: "medium",
              title: "Hibrit batarya, yakıtlı motor bakım kaydı ve şarj düzeni",
              detail:
                "DM-i hibritlerde batarya sağlık raporu, şarj alışkanlığı, benzinli motor bakım geçmişi ve garanti kapsamı birlikte kontrol edilmelidir.",
              typicalOnset: "Garanti devri ve yüksek km öncesi",
              costLevel: "Orta",
              sourceNote: common,
            },
          ],
        },
      ];
    case "chery-suv":
      return [
        {
          engineLabel: "1.5/1.6 TGDI",
          fuelType: "Benzin",
          transmission: "Otomatik",
          yearFrom: spec.yearFrom,
          yearTo: spec.yearTo,
          issues: [
            {
              id: issueId(spec, "tgdi-dct-electronics"),
              severity: "medium",
              title: "TGDI motor, DCT/otomatik ve ADAS yazılım kontrolü",
              detail:
                "Chery SUV'lerde turbo benzinli motor, çift kavrama/otomatik geçişleri, multimedya-ADAS yazılımı, servis kampanyaları ve garanti devri kontrol edilmelidir.",
              typicalOnset: "Garanti dönemi ve ikinci el devir öncesi",
              costLevel: "Orta",
              sourceNote: common,
            },
          ],
        },
      ];
    case "chevrolet":
      return [
        {
          engineLabel: "LPG dönüşümlü benzin",
          fuelType: "LPG",
          transmission: "Manuel",
          yearFrom: spec.yearFrom,
          yearTo: spec.yearTo,
          issues: [
            {
              id: issueId(spec, "lpg-cooling-valves"),
              severity: "medium",
              title: "LPG ayarı, subap/ateşleme ve soğutma kontrolü",
              detail:
                "LPG'li Chevrolet modellerinde ruhsat işleme, montaj kalitesi, subap ayarı, bobin/buji, hararet geçmişi ve soğutma sistemi özellikle kontrol edilmelidir.",
              typicalOnset: "80.000 km sonrası veya kötü ayarda daha erken",
              costLevel: "Orta",
              sourceNote: common,
            },
          ],
        },
        {
          engineLabel: "1.2/1.4/1.6 Ecotec benzin",
          fuelType: "Benzin",
          transmission: "Manuel",
          yearFrom: spec.yearFrom,
          yearTo: spec.yearTo,
          issues: [
            {
              id: issueId(spec, "ecotec-cooling-ignition"),
              severity: "medium",
              title: "Ecotec termostat, bobin ve soğutma sistemi kontrolü",
              detail:
                "Chevrolet benzinli modellerde termostat gövdesi, bobin/ateşleme, su kaçakları, yağ sızıntısı ve LPG dönüşümü varsa ayar/ruhsat geçmişi kontrol edilmeli.",
              typicalOnset: "80.000-140.000 km",
              costLevel: "Orta",
              sourceNote: common,
            },
          ],
        },
        {
          engineLabel: "1.3/2.0 dizel veya otomatik",
          fuelType: "Dizel",
          transmission: "Otomatik",
          yearFrom: spec.yearFrom,
          yearTo: spec.yearTo,
          issues: [
            {
              id: issueId(spec, "diesel-auto"),
              severity: "medium",
              title: "Dizel EGR/DPF ve otomatik şanzıman vuruntu kontrolü",
              detail:
                "Dizel/otomatik Chevrolet'lerde EGR/DPF, enjektör, turbo ve otomatik şanzıman geçişleri kontrol edilmeli; marka Türkiye'den çekildiği için parça/servis bulunurluğu ayrıca sorgulanmalı.",
              typicalOnset: "120.000 km sonrası",
              costLevel: "Orta",
              sourceNote: common,
            },
          ],
        },
      ];
    case "cupra-vag":
    case "skoda-vag":
    case "vag-seat":
      return [
        {
          engineLabel: "1.0/1.2/1.4/1.5 TSI",
          fuelType: "Benzin",
          transmission: "Yarı otomatik",
          yearFrom: spec.yearFrom,
          yearTo: spec.yearTo,
          issues: [
            {
              id: issueId(spec, "tsi-dsg"),
              severity: "medium",
              title: "TSI turbo/zincir-kayış dönemi ve DSG mekatronik kontrolü",
              detail:
                "VAG TSI modellerde motor ailesine göre zincir/gerdirici veya triger kayışı, turbo-wastegate, PCV/soğutma kaçakları ve DSG kuru kavrama/mekatronik davranışı kontrol edilmeli.",
              typicalOnset: "80.000-140.000 km",
              costLevel: "Orta",
              sourceNote: common,
            },
          ],
        },
        {
          engineLabel: "1.6/2.0 TDI",
          fuelType: "Dizel",
          transmission: "Otomatik",
          yearFrom: spec.yearFrom,
          yearTo: spec.yearTo,
          issues: [
            {
              id: issueId(spec, "tdi-dpf-dsg"),
              severity: "medium",
              title: "TDI EGR/DPF ve DSG/4x4 bakım geçmişi",
              detail:
                "TDI versiyonlarda EGR/DPF, enjektör, turbo aktüatör, çift kütle volan; DSG ve 4x4/Haldex varsa yağ bakım kayıtları kontrol edilmelidir.",
              typicalOnset: "120.000 km sonrası",
              costLevel: "Orta",
              sourceNote: common,
            },
          ],
        },
      ];
    case "ds-psa":
      return [
        {
          engineLabel: "E-Tense plug-in hibrit",
          fuelType: "Hibrit",
          transmission: "Otomatik",
          yearFrom: 2019,
          yearTo: spec.yearTo,
          issues: [
            {
              id: issueId(spec, "etense-hybrid"),
              severity: "medium",
              title: "PHEV batarya/şarj ve EAT8-hibrit modül kontrolü",
              detail:
                "DS E-Tense modellerinde batarya sağlık raporu, şarj portu, hibrit modül yazılımı, EAT8 geçişleri ve garanti/servis kampanyaları kontrol edilmeli.",
              typicalOnset: "Garanti dışı dönem ve ikinci el devir öncesi",
              costLevel: "Orta",
              sourceNote: common,
            },
          ],
        },
        {
          engineLabel: "1.2 PureTech",
          fuelType: "Benzin",
          transmission: "Otomatik",
          yearFrom: spec.yearFrom,
          yearTo: spec.yearTo,
          issues: [
            {
              id: issueId(spec, "puretech-belt"),
              severity: "high",
              title: "1.2 PureTech yağ içinde triger kayışı kontrolü",
              detail:
                "1.2 PureTech motorlarda yağ içinde çalışan triger kayışının dağılması, yağ süzgeci tıkanması ve yağ basıncı riski servis kaydıyla kontrol edilmelidir.",
              typicalOnset: "60.000-120.000 km",
              costLevel: "Yüksek",
              sourceNote: common,
            },
          ],
        },
        {
          engineLabel: "1.5 BlueHDi / EAT8",
          fuelType: "Dizel",
          transmission: "Otomatik",
          yearFrom: spec.yearFrom,
          yearTo: spec.yearTo,
          issues: [
            {
              id: issueId(spec, "bluehdi-adblue-chain"),
              severity: "medium",
              title: "AdBlue/NOx ve 1.5 BlueHDi eksantrik zinciri kontrolü",
              detail:
                "1.5 BlueHDi motorlarda AdBlue deposu/pompası, NOx sensörü, EGR/DPF ve eksantrik zinciri/üst kapak revizyon geçmişi kontrol edilmeli.",
              typicalOnset: "80.000-150.000 km",
              costLevel: "Orta",
              sourceNote: common,
            },
          ],
        },
      ];
    case "ev":
      return [
        {
          engineLabel: "Elektrikli güç aktarma",
          fuelType: "Elektrik",
          transmission: "Otomatik",
          yearFrom: spec.yearFrom,
          yearTo: spec.yearTo,
          issues: [
            {
              id: issueId(spec, "ev-battery-software"),
              severity: "medium",
              title: "Batarya sağlığı, hızlı şarj geçmişi ve yazılım hesabı",
              detail:
                "Elektrikli araçlarda batarya sağlık raporu, DC hızlı şarj oranı, garanti devri, yazılım/hesap özellikleri, kaza sonrası batarya muhafazası ve termal yönetim kontrol edilmeli.",
              typicalOnset: "İkinci el devir öncesi",
              costLevel: "Orta",
              sourceNote: common,
            },
          ],
        },
      ];
    case "honda":
      return [
        {
          engineLabel: "e:HEV / IMA hibrit",
          fuelType: "Hibrit",
          transmission: "Otomatik",
          yearFrom: spec.yearFrom,
          yearTo: spec.yearTo,
          issues: [
            {
              id: issueId(spec, "hybrid-battery-cvt"),
              severity: "low",
              title: "Hibrit batarya, inverter ve e-CVT kontrolü",
              detail:
                "Honda hibritlerde batarya sağlık raporu, inverter soğutma, e-CVT davranışı ve servis kayıtları kontrol edilmeli; uzun yatmış araçlarda batarya dengesi ayrıca sorgulanmalı.",
              typicalOnset: "150.000 km sonrası veya uzun yatmış araçlarda",
              costLevel: "Orta",
              sourceNote: common,
            },
          ],
        },
        {
          engineLabel: "1.4/1.5/1.6 i-VTEC",
          fuelType: "Benzin",
          transmission: "Otomatik",
          yearFrom: spec.yearFrom,
          yearTo: spec.yearTo,
          issues: [
            {
              id: issueId(spec, "ivtec-auto"),
              severity: "low",
              title: "i-VTEC bakım, CVT/tork konvertör ve LPG kontrolü",
              detail:
                "Honda benzinli motorlar dayanıklı kabul edilir; LPG dönüşümü, subap ayarı, CVT/tork konvertör davranışı, motor kulakları ve kaporta korozyonu kontrol edilmelidir.",
              typicalOnset: "120.000 km sonrası",
              costLevel: "Orta",
              sourceNote: common,
            },
          ],
        },
        {
          engineLabel: "1.6 i-DTEC / hibrit",
          fuelType: "Dizel",
          transmission: "Otomatik",
          yearFrom: spec.yearFrom,
          yearTo: spec.yearTo,
          issues: [
            {
              id: issueId(spec, "idtec-hybrid"),
              severity: "medium",
              title: "Dizel DPF/EGR veya hibrit batarya kontrolü",
              detail:
                "Dizelde DPF/EGR, turbo ve kısa mesafe kullanımı; hibritte batarya sağlığı, inverter soğutması ve servis kayıtları kontrol edilmelidir.",
              typicalOnset: "120.000 km sonrası",
              costLevel: "Orta",
              sourceNote: common,
            },
          ],
        },
      ];
    case "japanese":
      return [
        {
          engineLabel: "Benzinli atmosferik / Skyactiv",
          fuelType: "Benzin",
          transmission: "Otomatik",
          yearFrom: spec.yearFrom,
          yearTo: spec.yearTo,
          issues: [
            {
              id: issueId(spec, "petrol-auto-rust"),
              severity: "medium",
              title: "Atmosferik motor bakım, otomatik/CVT ve pas kontrolü",
              detail:
                "Japon atmosferik motorlar genel olarak dayanıklı kabul edilir; otomatik/CVT yağ bakımı, bobin-sensörler, alt takım burçları, pas ve kaza onarım kalitesi kontrol edilmelidir.",
              typicalOnset: "120.000 km sonrası veya yaşa bağlı",
              costLevel: "Orta",
              sourceNote: common,
            },
          ],
        },
        {
          engineLabel: "Dizel varyant",
          fuelType: "Dizel",
          transmission: "Manuel",
          yearFrom: spec.yearFrom,
          yearTo: spec.yearTo,
          issues: [
            {
              id: issueId(spec, "diesel-egr-dpf"),
              severity: "medium",
              title: "Dizel EGR/DPF, turbo ve kısa mesafe kullanım kontrolü",
              detail:
                "Dizel Japon modellerde EGR/DPF, turbo, enjektör ve kısa mesafe kullanım geçmişi; pickup/SUV'lerde 4x4 aktarma ve alt takım kontrol edilmeli.",
              typicalOnset: "130.000 km sonrası",
              costLevel: "Orta",
              sourceNote: common,
            },
          ],
        },
      ];
    case "jeep":
      return [
        {
          engineLabel: "1.4/2.4 benzin",
          fuelType: "Benzin",
          transmission: "Otomatik",
          yearFrom: spec.yearFrom,
          yearTo: spec.yearTo,
          issues: [
            {
              id: issueId(spec, "petrol-4x4-auto"),
              severity: "medium",
              title: "Benzinli motor, otomatik şanzıman ve 4x4 aktarma kontrolü",
              detail:
                "Jeep benzinli modellerde yağ tüketimi, soğutma sistemi, otomatik şanzıman geçişleri, 4x4 transfer ve arazi kullanım izleri kontrol edilmelidir.",
              typicalOnset: "100.000 km sonrası",
              costLevel: "Orta",
              sourceNote: common,
            },
          ],
        },
        {
          engineLabel: "2.0/2.8 CRD dizel",
          fuelType: "Dizel",
          transmission: "Otomatik",
          yearFrom: spec.yearFrom,
          yearTo: spec.yearTo,
          issues: [
            {
              id: issueId(spec, "crd-egr-4x4"),
              severity: "medium",
              title: "CRD EGR/DPF, turbo ve 4x4 arazi yıpranması",
              detail:
                "CRD dizellerde EGR/DPF, turbo hortumları, enjektör, otomatik şanzıman ve 4x4 diferansiyel/transfer kutusu kontrol edilmeli.",
              typicalOnset: "140.000 km sonrası",
              costLevel: "Yüksek",
              sourceNote: common,
            },
          ],
        },
      ];
    case "kia":
      return [
        {
          engineLabel: "Hibrit / plug-in hibrit",
          fuelType: "Hibrit",
          transmission: "Otomatik",
          yearFrom: spec.yearFrom,
          yearTo: spec.yearTo,
          issues: [
            {
              id: issueId(spec, "hybrid-dct-battery"),
              severity: "medium",
              title: "Hibrit batarya, DCT/otomatik ve garanti kontrolü",
              detail:
                "Kia hibritlerde batarya sağlık raporu, inverter/soğutma, DCT veya otomatik şanzıman geçişleri, servis kampanyaları ve garanti devri kontrol edilmeli.",
              typicalOnset: "Garanti dışı dönem ve 120.000 km sonrası",
              costLevel: "Orta",
              sourceNote: common,
            },
          ],
        },
        {
          engineLabel: "1.0/1.4/1.6 benzin",
          fuelType: "Benzin",
          transmission: "Otomatik",
          yearFrom: spec.yearFrom,
          yearTo: spec.yearTo,
          issues: [
            {
              id: issueId(spec, "petrol-dct-cooling"),
              severity: "medium",
              title: "Benzinli motor, DCT/otomatik ve soğutma kontrolü",
              detail:
                "Kia benzinli modellerde bobin/sensörler, soğutma kaçakları, otomatik/DCT kavrama davranışı ve servis kampanyaları kontrol edilmeli.",
              typicalOnset: "100.000 km sonrası",
              costLevel: "Orta",
              sourceNote: common,
            },
          ],
        },
        {
          engineLabel: "1.4/1.6 CRDi",
          fuelType: "Dizel",
          transmission: "Otomatik",
          yearFrom: spec.yearFrom,
          yearTo: spec.yearTo,
          issues: [
            {
              id: issueId(spec, "crdi-egr-dpf"),
              severity: "medium",
              title: "CRDi EGR/DPF, turbo ve çift kavrama kontrolü",
              detail:
                "CRDi dizellerde EGR/DPF, turbo, enjektör ve DCT/otomatik bakım geçmişi özellikle şehir içi kullanılmış araçlarda kontrol edilmelidir.",
              typicalOnset: "120.000 km sonrası",
              costLevel: "Orta",
              sourceNote: common,
            },
          ],
        },
      ];
    case "lada":
      return [
        {
          engineLabel: "LPG dönüşümlü benzin",
          fuelType: "LPG",
          transmission: "Manuel",
          yearFrom: spec.yearFrom,
          yearTo: spec.yearTo,
          issues: [
            {
              id: issueId(spec, "lpg-rust"),
              severity: "medium",
              title: "LPG montajı, pas ve elektrik tesisatı kontrolü",
              detail:
                "LPG'li Lada modellerinde montaj/ruhsat kaydı, karbüratör-enjeksiyon ayarı, pas, elektrik tesisatı ve manuel aktarma organları kontrol edilmelidir.",
              typicalOnset: "Yaş ve kullanım şartlarına bağlı",
              costLevel: "Orta",
              sourceNote: common,
            },
          ],
        },
        {
          engineLabel: "1.5/1.6/1.7 benzin",
          fuelType: "Benzin",
          transmission: "Manuel",
          yearFrom: spec.yearFrom,
          yearTo: spec.yearTo,
          issues: [
            {
              id: issueId(spec, "rust-electrical"),
              severity: "medium",
              title: "Pas, elektrik tesisatı ve mekanik yıpranma kontrolü",
              detail:
                "Lada modellerinde pas, şasi-tabanda kaynak/onarım izi, elektrik tesisatı, karbüratör/enjeksiyon ayarı ve manuel aktarma organları kontrol edilmelidir.",
              typicalOnset: "Yaş ve kullanım şartlarına bağlı",
              costLevel: "Orta",
              sourceNote: common,
            },
          ],
        },
      ];
    case "land-rover":
      return [
        {
          engineLabel: "2.0 Ingenium / TDV6 dizel",
          fuelType: "Dizel",
          transmission: "Otomatik",
          yearFrom: spec.yearFrom,
          yearTo: spec.yearTo,
          issues: [
            {
              id: issueId(spec, "ingenium-air"),
              severity: "high",
              title: "Ingenium/TDV6 zincir, emisyon ve havalı süspansiyon masrafı",
              detail:
                "Land Rover dizellerde Ingenium zincir sesi, EGR/DPF/AdBlue, turbo, otomatik şanzıman, 4x4 aktarma ve havalı süspansiyon/elektronik donanım kontrol edilmelidir.",
              typicalOnset: "100.000-160.000 km",
              costLevel: "Yüksek",
              sourceNote: common,
            },
          ],
        },
        {
          engineLabel: "PHEV/benzinli Si4",
          fuelType: "Hibrit",
          transmission: "Otomatik",
          yearFrom: spec.yearFrom,
          yearTo: spec.yearTo,
          issues: [
            {
              id: issueId(spec, "phev-electronics"),
              severity: "high",
              title: "PHEV/benzinli soğutma, batarya ve elektronik kontrolü",
              detail:
                "PHEV ve benzinli Land Rover modellerinde batarya sağlığı, şarj sistemi, soğutma kaçakları, turbo ve karmaşık elektronik donanım kontrol edilmeli.",
              typicalOnset: "Garanti dışı dönem veya 90.000 km sonrası",
              costLevel: "Yüksek",
              sourceNote: common,
            },
          ],
        },
      ];
    case "lexus-hybrid":
      return [
        {
          engineLabel: "Hibrit e-CVT",
          fuelType: "Hibrit",
          transmission: "Otomatik",
          yearFrom: spec.yearFrom,
          yearTo: spec.yearTo,
          issues: [
            {
              id: issueId(spec, "hybrid-battery-brake"),
              severity: "low",
              title: "Hibrit batarya, inverter soğutma ve fren aktüatörü kontrolü",
              detail:
                "Lexus hibritler dayanıklı kabul edilir; batarya sağlık raporu, inverter soğutma, fren aktüatörü, e-CVT bakım kaydı ve kaza onarım kalitesi kontrol edilmelidir.",
              typicalOnset: "150.000 km sonrası veya uzun yatmış araçlarda",
              costLevel: "Orta",
              sourceNote: common,
            },
          ],
        },
      ];
    case "mg":
      return [
        {
          engineLabel: "Plug-in hibrit",
          fuelType: "Hibrit",
          transmission: "Otomatik",
          yearFrom: spec.yearFrom,
          yearTo: spec.yearTo,
          issues: [
            {
              id: issueId(spec, "phev-battery-dct"),
              severity: "medium",
              title: "PHEV batarya, şarj portu ve otomatik şanzıman kontrolü",
              detail:
                "MG plug-in hibritlerde batarya sağlık raporu, şarj portu, hibrit sistem yazılımı, otomatik/DCT geçişleri ve garanti devri kontrol edilmeli.",
              typicalOnset: "Garanti dışı dönem ve ikinci el devir öncesi",
              costLevel: "Orta",
              sourceNote: common,
            },
          ],
        },
        {
          engineLabel: "Elektrikli güç aktarma",
          fuelType: "Elektrik",
          transmission: "Otomatik",
          yearFrom: spec.yearFrom,
          yearTo: spec.yearTo,
          issues: [
            {
              id: issueId(spec, "ev-battery"),
              severity: "medium",
              title: "Batarya, şarj portu ve yazılım/garanti kontrolü",
              detail:
                "MG elektrikli modellerde batarya sağlık raporu, hızlı şarj geçmişi, şarj portu, termal yönetim, yazılım güncellemeleri ve garanti devri kontrol edilmeli.",
              typicalOnset: "İkinci el devir öncesi",
              costLevel: "Orta",
              sourceNote: common,
            },
          ],
        },
        {
          engineLabel: "1.0/1.5 turbo benzin",
          fuelType: "Benzin",
          transmission: "Otomatik",
          yearFrom: spec.yearFrom,
          yearTo: spec.yearTo,
          issues: [
            {
              id: issueId(spec, "petrol-dct-electronics"),
              severity: "medium",
              title: "Turbo benzinli motor, DCT ve elektronik donanım kontrolü",
              detail:
                "MG benzinli modellerde turbo, DCT/otomatik geçişleri, multimedya/ADAS yazılımı, parça tedarik ve servis kampanyaları kontrol edilmeli.",
              typicalOnset: "Garanti dönemi ve 80.000 km sonrası",
              costLevel: "Orta",
              sourceNote: common,
            },
          ],
        },
      ];
    case "mini":
      return [
        {
          engineLabel: "1.6 Prince",
          fuelType: "Benzin",
          transmission: "Otomatik",
          yearFrom: spec.yearFrom,
          yearTo: 2014,
          issues: [
            {
              id: issueId(spec, "prince-chain"),
              severity: "high",
              title: "Prince motor zincir, yağ tüketimi ve karbon birikimi",
              detail:
                "R56 dönemindeki Prince motorlarda zincir gergisi, yağ tüketimi, turbo/PCV ve direkt enjeksiyon karbon birikimi ciddi masraf yaratabilir.",
              typicalOnset: "80.000-130.000 km",
              costLevel: "Yüksek",
              sourceNote: common,
            },
          ],
        },
        {
          engineLabel: "B38/B48",
          fuelType: "Benzin",
          transmission: "Otomatik",
          yearFrom: 2014,
          yearTo: spec.yearTo,
          issues: [
            {
              id: issueId(spec, "b-series"),
              severity: "medium",
              title: "B serisi motor, soğutma ve motor kulağı kontrolü",
              detail:
                "F nesli Mini'lerde B38/B48 motor daha iyi kabul edilir; motor kulağı, termostat/su pompası, yağ kaçakları ve otomatik şanzıman geçişleri kontrol edilmeli.",
              typicalOnset: "90.000 km sonrası",
              costLevel: "Orta",
              sourceNote: common,
            },
          ],
        },
      ];
    case "mitsubishi":
      return [
        {
          engineLabel: "PHEV hibrit",
          fuelType: "Hibrit",
          transmission: "Otomatik",
          yearFrom: 2013,
          yearTo: spec.yearTo,
          issues: [
            {
              id: issueId(spec, "phev-battery-awd"),
              severity: "medium",
              title: "PHEV batarya, şarj sistemi ve AWD kontrolü",
              detail:
                "Outlander PHEV gibi Mitsubishi hibritlerde batarya sağlık raporu, şarj portu, inverter/soğutma, AWD aktarma ve servis yazılım güncellemeleri kontrol edilmeli.",
              typicalOnset: "120.000 km sonrası veya uzun yatmış araçlarda",
              costLevel: "Orta",
              sourceNote: common,
            },
          ],
        },
        {
          engineLabel: "Benzinli MIVEC",
          fuelType: "Benzin",
          transmission: "Otomatik",
          yearFrom: spec.yearFrom,
          yearTo: spec.yearTo,
          issues: [
            {
              id: issueId(spec, "mivec-cvt"),
              severity: "medium",
              title: "MIVEC motor, CVT/otomatik ve pas-alt takım kontrolü",
              detail:
                "Mitsubishi benzinli modellerde CVT/otomatik yağ bakımı, bobin/sensörler, pas, alt takım ve 4x4 varsa transfer/diferansiyel kontrol edilmeli.",
              typicalOnset: "120.000 km sonrası",
              costLevel: "Orta",
              sourceNote: common,
            },
          ],
        },
        {
          engineLabel: "Dizel DI-D",
          fuelType: "Dizel",
          transmission: "Manuel",
          yearFrom: spec.yearFrom,
          yearTo: spec.yearTo,
          issues: [
            {
              id: issueId(spec, "did-dpf-4x4"),
              severity: "medium",
              title: "DI-D EGR/DPF, turbo ve 4x4 aktarma kontrolü",
              detail:
                "DI-D dizellerde EGR/DPF, turbo, enjektör, ağır kullanım izi ve 4x4 aktarma organları kontrol edilmelidir.",
              typicalOnset: "140.000 km sonrası",
              costLevel: "Orta",
              sourceNote: common,
            },
          ],
        },
      ];
    case "nissan":
      return [
        {
          engineLabel: "1.2/1.6 benzin CVT",
          fuelType: "Benzin",
          transmission: "Otomatik",
          yearFrom: spec.yearFrom,
          yearTo: spec.yearTo,
          issues: [
            {
              id: issueId(spec, "cvt-petrol"),
              severity: "medium",
              title: "CVT şanzıman, soğutma ve sensör kontrolü",
              detail:
                "Nissan benzinli CVT araçlarda kalkış titremesi, uğultu, yağ bakım geçmişi, soğutma sistemi ve sensör arızaları kontrol edilmeli.",
              typicalOnset: "100.000-150.000 km",
              costLevel: "Orta",
              sourceNote: common,
            },
          ],
        },
        {
          engineLabel: "1.5 dCi / 1.6 dCi",
          fuelType: "Dizel",
          transmission: "Manuel",
          yearFrom: spec.yearFrom,
          yearTo: spec.yearTo,
          issues: [
            {
              id: issueId(spec, "dci-egr-dpf"),
              severity: "medium",
              title: "dCi EGR/DPF, turbo ve enjektör kontrolü",
              detail:
                "Renault-Nissan dCi motorlarda EGR/DPF, turbo, enjektör, triger bakım kaydı ve kısa mesafe kullanım geçmişi kontrol edilmelidir.",
              typicalOnset: "120.000 km sonrası",
              costLevel: "Orta",
              sourceNote: common,
            },
          ],
        },
      ];
    case "pickup":
      return [
        {
          engineLabel: "Dizel pickup motoru",
          fuelType: "Dizel",
          transmission: "Otomatik",
          yearFrom: spec.yearFrom,
          yearTo: spec.yearTo,
          issues: [
            {
              id: issueId(spec, "pickup-4x4"),
              severity: "medium",
              title: "Enjektör/turbo, DPF ve 4x4 arazi kullanım izi",
              detail:
                "Pickup modellerde enjektör, turbo, EGR/DPF, otomatik şanzıman, transfer kutusu, diferansiyel ve şasi-alt takımda ağır yük/arazi kullanım izi kontrol edilmeli.",
              typicalOnset: "Ticari/ağır kullanıma bağlı",
              costLevel: "Orta",
              sourceNote: common,
            },
          ],
        },
      ];
    case "porsche":
      return [
        {
          engineLabel: "E-Hybrid",
          fuelType: "Hibrit",
          transmission: "Otomatik",
          yearFrom: 2010,
          yearTo: spec.yearTo,
          issues: [
            {
              id: issueId(spec, "ehybrid-battery-air"),
              severity: "high",
              title: "E-Hybrid batarya, soğutma ve havalı süspansiyon kontrolü",
              detail:
                "Porsche E-Hybrid modellerde batarya sağlık raporu, şarj sistemi, soğutma, PDK/Tiptronic bakım geçmişi ve havalı süspansiyon yüksek maliyetli kontrol kalemleridir.",
              typicalOnset: "Garanti dışı dönem ve 100.000 km sonrası",
              costLevel: "Yüksek",
              sourceNote: common,
            },
          ],
        },
        {
          engineLabel: "Benzinli boxer/V6/V8",
          fuelType: "Benzin",
          transmission: "Otomatik",
          yearFrom: spec.yearFrom,
          yearTo: spec.yearTo,
          issues: [
            {
              id: issueId(spec, "petrol-pdk-cooling"),
              severity: "high",
              title: "Motor yağ/soğutma, PDK/Tiptronic ve pahalı donanım kontrolü",
              detail:
                "Porsche modellerinde yağ kaçakları, soğutma sistemi, PDK/Tiptronic bakım geçmişi, fren-süspansiyon sarfiyatı ve kaza pist/performans kullanımı kontrol edilmeli.",
              typicalOnset: "90.000 km sonrası veya ağır kullanımda daha erken",
              costLevel: "Yüksek",
              sourceNote: common,
            },
          ],
        },
        {
          engineLabel: "Dizel / hibrit SUV varyant",
          fuelType: "Dizel",
          transmission: "Otomatik",
          yearFrom: spec.yearFrom,
          yearTo: spec.yearTo,
          issues: [
            {
              id: issueId(spec, "suv-transfer-air"),
              severity: "high",
              title: "Transfer kutusu, havalı süspansiyon ve emisyon sistemi",
              detail:
                "SUV Porsche modellerinde transfer kutusu, havalı süspansiyon, EGR/DPF/AdBlue veya hibrit batarya ve yüksek maliyetli elektronik donanım kontrol edilmeli.",
              typicalOnset: "100.000 km sonrası",
              costLevel: "Yüksek",
              sourceNote: common,
            },
          ],
        },
      ];
    case "ssangyong":
      return [
        {
          engineLabel: "2.0/2.2 e-XDi dizel",
          fuelType: "Dizel",
          transmission: "Otomatik",
          yearFrom: spec.yearFrom,
          yearTo: spec.yearTo,
          issues: [
            {
              id: issueId(spec, "exdi-auto-parts"),
              severity: "medium",
              title: "e-XDi dizel, otomatik/AWD ve parça-servis bulunurluğu",
              detail:
                "SsangYong modellerinde EGR/DPF, enjektör, otomatik şanzıman, AWD aktarma ve parça/servis bulunurluğu ikinci elde kritik kontrol kalemidir.",
              typicalOnset: "120.000 km sonrası",
              costLevel: "Orta",
              sourceNote: common,
            },
          ],
        },
      ];
    case "subaru":
      return [
        {
          engineLabel: "Boxer benzin / AWD",
          fuelType: "Benzin",
          transmission: "Otomatik",
          yearFrom: spec.yearFrom,
          yearTo: spec.yearTo,
          issues: [
            {
              id: issueId(spec, "boxer-cvt-awd"),
              severity: "medium",
              title: "Boxer yağ kaçakları, CVT ve simetrik AWD kontrolü",
              detail:
                "Subaru boxer motorlarda yağ kaçakları, soğutma sistemi, CVT yağ bakımı ve simetrik AWD için eş lastik/aktarma hassasiyeti kontrol edilmeli.",
              typicalOnset: "120.000 km sonrası",
              costLevel: "Orta",
              sourceNote: common,
            },
          ],
        },
        {
          engineLabel: "Boxer dizel",
          fuelType: "Dizel",
          transmission: "Manuel",
          yearFrom: spec.yearFrom,
          yearTo: spec.yearTo,
          issues: [
            {
              id: issueId(spec, "boxer-diesel"),
              severity: "high",
              title: "Boxer dizel DPF/EGR ve motor içi aşınma kontrolü",
              detail:
                "Boxer dizel Subaru modellerinde DPF/EGR, turbo, debriyaj-volan ve motor içi aşınma geçmişi dikkatle kontrol edilmeli.",
              typicalOnset: "120.000 km sonrası",
              costLevel: "Yüksek",
              sourceNote: common,
            },
          ],
        },
      ];
    case "suzuki":
      return [
        {
          engineLabel: "1.2/1.4 BoosterJet / atmosferik",
          fuelType: "Benzin",
          transmission: "Otomatik",
          yearFrom: spec.yearFrom,
          yearTo: spec.yearTo,
          issues: [
            {
              id: issueId(spec, "petrol-awd"),
              severity: "low",
              title: "Benzinli motor, otomatik/CVT ve AllGrip bakım kontrolü",
              detail:
                "Suzuki modelleri genel olarak dayanıklı kabul edilir; CVT/otomatik yağ bakımı, turbo hortumları, AllGrip aktarma ve alt takım-korozyon kontrol edilmeli.",
              typicalOnset: "120.000 km sonrası",
              costLevel: "Orta",
              sourceNote: common,
            },
          ],
        },
      ];
    case "volvo":
      return [
        {
          engineLabel: "T3/T4/T5 benzin",
          fuelType: "Benzin",
          transmission: "Otomatik",
          yearFrom: spec.yearFrom,
          yearTo: spec.yearTo,
          issues: [
            {
              id: issueId(spec, "petrol-cooling-auto"),
              severity: "medium",
              title: "Benzinli turbo, soğutma ve otomatik şanzıman kontrolü",
              detail:
                "Volvo benzinli turbo motorlarda soğutma kaçakları, turbo hortumları, PCV/yağ kaçakları, otomatik şanzıman bakımı ve elektronik donanım kontrol edilmelidir.",
              typicalOnset: "100.000 km sonrası",
              costLevel: "Orta",
              sourceNote: common,
            },
          ],
        },
        {
          engineLabel: "D3/D4/D5 dizel",
          fuelType: "Dizel",
          transmission: "Otomatik",
          yearFrom: spec.yearFrom,
          yearTo: spec.yearTo,
          issues: [
            {
              id: issueId(spec, "diesel-egr-auto"),
              severity: "medium",
              title: "Dizel EGR/DPF, otomatik şanzıman ve AWD kontrolü",
              detail:
                "Volvo dizellerde EGR/DPF, turbo, enjektör, otomatik şanzıman bakım geçmişi ve AWD varsa Haldex/aktarma kontrol edilmelidir.",
              typicalOnset: "130.000 km sonrası",
              costLevel: "Orta",
              sourceNote: common,
            },
          ],
        },
        {
          engineLabel: "T3/T4/T5 veya T8 hibrit",
          fuelType: "Hibrit",
          transmission: "Otomatik",
          yearFrom: spec.yearFrom,
          yearTo: spec.yearTo,
          issues: [
            {
              id: issueId(spec, "petrol-hybrid-electronics"),
              severity: "medium",
              title: "Benzinli/hibrit soğutma, batarya ve elektronik kontrolü",
              detail:
                "Volvo benzinli ve hibritlerde soğutma kaçakları, turbo, hibrit batarya sağlığı, sensör/ADAS ve multimedya yazılım geçmişi kontrol edilmeli.",
              typicalOnset: "100.000 km sonrası veya garanti dışı dönemde",
              costLevel: "Orta",
              sourceNote: common,
            },
          ],
        },
      ];
  }
}

function variant(
  spec: Spec,
  suffix: string,
  engineLabel: string,
  fuelType: EngineVariant["fuelType"],
  transmission: EngineVariant["transmission"],
  yearFrom: number,
  yearTo: number,
  title: string,
  detail: string,
  severity: "high" | "medium" | "low" = "medium",
): EngineVariant {
  return {
    engineLabel,
    fuelType,
    transmission,
    yearFrom,
    yearTo,
    issues: [
      {
        id: issueId(spec, suffix),
        severity,
        title,
        detail,
        typicalOnset: "90.000-150.000 km veya yaşa bağlı",
        costLevel: severity === "high" ? "Yüksek" : "Orta",
        sourceNote: `${spec.brand} ${spec.model} motor/yıl varyant kayıtları, Türkiye ikinci el ilan dağılımı, bağımsız servis notları ve aynı motor ailesi kullanıcı deneyimlerinde tekrar eden kontrol başlığı.`,
      },
    ],
  };
}

function specificModelEngines(spec: Spec): EngineVariant[] | null {
  const key = `${spec.brand}::${spec.model}`;
  const map: Record<string, EngineVariant[]> = {
    "Seat::Arona": [
      variant(
        spec,
        "10tsi-dq200",
        "1.0 TSI",
        "Benzin",
        "Yarı otomatik",
        2017,
        2026,
        "1.0 TSI turbo/soğutma ve DQ200 DSG kontrolü",
        "Arona 1.0 TSI'da turbo aktüatör sesi, bobin/buji, soğutma kaçakları ve kuru kavrama DQ200 DSG'de kalkış titremesi/mekatronik kontrol edilmeli.",
      ),
      variant(
        spec,
        "16tdi-dpf",
        "1.6 TDI",
        "Dizel",
        "Manuel",
        2017,
        2020,
        "1.6 TDI EGR/DPF ve kısa mesafe kullanım riski",
        "1.6 TDI Arona'da EGR/DPF doluluk, turbo aktüatör, enjektör düzeltmeleri ve şehir içi kullanım geçmişi kontrol edilmeli.",
      ),
    ],
    "Seat::Ateca": [
      variant(
        spec,
        "14-15tsi-dsg",
        "1.4/1.5 TSI",
        "Benzin",
        "Yarı otomatik",
        2016,
        2026,
        "1.4/1.5 TSI ACT ve DSG davranışı",
        "Ateca TSI'da ACT silindir kapama, düşük hız silkelenmesi, turbo/soğutma kaçakları ve DSG kavrama-mekatronik davranışı test edilmeli.",
      ),
      variant(
        spec,
        "16-20tdi-4drive",
        "1.6/2.0 TDI",
        "Dizel",
        "Otomatik",
        2016,
        2024,
        "TDI emisyon sistemi ve 4Drive/Haldex bakımı",
        "TDI Ateca'da EGR/DPF, turbo, DSG yağ bakım kaydı ve 4Drive varsa Haldex/arka diferansiyel bakımı kontrol edilmeli.",
      ),
    ],
    "Seat::Toledo": [
      variant(
        spec,
        "12tsi-chain",
        "1.2 TSI",
        "Benzin",
        "Manuel",
        2012,
        2019,
        "1.2 TSI zincir/turbo ve soğutma kontrolü",
        "Toledo 1.2 TSI'da erken zincir sesi, turbo wastegate, PCV ve soğutma sistemi kaçakları kontrol edilmeli.",
      ),
      variant(
        spec,
        "16tdi-dsg",
        "1.6 TDI",
        "Dizel",
        "Yarı otomatik",
        2012,
        2019,
        "1.6 TDI EGR/DPF ve DSG kuru kavrama kontrolü",
        "1.6 TDI Toledo'da EGR/DPF, enjektör, turbo ve DSG'de kalkış titremesi/vuruntu kontrol edilmeli.",
      ),
    ],
    "Skoda::Kamiq": [
      variant(
        spec,
        "10-15tsi-dsg",
        "1.0/1.5 TSI",
        "Benzin",
        "Yarı otomatik",
        2019,
        2026,
        "TSI turbo/ACT ve DQ200 DSG kontrolü",
        "Kamiq TSI'da 1.0 turbo aktüatör, 1.5 TSI düşük hız silkelenmesi, soğutma kaçakları ve DQ200 DSG kavrama-mekatronik kontrol edilmeli.",
      ),
    ],
    "Skoda::Karoq": [
      variant(
        spec,
        "15tsi-dsg",
        "1.5 TSI",
        "Benzin",
        "Yarı otomatik",
        2017,
        2026,
        "1.5 TSI silkelenme/ACT ve DSG kontrolü",
        "Karoq 1.5 TSI'da düşük hız silkelenmesi, ACT yazılımı, turbo/soğutma sistemi ve DSG kavrama-mekatronik davranışı kontrol edilmeli.",
      ),
      variant(
        spec,
        "16tdi-dpf",
        "1.6 TDI",
        "Dizel",
        "Otomatik",
        2017,
        2021,
        "1.6 TDI EGR/DPF ve DSG bakım geçmişi",
        "Dizel Karoq'ta EGR/DPF, turbo aktüatör, enjektör düzeltmeleri ve DSG yağ/kavrama geçmişi kontrol edilmeli.",
      ),
    ],
    "Skoda::Kodiaq": [
      variant(
        spec,
        "15tsi-dsg",
        "1.5 TSI",
        "Benzin",
        "Yarı otomatik",
        2017,
        2026,
        "1.5 TSI ACT, DSG ve ağır kasa kontrolü",
        "Kodiaq 1.5 TSI'da ağır kasa kullanımına bağlı kavrama yükü, ACT silkelenmesi, turbo/soğutma ve DSG davranışı test edilmeli.",
      ),
      variant(
        spec,
        "20tdi-4x4",
        "2.0 TDI 4x4",
        "Dizel",
        "Otomatik",
        2017,
        2026,
        "2.0 TDI emisyon, DSG ve 4x4/Haldex bakımı",
        "2.0 TDI Kodiaq'ta EGR/DPF/AdBlue, turbo, DSG yağı, Haldex ve diferansiyel bakım kayıtları kontrol edilmeli.",
      ),
    ],
    "Skoda::Rapid": [
      variant(
        spec,
        "12tsi-chain",
        "1.2 TSI",
        "Benzin",
        "Manuel",
        2012,
        2019,
        "1.2 TSI zincir/gerdirici ve turbo kontrolü",
        "Rapid 1.2 TSI'da zincir sesi, turbo wastegate, PCV ve yağ bakım aralıkları kontrol edilmeli.",
      ),
      variant(
        spec,
        "16tdi-dsg",
        "1.6 TDI",
        "Dizel",
        "Yarı otomatik",
        2012,
        2019,
        "1.6 TDI EGR/DPF ve DSG kavrama kontrolü",
        "1.6 TDI Rapid'de EGR/DPF, enjektör ve DSG kuru kavrama-mekatronik davranışı kontrol edilmeli.",
      ),
    ],
    "Skoda::Superb": [
      variant(
        spec,
        "14-15tsi-dsg",
        "1.4/1.5 TSI",
        "Benzin",
        "Yarı otomatik",
        2008,
        2026,
        "TSI zincir/ACT ve DSG kontrolü",
        "Superb TSI'da erken 1.4 TSI zincir/gerdirici, yeni 1.5 TSI ACT silkelenmesi, turbo/soğutma ve DSG kontrol edilmeli.",
      ),
      variant(
        spec,
        "16-20tdi-dsg",
        "1.6/2.0 TDI",
        "Dizel",
        "Otomatik",
        2008,
        2026,
        "TDI EGR/DPF, DSG ve uzun yol-yük geçmişi",
        "Superb TDI'da EGR/DPF/AdBlue, turbo, DSG yağ bakımı, yüksek kilometre ve filo/uzun yol kullanım geçmişi kontrol edilmeli.",
      ),
    ],
    "Honda::City": [
      variant(
        spec,
        "15ivtec-cvt",
        "1.5 i-VTEC",
        "Benzin",
        "Otomatik",
        2002,
        2026,
        "1.5 i-VTEC CVT ve LPG/subap kontrolü",
        "City 1.5 i-VTEC'te CVT yağ bakımı, motor kulağı, LPG varsa subap ayarı/ruhsat, bobin ve kaza-kaporta geçmişi kontrol edilmeli.",
        "low",
      ),
    ],
    "Honda::CR-V": [
      variant(
        spec,
        "20ivtec-auto-awd",
        "2.0 i-VTEC",
        "Benzin",
        "Otomatik",
        2000,
        2026,
        "2.0 i-VTEC otomatik/AWD ve LPG kontrolü",
        "CR-V 2.0 i-VTEC'te otomatik şanzıman yağı, AWD diferansiyel, LPG subap ayarı ve süspansiyon burçları kontrol edilmeli.",
      ),
      variant(
        spec,
        "16idtec-dpf",
        "1.6 i-DTEC",
        "Dizel",
        "Otomatik",
        2015,
        2020,
        "1.6 i-DTEC DPF/EGR ve turbo kontrolü",
        "Dizel CR-V'de DPF/EGR, turbo, enjektör ve kısa mesafe kullanım geçmişi kontrol edilmeli.",
      ),
      variant(
        spec,
        "ehev-battery",
        "e:HEV hibrit",
        "Hibrit",
        "Otomatik",
        2019,
        2026,
        "e:HEV batarya/inverter ve e-CVT kontrolü",
        "Hibrit CR-V'de batarya sağlık raporu, inverter soğutma, e-CVT davranışı ve servis kampanyaları kontrol edilmeli.",
        "low",
      ),
    ],
    "Honda::HR-V": [
      variant(
        spec,
        "15ivtec-cvt",
        "1.5 i-VTEC",
        "Benzin",
        "Otomatik",
        2015,
        2026,
        "1.5 i-VTEC CVT ve elektronik kontrolü",
        "HR-V'de CVT yağ bakımı, motor kulağı, klima-kompresör/elektronik donanım ve LPG varsa subap ayarı kontrol edilmeli.",
        "low",
      ),
      variant(
        spec,
        "ehev-hybrid",
        "e:HEV hibrit",
        "Hibrit",
        "Otomatik",
        2021,
        2026,
        "e:HEV batarya ve inverter kontrolü",
        "HR-V e:HEV'de batarya sağlık raporu, inverter soğutma ve yazılım/servis kampanyaları kontrol edilmeli.",
        "low",
      ),
    ],
    "Honda::Jazz": [
      variant(
        spec,
        "14-13ivtec-cvt",
        "1.3/1.4 i-VTEC",
        "Benzin",
        "Otomatik",
        2002,
        2020,
        "i-VTEC CVT/i-Shift ve LPG-subap kontrolü",
        "Jazz'da CVT yağı, eski i-Shift davranışı, motor kulağı, LPG varsa subap ayarı ve arka havuz/pas kontrol edilmeli.",
        "low",
      ),
      variant(
        spec,
        "ehev-hybrid",
        "e:HEV hibrit",
        "Hibrit",
        "Otomatik",
        2020,
        2026,
        "e:HEV batarya ve fren/elektronik kontrolü",
        "Jazz e:HEV'de batarya sağlık raporu, inverter, fren aktüatörü ve servis kampanyaları kontrol edilmeli.",
        "low",
      ),
    ],
    "Nissan::Juke": [
      variant(
        spec,
        "12dig-t-chain",
        "1.2 DIG-T",
        "Benzin",
        "Manuel",
        2014,
        2019,
        "1.2 DIG-T zincir/yağ tüketimi ve turbo kontrolü",
        "Juke 1.2 DIG-T'de zincir sesi, yağ tüketimi, turbo/soğutma ve motor yazılım güncellemeleri kontrol edilmeli.",
      ),
      variant(
        spec,
        "16cvt",
        "1.6 benzin CVT",
        "Benzin",
        "Otomatik",
        2010,
        2026,
        "1.6 CVT uğultu/titreme ve yağ bakım kontrolü",
        "Juke CVT'de kalkış titremesi, uğultu, geçiş gecikmesi ve CVT yağ bakım geçmişi kontrol edilmeli.",
      ),
      variant(
        spec,
        "15dci",
        "1.5 dCi",
        "Dizel",
        "Manuel",
        2010,
        2019,
        "1.5 dCi EGR/DPF ve turbo kontrolü",
        "Juke 1.5 dCi'da EGR/DPF, turbo, enjektör ve triger bakım kaydı kontrol edilmeli.",
      ),
    ],
    "Nissan::Micra": [
      variant(
        spec,
        "12-10-petrol-cvt",
        "1.0/1.2 benzin",
        "Benzin",
        "Otomatik",
        2000,
        2023,
        "Küçük benzinli motor, CVT/otomatik ve zincir kontrolü",
        "Micra'da zincir sesi, bobin/sensör, CVT/otomatik yağ bakımı, direksiyon kolon/elektrik ve pas-kaza geçmişi kontrol edilmeli.",
        "low",
      ),
      variant(
        spec,
        "15dci",
        "1.5 dCi",
        "Dizel",
        "Manuel",
        2003,
        2017,
        "1.5 dCi enjektör/EGR ve triger kontrolü",
        "Dizel Micra'da enjektör, EGR, turbo ve triger bakım geçmişi kontrol edilmeli.",
      ),
    ],
    "Nissan::X-Trail": [
      variant(
        spec,
        "16-17dci-xtronic",
        "1.6/1.7 dCi X-Tronic",
        "Dizel",
        "Otomatik",
        2014,
        2022,
        "dCi EGR/DPF ve X-Tronic CVT kontrolü",
        "X-Trail dizelde EGR/DPF, turbo, enjektör ve X-Tronic CVT'de titreme/uğultu/yağ bakım geçmişi kontrol edilmeli.",
      ),
      variant(
        spec,
        "epower",
        "e-Power hibrit",
        "Hibrit",
        "Otomatik",
        2022,
        2026,
        "e-Power batarya/jeneratör ve yazılım kontrolü",
        "e-Power X-Trail'de batarya sağlık raporu, jeneratör motoru, inverter soğutma ve yazılım kampanyaları kontrol edilmeli.",
      ),
    ],
    "Nissan::Navara": [
      variant(
        spec,
        "25dci-4x4",
        "2.5 dCi",
        "Dizel",
        "Otomatik",
        2000,
        2015,
        "2.5 dCi zincir, enjektör ve şasi kontrolü",
        "Navara 2.5 dCi'da zincir sesi, enjektör, turbo, şasi çatlak/pas ve 4x4 arazi kullanım izleri kontrol edilmeli.",
        "high",
      ),
      variant(
        spec,
        "23dci-4x4",
        "2.3 dCi",
        "Dizel",
        "Otomatik",
        2015,
        2022,
        "2.3 dCi EGR/DPF ve 4x4 aktarma kontrolü",
        "Yeni Navara'da EGR/DPF, turbo, otomatik şanzıman, transfer kutusu ve ağır yük geçmişi kontrol edilmeli.",
      ),
    ],
    "Kia::Ceed": [
      variant(
        spec,
        "14-16crdi-dct",
        "1.4/1.6 CRDi",
        "Dizel",
        "Yarı otomatik",
        2006,
        2021,
        "CRDi EGR/DPF ve DCT/otomatik kontrolü",
        "Ceed CRDi'da EGR/DPF, turbo, enjektör, çift kütle volan ve DCT/otomatik bakım geçmişi kontrol edilmeli.",
      ),
      variant(
        spec,
        "10-14tgdi",
        "1.0/1.4 T-GDI",
        "Benzin",
        "Yarı otomatik",
        2015,
        2026,
        "T-GDI turbo, LSPI ve DCT kavrama kontrolü",
        "Ceed T-GDI'da turbo, yağ bakım kalitesi, LSPI hassasiyeti, bobin ve DCT kavrama davranışı kontrol edilmeli.",
      ),
    ],
    "Kia::Picanto": [
      variant(
        spec,
        "10-12-petrol",
        "1.0/1.2 benzin",
        "Benzin",
        "Otomatik",
        2004,
        2026,
        "Küçük benzinli motor ve otomatik şanzıman kontrolü",
        "Picanto'da zincir sesi, bobin/sensör, otomatik şanzıman yağı, şehir içi yıpranma ve kaza boya geçmişi kontrol edilmeli.",
        "low",
      ),
    ],
    "Kia::Rio": [
      variant(
        spec,
        "14crdi",
        "1.4 CRDi",
        "Dizel",
        "Manuel",
        2011,
        2020,
        "1.4 CRDi EGR/DPF ve turbo kontrolü",
        "Rio CRDi'da EGR/DPF, turbo, enjektör ve şehir içi kullanım geçmişi kontrol edilmeli.",
      ),
      variant(
        spec,
        "12-14-petrol-auto",
        "1.2/1.4 benzin",
        "Benzin",
        "Otomatik",
        2000,
        2023,
        "Benzinli motor, otomatik ve LPG/subap kontrolü",
        "Rio benzinlide bobin/sensör, otomatik şanzıman yağı, LPG varsa subap ayarı ve kaza geçmişi kontrol edilmeli.",
        "low",
      ),
    ],
    "Kia::Sorento": [
      variant(
        spec,
        "22crdi-awd",
        "2.2 CRDi AWD",
        "Dizel",
        "Otomatik",
        2009,
        2026,
        "2.2 CRDi emisyon, otomatik ve AWD aktarma kontrolü",
        "Sorento 2.2 CRDi'da EGR/DPF, turbo, otomatik şanzıman, AWD diferansiyel/transfer ve ağır kullanım izleri kontrol edilmeli.",
        "medium",
      ),
      variant(
        spec,
        "hybrid",
        "1.6 T-GDI hibrit/PHEV",
        "Hibrit",
        "Otomatik",
        2020,
        2026,
        "Hibrit batarya, turbo ve otomatik şanzıman kontrolü",
        "Sorento hibritte batarya sağlık raporu, turbo benzinli motor, hibrit yazılımı ve otomatik şanzıman geçişleri kontrol edilmeli.",
      ),
    ],
    "Volvo::S90": [
      variant(
        spec,
        "d4-d5",
        "D4/D5 dizel",
        "Dizel",
        "Otomatik",
        2016,
        2022,
        "D4/D5 EGR/DPF ve Geartronic/AWD kontrolü",
        "S90 dizelde EGR/DPF/AdBlue, turbo, Geartronic bakım geçmişi ve AWD varsa Haldex kontrol edilmeli.",
      ),
      variant(
        spec,
        "t8",
        "T8 Recharge",
        "Hibrit",
        "Otomatik",
        2017,
        2026,
        "T8 batarya/şarj ve elektronik donanım kontrolü",
        "S90 T8'de batarya sağlık raporu, şarj portu, inverter/soğutma, ADAS ve multimedya yazılım geçmişi kontrol edilmeli.",
      ),
    ],
    "Volvo::XC40": [
      variant(
        spec,
        "t3-t4",
        "T3/T4 benzin",
        "Benzin",
        "Otomatik",
        2018,
        2026,
        "T3/T4 turbo benzin ve otomatik şanzıman kontrolü",
        "XC40 benzinlide turbo, soğutma kaçakları, PCV/yağ kaçakları, otomatik şanzıman ve elektronik donanım kontrol edilmeli.",
      ),
      variant(
        spec,
        "recharge-ev",
        "Recharge elektrikli",
        "Elektrik",
        "Otomatik",
        2021,
        2026,
        "EV batarya, şarj ve yazılım kontrolü",
        "XC40 Recharge'da batarya sağlık raporu, hızlı şarj geçmişi, yazılım güncellemeleri ve garanti devri kontrol edilmeli.",
      ),
    ],
    "Volvo::XC60": [
      variant(
        spec,
        "d4-d5",
        "D4/D5 dizel",
        "Dizel",
        "Otomatik",
        2008,
        2022,
        "D4/D5 EGR/DPF, Geartronic ve AWD kontrolü",
        "XC60 dizelde EGR/DPF, turbo, Geartronic yağ bakımı, AWD/Haldex ve ön takım burçları kontrol edilmeli.",
      ),
      variant(
        spec,
        "t8",
        "T8 Recharge",
        "Hibrit",
        "Otomatik",
        2017,
        2026,
        "T8 batarya, şarj ve elektronik kontrolü",
        "XC60 T8'de batarya sağlık raporu, şarj portu, inverter/soğutma, ADAS ve servis yazılım kampanyaları kontrol edilmeli.",
      ),
    ],
    "Volvo::XC90": [
      variant(
        spec,
        "d5-awd",
        "D5 AWD",
        "Dizel",
        "Otomatik",
        2002,
        2022,
        "D5 dizel, Geartronic ve AWD/Haldex kontrolü",
        "XC90 D5'te EGR/DPF, turbo, otomatik şanzıman, AWD/Haldex ve ağır SUV süspansiyon-yürüyen kontrol edilmeli.",
        "medium",
      ),
      variant(
        spec,
        "t8",
        "T8 Recharge",
        "Hibrit",
        "Otomatik",
        2015,
        2026,
        "T8 batarya, şarj ve hava süspansiyon/elektronik kontrolü",
        "XC90 T8'de batarya sağlık raporu, şarj sistemi, inverter, hava süspansiyon ve konfor elektronik donanımı kontrol edilmeli.",
        "high",
      ),
    ],
  };

  return map[key] ?? null;
}

const COMPLETION_SPECS: Spec[] = [
  { brand: "Alfa Romeo", model: "Giulia", yearFrom: 2016, yearTo: 2026, profile: "alfa-premium" },
  { brand: "Alfa Romeo", model: "MiTo", yearFrom: 2008, yearTo: 2018, profile: "alfa-small" },
  { brand: "Alfa Romeo", model: "Stelvio", yearFrom: 2017, yearTo: 2026, profile: "alfa-premium" },
  { brand: "Alfa Romeo", model: "Tonale", yearFrom: 2022, yearTo: 2026, profile: "alfa-premium" },
  { brand: "BYD", model: "Atto 3", yearFrom: 2023, yearTo: 2026, profile: "byd-ev" },
  { brand: "BYD", model: "Dolphin", yearFrom: 2023, yearTo: 2026, profile: "byd-ev" },
  { brand: "BYD", model: "Han", yearFrom: 2023, yearTo: 2026, profile: "byd-ev" },
  { brand: "BYD", model: "Seal", yearFrom: 2023, yearTo: 2026, profile: "byd-ev" },
  { brand: "BYD", model: "Song Plus", yearFrom: 2024, yearTo: 2026, profile: "byd-ev" },
  { brand: "BYD", model: "Tang", yearFrom: 2023, yearTo: 2026, profile: "byd-ev" },
  { brand: "Chery", model: "Tiggo 2", yearFrom: 2016, yearTo: 2026, profile: "chery-suv" },
  { brand: "Chery", model: "Tiggo 4", yearFrom: 2017, yearTo: 2026, profile: "chery-suv" },
  { brand: "Chery", model: "Tiggo 8", yearFrom: 2018, yearTo: 2026, profile: "chery-suv" },
  { brand: "Chery", model: "Tiggo 9", yearFrom: 2024, yearTo: 2026, profile: "chery-suv" },
  { brand: "Chevrolet", model: "Aveo", yearFrom: 2002, yearTo: 2016, profile: "chevrolet" },
  { brand: "Chevrolet", model: "Captiva", yearFrom: 2006, yearTo: 2018, profile: "chevrolet" },
  { brand: "Chevrolet", model: "Epica", yearFrom: 2006, yearTo: 2012, profile: "chevrolet" },
  { brand: "Chevrolet", model: "Lacetti", yearFrom: 2004, yearTo: 2012, profile: "chevrolet" },
  { brand: "Chevrolet", model: "Malibu", yearFrom: 2012, yearTo: 2018, profile: "chevrolet" },
  { brand: "Chevrolet", model: "Spark", yearFrom: 2005, yearTo: 2016, profile: "chevrolet" },
  { brand: "Chevrolet", model: "Trax", yearFrom: 2013, yearTo: 2022, profile: "chevrolet" },
  { brand: "Cupra", model: "Ateca", yearFrom: 2018, yearTo: 2026, profile: "cupra-vag" },
  { brand: "Cupra", model: "Born", yearFrom: 2021, yearTo: 2026, profile: "ev" },
  { brand: "Cupra", model: "Leon", yearFrom: 2020, yearTo: 2026, profile: "cupra-vag" },
  { brand: "DS Automobiles", model: "DS 3", yearFrom: 2010, yearTo: 2026, profile: "ds-psa" },
  { brand: "DS Automobiles", model: "DS 4", yearFrom: 2011, yearTo: 2026, profile: "ds-psa" },
  { brand: "DS Automobiles", model: "DS 9", yearFrom: 2020, yearTo: 2026, profile: "ds-psa" },
  { brand: "Honda", model: "City", yearFrom: 2002, yearTo: 2026, profile: "honda" },
  { brand: "Honda", model: "CR-V", yearFrom: 2000, yearTo: 2026, profile: "honda" },
  { brand: "Honda", model: "HR-V", yearFrom: 2000, yearTo: 2026, profile: "honda" },
  { brand: "Honda", model: "Jazz", yearFrom: 2002, yearTo: 2026, profile: "honda" },
  { brand: "Isuzu", model: "MU-X", yearFrom: 2013, yearTo: 2026, profile: "pickup" },
  { brand: "Jeep", model: "Cherokee", yearFrom: 2000, yearTo: 2023, profile: "jeep" },
  { brand: "Jeep", model: "Compass", yearFrom: 2007, yearTo: 2026, profile: "jeep" },
  { brand: "Jeep", model: "Grand Cherokee", yearFrom: 2000, yearTo: 2026, profile: "jeep" },
  { brand: "Jeep", model: "Wrangler", yearFrom: 2000, yearTo: 2026, profile: "jeep" },
  { brand: "Kia", model: "Ceed", yearFrom: 2006, yearTo: 2026, profile: "kia" },
  { brand: "Kia", model: "Picanto", yearFrom: 2004, yearTo: 2026, profile: "kia" },
  { brand: "Kia", model: "Rio", yearFrom: 2000, yearTo: 2023, profile: "kia" },
  { brand: "Kia", model: "Sorento", yearFrom: 2002, yearTo: 2026, profile: "kia" },
  { brand: "Kia", model: "Soul", yearFrom: 2008, yearTo: 2026, profile: "kia" },
  { brand: "Kia", model: "Stonic", yearFrom: 2017, yearTo: 2026, profile: "kia" },
  { brand: "Lada", model: "Samara", yearFrom: 2000, yearTo: 2013, profile: "lada" },
  { brand: "Lada", model: "Vega", yearFrom: 2000, yearTo: 2012, profile: "lada" },
  { brand: "Land Rover", model: "Defender", yearFrom: 2000, yearTo: 2026, profile: "land-rover" },
  { brand: "Land Rover", model: "Discovery", yearFrom: 2000, yearTo: 2026, profile: "land-rover" },
  { brand: "Land Rover", model: "Discovery Sport", yearFrom: 2015, yearTo: 2026, profile: "land-rover" },
  { brand: "Land Rover", model: "Range Rover", yearFrom: 2000, yearTo: 2026, profile: "land-rover" },
  { brand: "Land Rover", model: "Range Rover Sport", yearFrom: 2005, yearTo: 2026, profile: "land-rover" },
  { brand: "Lexus", model: "CT", yearFrom: 2011, yearTo: 2022, profile: "lexus-hybrid" },
  { brand: "Lexus", model: "ES", yearFrom: 2018, yearTo: 2026, profile: "lexus-hybrid" },
  { brand: "Lexus", model: "IS", yearFrom: 2000, yearTo: 2026, profile: "lexus-hybrid" },
  { brand: "Lexus", model: "RX", yearFrom: 2000, yearTo: 2026, profile: "lexus-hybrid" },
  { brand: "Lexus", model: "UX", yearFrom: 2019, yearTo: 2026, profile: "lexus-hybrid" },
  { brand: "Mazda", model: "2", yearFrom: 2003, yearTo: 2026, profile: "japanese" },
  { brand: "Mazda", model: "6", yearFrom: 2002, yearTo: 2024, profile: "japanese" },
  { brand: "Mazda", model: "CX-3", yearFrom: 2015, yearTo: 2026, profile: "japanese" },
  { brand: "Mazda", model: "CX-30", yearFrom: 2019, yearTo: 2026, profile: "japanese" },
  { brand: "Mazda", model: "CX-5", yearFrom: 2012, yearTo: 2026, profile: "japanese" },
  { brand: "MG", model: "HS", yearFrom: 2018, yearTo: 2026, profile: "mg" },
  { brand: "MG", model: "MG3", yearFrom: 2011, yearTo: 2026, profile: "mg" },
  { brand: "MG", model: "MG5", yearFrom: 2020, yearTo: 2026, profile: "mg" },
  { brand: "Mini", model: "Clubman", yearFrom: 2007, yearTo: 2024, profile: "mini" },
  { brand: "Mini", model: "Countryman", yearFrom: 2010, yearTo: 2026, profile: "mini" },
  { brand: "Mitsubishi", model: "ASX", yearFrom: 2010, yearTo: 2026, profile: "mitsubishi" },
  { brand: "Mitsubishi", model: "Colt", yearFrom: 2004, yearTo: 2026, profile: "mitsubishi" },
  { brand: "Mitsubishi", model: "L200", yearFrom: 2000, yearTo: 2026, profile: "pickup" },
  { brand: "Mitsubishi", model: "Outlander", yearFrom: 2003, yearTo: 2026, profile: "mitsubishi" },
  { brand: "Mitsubishi", model: "Pajero", yearFrom: 2000, yearTo: 2021, profile: "mitsubishi" },
  { brand: "Nissan", model: "Juke", yearFrom: 2010, yearTo: 2026, profile: "nissan" },
  { brand: "Nissan", model: "Micra", yearFrom: 2000, yearTo: 2023, profile: "nissan" },
  { brand: "Nissan", model: "Navara", yearFrom: 2000, yearTo: 2022, profile: "pickup" },
  { brand: "Nissan", model: "Note", yearFrom: 2005, yearTo: 2017, profile: "nissan" },
  { brand: "Nissan", model: "X-Trail", yearFrom: 2001, yearTo: 2026, profile: "nissan" },
  { brand: "Porsche", model: "911", yearFrom: 2000, yearTo: 2026, profile: "porsche" },
  { brand: "Porsche", model: "Boxster", yearFrom: 2000, yearTo: 2026, profile: "porsche" },
  { brand: "Porsche", model: "Cayman", yearFrom: 2005, yearTo: 2026, profile: "porsche" },
  { brand: "Porsche", model: "Macan", yearFrom: 2014, yearTo: 2026, profile: "porsche" },
  { brand: "Porsche", model: "Panamera", yearFrom: 2009, yearTo: 2026, profile: "porsche" },
  { brand: "Seat", model: "Arona", yearFrom: 2017, yearTo: 2026, profile: "vag-seat" },
  { brand: "Seat", model: "Ateca", yearFrom: 2016, yearTo: 2026, profile: "vag-seat" },
  { brand: "Seat", model: "Toledo", yearFrom: 2000, yearTo: 2019, profile: "vag-seat" },
  { brand: "Skoda", model: "Kamiq", yearFrom: 2019, yearTo: 2026, profile: "skoda-vag" },
  { brand: "Skoda", model: "Karoq", yearFrom: 2017, yearTo: 2026, profile: "skoda-vag" },
  { brand: "Skoda", model: "Kodiaq", yearFrom: 2016, yearTo: 2026, profile: "skoda-vag" },
  { brand: "Skoda", model: "Rapid", yearFrom: 2012, yearTo: 2019, profile: "skoda-vag" },
  { brand: "Skoda", model: "Superb", yearFrom: 2001, yearTo: 2026, profile: "skoda-vag" },
  { brand: "SsangYong", model: "Actyon", yearFrom: 2005, yearTo: 2018, profile: "ssangyong" },
  { brand: "SsangYong", model: "Musso", yearFrom: 2000, yearTo: 2026, profile: "ssangyong" },
  { brand: "SsangYong", model: "Rexton", yearFrom: 2001, yearTo: 2026, profile: "ssangyong" },
  { brand: "SsangYong", model: "Tivoli", yearFrom: 2015, yearTo: 2026, profile: "ssangyong" },
  { brand: "Subaru", model: "Impreza", yearFrom: 2000, yearTo: 2026, profile: "subaru" },
  { brand: "Subaru", model: "Legacy", yearFrom: 2000, yearTo: 2020, profile: "subaru" },
  { brand: "Subaru", model: "Outback", yearFrom: 2000, yearTo: 2026, profile: "subaru" },
  { brand: "Subaru", model: "XV", yearFrom: 2011, yearTo: 2026, profile: "subaru" },
  { brand: "Suzuki", model: "Baleno", yearFrom: 2000, yearTo: 2022, profile: "suzuki" },
  { brand: "Suzuki", model: "Ignis", yearFrom: 2000, yearTo: 2026, profile: "suzuki" },
  { brand: "Suzuki", model: "S-Cross", yearFrom: 2013, yearTo: 2026, profile: "suzuki" },
  { brand: "Tesla", model: "Model 3", yearFrom: 2017, yearTo: 2026, profile: "ev" },
  { brand: "Tesla", model: "Model S", yearFrom: 2012, yearTo: 2026, profile: "ev" },
  { brand: "Tesla", model: "Model X", yearFrom: 2015, yearTo: 2026, profile: "ev" },
  { brand: "Togg", model: "T10F", yearFrom: 2025, yearTo: 2026, profile: "ev" },
  { brand: "Volvo", model: "S90", yearFrom: 2016, yearTo: 2026, profile: "volvo" },
  { brand: "Volvo", model: "V60", yearFrom: 2010, yearTo: 2026, profile: "volvo" },
  { brand: "Volvo", model: "XC40", yearFrom: 2018, yearTo: 2026, profile: "volvo" },
  { brand: "Volvo", model: "XC60", yearFrom: 2008, yearTo: 2026, profile: "volvo" },
  { brand: "Volvo", model: "XC90", yearFrom: 2002, yearTo: 2026, profile: "volvo" },
];

export const FORM_CATALOG_COMPLETION_ENTRIES: ModelEntry[] = COMPLETION_SPECS.map((spec) => ({
  brand: spec.brand,
  model: spec.model,
  generation: spec.generation,
  yearFrom: spec.yearFrom,
  yearTo: spec.yearTo,
  generalNote:
    "Form kataloğundaki eksik model kapsamasını tamamlayan kayıt. Bu kayıt kesin arıza hükmü değil; motor/şanzıman/yıl ailesine göre alım öncesi kontrol başlıklarını rapora taşır.",
  engines: specificModelEngines(spec) ?? profileEngines(spec),
}));
