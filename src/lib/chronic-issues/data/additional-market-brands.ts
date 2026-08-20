import type { ModelEntry } from "../types";

// Ikinci el ilani ve satis ekosisteminde gorulen, mevcut 20 markanin disinda
// kalan markalar icin ilk kapsama katmani. Bu kayitlar model/motor ailesi
// rehberidir; tek bir aracin kesin arizasi veya satin alma garantisi degildir.
export const ADDITIONAL_MARKET_BRAND_ENTRIES: ModelEntry[] = [
  {
    brand: "BYD",
    model: "Seal U",
    generation: "2024+",
    yearFrom: 2024,
    yearTo: 2026,
    generalNote:
      "Turkiye pazarinda yeni ve hizli buyuyen bir model oldugu icin uzun donem ikinci el verisi sinirlidir; kontroller daha cok batarya, sarj ve yazilim gecmisi uzerinden yapilmalidir.",
    engines: [
      {
        engineLabel: "DM-i plug-in hibrit",
        fuelType: "Hibrit",
        transmission: "Otomatik",
        reliabilityNote:
          "Uzun donem saha verisi henuz sinirli; hibrit batarya sagligi, sarj gecmisi ve yazilim guncellemeleri alirken oncelikli kontrol edilmelidir.",
        issues: [
          {
            id: "byd-sealu-dmi-battery-software",
            severity: "medium",
            title: "Batarya/sarj gecmisi ve yazilim surumu belirsizligi",
            detail:
              "Yeni nesil plug-in hibritlerde ariza kadar kullanicinin sarj aliskanligi, batarya saglik raporu, servis yazilim guncellemeleri ve garanti devri kritik hale gelir. Eksik kayit ileride menzil ve ikinci el degeri tartismasi yaratabilir.",
            typicalOnset: "Garanti devri ve yuksek km oncesi kontrol",
            costLevel: "Orta",
            sourceNote:
              "Yeni enerji araclari icin marka garanti kosullari, kullanici forumlari ve ikinci el alis rehberlerinde tekrar eden kontrol basligi.",
          },
        ],
      },
    ],
  },
  {
    brand: "Chery",
    model: "Tiggo 7",
    generation: "Pro / Pro Max",
    yearFrom: 2023,
    yearTo: 2026,
    generalNote:
      "Turkiye'de kisa surede yayginlasan bir SUV; uzun donem ikinci el verisi sinirli oldugu icin garanti, servis kaydi ve elektronik donanim kontrolu onemlidir.",
    engines: [
      {
        engineLabel: "1.6 TGDI",
        fuelType: "Benzin",
        transmission: "Otomatik",
        issues: [
          {
            id: "chery-tiggo7-electronics-adas",
            severity: "medium",
            title: "Elektronik/ADAS kalibrasyonu ve servis yazilimi kontrolu",
            detail:
              "Yeni ithal SUV'lerde kamera, radar, multimedya, yazilim surumu ve garanti kapsaminda yapilan servis kampanyalari alis oncesi kontrol edilmelidir. Donanim arizasi mekanik arizadan daha pahali ve parca beklemeli olabilir.",
            typicalOnset: "Garanti doneminde veya kaza/onarim sonrasi",
            costLevel: "Orta",
            sourceNote:
              "Yeni nesil Chery kullanici kayitlari, bayi servis deneyimleri ve ADAS donanimli arac alis rehberlerinde tekrar eden kontrol konusu.",
          },
        ],
      },
    ],
  },
  {
    brand: "Chevrolet",
    model: "Cruze",
    generation: "J300",
    yearFrom: 2009,
    yearTo: 2016,
    engines: [
      {
        engineLabel: "1.6 Ecotec",
        fuelType: "Benzin",
        issues: [
          {
            id: "chevrolet-cruze-16-thermostat-coil",
            severity: "medium",
            title: "Termostat, bobin ve sogutma sistemi arizalari",
            detail:
              "Cruze 1.6 benzinli araclarda termostat govdesi, bobin/atesleme ve sogutma kacagi sik kontrol edilmelidir. Hararet gecmisi conta ve motor ic hasari riskini buyutur.",
            typicalOnset: "80.000-140.000 km",
            costLevel: "Orta",
            sourceNote:
              "Cruze sahip forumlari ve bagimsiz servis kayitlarinda termostat, bobin ve sogutma sistemi tekrar eden bulgulardir.",
          },
        ],
      },
      {
        engineLabel: "1.6 otomatik",
        fuelType: "Benzin",
        transmission: "Otomatik",
        issues: [
          {
            id: "chevrolet-cruze-at-shift",
            severity: "medium",
            title: "Otomatik sanziman vuruntu/gecikme riski",
            detail:
              "Vites gecisinde vuruntu, sogukken gecikme veya geri vitese sert gecis gorulurse yag bakimi, solenoid ve sanziman ariza kayitlari kontrol edilmelidir.",
            typicalOnset: "120.000 km sonrasi",
            costLevel: "Orta",
            sourceNote:
              "Cruze otomatik kullanici sikayetleri ve sanziman servis kaynaklarinda tekrar eden alis oncesi kontrol basligi.",
          },
        ],
      },
    ],
  },
  {
    brand: "Cupra",
    model: "Formentor",
    generation: "2020+",
    yearFrom: 2020,
    yearTo: 2026,
    engines: [
      {
        engineLabel: "1.5 TSI",
        fuelType: "Benzin",
        transmission: "Yarı otomatik",
        issues: [
          {
            id: "cupra-formentor-15tsi-kangaroo-dsg",
            severity: "medium",
            title: "1.5 TSI dusuk hiz silkelenmesi ve DSG bakim hassasiyeti",
            detail:
              "1.5 TSI ailesinde dusuk hizda silkelenme/tekleme sikayeti ve DSG'de kavrama-mekatronik davranisi alis oncesi test surusunde kontrol edilmelidir. Yazilim guncellemesi ve servis kaydi onemlidir.",
            typicalOnset: "Dusuk km'de dahi test surusunde gorulebilir",
            costLevel: "Orta",
            sourceNote:
              "VW Grubu 1.5 TSI/DSG kullanici forumlari ve teknik servis guncelleme kayitlarinda tekrar eden bulgu.",
          },
        ],
      },
    ],
  },
  {
    brand: "Jeep",
    model: "Renegade",
    generation: "BU",
    yearFrom: 2015,
    yearTo: 2026,
    engines: [
      {
        engineLabel: "1.6 Multijet",
        fuelType: "Dizel",
        transmission: "Otomatik",
        issues: [
          {
            id: "jeep-renegade-16mjet-ddct",
            severity: "medium",
            title: "DDCT/otomatik sanziman ve EGR/DPF kontrolu",
            detail:
              "Renegade dizel otomatiklerde kavrama davranisi, vites gecis sarsintisi, EGR ve DPF doluluk gecmisi kontrol edilmelidir. Sehir ici kisa mesafe kullanimi dizel yan sistemleri yorar.",
            typicalOnset: "100.000 km sonrasi",
            costLevel: "Orta",
            sourceNote:
              "Fiat/Jeep Multijet ve DDCT kullanici forumlari ile bagimsiz servis kayitlarinda tekrar eden kontrol basligi.",
          },
        ],
      },
    ],
  },
  {
    brand: "Lexus",
    model: "NX",
    generation: "AZ10 / AZ20",
    yearFrom: 2015,
    yearTo: 2026,
    engines: [
      {
        engineLabel: "300h / 350h hibrit",
        fuelType: "Hibrit",
        transmission: "Otomatik",
        issues: [
          {
            id: "lexus-nx-hybrid-battery-brake",
            severity: "low",
            title: "Hibrit batarya sagligi ve fren aktuatörü kontrolu",
            detail:
              "Lexus hibritler genel olarak dayanikli kabul edilir; yine de batarya saglik raporu, inverter sogutma, fren aktuatörü sesi ve servis kaydi alis oncesi kontrol edilmelidir.",
            typicalOnset: "150.000 km sonrasi veya uzun yatan araclarda",
            costLevel: "Orta",
            sourceNote:
              "Toyota/Lexus hibrit alis rehberleri ve kullanici forumlarinda tekrar eden onleyici kontrol basligi.",
          },
        ],
      },
    ],
  },
  {
    brand: "Mazda",
    model: "3",
    generation: "BL/BM/BN/BP",
    yearFrom: 2009,
    yearTo: 2026,
    engines: [
      {
        engineLabel: "1.5 / 1.6 benzin",
        fuelType: "Benzin",
        issues: [
          {
            id: "mazda3-paint-rust-suspension",
            severity: "medium",
            title: "Ince boya/pas ve alt takim kontrolu",
            detail:
              "Mazda 3 genel olarak mekanik dayanikliligiyle bilinir; ancak ince boya, camurluk/esik pas baslangici ve amortisor-burc sesleri alis oncesi lifte kontrol edilmelidir.",
            typicalOnset: "Yas ve bolge kosullarina bagli",
            costLevel: "Orta",
            sourceNote:
              "Mazda sahip forumlari ve ikinci el alis rehberlerinde boya/pas ve alt takim kontrolu sik tekrarlanir.",
          },
        ],
      },
    ],
  },
  {
    brand: "MG",
    model: "ZS",
    generation: "ZS EV / ZS benzin",
    yearFrom: 2021,
    yearTo: 2026,
    engines: [
      {
        engineLabel: "Elektrikli güç aktarma",
        fuelType: "Elektrik",
        transmission: "Otomatik",
        issues: [
          {
            id: "mg-zs-ev-battery-charging",
            severity: "medium",
            title: "Batarya sagligi, sarj portu ve yazilim kontrolu",
            detail:
              "ZS EV'de batarya saglik raporu, hizli sarj gecmisi, sarj portu/kapagi, klima-batarya termal yonetimi ve servis yazilim guncellemeleri ikinci elde onemlidir.",
            typicalOnset: "Garanti devri ve yuksek km oncesi kontrol",
            costLevel: "Orta",
            sourceNote:
              "EV alis rehberleri, MG kullanici forumlari ve servis deneyimlerinde tekrar eden kontrol kalemleri.",
          },
        ],
      },
    ],
  },
  {
    brand: "Mini",
    model: "Cooper",
    generation: "R56 / F56",
    yearFrom: 2007,
    yearTo: 2026,
    engines: [
      {
        engineLabel: "1.6 Prince turbo",
        fuelType: "Benzin",
        yearFrom: 2007,
        yearTo: 2014,
        issues: [
          {
            id: "mini-r56-prince-chain-carbon",
            severity: "high",
            title: "Prince motor zincir, yag tuketimi ve karbon birikimi",
            detail:
              "R56 Cooper S/JCW Prince motorlarda zincir gergisi, yag tuketimi, turbo/PCV ve direkt enjeksiyon kaynakli karbon birikimi ciddi masraf yaratabilir. Soguk calistirma sesi ve servis faturasi kritik.",
            typicalOnset: "80.000-130.000 km",
            costLevel: "Yüksek",
            sourceNote:
              "Mini R56/Prince motor alis rehberleri ve bagimsiz servis kaynaklarinda cok tekrar eden kronik risk.",
          },
        ],
      },
      {
        engineLabel: "B38/B48",
        fuelType: "Benzin",
        yearFrom: 2014,
        yearTo: 2026,
        issues: [
          {
            id: "mini-f56-engine-mount-cooling",
            severity: "medium",
            title: "Motor kulagi ve sogutma sistemi yipranmasi",
            detail:
              "F56 neslinde B serisi motorlar daha iyi kabul edilir; buna ragmen motor kulagi, termostat/su pompasi ve yag kacaklari kontrol edilmelidir.",
            typicalOnset: "90.000 km sonrasi",
            costLevel: "Orta",
            sourceNote: "Mini F56 kullanici kayitlari ve bagimsiz servis alis kontrol listelerinde tekrar eden bulgu.",
          },
        ],
      },
    ],
  },
  {
    brand: "Tesla",
    model: "Model Y",
    generation: "2021+",
    yearFrom: 2021,
    yearTo: 2026,
    engines: [
      {
        engineLabel: "Elektrikli güç aktarma",
        fuelType: "Elektrik",
        transmission: "Otomatik",
        issues: [
          {
            id: "tesla-modely-battery-suspension",
            severity: "medium",
            title: "Batarya sagligi, kaza onarimi ve salincak/suspansiyon kontrolu",
            detail:
              "Model Y alirken batarya sagligi, supercharge kullanimi, kaza/onarim kaydi, salincak-burc sesleri, cam tavan su/ruzgar sesi ve yazilim ozelliklerinin hesaba devri kontrol edilmelidir.",
            typicalOnset: "Kullanim ve hasar gecmisine bagli",
            costLevel: "Orta",
            sourceNote:
              "Tesla kullanici forumlari, EV alis rehberleri ve servis deneyimlerinde tekrar eden ikinci el kontrol kalemleri.",
          },
        ],
      },
    ],
  },
  {
    brand: "Land Rover",
    model: "Range Rover Evoque",
    generation: "L538 / L551",
    yearFrom: 2011,
    yearTo: 2026,
    engines: [
      {
        engineLabel: "2.0 Ingenium dizel",
        fuelType: "Dizel",
        transmission: "Otomatik",
        yearFrom: 2015,
        yearTo: 2020,
        issues: [
          {
            id: "landrover-evoque-ingenium-chain-dpf",
            severity: "high",
            title: "Ingenium dizel zincir ve DPF/EGR masraf riski",
            detail:
              "2.0 Ingenium dizellerde zincir sesi/uzama, DPF doluluk, EGR ve AdBlue/emisyon sistemi arizalari pahali olabilir. Kisa mesafe kullanim ve uzun yag degisim araliklari riski artirir.",
            typicalOnset: "100.000-160.000 km",
            costLevel: "Yüksek",
            sourceNote:
              "Jaguar Land Rover Ingenium dizel servis kaynaklari ve kullanici forumlarinda tekrar eden yuksek maliyetli risk.",
          },
        ],
      },
    ],
  },
  {
    brand: "Mitsubishi",
    model: "Lancer",
    generation: "CY",
    yearFrom: 2008,
    yearTo: 2017,
    engines: [
      {
        engineLabel: "1.5 / 1.6 MIVEC",
        fuelType: "Benzin",
        issues: [
          {
            id: "mitsubishi-lancer-cvt-rust",
            severity: "medium",
            title: "CVT bakimi, pas ve alt takim kontrolu",
            detail:
              "Lancer mekanik olarak dayanikli kabul edilir; otomatik/CVT versiyonlarda yag bakimi, sogukta ugultu, pas baslangici ve alt takim burclari kontrol edilmelidir.",
            typicalOnset: "120.000 km sonrasi",
            costLevel: "Orta",
            sourceNote:
              "Mitsubishi Lancer sahip forumlari ve ikinci el alis rehberlerinde tekrar eden kontrol basliklari.",
          },
        ],
      },
    ],
  },
  {
    brand: "Subaru",
    model: "Forester",
    generation: "SH/SJ/SK",
    yearFrom: 2008,
    yearTo: 2026,
    engines: [
      {
        engineLabel: "2.0 Boxer benzin",
        fuelType: "Benzin",
        transmission: "Otomatik",
        issues: [
          {
            id: "subaru-forester-boxer-cvt-awd",
            severity: "medium",
            title: "CVT, yag kacaklari ve AWD bakim gecmisi",
            detail:
              "Boxer motorda kapak/kece yag kacaklari, CVT yag bakimi ve simetrik dort ceker sisteminin lastik ebat/esit asinma hassasiyeti kontrol edilmelidir.",
            typicalOnset: "120.000 km sonrasi",
            costLevel: "Orta",
            sourceNote:
              "Subaru sahip forumlari, boxer motor servis kaynaklari ve CVT alis rehberlerinde tekrar eden bulgu.",
          },
        ],
      },
    ],
  },
  {
    brand: "Porsche",
    model: "Cayenne",
    generation: "958 / 9YA",
    yearFrom: 2011,
    yearTo: 2026,
    engines: [
      {
        engineLabel: "3.0 V6 dizel",
        fuelType: "Dizel",
        transmission: "Otomatik",
        yearFrom: 2011,
        yearTo: 2018,
        issues: [
          {
            id: "porsche-cayenne-diesel-transfer-case-air",
            severity: "high",
            title: "Transfer kutusu, havali suspansiyon ve dizel emisyon sistemi",
            detail:
              "Cayenne'de transfer kutusu titreme/vuruntu, havali suspansiyon kompresoru-korukleri, EGR/DPF ve yag kacaklari yuksek maliyetli kontrol kalemleridir.",
            typicalOnset: "100.000 km sonrasi",
            costLevel: "Yüksek",
            sourceNote:
              "Porsche Cayenne alis rehberleri, bagimsiz servis ve kullanici forumlarinda tekrar eden pahali riskler.",
          },
        ],
      },
    ],
  },
  {
    brand: "Alfa Romeo",
    model: "Giulietta",
    generation: "940",
    yearFrom: 2010,
    yearTo: 2021,
    engines: [
      {
        engineLabel: "1.4 MultiAir",
        fuelType: "Benzin",
        issues: [
          {
            id: "alfa-giulietta-multiair-module",
            severity: "high",
            title: "MultiAir unitesi ve yag bakim hassasiyeti",
            detail:
              "1.4 MultiAir motorlarda MultiAir modulu yag kalitesine cok hassastir; gecikmis yag bakimi tekleme, guc kaybi ve pahali modul degisimi yaratabilir.",
            typicalOnset: "80.000-140.000 km",
            costLevel: "Yüksek",
            sourceNote:
              "Alfa Romeo/Fiat MultiAir teknik servis kaynaklari ve kullanici forumlarinda tekrar eden iyi bilinen risk.",
          },
        ],
      },
      {
        engineLabel: "1.6 JTDm",
        fuelType: "Dizel",
        issues: [
          {
            id: "alfa-giulietta-jtdm-egr-dpf",
            severity: "medium",
            title: "EGR/DPF ve turbo hortumu kontrolu",
            detail:
              "Dizel JTDm versiyonlarda EGR, DPF doluluk, turbo hortumu kacaklari ve debriyaj-volan kontrolu ozellikle sehir ici kullanimda onemlidir.",
            typicalOnset: "120.000 km sonrasi",
            costLevel: "Orta",
            sourceNote:
              "JTDm motor ailesi kullanici forumlari ve bagimsiz servis kayitlarinda tekrar eden kontrol basligi.",
          },
        ],
      },
    ],
  },
  {
    brand: "Togg",
    model: "T10X",
    generation: "2023+",
    yearFrom: 2023,
    yearTo: 2026,
    engines: [
      {
        engineLabel: "Elektrikli güç aktarma",
        fuelType: "Elektrik",
        transmission: "Otomatik",
        issues: [
          {
            id: "togg-t10x-software-battery",
            severity: "medium",
            title: "Batarya sagligi, Trumore/hesap devri ve yazilim guncellemesi",
            detail:
              "Yeni yerli EV oldugu icin alirken batarya saglik raporu, sarj gecmisi, garanti devri, servis kampanyalari, yazilim surumu ve hesap/uygulama devri kontrol edilmelidir.",
            typicalOnset: "Ikinci el devir oncesi kontrol",
            costLevel: "Orta",
            sourceNote:
              "EV alis rehberleri, Togg kullanici deneyimleri ve garanti/servis devri pratiklerinde tekrar eden kontrol basliklari.",
          },
        ],
      },
    ],
  },
  {
    brand: "DS Automobiles",
    model: "DS 7",
    generation: "Crossback / DS 7",
    yearFrom: 2018,
    yearTo: 2026,
    engines: [
      {
        engineLabel: "1.5 BlueHDi",
        fuelType: "Dizel",
        transmission: "Otomatik",
        issues: [
          {
            id: "ds7-15bluehdi-adblue-chain",
            severity: "medium",
            title: "AdBlue sistemi ve 1.5 BlueHDi zincir/eksantrik kontrolu",
            detail:
              "PSA 1.5 BlueHDi ailesinde AdBlue deposu/pompasi, NOx sensoru ve eksantrik zinciri/ust kapak kaynakli riskler servis kaydiyla kontrol edilmelidir.",
            typicalOnset: "80.000-150.000 km",
            costLevel: "Orta",
            sourceNote:
              "PSA 1.5 BlueHDi teknik kaynaklari, kullanici sikayetleri ve bagimsiz servis kayitlarinda tekrar eden bulgu.",
          },
        ],
      },
    ],
  },
  {
    brand: "Isuzu",
    model: "D-Max",
    generation: "2. ve 3. nesil",
    yearFrom: 2012,
    yearTo: 2026,
    engines: [
      {
        engineLabel: "1.9 / 2.5 dizel",
        fuelType: "Dizel",
        transmission: "Otomatik",
        issues: [
          {
            id: "isuzu-dmax-4x4-injector-dpf",
            severity: "medium",
            title: "Enjektor, DPF ve 4x4 arazi kullanim izi",
            detail:
              "Pickup alirken enjektor sesi/duman, DPF doluluk, arazi kullanimindan gelen sasi-alt takim hasari, difransiyel ve transfer kutusu yag kacaklari kontrol edilmelidir.",
            typicalOnset: "Ticari/ag kullanima bagli",
            costLevel: "Orta",
            sourceNote:
              "Pickup alis rehberleri, Isuzu kullanici forumlari ve bagimsiz servis listelerinde tekrar eden kontrol kalemleri.",
          },
        ],
      },
    ],
  },
  {
    brand: "SsangYong",
    model: "Korando",
    generation: "C200 / C300",
    yearFrom: 2011,
    yearTo: 2026,
    engines: [
      {
        engineLabel: "2.0 e-XDi / 1.6 dizel",
        fuelType: "Dizel",
        transmission: "Otomatik",
        issues: [
          {
            id: "ssangyong-korando-diesel-awd-parts",
            severity: "medium",
            title: "Dizel emisyon sistemi, AWD ve parca bulunurlugu kontrolu",
            detail:
              "Korando'da EGR/DPF, otomatik sanziman gecisleri, AWD sistem sesi ve parca/servis bulunurlugu ikinci elde onemli risk kalemleridir.",
            typicalOnset: "100.000 km sonrasi",
            costLevel: "Orta",
            sourceNote:
              "SsangYong kullanici forumlari ve ikinci el alis rehberlerinde tekrar eden servis/parca ve dizel yan sistem kontrolleri.",
          },
        ],
      },
    ],
  },
  {
    brand: "Lada",
    model: "Niva",
    generation: "4x4 / Legend",
    yearFrom: 1995,
    yearTo: 2026,
    engines: [
      {
        engineLabel: "1.7 benzin",
        fuelType: "Benzin",
        transmission: "Manuel",
        issues: [
          {
            id: "lada-niva-rust-transfer-electrical",
            severity: "medium",
            title: "Pas, transfer kutusu ugultusu ve elektrik tesisati",
            detail:
              "Niva'da sasi-tabanda pas, transfer kutusu/difransiyel ugultusu, su alma, elektrik tesisati ve arazi kullanimindan kaynakli kaynak/onarim izleri mutlaka kontrol edilmelidir.",
            typicalOnset: "Yas ve arazi kullanimina bagli",
            costLevel: "Orta",
            sourceNote: "Niva sahip forumlari ve arazi araci alis rehberlerinde tekrar eden klasik kontrol basliklari.",
          },
        ],
      },
    ],
  },
];
