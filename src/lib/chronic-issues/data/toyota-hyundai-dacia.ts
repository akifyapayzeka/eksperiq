import type { ModelEntry } from "../types";

// Kaynak: Toyota/Hyundai/Dacia sahip forumları (Toyota Owners Club,
// corollaforum, hyundai-forums, daciaforum), Hyundai'nin kendi teknik
// servis bülteni (7DCT titreme), Toyota'nın resmi geri çağırma kaydı
// (E210 piston segmanı) ve Türkçe kronik arıza veritabanı
// (kronikariza.com.tr) genelinde tekrar eden bulgular.
export const TOYOTA_HYUNDAI_DACIA_ENTRIES: ModelEntry[] = [
  {
    brand: "Toyota",
    model: "Corolla",
    generation: "E170 (2013-2019) ve E210 (2019-2023)",
    yearFrom: 2013,
    yearTo: 2023,
    generalNote:
      "Toyota Corolla genel olarak segmentinin en güvenilir modellerinden biri kabul edilir. Aşağıdaki sorunlar bu genel güvenilirliği değiştirmez, ancak alım öncesi kontrol edilmesi faydalı noktalardır.",
    engines: [
      {
        engineLabel: "1.4 D-4D",
        fuelType: "Dizel",
        transmission: "Manuel",
        yearFrom: 2013,
        yearTo: 2016,
        reliabilityNote:
          "Türkiye'de 2015-2016 civarı emisyon nedeniyle satıştan kalkmıştır; genel olarak dayanıklı kabul edilir.",
        issues: [
          {
            id: "corolla-14d4d-scv",
            severity: "medium",
            title: "Yakıt basınç regülatörü (SCV) tıkanması",
            detail:
              "Yakıt rayı basınç regülatörü zamanla aşınıp tıkanabiliyor; uzun marş süresi, rölantide takılma/stop etme ve güç kaybı şeklinde belirtiler bildiriliyor.",
            typicalOnset: "100.000-150.000 km sonrası",
            costLevel: "Orta",
            sourceNote: "Birden fazla İngilizce oto forumu ve teknik arıza sitesinde tekrar eden bir konu.",
          },
          {
            id: "corolla-14d4d-turbo-oil",
            severity: "low",
            title: "Turbo yağ keçesinden kaynaklı yağ tüketimi",
            detail: "Yüksek kilometrede turbo yağ keçesi veya PCV sistemi kaynaklı yağ tüketimi bildirilmiştir.",
            typicalOnset: "150.000 km üzeri",
            costLevel: "Orta",
            sourceNote: "Birden fazla forum ve arıza veritabanında tekrar eden gözlem.",
          },
        ],
      },
      {
        engineLabel: "1.3 Dual VVT-i",
        fuelType: "Benzin",
        transmission: "Manuel",
        yearFrom: 2013,
        yearTo: 2019,
        reliabilityNote:
          "Bu motor için yaygın/kronik bir mekanik sorun tespit edilemedi; genel olarak çok güvenilir kabul edilir.",
        issues: [],
      },
      {
        engineLabel: "1.6 Valvematic",
        fuelType: "Benzin",
        transmission: "Otomatik",
        yearFrom: 2013,
        yearTo: 2019,
        reliabilityNote:
          "Valvematic sistemi klasik VVT-i'ye göre daha karmaşık ve sorunlara daha açık kabul edilir; Toyota bu sistemi 2015/2016 civarı revize etmiştir.",
        issues: [
          {
            id: "corolla-16valvematic-actuator",
            severity: "high",
            title: "Valvematic aktüatörü tutukluğu (2014-2015 model)",
            detail:
              "Emme manifoldundaki karbon birikimi nedeniyle Valvematic aktüatörü sıkışabiliyor; çoklu arıza kodu, ciddi güç kaybı, bazı durumlarda motorun çalışmaması bildirilmiştir. 2015/2016 sonrası revize motorlarda görülme sıklığı azalmıştır.",
            typicalOnset: "80.000-150.000 km",
            costLevel: "Yüksek",
            sourceNote: "Birden fazla teknik forum ve motor inceleme sitesinde tekrar eden, isimlendirilmiş bir arıza.",
          },
          {
            id: "corolla-16valvematic-oil",
            severity: "medium",
            title: "Yağ tüketimi",
            detail:
              "Bu motorda en sık bildirilen şikayet aşırı yağ tüketimi; piston segmanı/supap keçesi aşınmasına bağlanıyor.",
            typicalOnset: "100.000 km üzeri",
            costLevel: "Orta",
            sourceNote: "Çok sayıda kullanıcı forumunda ve motor spesifikasyon sitelerinde tekrar eden gözlem.",
          },
        ],
      },
      {
        engineLabel: "1.5 Dynamic Force",
        fuelType: "Benzin",
        transmission: "Otomatik",
        yearFrom: 2019,
        yearTo: 2023,
        reliabilityNote:
          "E210 nesli genel olarak güvenilir kabul edilir; bilinen sorunlar çoğunlukla resmi geri çağırma kayıtlarına dayanır.",
        issues: [
          {
            id: "corolla-e210-oilring-recall",
            severity: "medium",
            title: "Piston segmanı/yağ tüketimi geri çağırması (2019-2020 üretim)",
            detail:
              "Bazı 2019-2020 model yıllarında piston segmanı kaynaklı yağ tüketimi sorunu için resmi geri çağırma yapılmıştır; alım öncesi şasi numarasıyla kontrol önerilir.",
            costLevel: "Orta",
            sourceNote: "Resmi Toyota geri çağırma kaydına dayalı bilgi.",
          },
        ],
      },
    ],
  },
  {
    brand: "Hyundai",
    model: "i20",
    generation: "PB (2008-2014) ve GB (2014-2020)",
    yearFrom: 2008,
    yearTo: 2020,
    generalNote:
      "Hyundai i20 genel olarak orta düzeyde güvenilir kabul edilir; motor ailesine göre bilinen belirli zayıf noktalar mevcuttur.",
    engines: [
      {
        engineLabel: "1.4 CRDi",
        fuelType: "Dizel",
        transmission: "Manuel",
        yearFrom: 2008,
        yearTo: 2020,
        issues: [
          {
            id: "i20-14crdi-injector-washer",
            severity: "high",
            title: "Enjektör bakır sızdırmazlık rondelası arızası",
            detail:
              "Enjektörlerin bakır sızdırmazlık rondelaları zamanla arızalanarak egzoz gazının motor yağına karışmasına, is/karbon birikimine ve yağ pompası emme borusunun tıkanmasına yol açabiliyor; bu durum yağ açlığından turbo arızasına kadar ilerleyebiliyor.",
            typicalOnset: "100.000 km üzeri",
            costLevel: "Yüksek",
            sourceNote:
              "Birden fazla teknik forum ve parça/arıza kaynağında tekrar eden, mekanizması net tarif edilmiş bir sorun.",
          },
        ],
      },
      {
        engineLabel: "1.1 CRDi",
        fuelType: "Dizel",
        transmission: "Manuel",
        yearFrom: 2014,
        yearTo: 2020,
        issues: [
          {
            id: "i20-11crdi-fuelpump",
            severity: "medium",
            title: "Yakıt pompası arızası",
            detail: "Yakıt pompasında arıza, marş zorluğu, güç kaybı ve bazen ani stop etmeye yol açabiliyor.",
            typicalOnset: "80.000-120.000 km",
            costLevel: "Orta",
            sourceNote: "Birden fazla teknik/arıza kaynağında tekrar eden gözlem.",
          },
        ],
      },
      {
        engineLabel: "1.2 Kappa",
        fuelType: "Benzin",
        transmission: "Manuel",
        yearFrom: 2008,
        yearTo: 2020,
        issues: [
          {
            id: "i20-12kappa-timingchain",
            severity: "high",
            title: "Triger zinciri gerdirici arızası",
            detail:
              "Ömür boyu parça olarak tasarlanan zincir, hidrolik gerdiricinin zayıflamasıyla gevşeyebiliyor; soğuk marşta 1-30 saniye süren belirgin bir tıkırtı sesi tipik belirtidir.",
            typicalOnset: "60.000-120.000 km",
            costLevel: "Yüksek",
            sourceNote: "Birden fazla İngilizce parça/arıza sitesinde tekrar eden, iyi belgelenmiş bir sorun.",
          },
          {
            id: "i20-12kappa-oil",
            severity: "medium",
            title: "Yağ tüketimi",
            detail:
              "Piston segmanı ve supap keçesi aşınmasına bağlı olarak servisler arası yağ takviyesi gerektiği bildirilmiştir.",
            costLevel: "Orta",
            sourceNote: "Birden fazla kaynakta tekrar eden gözlem.",
          },
        ],
      },
      {
        engineLabel: "1.4 Kappa",
        fuelType: "Benzin",
        transmission: "Manuel",
        yearFrom: 2008,
        yearTo: 2020,
        reliabilityNote: "1.2 Kappa ile aynı motor ailesinden olduğu için benzer zayıf noktaları paylaşıyor.",
        issues: [
          {
            id: "i20-14kappa-timingchain",
            severity: "medium",
            title: "Triger zinciri gerdirici arızası",
            detail:
              "1.2 Kappa'ya benzer şekilde zincir gerdiricisi zamanla zayıflayıp soğuk marşta tıkırtı sesine yol açabiliyor; 1.4 versiyonunda bildirim sıklığı 1.2'ye göre biraz daha düşük.",
            typicalOnset: "80.000-130.000 km",
            costLevel: "Yüksek",
            sourceNote: "Aynı motor ailesi için tekrar eden forum/arıza kaynağı gözlemleri.",
          },
        ],
      },
    ],
  },
  {
    brand: "Hyundai",
    model: "Accent Blue",
    generation: "RB",
    yearFrom: 2011,
    yearTo: 2020,
    generalNote: "Elantra (MD/AD) ile aynı platform ailesini ve benzer motor/şanzıman seçeneklerini paylaşır.",
    engines: [
      {
        engineLabel: "1.6 CRDi",
        fuelType: "Dizel",
        transmission: "Yarı otomatik",
        yearFrom: 2011,
        yearTo: 2020,
        reliabilityNote:
          "7DCT (7 ileri kuru çift kavramalı) şanzımanla eşleştirilen versiyonlarda şanzıman kaynaklı şikayetler manuel versiyona göre belirgin şekilde daha fazladır.",
        issues: [
          {
            id: "accent-16crdi-dct-judder",
            severity: "high",
            title: "7DCT kuru çift kavramalı şanzımanda düşük hızda titreme/sarsıntı",
            detail:
              "Kalkışta veya düşük hızda ani sarsıntı, gecikmeli vites geçişi, kavrama titremesi bildirilmiştir. Hyundai bu konuda teknik servis bülteni yayınlayarak TCU yazılım güncellemesi ve gerekirse çift kavrama değişimi öngörmüştür.",
            typicalOnset: "30.000-80.000 km",
            costLevel: "Yüksek",
            sourceNote:
              "Hyundai'nin kendi teknik servis bülteni ve birden fazla bağımsız şanzıman tamir/forum kaynağında tekrar eden, iyi belgelenmiş bir sorun.",
          },
        ],
      },
      {
        engineLabel: "1.4 D-CVVT",
        fuelType: "Benzin",
        transmission: "Manuel",
        yearFrom: 2011,
        yearTo: 2020,
        issues: [
          {
            id: "accent-14dcvvt-valve",
            severity: "high",
            title: "Supap ve supap yatağı aşınması",
            detail: "İleri kilometrede supap ve supap yatağında aşınma bildirilmektedir.",
            typicalOnset: "Yüksek km (150.000+)",
            costLevel: "Yüksek",
            sourceNote:
              "Türkçe kronik arıza veritabanı (kronikariza.com.tr) ve genel kullanıcı şikayet platformlarında (Şikayetvar) tekrar eden bir konu.",
          },
          {
            id: "accent-14dcvvt-ignition",
            severity: "medium",
            title: "Ateşleme bobini / buji arızası",
            detail:
              "Ateşleme bobini arızası; motor arıza lambası, marş ve performans sorunları, düzensiz rölanti şeklinde belirtiler.",
            costLevel: "Orta",
            sourceNote: "Türkçe kronik arıza veritabanı ve genel Accent şikayet kaynaklarında tekrar eden gözlem.",
          },
        ],
      },
      {
        engineLabel: "1.6 GDI",
        fuelType: "Benzin",
        transmission: "Otomatik",
        yearFrom: 2011,
        yearTo: 2020,
        issues: [
          {
            id: "accent-16gdi-piston-oil",
            severity: "medium",
            title: "Piston segmanı aşınması ve karbon birikimine bağlı yağ tüketimi",
            detail:
              "Direkt enjeksiyonlu (GDI) motorlarda tipik olarak emme supaplarında ve piston segmanlarında karbon birikimi; segmanların yağı düzgün sıyıramaması sonucu yağ tüketiminde artış bildirilmiştir.",
            typicalOnset: "80.000-150.000 km",
            costLevel: "Orta",
            sourceNote:
              "Birden fazla forum ve genel GDI motor arıza kaynağında tekrar eden, GDI motorlar için bilinen bir mekanizma.",
          },
        ],
      },
    ],
  },
  {
    brand: "Hyundai",
    model: "Elantra",
    generation: "MD/AD",
    yearFrom: 2011,
    yearTo: 2020,
    generalNote: "Accent Blue ile aynı platform ailesini ve benzer motor/şanzıman seçeneklerini paylaşır.",
    engines: [
      {
        engineLabel: "1.6 CRDi",
        fuelType: "Dizel",
        transmission: "Yarı otomatik",
        yearFrom: 2011,
        yearTo: 2020,
        issues: [
          {
            id: "elantra-16crdi-dct-judder",
            severity: "high",
            title: "7DCT kuru çift kavramalı şanzımanda düşük hızda titreme/sarsıntı",
            detail: "Kalkışta veya düşük hızda ani sarsıntı, gecikmeli vites geçişi, kavrama titremesi bildirilmiştir.",
            typicalOnset: "30.000-80.000 km",
            costLevel: "Yüksek",
            sourceNote:
              "Hyundai'nin kendi teknik servis bülteni ve birden fazla bağımsız kaynakta tekrar eden, iyi belgelenmiş bir sorun.",
          },
        ],
      },
      {
        engineLabel: "1.6 GDI",
        fuelType: "Benzin",
        transmission: "Otomatik",
        yearFrom: 2011,
        yearTo: 2020,
        issues: [
          {
            id: "elantra-16gdi-piston-oil",
            severity: "medium",
            title: "Piston segmanı aşınması ve karbon birikimine bağlı yağ tüketimi",
            detail:
              "Direkt enjeksiyonlu (GDI) motorlarda emme supaplarında ve piston segmanlarında karbon birikimi; yağ tüketiminde artış bildirilmiştir.",
            typicalOnset: "80.000-150.000 km",
            costLevel: "Orta",
            sourceNote: "Birden fazla forum ve genel GDI motor arıza kaynağında tekrar eden bulgu.",
          },
        ],
      },
    ],
  },
  {
    brand: "Dacia",
    model: "Duster",
    generation: "1. Nesil (2010-2017) ve 2. Nesil (2018-2023)",
    yearFrom: 2010,
    yearTo: 2023,
    generalNote:
      "Dacia Duster'ın genel güvenilirlik notu orta seviyededir; küçük ama can sıkıcı arızalar sık, parça/onarım maliyetleri ise görece düşüktür.",
    engines: [
      {
        engineLabel: "1.5 dCi",
        fuelType: "Dizel",
        transmission: "Manuel",
        yearFrom: 2010,
        yearTo: 2023,
        issues: [
          {
            id: "duster-15dci-turbo",
            severity: "high",
            title: "Turbo arızası (yağ açlığı/aşırı ısınma kaynaklı)",
            detail:
              "İhmal edilen anormal yağ tüketimi veya yağ açlığı sonucu turboda erken aşınma/arıza bildirilmektedir; belirtiler güç kaybı ve artan egzoz emisyonudur.",
            typicalOnset: "100.000 km üzeri, bakım ihmalinde daha erken",
            costLevel: "Yüksek",
            sourceNote: "Birden fazla teknik kaynak ve forum sitesinde tekrar eden bir sorun.",
          },
          {
            id: "duster-15dci-egr",
            severity: "medium",
            title: "EGR valfi tıkanması",
            detail:
              "Özellikle sık kısa mesafe kullanımda EGR valfinde karbon birikimi/tıkanma; duman, güç kaybı ve yakıt tüketiminde artışa yol açabiliyor.",
            typicalOnset: "Kısa mesafe kullanımda daha erken, genelde 80.000 km üzeri",
            costLevel: "Orta",
            sourceNote: "Çok sayıda forum ve arıza kaynağında tekrar eden gözlem.",
          },
        ],
      },
      {
        engineLabel: "1.6 16V",
        fuelType: "Benzin",
        transmission: "Manuel",
        yearFrom: 2010,
        yearTo: 2018,
        issues: [
          {
            id: "duster-16-16v-valvecover",
            severity: "medium",
            title: "Buji yuvası ve supap kapağı contası sızıntısı",
            detail:
              "Özellikle 2013 öncesi üretimlerde buji yuvasından ve supap kapağı contasından yağ/nem sızıntısı bildirilmiştir; bujilerde arızaya yol açabiliyor.",
            costLevel: "Düşük",
            sourceNote: "Birden fazla arıza kataloğu sitesinde tekrar eden gözlem.",
          },
        ],
      },
      {
        engineLabel: "1.2 TCe",
        fuelType: "Benzin",
        transmission: "Manuel",
        yearFrom: 2013,
        yearTo: 2018,
        reliabilityNote:
          "Bu motor performans ve yakıt tüketimi açısından övülse de zincir gerdirici sorunuyla ün yapmıştır; ikinci el alımında özellikle dikkat edilmesi önerilir.",
        issues: [
          {
            id: "duster-12tce-timingchain",
            severity: "high",
            title: "Triger zinciri gerdirici arızası",
            detail:
              "Zincir gerdiricisi sabit gerginlik sağlayamıyor, zamanla faz kayması kötüleşiyor; ilk belirtiler soğukken metalik ses ve zamanlama ile ilgili arıza lambasıdır. OEM veya kaliteli yedek parça ile onarılsa bile bazı araçlarda tekrarlayabiliyor.",
            typicalOnset: "60.000-100.000 km",
            costLevel: "Yüksek",
            sourceNote:
              "Birden fazla bağımsız teknik kaynakta tekrar eden, motor kodu (H5F) ile isimlendirilmiş, iyi belgelenmiş bir sorun.",
          },
        ],
      },
      {
        engineLabel: "1.3 TCe",
        fuelType: "Benzin",
        transmission: "Manuel",
        yearFrom: 2018,
        yearTo: 2023,
        reliabilityNote:
          "1.2 TCe'nin yerini alan bu motor için yaygın/kronik bir zincir sorunu tespit edilemedi. Manuel supap ayarı gerektirmesi (60.000 km'de) dikkat edilmesi gereken bir bakım noktasıdır.",
        issues: [
          {
            id: "duster-13tce-valveclearance",
            severity: "low",
            title: "Periyodik manuel supap boşluğu ayarı ihtiyacı",
            detail:
              "Bu motor hidrolik supap ayarına sahip değildir; yaklaşık 60.000 km'de manuel supap boşluğu ayarı gerektirir. Bu bir arıza değil, üreticinin öngördüğü bir bakım gereksinimidir.",
            typicalOnset: "60.000 km",
            costLevel: "Düşük",
            sourceNote: "Kullanıcı forumları ve teknik özellik kaynaklarında tekrar eden bakım notu.",
          },
        ],
      },
    ],
  },
  {
    brand: "Toyota",
    model: "Auris",
    yearFrom: 2007,
    yearTo: 2019,
    engines: [
      {
        engineLabel: "1.33 / 1.6 VVT-i",
        fuelType: "Benzin",
        transmission: "Manuel",
        yearFrom: 2007,
        yearTo: 2019,
        issues: [
          {
            id: "toyota-auris-vvti-waterpump-oil",
            severity: "low",
            title: "Su pompası, bobin ve yağ tüketimi kontrolü",
            detail:
              "Auris benzinliler genel olarak dayanıklı kabul edilir; su pompası kaçakları, bobin/buji tekleme, yağ tüketimi ve MMT varsa robotize şanzıman davranışı kontrol edilmelidir.",
            typicalOnset: "120.000 km sonrası",
            costLevel: "Düşük",
            sourceNote:
              "Toyota Auris kullanıcı forumları ve bağımsız servis alım listelerinde tekrar eden kontrol başlıkları.",
          },
        ],
      },
      {
        engineLabel: "1.4 D-4D",
        fuelType: "Dizel",
        transmission: "Manuel",
        yearFrom: 2007,
        yearTo: 2018,
        issues: [
          {
            id: "toyota-auris-14d4d-scv-egr",
            severity: "medium",
            title: "SCV/yakıt basıncı, EGR ve turbo yağ kontrolü",
            detail:
              "1.4 D-4D Auris'te yakıt basınç regülatörü, EGR kurumlanması, turbo yağ sızıntısı ve kısa mesafe dizel kullanımı kontrol edilmeli.",
            typicalOnset: "120.000 km sonrası",
            costLevel: "Orta",
            sourceNote: "Toyota 1.4 D-4D teknik kaynakları ve Auris kullanıcı forumlarında tekrar eden bulgular.",
          },
        ],
      },
      {
        engineLabel: "Hybrid 1.8 e-CVT",
        fuelType: "Hibrit",
        transmission: "Otomatik",
        yearFrom: 2010,
        yearTo: 2019,
        issues: [
          {
            id: "toyota-auris-hybrid-battery-egr",
            severity: "low",
            title: "Hibrit batarya sağlığı ve EGR/soğutma temizliği",
            detail:
              "Auris Hybrid'de batarya sağlık raporu, inverter soğutma, EGR/emme temizliği ve taksi/filo kullanım geçmişi kontrol edilmeli.",
            typicalOnset: "150.000 km sonrası",
            costLevel: "Orta",
            sourceNote:
              "Toyota hibrit alım rehberleri ve Auris/Prius kullanıcı forumlarında tekrar eden kontrol başlıkları.",
          },
        ],
      },
    ],
  },
  {
    brand: "Toyota",
    model: "Yaris",
    yearFrom: 2000,
    yearTo: 2026,
    engines: [
      {
        engineLabel: "1.0 / 1.33 VVT-i",
        fuelType: "Benzin",
        transmission: "Manuel",
        yearFrom: 2000,
        yearTo: 2020,
        issues: [
          {
            id: "toyota-yaris-vvti-chain-waterpump",
            severity: "low",
            title: "Su pompası, zincir sesi ve MMT robotize şanzıman kontrolü",
            detail:
              "Yaris benzinliler genel olarak güvenilirdir; su pompası, bobin, zincir sesi ve MMT robotize şanzımanlı araçlarda aktüatör/debriyaj davranışı kontrol edilmeli.",
            typicalOnset: "120.000 km sonrası",
            costLevel: "Düşük",
            sourceNote:
              "Toyota Yaris kullanıcı forumları ve MMT şanzıman servis kayıtlarında tekrar eden kontrol başlığı.",
          },
        ],
      },
      {
        engineLabel: "Hybrid 1.5 e-CVT",
        fuelType: "Hibrit",
        transmission: "Otomatik",
        yearFrom: 2012,
        yearTo: 2026,
        issues: [
          {
            id: "toyota-yaris-hybrid-battery-brake",
            severity: "low",
            title: "Hibrit batarya, fren aktüatörü ve inverter soğutma kontrolü",
            detail:
              "Yaris Hybrid'de batarya sağlık raporu, fren aktüatörü sesi, inverter soğutma ve servis/garanti geçmişi kontrol edilmeli.",
            typicalOnset: "150.000 km sonrası veya uzun yatan araçlarda",
            costLevel: "Orta",
            sourceNote:
              "Toyota hibrit alım rehberleri ve Yaris Hybrid kullanıcı deneyimlerinde tekrar eden kontrol başlıkları.",
          },
        ],
      },
    ],
  },
  {
    brand: "Toyota",
    model: "C-HR",
    yearFrom: 2016,
    yearTo: 2026,
    engines: [
      {
        engineLabel: "Hybrid 1.8 e-CVT",
        fuelType: "Hibrit",
        transmission: "Otomatik",
        yearFrom: 2016,
        yearTo: 2026,
        issues: [
          {
            id: "toyota-chr-hybrid-battery-egr",
            severity: "low",
            title: "Hibrit batarya, EGR/emme temizliği ve fren sistemi kontrolü",
            detail:
              "C-HR Hybrid'de batarya sağlık raporu, EGR/emme kirlenmesi, fren aktüatörü ve kaza sonrası ADAS/radar kalibrasyonu kontrol edilmeli.",
            typicalOnset: "150.000 km sonrası",
            costLevel: "Orta",
            sourceNote: "Toyota hibrit ve C-HR kullanıcı forumlarında tekrar eden kontrol başlıkları.",
          },
        ],
      },
      {
        engineLabel: "1.2 Turbo",
        fuelType: "Benzin",
        transmission: "Otomatik",
        yearFrom: 2016,
        yearTo: 2020,
        issues: [
          {
            id: "toyota-chr-12turbo-cvt",
            severity: "medium",
            title: "Turbo/soğutma ve CVT davranışı kontrolü",
            detail:
              "1.2 Turbo C-HR'da turbo sesi, soğutma kaçakları, yağ bakımı ve CVT geçiş/uğultu davranışı kontrol edilmeli.",
            typicalOnset: "100.000 km sonrası",
            costLevel: "Orta",
            sourceNote:
              "Toyota 1.2 Turbo/CVT kullanıcı deneyimleri ve servis kayıtlarında tekrar eden kontrol başlığı.",
          },
        ],
      },
    ],
  },
  {
    brand: "Toyota",
    model: "Corolla Cross",
    yearFrom: 2022,
    yearTo: 2026,
    engines: [
      {
        engineLabel: "Hybrid 1.8 / 2.0 e-CVT",
        fuelType: "Hibrit",
        transmission: "Otomatik",
        yearFrom: 2022,
        yearTo: 2026,
        issues: [
          {
            id: "toyota-corollacross-hybrid-battery-adas",
            severity: "low",
            title: "Hibrit batarya, e-CVT ve ADAS kalibrasyonu kontrolü",
            detail:
              "Corolla Cross yeni model olduğu için kronik saha verisi sınırlıdır; batarya sağlığı, garanti devri, e-CVT davranışı ve kaza sonrası ADAS/radar kalibrasyonu kontrol edilmeli.",
            typicalOnset: "Garanti devri öncesi",
            costLevel: "Orta",
            sourceNote: "Toyota hibrit alım rehberleri ve yeni nesil ADAS donanımlı araç kontrol pratikleri.",
          },
        ],
      },
    ],
  },
  {
    brand: "Toyota",
    model: "RAV4",
    yearFrom: 2000,
    yearTo: 2026,
    engines: [
      {
        engineLabel: "2.0 VVT-i / Valvematic",
        fuelType: "Benzin",
        transmission: "Otomatik",
        yearFrom: 2000,
        yearTo: 2018,
        issues: [
          {
            id: "toyota-rav4-20-awd-oil",
            severity: "medium",
            title: "Yağ tüketimi, AWD aktarma ve otomatik şanzıman kontrolü",
            detail:
              "RAV4 benzinlilerde yağ tüketimi, otomatik şanzıman geçişleri, AWD diferansiyel/transfer yağ bakımı ve süspansiyon burçları kontrol edilmeli.",
            typicalOnset: "150.000 km sonrası",
            costLevel: "Orta",
            sourceNote: "Toyota RAV4 kullanıcı forumları ve AWD SUV alım rehberlerinde tekrar eden kontrol başlıkları.",
          },
        ],
      },
      {
        engineLabel: "Hybrid 2.5 e-CVT",
        fuelType: "Hibrit",
        transmission: "Otomatik",
        yearFrom: 2016,
        yearTo: 2026,
        issues: [
          {
            id: "toyota-rav4-hybrid-cable-battery",
            severity: "medium",
            title: "Hibrit batarya, inverter ve AWD yüksek voltaj kablo kontrolü",
            detail:
              "RAV4 Hybrid'de batarya sağlığı, inverter soğutma, AWD elektrikli arka aks ve bazı pazarlarda raporlanan yüksek voltaj kablo korozyonu kontrol edilmeli.",
            typicalOnset: "Korozyonlu iklimlerde veya yüksek km'de",
            costLevel: "Yüksek",
            sourceNote:
              "Toyota RAV4 Hybrid kullanıcı forumları ve hibrit servis/alım rehberlerinde tekrar eden kontrol başlığı.",
          },
        ],
      },
      {
        engineLabel: "2.0 / 2.2 D-4D",
        fuelType: "Dizel",
        transmission: "Manuel",
        yearFrom: 2000,
        yearTo: 2018,
        issues: [
          {
            id: "toyota-rav4-d4d-egr-headgasket",
            severity: "medium",
            title: "D-4D EGR/turbo ve silindir kapak conta kontrolü",
            detail:
              "Dizel RAV4'lerde EGR, turbo, enjektör ve bazı 2.2 D-4D dönemlerinde silindir kapak conta/hararet geçmişi kontrol edilmeli.",
            typicalOnset: "150.000 km sonrası",
            costLevel: "Yüksek",
            sourceNote: "Toyota D-4D ve RAV4 dizel kullanıcı forumlarında tekrar eden bulgular.",
          },
        ],
      },
    ],
  },
  {
    brand: "Toyota",
    model: "Hilux",
    yearFrom: 2000,
    yearTo: 2026,
    engines: [
      {
        engineLabel: "2.5 / 3.0 D-4D",
        fuelType: "Dizel",
        transmission: "Manuel",
        yearFrom: 2005,
        yearTo: 2016,
        issues: [
          {
            id: "toyota-hilux-d4d-injector-turbo",
            severity: "medium",
            title: "Enjektör, turbo ve 4x4 arazi/yük kullanım izi",
            detail:
              "Hilux D-4D'de enjektör düzeltme değerleri, turbo, EGR, diferansiyel/transfer, şasi altı ve çekme/yük kullanım geçmişi kontrol edilmeli.",
            typicalOnset: "Ağır kullanıma bağlı",
            costLevel: "Yüksek",
            sourceNote:
              "Toyota Hilux kullanıcı forumları, pickup alım rehberleri ve dizel servis kayıtlarında tekrar eden bulgular.",
          },
        ],
      },
      {
        engineLabel: "2.4 D-4D",
        fuelType: "Dizel",
        transmission: "Otomatik",
        yearFrom: 2016,
        yearTo: 2026,
        issues: [
          {
            id: "toyota-hilux-24d4d-dpf-auto",
            severity: "medium",
            title: "DPF/EGR, otomatik şanzıman ve 4x4 aktarma kontrolü",
            detail:
              "Yeni Hilux 2.4 D-4D'de DPF/EGR, enjektör, otomatik şanzıman yağı, transfer/diferansiyel ve arazi kullanım izleri kontrol edilmeli.",
            typicalOnset: "120.000 km sonrası veya ağır kullanımda",
            costLevel: "Yüksek",
            sourceNote:
              "Hilux 2.4 D-4D servis kaynakları ve pickup kullanıcı forumlarında tekrar eden kontrol başlıkları.",
          },
        ],
      },
    ],
  },
  {
    brand: "Toyota",
    model: "Yaris Cross",
    yearFrom: 2021,
    yearTo: 2026,
    engines: [
      {
        engineLabel: "Hybrid 1.5 e-CVT",
        fuelType: "Hibrit",
        transmission: "Otomatik",
        yearFrom: 2021,
        yearTo: 2026,
        issues: [
          {
            id: "toyota-yariscross-hybrid-battery-adas",
            severity: "low",
            title: "Hibrit batarya, e-CVT ve ADAS/radar kalibrasyonu",
            detail:
              "Yaris Cross yeni ve genel olarak güvenilir kabul edilir; batarya sağlığı, garanti devri, e-CVT davranışı ve kaza sonrası ADAS/radar kalibrasyonu kontrol edilmeli.",
            typicalOnset: "Garanti devri öncesi",
            costLevel: "Orta",
            sourceNote: "Toyota hibrit alım rehberleri ve yeni nesil ADAS donanımlı araç kontrol pratikleri.",
          },
        ],
      },
    ],
  },
  {
    brand: "Hyundai",
    model: "i10",
    yearFrom: 2008,
    yearTo: 2026,
    engines: [
      {
        engineLabel: "1.0 / 1.2 Kappa",
        fuelType: "Benzin",
        transmission: "Manuel",
        yearFrom: 2008,
        yearTo: 2026,
        issues: [
          {
            id: "hyundai-i10-kappa-chain-oil",
            severity: "low",
            title: "Zincir sesi, yağ tüketimi ve bobin/buji kontrolü",
            detail:
              "i10 Kappa motorlar genel olarak basit ve dayanıklıdır; soğukta zincir sesi, yağ tüketimi, bobin/buji teklemesi ve otomatik varsa geçiş davranışı kontrol edilmeli.",
            typicalOnset: "100.000 km sonrası",
            costLevel: "Düşük",
            sourceNote:
              "Hyundai Kappa motor kullanıcı forumları ve i10 servis kayıtlarında tekrar eden kontrol başlıkları.",
          },
        ],
      },
    ],
  },
  {
    brand: "Hyundai",
    model: "i30",
    yearFrom: 2007,
    yearTo: 2026,
    engines: [
      {
        engineLabel: "1.6 CRDi",
        fuelType: "Dizel",
        transmission: "Yarı otomatik",
        yearFrom: 2007,
        yearTo: 2020,
        issues: [
          {
            id: "hyundai-i30-16crdi-dct-dpf",
            severity: "medium",
            title: "7DCT kavrama, DPF/EGR ve enjektör kontrolü",
            detail:
              "i30 1.6 CRDi'de DPF/EGR, enjektör değerleri ve 7DCT varsa kavrama titremesi/geçiş davranışı kontrol edilmeli.",
            typicalOnset: "80.000-140.000 km",
            costLevel: "Orta",
            sourceNote:
              "Hyundai 7DCT teknik bülteni, CRDi kullanıcı forumları ve i30 servis kayıtlarında tekrar eden bulgular.",
          },
        ],
      },
      {
        engineLabel: "1.4 / 1.6 GDI",
        fuelType: "Benzin",
        transmission: "Otomatik",
        yearFrom: 2007,
        yearTo: 2020,
        issues: [
          {
            id: "hyundai-i30-gdi-carbon",
            severity: "medium",
            title: "GDI karbon birikimi ve yağ tüketimi kontrolü",
            detail:
              "Direkt enjeksiyonlu i30 benzinlilerde emme supabı karbon birikimi, bobin/buji teklemesi ve yağ tüketimi kontrol edilmelidir.",
            typicalOnset: "80.000-150.000 km",
            costLevel: "Orta",
            sourceNote:
              "Hyundai/Kia GDI motor ailesi kullanıcı forumları ve bağımsız servis kayıtlarında tekrar eden bulgular.",
          },
        ],
      },
    ],
  },
  {
    brand: "Hyundai",
    model: "Bayon",
    yearFrom: 2021,
    yearTo: 2026,
    engines: [
      {
        engineLabel: "1.0 T-GDI DCT",
        fuelType: "Benzin",
        transmission: "Yarı otomatik",
        yearFrom: 2021,
        yearTo: 2026,
        issues: [
          {
            id: "hyundai-bayon-10tgdi-dct",
            severity: "medium",
            title: "7DCT kavrama davranışı ve turbo/soğutma kontrolü",
            detail:
              "Bayon 1.0 T-GDI DCT'de dur-kalkta kavrama titremesi, geçiş gecikmesi, turbo sesi ve yazılım güncellemeleri kontrol edilmeli.",
            typicalOnset: "Garanti devri ve 80.000 km sonrası",
            costLevel: "Orta",
            sourceNote:
              "Hyundai 7DCT teknik bülteni ve 1.0 T-GDI kullanıcı deneyimlerinde tekrar eden kontrol başlığı.",
          },
        ],
      },
      {
        engineLabel: "1.4 MPI",
        fuelType: "Benzin",
        transmission: "Otomatik",
        yearFrom: 2021,
        yearTo: 2026,
        issues: [
          {
            id: "hyundai-bayon-14mpi-chain-coil",
            severity: "low",
            title: "MPI motor bobin, zincir sesi ve otomatik şanzıman kontrolü",
            detail:
              "1.4 MPI Bayon basit kabul edilir; bobin/buji, zincir sesi, yağ tüketimi ve tork konvertörlü otomatik geçişleri kontrol edilmeli.",
            typicalOnset: "100.000 km sonrası",
            costLevel: "Düşük",
            sourceNote: "Hyundai MPI/Kappa ailesi ve Bayon kullanıcı servis kayıtlarında tekrar eden kontrol kalemi.",
          },
        ],
      },
    ],
  },
  {
    brand: "Hyundai",
    model: "Kona",
    yearFrom: 2017,
    yearTo: 2026,
    engines: [
      {
        engineLabel: "1.6 T-GDI DCT",
        fuelType: "Benzin",
        transmission: "Yarı otomatik",
        yearFrom: 2017,
        yearTo: 2026,
        issues: [
          {
            id: "hyundai-kona-16tgdi-dct",
            severity: "medium",
            title: "7DCT kavrama, GDI karbon ve turbo kontrolü",
            detail:
              "Kona 1.6 T-GDI'da DCT kavrama davranışı, GDI karbon birikimi, turbo sesi ve AWD varsa arka aktarma kontrol edilmeli.",
            typicalOnset: "80.000-140.000 km",
            costLevel: "Orta",
            sourceNote: "Hyundai 7DCT/GDI kullanıcı kayıtları ve Kona forumlarında tekrar eden bulgular.",
          },
        ],
      },
      {
        engineLabel: "Elektrikli",
        fuelType: "Elektrik",
        transmission: "Otomatik",
        yearFrom: 2018,
        yearTo: 2026,
        issues: [
          {
            id: "hyundai-kona-ev-battery-recall",
            severity: "medium",
            title: "EV batarya geri çağırma/sağlık ve şarj sistemi kontrolü",
            detail:
              "Kona EV'de batarya geri çağırma kampanyası durumu, batarya sağlık raporu, DC hızlı şarj geçmişi ve şarj portu kontrol edilmeli.",
            typicalOnset: "Garanti devri öncesi",
            costLevel: "Orta",
            sourceNote:
              "Kona EV batarya kampanya kayıtları, EV alım rehberleri ve kullanıcı deneyimlerinde tekrar eden kontrol başlığı.",
          },
        ],
      },
    ],
  },
  {
    brand: "Hyundai",
    model: "Tucson",
    yearFrom: 2004,
    yearTo: 2026,
    engines: [
      {
        engineLabel: "1.6 T-GDI DCT",
        fuelType: "Benzin",
        transmission: "Yarı otomatik",
        yearFrom: 2015,
        yearTo: 2026,
        issues: [
          {
            id: "hyundai-tucson-16tgdi-dct",
            severity: "medium",
            title: "7DCT kavrama, GDI karbon ve turbo/soğutma kontrolü",
            detail:
              "Tucson 1.6 T-GDI'da düşük hız DCT titremesi, GDI karbon, turbo/soğutma ve AWD aktarma kontrol edilmeli.",
            typicalOnset: "80.000-140.000 km",
            costLevel: "Orta",
            sourceNote:
              "Hyundai 7DCT teknik bülteni, GDI motor kaynakları ve Tucson kullanıcı forumlarında tekrar eden bulgular.",
          },
        ],
      },
      {
        engineLabel: "1.6 CRDi / 2.0 CRDi",
        fuelType: "Dizel",
        transmission: "Otomatik",
        yearFrom: 2004,
        yearTo: 2026,
        issues: [
          {
            id: "hyundai-tucson-crdi-dpf-awd",
            severity: "medium",
            title: "DPF/EGR, enjektör ve AWD/otomatik şanzıman kontrolü",
            detail:
              "Tucson dizellerde DPF/EGR, enjektör, turbo, otomatik şanzıman ve AWD diferansiyel/aktarma bakımı kontrol edilmeli.",
            typicalOnset: "120.000 km sonrası",
            costLevel: "Yüksek",
            sourceNote: "Hyundai CRDi ve Tucson kullanıcı servis kayıtlarında tekrar eden kontrol başlıkları.",
          },
        ],
      },
    ],
  },
  {
    brand: "Hyundai",
    model: "Santa Fe",
    yearFrom: 2000,
    yearTo: 2026,
    engines: [
      {
        engineLabel: "2.0 / 2.2 CRDi",
        fuelType: "Dizel",
        transmission: "Otomatik",
        yearFrom: 2000,
        yearTo: 2026,
        issues: [
          {
            id: "hyundai-santafe-crdi-auto-awd",
            severity: "medium",
            title: "CRDi enjektör/turbo, otomatik şanzıman ve AWD aktarma kontrolü",
            detail:
              "Santa Fe dizellerde enjektör, turbo, EGR/DPF, otomatik şanzıman yağ bakımı, AWD/diferansiyel ve çekme/yük geçmişi kontrol edilmelidir.",
            typicalOnset: "150.000 km sonrası",
            costLevel: "Yüksek",
            sourceNote: "Hyundai Santa Fe kullanıcı forumları ve SUV dizel servis kayıtlarında tekrar eden bulgular.",
          },
        ],
      },
    ],
  },
  {
    brand: "Dacia",
    model: "Logan",
    yearFrom: 2004,
    yearTo: 2021,
    engines: [
      {
        engineLabel: "1.4 / 1.6 MPI",
        fuelType: "Benzin",
        transmission: "Manuel",
        yearFrom: 2004,
        yearTo: 2016,
        issues: [
          {
            id: "dacia-logan-mpi-lpg-uch",
            severity: "medium",
            title: "LPG/subap, bobin ve elektrik/UCH kontrolü",
            detail:
              "Logan benzinli MPI motorlar basit kabul edilir; LPG montajı, subap/kompresyon, bobin/buji, soğutma sistemi ve UCH/elektrik arızaları kontrol edilmeli.",
            typicalOnset: "Yaş ve LPG kullanımına bağlı",
            costLevel: "Orta",
            sourceNote: "Renault/Dacia K7M-K4M kullanıcı forumları ve LPG servis kayıtlarında tekrar eden bulgular.",
          },
        ],
      },
      {
        engineLabel: "1.5 dCi K9K",
        fuelType: "Dizel",
        transmission: "Manuel",
        yearFrom: 2005,
        yearTo: 2021,
        issues: [
          {
            id: "dacia-logan-k9k-injector-egr",
            severity: "medium",
            title: "K9K enjektör, EGR ve turbo hortumu kontrolü",
            detail:
              "Logan 1.5 dCi'da enjektör düzeltme değerleri, EGR kurumlanması, turbo hortumu ve yağ bakım geçmişi kontrol edilmeli.",
            typicalOnset: "120.000 km sonrası",
            costLevel: "Orta",
            sourceNote: "Renault/Dacia K9K motor ailesi forumları ve servis kayıtlarında tekrar eden bulgular.",
          },
        ],
      },
    ],
  },
  {
    brand: "Dacia",
    model: "Sandero",
    yearFrom: 2008,
    yearTo: 2026,
    engines: [
      {
        engineLabel: "1.2 / 1.4 / 1.6 MPI",
        fuelType: "Benzin",
        transmission: "Manuel",
        yearFrom: 2008,
        yearTo: 2020,
        issues: [
          {
            id: "dacia-sandero-mpi-lpg",
            severity: "medium",
            title: "LPG/subap, bobin ve soğutma sistemi kontrolü",
            detail:
              "Sandero MPI motorlarda LPG montajı, subap/kompresyon, bobin-buji, termostat/su kaçağı ve alt takım kontrol edilmeli.",
            typicalOnset: "100.000 km sonrası veya LPG'li kullanımda",
            costLevel: "Orta",
            sourceNote:
              "Dacia Sandero kullanıcı forumları ve Renault MPI/LPG servis kayıtlarında tekrar eden bulgular.",
          },
        ],
      },
      {
        engineLabel: "0.9 / 1.0 TCe",
        fuelType: "Benzin",
        transmission: "Manuel",
        yearFrom: 2013,
        yearTo: 2026,
        issues: [
          {
            id: "dacia-sandero-tce-turbo-chain",
            severity: "medium",
            title: "TCe turbo/yağ bakımı ve zincir sesi kontrolü",
            detail:
              "Küçük TCe motorlarda yağ bakımı, turbo sesi, soğukta zincir sesi, bobin/buji ve LPG'li ECO-G versiyonda montaj/sistem kontrol edilmeli.",
            typicalOnset: "90.000 km sonrası",
            costLevel: "Orta",
            sourceNote:
              "Renault/Dacia TCe kullanıcı kayıtları ve bağımsız servis kontrol listelerinde tekrar eden bulgular.",
          },
        ],
      },
      {
        engineLabel: "1.5 dCi K9K",
        fuelType: "Dizel",
        transmission: "Manuel",
        yearFrom: 2008,
        yearTo: 2020,
        issues: [
          {
            id: "dacia-sandero-k9k-egr-injector",
            severity: "medium",
            title: "EGR/enjektör, turbo ve yağ bakım kontrolü",
            detail:
              "Sandero 1.5 dCi'da EGR, enjektör, turbo hortumu ve gecikmiş yağ bakımına bağlı yatak/turbo riski kontrol edilmeli.",
            typicalOnset: "120.000 km sonrası",
            costLevel: "Orta",
            sourceNote: "Renault K9K motor ailesi ve Dacia kullanıcı forumlarında tekrar eden bulgular.",
          },
        ],
      },
    ],
  },
  {
    brand: "Dacia",
    model: "Sandero Stepway",
    yearFrom: 2009,
    yearTo: 2026,
    engines: [
      {
        engineLabel: "0.9 / 1.0 TCe ECO-G",
        fuelType: "LPG",
        transmission: "Manuel",
        yearFrom: 2013,
        yearTo: 2026,
        issues: [
          {
            id: "dacia-stepway-tce-ecog",
            severity: "medium",
            title: "TCe turbo, LPG/ECO-G sistem ve bobin kontrolü",
            detail:
              "Stepway ECO-G/TCe'de turbo sesi, yağ bakımı, LPG regülatörü/enjektörleri, bobin/buji ve yazılım güncellemeleri kontrol edilmeli.",
            typicalOnset: "90.000 km sonrası",
            costLevel: "Orta",
            sourceNote: "Dacia ECO-G/TCe kullanıcı kayıtları ve LPG servis deneyimlerinde tekrar eden kontrol başlığı.",
          },
        ],
      },
      {
        engineLabel: "1.5 dCi K9K",
        fuelType: "Dizel",
        transmission: "Manuel",
        yearFrom: 2009,
        yearTo: 2020,
        issues: [
          {
            id: "dacia-stepway-k9k-dpf-egr",
            severity: "medium",
            title: "K9K EGR/DPF, enjektör ve turbo hortumu kontrolü",
            detail: "Stepway dizelde EGR/DPF, enjektör değerleri, turbo hortumu ve yağ bakım geçmişi kontrol edilmeli.",
            typicalOnset: "120.000 km sonrası",
            costLevel: "Orta",
            sourceNote: "Renault/Dacia K9K kullanıcı forumları ve servis kayıtları.",
          },
        ],
      },
    ],
  },
  {
    brand: "Dacia",
    model: "Dokker",
    yearFrom: 2012,
    yearTo: 2021,
    engines: [
      {
        engineLabel: "1.5 dCi K9K",
        fuelType: "Dizel",
        transmission: "Manuel",
        yearFrom: 2012,
        yearTo: 2021,
        issues: [
          {
            id: "dacia-dokker-k9k-commercial",
            severity: "medium",
            title: "K9K dizel yan sistemleri ve ticari kullanım yıpranması",
            detail:
              "Dokker'de ticari kullanım EGR/DPF, enjektör, turbo hortumu, debriyaj/volan ve arka süspansiyon yıpranmasını hızlandırabilir.",
            typicalOnset: "100.000 km sonrası veya ticari kullanımda",
            costLevel: "Orta",
            sourceNote: "Dacia Dokker/K9K kullanıcı forumları ve ticari servis kayıtlarında tekrar eden bulgular.",
          },
        ],
      },
      {
        engineLabel: "1.6 MPI",
        fuelType: "Benzin",
        transmission: "Manuel",
        yearFrom: 2012,
        yearTo: 2021,
        issues: [
          {
            id: "dacia-dokker-16mpi-lpg",
            severity: "medium",
            title: "LPG/subap, bobin ve yük kullanımı kontrolü",
            detail:
              "1.6 MPI Dokker'de LPG montajı, subap/kompresyon, bobin/buji, soğutma ve ticari/yük kullanım izleri kontrol edilmeli.",
            typicalOnset: "LPG'li yüksek km araçlarda",
            costLevel: "Orta",
            sourceNote: "Renault/Dacia MPI LPG kullanıcı kayıtları ve Dokker ticari servis deneyimleri.",
          },
        ],
      },
    ],
  },
  {
    brand: "Dacia",
    model: "Lodgy",
    yearFrom: 2012,
    yearTo: 2021,
    engines: [
      {
        engineLabel: "1.5 dCi K9K",
        fuelType: "Dizel",
        transmission: "Manuel",
        yearFrom: 2012,
        yearTo: 2021,
        issues: [
          {
            id: "dacia-lodgy-k9k-dpf-dmf",
            severity: "medium",
            title: "K9K EGR/DPF, enjektör ve aile/ticari kullanım yıpranması",
            detail:
              "Lodgy 1.5 dCi'da EGR/DPF, enjektör, turbo hortumu, debriyaj/volan ve yedi koltuk/yük kullanımından gelen alt takım kontrol edilmeli.",
            typicalOnset: "120.000 km sonrası",
            costLevel: "Orta",
            sourceNote: "Dacia Lodgy/K9K kullanıcı forumları ve servis kayıtlarında tekrar eden bulgular.",
          },
        ],
      },
      {
        engineLabel: "1.2 TCe H5Ft",
        fuelType: "Benzin",
        transmission: "Manuel",
        yearFrom: 2012,
        yearTo: 2018,
        issues: [
          {
            id: "dacia-lodgy-12tce-chain-oil",
            severity: "high",
            title: "1.2 TCe yağ tüketimi ve zincir riski",
            detail:
              "H5Ft 1.2 TCe Lodgy'de yağ tüketimi, zincir uzaması ve turbo riski kontrol edilmeli; yağ eksiltme geçmişi varsa motor hasarı riski büyür.",
            typicalOnset: "60.000-120.000 km",
            costLevel: "Yüksek",
            sourceNote:
              "Renault/Nissan H5Ft 1.2 TCe teknik kaynakları ve Dacia kullanıcı kayıtlarında tekrar eden risk.",
          },
        ],
      },
    ],
  },
  {
    brand: "Dacia",
    model: "Jogger",
    yearFrom: 2021,
    yearTo: 2026,
    engines: [
      {
        engineLabel: "1.0 TCe ECO-G",
        fuelType: "LPG",
        transmission: "Manuel",
        yearFrom: 2021,
        yearTo: 2026,
        issues: [
          {
            id: "dacia-jogger-tce-ecog",
            severity: "medium",
            title: "ECO-G LPG sistemi, turbo ve yazılım güncellemesi kontrolü",
            detail:
              "Jogger ECO-G'de LPG regülatörü/enjektörleri, turbo sesi, bobin/buji, yağ bakımı ve yazılım/garanti kayıtları kontrol edilmeli.",
            typicalOnset: "Garanti devri ve 80.000 km sonrası",
            costLevel: "Orta",
            sourceNote: "Dacia ECO-G kullanıcı deneyimleri ve LPG servis kayıtlarında tekrar eden kontrol başlığı.",
          },
        ],
      },
      {
        engineLabel: "Hybrid 140",
        fuelType: "Hibrit",
        transmission: "Otomatik",
        yearFrom: 2023,
        yearTo: 2026,
        issues: [
          {
            id: "dacia-jogger-hybrid-battery",
            severity: "low",
            title: "Hibrit batarya, E-Tech şanzıman ve garanti devri kontrolü",
            detail:
              "Jogger Hybrid'de batarya sağlığı, E-Tech otomatik sistem davranışı, garanti devri ve yazılım güncellemeleri kontrol edilmeli.",
            typicalOnset: "Garanti devri öncesi",
            costLevel: "Orta",
            sourceNote: "Renault/Dacia E-Tech hibrit kullanıcı deneyimleri ve hibrit alım rehberleri.",
          },
        ],
      },
    ],
  },
  {
    brand: "Dacia",
    model: "Spring",
    yearFrom: 2021,
    yearTo: 2026,
    engines: [
      {
        engineLabel: "Elektrikli güç aktarma",
        fuelType: "Elektrik",
        transmission: "Otomatik",
        yearFrom: 2021,
        yearTo: 2026,
        issues: [
          {
            id: "dacia-spring-battery-charging",
            severity: "medium",
            title: "Batarya sağlığı, şarj portu ve düşük maliyetli donanım yıpranması",
            detail:
              "Spring'de batarya sağlık raporu, DC/AC şarj geçmişi, şarj portu, 12V akü, fren/süspansiyon yıpranması ve garanti devri kontrol edilmeli.",
            typicalOnset: "Garanti devri ve yüksek km öncesi",
            costLevel: "Orta",
            sourceNote: "Dacia Spring kullanıcı deneyimleri ve EV alım rehberlerinde tekrar eden kontrol başlıkları.",
          },
        ],
      },
    ],
  },
];
