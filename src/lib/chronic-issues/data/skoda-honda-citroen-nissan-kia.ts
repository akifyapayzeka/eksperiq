import type { ModelEntry } from "../types";

// Kaynak: BRISKODA, qashqaiforums, civinfo, frenchcarforum, kiaownersclub
// gibi marka forumları, bağımsız güvenilirlik raporlama siteleri
// (carchecker.pro, What Car?, engineexplained) ve şanzıman/servis
// uzmanlığı kaynakları (ASR Gearbox Repairs, Mister Gearbox) genelinde
// çapraz doğrulanan, birden fazla kaynakta tekrar eden bulgular.
export const SKODA_HONDA_CITROEN_NISSAN_KIA_ENTRIES: ModelEntry[] = [
  {
    brand: "Skoda",
    model: "Octavia",
    generation: "A7 (3. Nesil)",
    yearFrom: 2013,
    yearTo: 2020,
    generalNote:
      "MQB platformunda üretilen A7 nesli, motor ailesine göre değişen kronik sorunlara sahiptir; DSG'li ve TSI'lı versiyonlarda periyodik bakım eksikliği sorunları büyütür.",
    engines: [
      {
        engineLabel: "1.6 TDI",
        fuelType: "Dizel",
        transmission: "Manuel",
        yearFrom: 2013,
        yearTo: 2020,
        reliabilityNote:
          "Mekanik olarak dayanıklı kabul edilir, ancak enjektör ve emisyon sistemi arızaları yaygın şikayet konusudur.",
        issues: [
          {
            id: "octavia-16tdi-injector",
            severity: "medium",
            title: "Enjektör arızaları (özellikle aynı silindirde tekrarlayan)",
            detail:
              "Bazı araçlarda tekrarlayan enjektör arızaları bildirilmiştir; dizel emisyon güncellemesi sonrası ekstra enjeksiyon döngüsü nedeniyle enjektör yükünün arttığı yönünde tekrarlayan gözlemler var.",
            typicalOnset: "80.000-150.000 km",
            costLevel: "Orta",
            sourceNote:
              "Birden fazla İngiliz otomotiv forumu (BRISKODA) ve teknik servis/soru-cevap sitesi kaynaklı, tekrarlayan raporlar.",
          },
        ],
      },
      {
        engineLabel: "2.0 TDI",
        fuelType: "Dizel",
        transmission: "Manuel",
        yearFrom: 2013,
        yearTo: 2020,
        reliabilityNote:
          "Mekanik gövde olarak dayanıklı (200.000+ km) kabul edilir; asıl risk emisyon yan sistemlerinde.",
        issues: [
          {
            id: "octavia-20tdi-egr-cooler",
            severity: "medium",
            title: "EGR soğutucusunda çatlak / soğutma suyu kaçağı",
            detail:
              "EGR soğutucusunun içten çatlayarak soğutma suyunun emme sistemine sızması; beyaz duman, soğutma suyu kaybı ve nadiren hidrolik kilitlenmeye yol açabildiği bildiriliyor.",
            typicalOnset: "100.000-180.000 km",
            costLevel: "Orta",
            sourceNote:
              "Bağımsız araç güvenilirlik raporlama siteleri ve teknik servis anlatımları, tutarlı şekilde tekrarlanıyor.",
          },
        ],
      },
      {
        engineLabel: "1.4 TSI",
        fuelType: "Benzin",
        transmission: "Manuel",
        yearFrom: 2013,
        yearTo: 2015,
        reliabilityNote:
          "Bu motor kodu esas olarak Octavia A7'nin ilk üretim yıllarında (EA111 geçiş dönemi) görülür; araç bazında motor kodu teyit edilmeli.",
        issues: [
          {
            id: "octavia-14tsi-ea111-chain",
            severity: "high",
            title: "Zaman zinciri gergi bilyası (tensioner) erken arızası",
            detail:
              "EA111 ailesi 1.2/1.4 TSI motorlarda zaman zinciri gergisinin erken aşınıp zincirde boşluk oluşturması, ciddi motor hasarına yol açabilen bilinen bir tasarım zayıflığı olarak çok sayıda kaynakta tekrarlanıyor.",
            typicalOnset: "30.000-80.000 km",
            costLevel: "Yüksek",
            sourceNote:
              "VW/Skoda motor teknik incelemeleri ve BRISKODA forumu dahil çok sayıda bağımsız kaynakta tekrar eden, iyi belgelenmiş bir sorun.",
          },
        ],
      },
      {
        engineLabel: "DSG (DQ200 / DQ250)",
        fuelType: "Benzin",
        transmission: "Otomatik",
        trims: ["TSI ve TDI'nin DSG versiyonları"],
        yearFrom: 2013,
        yearTo: 2020,
        reliabilityNote:
          "DSG şanzımanlarda mekatronik ünite ve debriyaj paketi bakımı ihmal edildiğinde ciddi arızalar görülüyor.",
        issues: [
          {
            id: "octavia-dsg-mechatronic",
            severity: "high",
            title: "Mekatronik ünite / kavrama sensör arızaları",
            detail:
              "DSG şanzımanlarda sarsıntılı/gecikmeli vites geçişleri, kavrama pozisyon sensörü arızaları ve mekatronik ünite bozulmaları; yağ ve filtre değişimi periyodu aşıldığında risk artıyor.",
            typicalOnset: "80.000-150.000 km (bakımsız araçlarda daha erken)",
            costLevel: "Yüksek",
            sourceNote:
              "Şanzıman tamir servisleri (Mister Gearbox, ASR Gearbox Repairs) ve genel otomotiv arıza rehberlerinde tekrarlayan, tutarlı bir tema.",
          },
        ],
      },
    ],
  },
  {
    brand: "Skoda",
    model: "Fabia",
    yearFrom: 2007,
    yearTo: 2021,
    generalNote:
      "Mk2 (2007-2014) ve Mk3 (2014-2021) nesilleri farklı motor aileleri kullanır; küçük 3 silindirli ve turbo benzinli motorlarda zincir sorunları öne çıkıyor.",
    engines: [
      {
        engineLabel: "1.2 HTP",
        fuelType: "Benzin",
        transmission: "Manuel",
        yearFrom: 2007,
        yearTo: 2014,
        reliabilityNote: "Ucuz bakım maliyetiyle bilinir ama zaman zinciri hassasiyeti nedeniyle düzenli bakım şart.",
        issues: [
          {
            id: "fabia-12htp-chain",
            severity: "high",
            title: "Zaman zinciri gerilme / gergi zayıflığı",
            detail:
              "Alüminyum blok ve nispeten ince zaman zinciri kombinasyonu zamanla zincirin gerilmesine ve gerginin zayıflamasına yol açıyor; soğuk startta duyulan çıtırtı sesi erken uyarı işareti, ihmal edilirse zincir atlaması motora ciddi hasar verebiliyor.",
            typicalOnset: "30.000-60.000 km",
            costLevel: "Orta",
            sourceNote: "Bağımsız motor arıza rehberleri ve kullanıcı forumlarında tekrarlayan, tutarlı bir bulgu.",
          },
        ],
      },
      {
        engineLabel: "1.2 TSI",
        fuelType: "Benzin",
        transmission: "Manuel",
        yearFrom: 2010,
        yearTo: 2012,
        reliabilityNote:
          "2012 öncesi üretilen motorlarda zincir kalitesi sorunlu; 2012 sonrası revize edilen parçalarla güvenilirlik arttığı belirtiliyor.",
        issues: [
          {
            id: "fabia-12tsi-chain-early",
            severity: "high",
            title: "Erken zaman zinciri gerilmesi/arızası",
            detail:
              "2011 sonu öncesi üretilen motorlarda zincirin birkaç on bin kilometrede erken gerilmesi ve gergi bilyasının arızalanması bildiriliyor.",
            typicalOnset: "30.000-60.000 km",
            costLevel: "Yüksek",
            sourceNote:
              "BRISKODA ve SEATCUPRA.NET forumlarında, ayrıca bağımsız teknik servis videolarında tekrarlayan, iyi belgelenmiş sorun.",
          },
        ],
      },
      {
        engineLabel: "7 ileri DSG (DQ200)",
        fuelType: "Benzin",
        transmission: "Otomatik",
        yearFrom: 2014,
        yearTo: 2021,
        reliabilityNote: "DQ200 kuru kavramalı 7 ileri şanzıman VW grubu genelinde bilinen bir zayıf noktadır.",
        issues: [
          {
            id: "fabia-dsg7-electrical",
            severity: "high",
            title: "Şanzıman elektronik/yağ kaynaklı arıza",
            detail:
              "7 ileri DSG şanzımanda yağdaki kimyasal değişimlerin elektronik sistemde kısa devreye yol açabildiği, ciddi arızalara neden olduğu bildiriliyor.",
            typicalOnset: "60.000-100.000 km",
            costLevel: "Yüksek",
            sourceNote:
              "Bağımsız otomotiv arıza rehberleri tarafında tekrarlayan bulgu; VW grubu genelinde DQ200 için bilinen bir konu.",
          },
        ],
      },
    ],
  },
  {
    brand: "Honda",
    model: "Civic",
    generation: "FK/FC (9. ve 10. Nesil)",
    yearFrom: 2012,
    yearTo: 2021,
    generalNote:
      "Honda Civic genel olarak güvenilirlik sıralamalarında iyi performans gösterir; en belirgin sorunlar 1.6 i-DTEC dizel ve 1.0 VTEC Turbo benzinli motorlarda görülüyor.",
    engines: [
      {
        engineLabel: "1.6 i-DTEC",
        fuelType: "Dizel",
        transmission: "Manuel",
        yearFrom: 2013,
        yearTo: 2021,
        reliabilityNote:
          "Genel olarak dayanıklı kabul edilir ancak enjektör ve kam mili aşınması ile ilgili tekrarlayan raporlar var.",
        issues: [
          {
            id: "civic-16idtec-injector",
            severity: "medium",
            title: "Enjektör arızaları",
            detail:
              "Dizel uzmanlarının aylık olarak birden fazla arızalı 1.6 i-DTEC enjektör seti aldığını bildirmesi, bu motor ailesinde sistemik bir enjektör sorununa işaret ediyor.",
            typicalOnset: "100.000+ km",
            costLevel: "Orta",
            sourceNote:
              "Honda Civic sahip forumları (civinfo) ve bağımsız dizel enjektör servisleri kaynaklı tekrarlayan raporlar.",
          },
          {
            id: "civic-16idtec-camshaft",
            severity: "medium",
            title: "Kam mili aşınması / eksenel boşluk",
            detail:
              "16MY (2016 model yılı) 1.6 i-DTEC motorlarda kam millerinin aşınıp aşırı eksenel boşluk oluşturduğu, düşük devirde ve rölantide gümbürtü sesine yol açtığı bildiriliyor.",
            typicalOnset: "Orta kilometrede, model yılına bağlı",
            costLevel: "Orta",
            sourceNote: "Honda Civic sahip forumu üzerinde tekrarlayan, spesifik model-yılı referanslı rapor.",
          },
        ],
      },
      {
        engineLabel: "1.0 VTEC Turbo",
        fuelType: "Benzin",
        transmission: "Manuel",
        yearFrom: 2017,
        yearTo: 2021,
        reliabilityNote:
          "Küçük turbo motor olarak yağ seyrelmesi konusunda dikkat gerektiriyor; Honda bu motor ailesi için yazılım güncellemeleri yayınlamıştır.",
        issues: [
          {
            id: "civic-10turbo-dilution",
            severity: "medium",
            title: "Yağ seyrelmesi (benzin karışımı)",
            detail:
              "Soğuk havada ve kısa mesafe kullanımda yakıtın motor yağına karışarak yağı seyrelttiği bildiriliyor; Honda ECU yazılım güncellemesi yayınlamıştır.",
            typicalOnset: "Kışın/kısa mesafe kullanımda daha belirgin",
            costLevel: "Orta",
            sourceNote:
              "Honda sahip forumları ve tüketici basınında tekrarlayan, üretici tarafından da yazılım güncellemesiyle kısmen kabul edilmiş bir sorun.",
          },
        ],
      },
      {
        engineLabel: "1.6/1.8 i-VTEC",
        fuelType: "Benzin",
        transmission: "Manuel",
        yearFrom: 2012,
        yearTo: 2021,
        reliabilityNote:
          "Genel olarak çok güvenilir kabul edilen motor ailesi; ciddi mekanik kronik arıza paterni bulunmuyor.",
        issues: [],
      },
    ],
  },
  {
    brand: "Citroen",
    model: "C-Elysee",
    yearFrom: 2012,
    yearTo: 2022,
    generalNote:
      "PSA'nın giriş segmenti sedanı; hem benzinli VTi/Prince hem dizel e-HDi motorlarında belgelenmiş zaman zinciri ve emisyon sistemi sorunları var.",
    engines: [
      {
        engineLabel: "1.6 VTi",
        fuelType: "Benzin",
        transmission: "Manuel",
        yearFrom: 2012,
        yearTo: 2022,
        reliabilityNote:
          "Zaman zinciri gergi sistemi, PSA/BMW Prince motor ailesinde bilinen bir zayıf noktadır ve bazı pazarlarda geri çağırma konusu olmuştur.",
        issues: [
          {
            id: "celysee-16vti-chain",
            severity: "high",
            title: "Zaman zinciri gergi tertibatı arızası",
            detail:
              "Hidrolik zincir gergisinde kaynaklanan sorunlar zincirde gevşekliğe, motor tarafından duyulan ritmik vuruntu/tıkırtı sesine yol açıyor; ilerlemiş durumda zincir diş atlayabiliyor veya kopabiliyor, ciddi motor hasarına neden olabiliyor. Bazı pazarlarda bu konuda geri çağırma kampanyası yürütülmüştür.",
            typicalOnset: "Değişken, düzensiz yağ bakımında daha erken",
            costLevel: "Yüksek",
            sourceNote:
              "Fransız otomotiv forumları ve tüketici şikayet platformlarında (Şikayetvar) tekrarlayan, çok sayıda kaynakta doğrulanan bir sorun.",
          },
        ],
      },
      {
        engineLabel: "1.6 e-HDi",
        fuelType: "Dizel",
        transmission: "Manuel",
        yearFrom: 2012,
        yearTo: 2022,
        reliabilityNote:
          "EGR/DPF ve enjektör sorunları, kısa mesafe kullanımı ve karter tasarımı kaynaklı yağ tahliye sorunlarıyla ilişkilendiriliyor.",
        issues: [
          {
            id: "celysee-16ehdi-egr",
            severity: "medium",
            title: "EGR valfi tıkanması / karbon birikimi",
            detail:
              "EGR valfinin zamanla kurum birikintisiyle tıkanması motor performansını düşürüyor, emisyonları artırıyor, hatta motorun stop etmesine yol açabiliyor.",
            typicalOnset: "60.000+ km",
            costLevel: "Orta",
            sourceNote: "Bağımsız motor inceleme siteleri ve Fransız/PSA forumlarında tekrarlayan bulgu.",
          },
          {
            id: "celysee-16ehdi-injector-sludge",
            severity: "medium",
            title: "Karter tasarımı kaynaklı yağ tahliye sorunu ve enjektör keçe arızası",
            detail:
              "1.6 HDI motorun orijinal karter tasarımının yağ değişiminde tam boşalmaya izin vermediği, kalan yağ/çamurun turbo yağ besleme hatlarını tıkayabildiği ve enjektör keçelerinin arızalanmasına yol açabildiği bildiriliyor.",
            typicalOnset: "60.000+ km",
            costLevel: "Orta",
            sourceNote: "Bağımsız motor teknik inceleme kaynağı; PSA HDI motor ailesi için tekrarlayan bir tema.",
          },
        ],
      },
    ],
  },
  {
    brand: "Nissan",
    model: "Qashqai",
    generation: "J10 (2007-2013) ve J11 (2013-2021)",
    yearFrom: 2007,
    yearTo: 2021,
    generalNote:
      "İki nesil arasında motor aileleri farklıdır; J11'in 1.2 DIG-T turbo benzinli motoru ve CVT şanzımanı özellikle dikkat gerektiriyor.",
    engines: [
      {
        engineLabel: "1.6 dCi",
        fuelType: "Dizel",
        transmission: "Manuel",
        yearFrom: 2011,
        yearTo: 2021,
        reliabilityNote:
          "Zaman zinciri kullanır (kayış değil); bakımlı araçlarda zincirle ilgili yaygın bir arıza paterni belgelenmedi.",
        issues: [
          {
            id: "qashqai-16dci-dpf-egr",
            severity: "medium",
            title: "DPF/EGR tıkanması",
            detail: "Kısa mesafe kullanımında DPF'nin tıkanması ve EGR valfinde kurum birikimi bildiriliyor.",
            typicalOnset: "80.000+ km, kısa mesafe kullanımda daha erken",
            costLevel: "Orta",
            sourceNote: "Nissan Qashqai sahip forumları üzerinde tekrarlayan tema.",
          },
        ],
      },
      {
        engineLabel: "2.0 dCi",
        fuelType: "Dizel",
        transmission: "Manuel",
        yearFrom: 2007,
        yearTo: 2013,
        reliabilityNote:
          "Nissan'ın bu motor için biyel kolu yatağı aşınmasına yönelik gönüllü servis kampanyası düzenlediği bildiriliyor.",
        issues: [
          {
            id: "qashqai-20dci-bearing",
            severity: "high",
            title: "Krank mili biyel yatağı erken aşınması",
            detail:
              "Nissan, bu motorda erken biyel kolu yatağı aşınmasına yönelik gönüllü bir servis kampanyası yürütmüştür; yüksek yük/yüksek devirde yatakların arızalanıp motor sıkışmasına yol açabildiği bildiriliyor. İkinci el alımda bu kampanya kapsamındaki işlemin yapılıp yapılmadığının teyit edilmesi öneriliyor.",
            typicalOnset: "150.000-200.000 km (bakımsız araçlarda)",
            costLevel: "Yüksek",
            sourceNote:
              "What Car? ve bağımsız güvenilirlik raporlama siteleri üzerinde tekrarlayan, üretici servis kampanyasına dayanan belgelenmiş bir sorun.",
          },
        ],
      },
      {
        engineLabel: "1.2 DIG-T",
        fuelType: "Benzin",
        transmission: "Manuel",
        yearFrom: 2013,
        yearTo: 2021,
        reliabilityNote:
          "Erken üretim (2014-2015) araçlarda yağ tüketimi ve zaman zinciri sorunları yoğun; 2016 ECU yazılım güncellemesi ve revize piston segmanlarıyla iyileştirildiği bildiriliyor.",
        issues: [
          {
            id: "qashqai-12digt-chain-oil",
            severity: "high",
            title: "Yağ tüketimi ve zaman zinciri gergi arızası",
            detail:
              "Erken üretim 1.2 DIG-T motorlarda aşırı yağ tüketimi bildirilmiş; düşük yağ seviyesi zincir gergisinin yağsız kalıp arızalanmasına yol açıyor, soğuk startta tıkırtı sesiyle kendini gösteriyor. Nissan 2016'da ECU yazılım güncellemesi ve revize piston segmanları yayınlamıştır.",
            typicalOnset: "2014-2015 üretim, düşük-orta kilometre",
            costLevel: "Yüksek",
            sourceNote:
              "Qashqai sahip forumları ve bağımsız güvenilirlik raporlama siteleri üzerinde çok sayıda tekrarlayan, ayrıntılı belgelenmiş bir sorun.",
          },
        ],
      },
      {
        engineLabel: "Xtronic CVT",
        fuelType: "Benzin",
        transmission: "Otomatik",
        trims: ["1.2 DIG-T ve 1.6 benzinli CVT versiyonları"],
        yearFrom: 2013,
        yearTo: 2021,
        reliabilityNote:
          "Nissan'ın 'ömür boyu dolum' iddiasına rağmen periyodik CVT yağı değişiminin şanzıman ömrü için kritik olduğu vurgulanıyor.",
        issues: [
          {
            id: "qashqai-cvt-overheat-judder",
            severity: "high",
            title: "CVT aşırı ısınma, sarsıntı ve erken arıza",
            detail:
              "Trafikte veya yokuş çıkışlarında aşırı ısınma; düşük hızda sarsıntı, gecikmeli hızlanma tepkisi, uğultu sesi ve şanzımanın koruma moduna geçmesi bildiriliyor. Yağın 40.000-60.000 km aralığında NS-3 spesifikasyonuyla değiştirilmemesi durumunda erken arıza riskinin arttığı belirtiliyor.",
            typicalOnset: "60.000-120.000 km (bakımsız araçlarda)",
            costLevel: "Yüksek",
            sourceNote:
              "Qashqai sahip forumları, şanzıman tamir servisleri ve bağımsız güvenilirlik raporlarında tekrarlayan, tutarlı bir bulgu.",
          },
        ],
      },
    ],
  },
  {
    brand: "Kia",
    model: "Sportage",
    yearFrom: 2010,
    yearTo: 2020,
    generalNote:
      "Cerato ile Hyundai-Kia'nın Gamma 1.6 GDI benzinli ve CRDi dizel motor ailelerini paylaşır; en belirgin kronik sorunlar direkt enjeksiyonlu benzin motorunda karbon birikimi ve dizel modellerde DPF/DCT şikayetleridir.",
    engines: [
      {
        engineLabel: "1.6 GDI",
        fuelType: "Benzin",
        transmission: "Manuel",
        yearFrom: 2010,
        yearTo: 2020,
        reliabilityNote:
          "Genel olarak yaygın bir motor arızası paterni yok, ancak direkt enjeksiyon kaynaklı karbon birikimi tekrarlayan şikayetler arasında.",
        issues: [
          {
            id: "sportage-16gdi-carbon",
            severity: "medium",
            title: "Emme supaplarında karbon birikimi (direkt enjeksiyon kaynaklı)",
            detail:
              "Direkt enjeksiyon tasarımı gereği yakıtın supap arkasından geçmemesi nedeniyle zamanla emme supaplarında ve emme manifoldunda karbon birikmesi; güç kaybı, düzensiz rölanti, kısılma/misfire ve check engine lambası şeklinde kendini gösteriyor.",
            typicalOnset: "40.000-80.000 km",
            costLevel: "Orta",
            sourceNote:
              "Kia sahip forumları ve bağımsız motor inceleme siteleri üzerinde tekrarlayan, çok sayıda kaynakta doğrulanan bir tema.",
          },
        ],
      },
      {
        engineLabel: "1.7 CRDi",
        fuelType: "Dizel",
        transmission: "Manuel",
        yearFrom: 2010,
        yearTo: 2020,
        reliabilityNote:
          "Motor gövdesi dayanıklı kabul edilir; asıl risk DPF/EGR ve turbo yan sistemlerinde yoğunlaşıyor.",
        issues: [
          {
            id: "sportage-17crdi-dpf",
            severity: "medium",
            title: "DPF tıkanması / sensör arızaları",
            detail:
              "DPF basınç sensörü arızaları, tıkalı sensör hortumları veya kısa mesafe kullanım alışkanlıkları nedeniyle DPF'nin kendini temizleyememesi; DPF uyarı lambası, güç kaybı ve nihayetinde koruma moduna geçiş bildiriliyor.",
            typicalOnset: "80.000+ km, kısa mesafe kullanımda daha erken",
            costLevel: "Orta",
            sourceNote: "Bağımsız güvenilirlik raporlama siteleri üzerinde tekrarlayan bulgu.",
          },
          {
            id: "sportage-17crdi-turbo",
            severity: "medium",
            title: "Turbo arızası (yağ açlığı/kirlenmesi kaynaklı)",
            detail:
              "Güç kaybı ve artan egzoz dumanıyla kendini gösteren turbo arızaları; yağ açlığı, kirlenme veya genel aşınmaya bağlandığı bildiriliyor.",
            typicalOnset: "100.000+ km",
            costLevel: "Yüksek",
            sourceNote: "Bağımsız güvenilirlik raporlama siteleri üzerinde tekrarlayan bulgu.",
          },
        ],
      },
      {
        engineLabel: "7 ileri DCT",
        fuelType: "Dizel",
        transmission: "Yarı otomatik",
        trims: ["Sportage QL 1.7 CRDi"],
        yearFrom: 2015,
        yearTo: 2020,
        reliabilityNote: "Trafik/durdur-kalk kullanımında kavrama aşınması hızlanıyor.",
        issues: [
          {
            id: "sportage-dct-shudder",
            severity: "medium",
            title: "Kalkışta sarsıntı ve erken kavrama aşınması",
            detail:
              "Özellikle stop-and-go trafikte kalkış anında sarsıntı, tereddüt ve erken kavrama aşınması sıkça bildiriliyor.",
            typicalOnset: "50.000-100.000 km",
            costLevel: "Orta",
            sourceNote: "Bağımsız güvenilirlik raporlama siteleri üzerinde tekrarlayan bulgu.",
          },
        ],
      },
    ],
  },
  {
    brand: "Kia",
    model: "Cerato",
    yearFrom: 2010,
    yearTo: 2020,
    generalNote: "Sportage ile Hyundai-Kia'nın Gamma 1.6 GDI benzinli motor ailesini paylaşır.",
    engines: [
      {
        engineLabel: "1.6 GDI",
        fuelType: "Benzin",
        transmission: "Manuel",
        yearFrom: 2010,
        yearTo: 2020,
        issues: [
          {
            id: "cerato-16gdi-carbon",
            severity: "medium",
            title: "Emme supaplarında karbon birikimi (direkt enjeksiyon kaynaklı)",
            detail:
              "Direkt enjeksiyon tasarımı gereği zamanla emme supaplarında karbon birikmesi; güç kaybı, düzensiz rölanti ve check engine lambası şeklinde kendini gösteriyor.",
            typicalOnset: "40.000-80.000 km",
            costLevel: "Orta",
            sourceNote: "Kia sahip forumları ve bağımsız motor inceleme siteleri üzerinde tekrarlayan bulgu.",
          },
        ],
      },
    ],
  },
  {
    brand: "Citroen",
    model: "C3",
    yearFrom: 2002,
    yearTo: 2026,
    engines: [
      {
        engineLabel: "1.2 PureTech",
        fuelType: "Benzin",
        yearFrom: 2016,
        yearTo: 2026,
        issues: [
          {
            id: "citroen-c3-12puretech-wetbelt",
            severity: "high",
            title: "1.2 PureTech ıslak triger kayışı ve yağ tüketimi",
            detail:
              "Yağ içinde çalışan kayış parçalanıp yağ süzgecini tıkayabilir; yağ tüketimi ve fren vakum riski servis kampanya geçmişiyle kontrol edilmelidir.",
            typicalOnset: "60.000-120.000 km",
            costLevel: "Yüksek",
            sourceNote:
              "PSA 1.2 PureTech teknik kampanyaları ve Citroen/Peugeot kullanıcı kayıtlarında tekrar eden risk.",
          },
        ],
      },
      {
        engineLabel: "1.4 / 1.6 HDi",
        fuelType: "Dizel",
        transmission: "Manuel",
        yearFrom: 2002,
        yearTo: 2018,
        issues: [
          {
            id: "citroen-c3-hdi-turbo-egr",
            severity: "medium",
            title: "Turbo yağ besleme, EGR/DPF ve enjektör contası",
            detail:
              "HDi C3'lerde turbo yağ besleme hattı, EGR/DPF, enjektör conta kaçağı ve kısa mesafe dizel kullanımı kontrol edilmelidir.",
            typicalOnset: "120.000 km sonrası",
            costLevel: "Orta",
            sourceNote: "PSA HDi motor ailesi servis kaynakları ve C3 kullanıcı forumlarında tekrar eden bulgular.",
          },
        ],
      },
    ],
  },
  {
    brand: "Citroen",
    model: "C4",
    yearFrom: 2004,
    yearTo: 2026,
    engines: [
      {
        engineLabel: "1.6 THP",
        fuelType: "Benzin",
        yearFrom: 2009,
        yearTo: 2018,
        issues: [
          {
            id: "citroen-c4-16thp-chain-carbon",
            severity: "high",
            title: "THP zincir, yüksek basınç pompası ve karbon birikimi",
            detail:
              "BMW-PSA THP motorda zincir gergisi, HPFP, turbo wastegate ve direkt enjeksiyon karbon birikimi pahalı risk oluşturabilir.",
            typicalOnset: "60.000-120.000 km",
            costLevel: "Yüksek",
            sourceNote:
              "Prince/THP motor teknik kaynakları ve PSA kullanıcı forumlarında tekrar eden iyi belgelenmiş risk.",
          },
        ],
      },
      {
        engineLabel: "1.6 HDi / BlueHDi",
        fuelType: "Dizel",
        yearFrom: 2004,
        yearTo: 2020,
        issues: [
          {
            id: "citroen-c4-16hdi-egr-dpf",
            severity: "medium",
            title: "EGR/DPF, turbo yağ besleme ve enjektör contası",
            detail:
              "C4 HDi'da EGR/DPF, turbo yağ besleme hattı, enjektör conta kaçakları ve EGS/ETG robotize şanzıman davranışı kontrol edilmelidir.",
            typicalOnset: "120.000 km sonrası",
            costLevel: "Orta",
            sourceNote: "PSA 1.6 HDi ve C4 kullanıcı kayıtlarında tekrar eden bulgular.",
          },
        ],
      },
      {
        engineLabel: "1.2 PureTech",
        fuelType: "Benzin",
        transmission: "Otomatik",
        yearFrom: 2020,
        yearTo: 2026,
        issues: [
          {
            id: "citroen-c4-12puretech-wetbelt",
            severity: "high",
            title: "PureTech wet belt ve EAT8 geçiş kontrolü",
            detail:
              "Yeni C4 1.2 PureTech'te ıslak kayış, yağ tüketimi, turbo ve EAT8 otomatik şanzıman geçişleri kontrol edilmelidir.",
            typicalOnset: "60.000-120.000 km",
            costLevel: "Yüksek",
            sourceNote: "PSA 1.2 PureTech teknik kaynakları ve kullanıcı kayıtlarında tekrar eden risk.",
          },
        ],
      },
    ],
  },
  {
    brand: "Citroen",
    model: "C4 Cactus",
    yearFrom: 2014,
    yearTo: 2020,
    engines: [
      {
        engineLabel: "1.2 PureTech",
        fuelType: "Benzin",
        transmission: "Otomatik",
        yearFrom: 2014,
        yearTo: 2020,
        issues: [
          {
            id: "citroen-c4cactus-12puretech-etg",
            severity: "high",
            title: "PureTech wet belt ve ETG/EAT şanzıman davranışı",
            detail:
              "C4 Cactus 1.2 PureTech'te ıslak kayış/yağ tüketimi; ETG robotize veya EAT otomatik şanzımanda geçiş davranışı kontrol edilmeli.",
            typicalOnset: "60.000-120.000 km",
            costLevel: "Yüksek",
            sourceNote: "PSA PureTech ve ETG/EAT kullanıcı kayıtlarında tekrar eden kontrol başlığı.",
          },
        ],
      },
      {
        engineLabel: "1.6 BlueHDi",
        fuelType: "Dizel",
        transmission: "Otomatik",
        yearFrom: 2014,
        yearTo: 2020,
        issues: [
          {
            id: "citroen-c4cactus-bluehdi-adblue",
            severity: "medium",
            title: "AdBlue/NOx, DPF/EGR ve ETG şanzıman kontrolü",
            detail:
              "BlueHDi Cactus'te AdBlue deposu/pompası, NOx sensörü, DPF/EGR ve ETG robotize şanzıman kalkış/geçiş davranışı kontrol edilmelidir.",
            typicalOnset: "90.000-150.000 km",
            costLevel: "Orta",
            sourceNote: "PSA BlueHDi ve C4 Cactus kullanıcı forumlarında tekrar eden bulgular.",
          },
        ],
      },
    ],
  },
  {
    brand: "Citroen",
    model: "C5",
    yearFrom: 2001,
    yearTo: 2017,
    engines: [
      {
        engineLabel: "1.6 / 2.0 HDi",
        fuelType: "Dizel",
        transmission: "Otomatik",
        yearFrom: 2001,
        yearTo: 2017,
        issues: [
          {
            id: "citroen-c5-hdi-hydractive",
            severity: "medium",
            title: "HDi dizel yan sistemleri ve hidropnömatik süspansiyon",
            detail:
              "C5'te EGR/DPF, turbo, enjektör ve Hydractive/hidropnömatik süspansiyon pompa-küre-kaçak kontrolü pahalı masrafı belirler.",
            typicalOnset: "140.000 km sonrası veya yaşa bağlı",
            costLevel: "Yüksek",
            sourceNote:
              "Citroen C5/HDi kullanıcı forumları ve hidropnömatik servis kaynaklarında tekrar eden bulgular.",
          },
        ],
      },
      {
        engineLabel: "1.6 THP",
        fuelType: "Benzin",
        transmission: "Otomatik",
        yearFrom: 2009,
        yearTo: 2017,
        issues: [
          {
            id: "citroen-c5-thp-chain-hpfp",
            severity: "high",
            title: "THP zincir, HPFP ve turbo kontrolü",
            detail:
              "1.6 THP C5'te zincir/gergi, yüksek basınç pompası, turbo ve karbon birikimi kontrol edilmeli; otomatik şanzıman geçişleri de izlenmelidir.",
            typicalOnset: "60.000-120.000 km",
            costLevel: "Yüksek",
            sourceNote: "PSA/BMW THP motor ailesi teknik kaynakları ve kullanıcı kayıtlarında tekrar eden risk.",
          },
        ],
      },
    ],
  },
  {
    brand: "Citroen",
    model: "C5 Aircross",
    yearFrom: 2018,
    yearTo: 2026,
    engines: [
      {
        engineLabel: "1.2 PureTech",
        fuelType: "Benzin",
        transmission: "Otomatik",
        yearFrom: 2018,
        yearTo: 2026,
        issues: [
          {
            id: "citroen-c5aircross-12puretech-wetbelt",
            severity: "high",
            title: "1.2 PureTech wet belt ve turbo kontrolü",
            detail:
              "C5 Aircross 1.2 PureTech'te ıslak kayış, yağ tüketimi, turbo ve servis kampanya geçmişi kontrol edilmelidir.",
            typicalOnset: "60.000-120.000 km",
            costLevel: "Yüksek",
            sourceNote: "PSA 1.2 PureTech teknik kayıtları ve C5 Aircross kullanıcı deneyimleri.",
          },
        ],
      },
      {
        engineLabel: "1.5 BlueHDi",
        fuelType: "Dizel",
        transmission: "Otomatik",
        yearFrom: 2018,
        yearTo: 2026,
        issues: [
          {
            id: "citroen-c5aircross-15bluehdi-adblue",
            severity: "medium",
            title: "AdBlue/NOx ve eksantrik zinciri kontrolü",
            detail:
              "1.5 BlueHDi C5 Aircross'ta AdBlue deposu/pompası, NOx sensörü, DPF/EGR ve eksantrik zinciri riski kontrol edilmeli.",
            typicalOnset: "80.000-150.000 km",
            costLevel: "Orta",
            sourceNote: "PSA 1.5 BlueHDi teknik kaynakları ve kullanıcı kayıtlarında tekrar eden bulgu.",
          },
        ],
      },
      {
        engineLabel: "Plug-in Hybrid",
        fuelType: "Hibrit",
        transmission: "Otomatik",
        yearFrom: 2020,
        yearTo: 2026,
        issues: [
          {
            id: "citroen-c5aircross-phev-battery",
            severity: "medium",
            title: "PHEV batarya, şarj ve garanti devri kontrolü",
            detail:
              "Plug-in hibritte batarya sağlık raporu, şarj portu, inverter/soğutma, garanti devri ve yazılım güncellemeleri kontrol edilmelidir.",
            typicalOnset: "Garanti devri öncesi",
            costLevel: "Orta",
            sourceNote: "PHEV alım rehberleri ve PSA hibrit kullanıcı deneyimlerinde tekrar eden kontrol başlıkları.",
          },
        ],
      },
    ],
  },
  {
    brand: "Citroen",
    model: "Berlingo",
    yearFrom: 2000,
    yearTo: 2026,
    generalNote:
      "Ticari/aile kullanımı karışık olduğu için yük geçmişi, kilometre doğruluğu, arka aks ve dizel emisyon sistemi önemlidir.",
    engines: [
      {
        engineLabel: "1.6 HDi / BlueHDi",
        fuelType: "Dizel",
        transmission: "Manuel",
        yearFrom: 2005,
        yearTo: 2018,
        issues: [
          {
            id: "citroen-berlingo-16hdi-rearaxle",
            severity: "medium",
            title: "1.6 HDi turbo/EGR ve arka torsiyon/aks kontrolü",
            detail:
              "Berlingo 1.6 HDi'da turbo yağ besleme, EGR/DPF, enjektör contası, ticari kullanım ve arka torsiyon/aks boşluğu kontrol edilmelidir.",
            typicalOnset: "120.000 km sonrası",
            costLevel: "Orta",
            sourceNote: "PSA 1.6 HDi ve Berlingo/Partner kullanıcı servis kayıtlarında tekrar eden bulgular.",
          },
        ],
      },
      {
        engineLabel: "1.5 BlueHDi",
        fuelType: "Dizel",
        transmission: "Manuel",
        yearFrom: 2018,
        yearTo: 2026,
        issues: [
          {
            id: "citroen-berlingo-15bluehdi-adblue",
            severity: "medium",
            title: "AdBlue/NOx, DPF/EGR ve ticari kullanım yıpranması",
            detail:
              "Yeni Berlingo 1.5 BlueHDi'da AdBlue/NOx, DPF/EGR, eksantrik zinciri riski ve ticari kullanım kaynaklı debriyaj/alt takım kontrol edilmeli.",
            typicalOnset: "100.000 km sonrası",
            costLevel: "Orta",
            sourceNote: "PSA 1.5 BlueHDi ve Berlingo kullanıcı kayıtlarında tekrar eden bulgular.",
          },
        ],
      },
    ],
  },
  {
    brand: "Citroen",
    model: "Jumpy",
    yearFrom: 2000,
    yearTo: 2026,
    engines: [
      {
        engineLabel: "1.6 / 2.0 HDi-BlueHDi",
        fuelType: "Dizel",
        transmission: "Manuel",
        yearFrom: 2000,
        yearTo: 2026,
        issues: [
          {
            id: "citroen-jumpy-hdi-commercial",
            severity: "medium",
            title: "Turbo, DPF/EGR, AdBlue ve ticari kullanım aktarma kontrolü",
            detail:
              "Jumpy'de motor hacminden bağımsız olarak turbo, EGR/DPF, AdBlue, debriyaj/volan, şanzıman ve yük/servis geçmişi kontrol edilmelidir.",
            typicalOnset: "Ticari kullanıma bağlı",
            costLevel: "Yüksek",
            sourceNote:
              "PSA ticari HDi/BlueHDi servis kayıtları ve Jumpy kullanıcı forumlarında tekrar eden kontrol başlıkları.",
          },
        ],
      },
    ],
  },
];
