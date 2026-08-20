import type { ModelEntry } from "../types";

// Kaynak: forum konsensüsü (DonanımHaber, Şikayetvar, Team Doblo) ve
// Multijet/Fire/E-torQ/T-Jet motor aileleri için tekrarlayan bulgular.
export const FIAT_ENTRIES: ModelEntry[] = [
  {
    brand: "Fiat",
    model: "Egea",
    yearFrom: 2015,
    yearTo: 2026,
    generalNote:
      "Türkiye'de üretilen ve en çok satan modellerden biri olduğu için servis/parça kaynaklı bilgi bolluğu var; aşağıdaki sorunlar birden fazla bağımsız kaynakta (forum, şikayet platformu) tekrar eden bulgulardır.",
    engines: [
      {
        engineLabel: "1.3 Multijet",
        fuelType: "Dizel",
        transmission: "Manuel",
        yearFrom: 2015,
        yearTo: 2020,
        reliabilityNote:
          "Egea'nın erken yıllarında sunulan bu motor, daha sonra üretimden kaldırılıp yerini 1.6 Multijet'e bırakmıştır.",
        issues: [
          {
            id: "egea-13mjet-turbo",
            severity: "medium",
            title: "Turbo aşınması / körük çatlağı",
            detail:
              "Turbo kanatları ve körüklerinde zamanla aşınma/çatlama bildirilmekte; güç kaybı, ıslık sesi ve yağ sızıntısı ile kendini gösterebiliyor.",
            typicalOnset: "100.000 km sonrası",
            costLevel: "Yüksek",
            sourceNote:
              "Birden fazla forum ve şikayet platformunda (DonanımHaber, Şikayetvar) tekrar eden kullanıcı bildirimlerine dayanır.",
          },
          {
            id: "egea-13mjet-enjektor",
            severity: "medium",
            title: "Enjektör kirlenmesi/arızası",
            detail:
              "Düşük kaliteli yakıt veya gecikmiş filtre değişimiyle ilişkilendirilen enjektör tıkanması; sarsıntılı rölanti, güç kaybı ve siyah duman ile ortaya çıkabiliyor.",
            typicalOnset: "80.000-120.000 km arası",
            costLevel: "Orta",
            sourceNote:
              "Fiat 1.3 Multijet ailesi için genel forum ve teknik servis kaynaklarında tekrarlanan bir tema.",
          },
          {
            id: "egea-13mjet-egr",
            severity: "medium",
            title: "EGR valfi tıkanması",
            detail: "EGR valfinde kurum birikimi motor verimini düşürebilir, arıza lambası yanmasına neden olabilir.",
            costLevel: "Orta",
            sourceNote: "Multijet motor ailesi genelinde tekrarlanan bir forum/şikayet bulgusu.",
          },
          {
            id: "egea-13mjet-ckv",
            severity: "medium",
            title: "Çift kütleli volan / debriyaj erken aşınması",
            detail:
              "Özellikle şehir içi dur-kalk kullanımda çift kütleli volan ve debriyaj setinde erken aşınma; rölantide tıkırtı, vites geçişinde titreşim.",
            typicalOnset: "100.000 km civarı",
            costLevel: "Yüksek",
            sourceNote: "Fiat Multijet motor ailesi için tekrar eden forum/teknik kaynak bulgusu.",
          },
        ],
      },
      {
        engineLabel: "1.6 Multijet",
        fuelType: "Dizel",
        transmission: "Manuel",
        yearFrom: 2015,
        yearTo: 2023,
        reliabilityNote:
          "Egea'nın en yaygın dizel motor seçeneği; genel olarak makul kabul edilse de tekrarlayan enjektör ve turbo aktüatör şikayetleri mevcut.",
        issues: [
          {
            id: "egea-16mjet-enjektor",
            severity: "medium",
            title: "Tekrarlayan enjektör arızası",
            detail:
              "Değişim sonrası bile tekrarlayan enjektör arızaları bildirilmiş; güç kaybı ve arıza lambası ile kendini gösteriyor.",
            costLevel: "Yüksek",
            sourceNote: "Şikayetvar ve kronik sorun derleme sitelerinde tekrarlanan kullanıcı şikayetleri.",
          },
          {
            id: "egea-16mjet-turboact",
            severity: "medium",
            title: "Turbo aktüatör (değişken geometri) arızası",
            detail:
              "Turbonun geometri kontrol aktüatöründeki arıza motoru 'limp mode'a (acil çalışma moduna) sokarak belirgin güç kaybına yol açabiliyor.",
            costLevel: "Orta",
            sourceNote: "Türkçe forum ve şikayet platformlarında tekrar eden bulgu.",
          },
          {
            id: "egea-16mjet-ckv",
            severity: "medium",
            title: "Çift kütleli volan / debriyaj erken aşınması",
            detail:
              "Manuel şanzımanlı versiyonlarda, özellikle şehir içi kullanımda debriyaj ve çift kütleli volan erken yıpranıyor; vites geçişinde sarsıntı/ses.",
            typicalOnset: "90.000-120.000 km",
            costLevel: "Yüksek",
            sourceNote: "DonanımHaber ve kronik sorun derleme sitelerinde tekrarlanan bulgu.",
          },
          {
            id: "egea-16mjet-manifold",
            severity: "low",
            title: "Emme manifoldunda karbon birikimi",
            detail:
              "Emme manifoldu ve gaz kelebeğinde kurum/karbon birikimi rölanti düzensizliği, güç kaybı ve titreşime yol açabiliyor.",
            costLevel: "Orta",
            sourceNote: "Türkçe forum kaynaklarında tekrarlanan gözlem.",
          },
        ],
      },
      {
        engineLabel: "1.4 Fire",
        fuelType: "Benzin",
        transmission: "Manuel",
        yearFrom: 2015,
        yearTo: 2020,
        issues: [
          {
            id: "egea-14fire-yagsizmasi",
            severity: "medium",
            title: "Conta/keçe kaynaklı yağ sızıntısı ve yağ tüketimi",
            detail:
              "Motor contaları ve keçelerinden zamanla yağ sızıntısı; bazı kullanıcılar düzenli bakıma rağmen artan yağ tüketimi bildiriyor.",
            costLevel: "Orta",
            sourceNote: "Kronik sorun derleme siteleri ve forum kaynaklarında tekrarlanan bulgu.",
          },
          {
            id: "egea-14fire-bobin",
            severity: "low",
            title: "Ateşleme bobini arızası",
            detail:
              "Buji ateşleme bobinlerinin sık değişen parçalardan biri olduğu, arızalandığında motor arızası uyarısı ve tekleme görüldüğü bildiriliyor.",
            costLevel: "Düşük",
            sourceNote: "Türkçe forum kaynaklarında tekrarlanan gözlem.",
          },
          {
            id: "egea-14fire-debriyaj",
            severity: "low",
            title: "Debriyaj erken aşınması",
            detail: "Yoğun şehir içi dur-kalk trafikte debriyaj baskı/balata setinde erken aşınma bildiriliyor.",
            typicalOnset: "60.000-80.000 km",
            costLevel: "Orta",
            sourceNote: "Forum kaynaklarında tekrarlanan bulgu.",
          },
        ],
      },
      {
        engineLabel: "1.6 E-torQ",
        fuelType: "Benzin",
        transmission: "Otomatik",
        yearFrom: 2015,
        yearTo: 2020,
        issues: [
          {
            id: "egea-16etorq-termostat",
            severity: "medium",
            title: "Termostat arızası",
            detail:
              "70.000-100.000 km aralığında termostat arızası sık görülüyor; motor ısınma süresinin uzaması veya aşırı ısınma eğilimi yaratabiliyor.",
            typicalOnset: "70.000-100.000 km",
            costLevel: "Düşük",
            sourceNote: "Birden fazla teknik blog ve forum kaynağında tekrarlanan bulgu.",
          },
          {
            id: "egea-16etorq-yagsizmasi",
            severity: "low",
            title: "Silindir kapak contası ve krank keçesinden yağ sızıntısı",
            detail:
              "Yüksek kilometrede silindir kapak contası ve krank mili yağ keçelerinden sızıntı ve hafif yağ eksiltme bildiriliyor.",
            costLevel: "Orta",
            sourceNote: "Teknik servis odaklı blog kaynaklarında tekrarlanan bulgu.",
          },
        ],
      },
      {
        engineLabel: "1.0 FireFly Turbo",
        fuelType: "Benzin",
        transmission: "Manuel",
        yearFrom: 2020,
        yearTo: 2026,
        reliabilityNote:
          "FireFly turbo, eski atmosferik Fire motorlara göre daha modern ve ekonomik; turbo/yağ bakımı ve soğutma disiplini daha kritik.",
        issues: [
          {
            id: "egea-10firefly-turbo-oil",
            severity: "medium",
            title: "Turbo ve yağ bakım hassasiyeti",
            detail:
              "Küçük hacimli turbo benzinli yapıda gecikmiş yağ bakımı, yanlış yağ viskozitesi veya sıcak kullanım sonrası soğutmadan stop etme turbo ömrünü kısaltabilir. Alımda turbo sesi, yağ kaçakları ve servis faturası kontrol edilmeli.",
            typicalOnset: "100.000 km sonrası risk artar",
            costLevel: "Orta",
            sourceNote:
              "Fiat FireFly turbo motor ailesi ve küçük hacimli turbo benzinli alım rehberlerinde tekrar eden bakım hassasiyeti.",
          },
          {
            id: "egea-10firefly-coil-sensor",
            severity: "low",
            title: "Ateşleme bobini/sensör kaynaklı tekleme",
            detail:
              "Direkt enjeksiyonlu turbo benzinli motorlarda bobin, buji ve sensör kaynaklı tekleme/arıza lambası alım öncesi test sürüşünde kontrol edilmeli.",
            costLevel: "Düşük",
            sourceNote:
              "FireFly ailesi kullanıcı kayıtları ve genel küçük hacimli turbo benzinli servis gözlemleriyle tutarlı kontrol kalemi.",
          },
        ],
      },
      {
        engineLabel: "1.4 T-Jet",
        fuelType: "Benzin",
        transmission: "Manuel",
        yearFrom: 2016,
        yearTo: 2020,
        issues: [
          {
            id: "egea-14tjet-turbo-valve",
            severity: "medium",
            title: "Turbo basınç kontrolü ve hortum/valf kaçakları",
            detail:
              "T-Jet motorlarda turbo basınç kontrol valfi, hortum kaçakları ve düzensiz boost davranışı performans kaybı yaratabilir. Yazılımlı/kullanılmış araçlarda risk artar.",
            typicalOnset: "90.000 km sonrası",
            costLevel: "Orta",
            sourceNote:
              "Fiat T-Jet motor ailesi forumları ve bağımsız servis kayıtlarında tekrar eden turbo kontrol sistemi bulgusu.",
          },
          {
            id: "egea-14tjet-oil-cooling",
            severity: "medium",
            title: "Yağ/soğutma bakımı ihmalinde turbo yıpranması",
            detail:
              "Turbo benzinli T-Jet motorda yağ değişim aralığı, doğru yağ ve soğutma sistemi sağlığı kritik; hararet veya yağsız kullanım turbo ve conta masrafı doğurabilir.",
            costLevel: "Orta",
            sourceNote: "T-Jet alım rehberleri ve kullanıcı forumlarında tekrar eden bakım hassasiyeti.",
          },
        ],
      },
      {
        engineLabel: "1.5 Hybrid T4 DCT",
        fuelType: "Hibrit",
        transmission: "Yarı otomatik",
        yearFrom: 2022,
        yearTo: 2026,
        reliabilityNote:
          "Yeni nesil hibrit/DCT kombinasyonu olduğu için uzun dönem veri 1.3/1.6 Multijet kadar geniş değildir; garanti ve yazılım/şanzıman davranışı önemlidir.",
        issues: [
          {
            id: "egea-15hybrid-dct-clutch",
            severity: "medium",
            title: "DCT kavrama davranışı ve yazılım güncellemesi kontrolü",
            detail:
              "Dur-kalk trafikte çift kavrama davranışı, kalkış titremesi, vites geçiş gecikmesi ve servis yazılım güncellemeleri kontrol edilmeli. Test sürüşü soğuk ve sıcak kullanımda yapılmalı.",
            typicalOnset: "Kullanım tarzına bağlı",
            costLevel: "Orta",
            sourceNote:
              "DCT şanzımanlı küçük hacimli hibrit/benzinli araç alım rehberleri ve kullanıcı deneyimlerinde tekrar eden kontrol başlığı.",
          },
          {
            id: "egea-15hybrid-battery-warranty",
            severity: "low",
            title: "Hibrit sistem garanti ve 12V/48V akü kontrolü",
            detail:
              "Hibrit sistem arızasından çok garanti devri, 12V/48V akü durumu ve yazılım güncellemeleri ikinci elde doğrulanmalıdır.",
            costLevel: "Orta",
            sourceNote:
              "Mild-hybrid araç alım rehberlerinde batarya/garanti/yazılım kontrolü tekrar eden önleyici kalemdir.",
          },
        ],
      },
    ],
  },
  {
    brand: "Fiat",
    model: "Egea Cross",
    yearFrom: 2020,
    yearTo: 2026,
    generalNote:
      "Egea Cross, Egea ile aynı temel motor ailesini kullanır; riskler motor/şanzıman kombinasyonuna bağlıdır. Cross gövde ve donanımda tavan rayı, plastik kaplama ve ADAS/ek donanım kontrolü de yapılmalıdır.",
    engines: [
      {
        engineLabel: "1.4 Fire",
        fuelType: "Benzin",
        transmission: "Manuel",
        yearFrom: 2020,
        yearTo: 2026,
        issues: [
          {
            id: "egea-cross-14fire-oil-coil",
            severity: "medium",
            title: "Yağ sızıntısı, bobin ve debriyaj kontrolü",
            detail:
              "1.4 Fire atmosferik yapı olarak basittir; alımda yağ kaçakları, bobin/buji teklemesi, LPG varsa montaj kalitesi ve şehir içi kullanım kaynaklı debriyaj aşınması kontrol edilmeli.",
            typicalOnset: "80.000 km sonrası",
            costLevel: "Orta",
            sourceNote:
              "Egea 1.4 Fire ve Fiat Fire motor ailesi kullanıcı/servis kayıtlarında tekrar eden bulguların Cross gövdeye uyarlanması.",
          },
        ],
      },
      {
        engineLabel: "1.0 FireFly Turbo",
        fuelType: "Benzin",
        transmission: "Manuel",
        yearFrom: 2020,
        yearTo: 2026,
        issues: [
          {
            id: "egea-cross-10firefly-turbo",
            severity: "medium",
            title: "Turbo/yağ bakımı ve direkt enjeksiyon hassasiyeti",
            detail:
              "1.0 FireFly Turbo'da doğru yağ, turbo soğutma alışkanlığı, bobin/buji durumu ve emme sistemi temizliği alım öncesi kontrol edilmelidir.",
            typicalOnset: "100.000 km sonrası",
            costLevel: "Orta",
            sourceNote:
              "Fiat FireFly turbo motor ailesi ve Egea kullanıcı deneyimlerinde tekrar eden bakım hassasiyeti.",
          },
        ],
      },
      {
        engineLabel: "1.3 Multijet",
        fuelType: "Dizel",
        transmission: "Manuel",
        yearFrom: 2020,
        yearTo: 2022,
        issues: [
          {
            id: "egea-cross-13mjet-egr-injector",
            severity: "medium",
            title: "EGR/enjektör ve turbo hortumu kontrolü",
            detail:
              "1.3 Multijet Cross versiyonlarında kısa mesafe kullanım EGR ve enjektör sorunlarını öne çıkarır; turbo hortumu, duman ve rölanti dalgalanması kontrol edilmeli.",
            typicalOnset: "90.000-140.000 km",
            costLevel: "Orta",
            sourceNote: "1.3 Multijet ailesi için Fiat forumları ve bağımsız servis kayıtlarında tekrar eden bulgular.",
          },
        ],
      },
      {
        engineLabel: "1.6 Multijet",
        fuelType: "Dizel",
        transmission: "Manuel",
        yearFrom: 2020,
        yearTo: 2026,
        issues: [
          {
            id: "egea-cross-16mjet-manual-dpf-dmf",
            severity: "medium",
            title: "DPF/EGR, enjektör ve çift kütleli volan kontrolü",
            detail:
              "1.6 Multijet manuelde şehir içi kullanım DPF/EGR kurumlanmasını, yüksek tork ise debriyaj/volan aşınmasını öne çıkarır. Servis geçmişi ve rejenerasyon alışkanlığı sorulmalı.",
            typicalOnset: "100.000 km sonrası",
            costLevel: "Yüksek",
            sourceNote:
              "Fiat 1.6 Multijet ailesi forumları, Egea kullanıcı kayıtları ve dizel bakım rehberlerinde tekrar eden bulgular.",
          },
        ],
      },
      {
        engineLabel: "1.6 Multijet DCT",
        fuelType: "Dizel",
        transmission: "Yarı otomatik",
        yearFrom: 2021,
        yearTo: 2026,
        issues: [
          {
            id: "egea-cross-16mjet-dct-clutch",
            severity: "medium",
            title: "DCT kavrama ve dizel emisyon sistemi birlikte kontrol edilmeli",
            detail:
              "Dizel DCT kombinasyonunda kalkış titremesi, vites geçişi, kavrama adaptasyonu, DPF/EGR ve enjektör geçmişi birlikte değerlendirilmelidir.",
            typicalOnset: "100.000 km sonrası",
            costLevel: "Yüksek",
            sourceNote:
              "Fiat DCT kullanıcı deneyimleri ve Multijet bakım kayıtlarında tekrar eden çift kontrol başlığı.",
          },
        ],
      },
      {
        engineLabel: "1.5 Hybrid T4 DCT",
        fuelType: "Hibrit",
        transmission: "Yarı otomatik",
        yearFrom: 2022,
        yearTo: 2026,
        issues: [
          {
            id: "egea-cross-15hybrid-dct",
            severity: "medium",
            title: "DCT, hibrit akü ve yazılım güncellemesi kontrolü",
            detail:
              "1.5 hibrit Cross alımında kavrama davranışı, 48V sistem/akü durumu, garanti devri ve servis yazılım güncellemeleri kontrol edilmelidir.",
            typicalOnset: "Garanti devri ve 80.000 km sonrası",
            costLevel: "Orta",
            sourceNote:
              "Egea hibrit kullanıcı deneyimleri ve mild-hybrid/DCT ikinci el kontrol rehberleriyle tutarlı bulgu.",
          },
        ],
      },
    ],
  },
  {
    brand: "Fiat",
    model: "Linea",
    yearFrom: 2007,
    yearTo: 2015,
    generalNote:
      "Türkiye'de uzun süre üretilmiş, ikinci el pazarında çok yaygın bir model; dizel motorlarda turbo/enjektör, T-Jet motorda turbo kontrol valfi öne çıkan tekrarlayan sorunlar.",
    engines: [
      {
        engineLabel: "1.3 Multijet",
        fuelType: "Dizel",
        transmission: "Manuel",
        issues: [
          {
            id: "linea-13mjet-enjektor",
            severity: "medium",
            title: "Enjektör arızası",
            detail: "Enjektör arızası güç kaybı, aşırı duman ve artan yakıt tüketimine yol açabiliyor.",
            costLevel: "Orta",
            sourceNote: "Türkçe forum ve kronik sorun derleme sitelerinde tekrarlanan bulgu.",
          },
          {
            id: "linea-13mjet-turbo",
            severity: "medium",
            title: "Turbo arızası (körük çatlağı, yağ sızıntısı)",
            detail:
              "Turbo körüklerinde çatlak, yağ sızdırması ve ıslık sesi ile kendini gösteren turbo arızaları bildiriliyor.",
            typicalOnset: "100.000 km sonrası",
            costLevel: "Yüksek",
            sourceNote: "DonanımHaber ve kronik sorun sitelerinde tekrarlanan bulgu.",
          },
          {
            id: "linea-13mjet-egr",
            severity: "low",
            title: "EGR valfi arızası",
            detail:
              "EGR valfi tıkanması veya arızası kirli enjektörle birlikte siyah duman ve performans kaybına katkıda bulunabiliyor.",
            costLevel: "Orta",
            sourceNote: "Forum kaynaklarında tekrarlanan gözlem.",
          },
        ],
      },
      {
        engineLabel: "1.6 Multijet",
        fuelType: "Dizel",
        transmission: "Manuel",
        issues: [
          {
            id: "linea-16mjet-dpf",
            severity: "medium",
            title: "DPF (partikül filtresi) tıkanması",
            detail:
              "Özellikle kısa mesafe şehir içi kullanımda DPF tıkanması, güç kaybı ve arıza lambası ile sonuçlanabiliyor.",
            costLevel: "Yüksek",
            sourceNote: "Türkçe forum kaynaklarında tekrarlanan bulgu.",
          },
          {
            id: "linea-16mjet-turbo",
            severity: "medium",
            title: "Turbo arızaları",
            detail: "1.3 Multijet'e benzer şekilde turbo aşınması/arızası bildiriliyor.",
            costLevel: "Yüksek",
            sourceNote: "Forum kaynaklarında tekrarlanan gözlem.",
          },
        ],
      },
      {
        engineLabel: "1.4 T-Jet",
        fuelType: "Benzin",
        transmission: "Manuel",
        reliabilityNote:
          "Birinci nesil turbo benzinli motor olduğu için düzenli 'turbo zamanlaması' (soğuma süresi bekletme) bakımına dikkat önerilir.",
        issues: [
          {
            id: "linea-14tjet-basinckontrol",
            severity: "medium",
            title: "Turbo basınç kontrol valfi arızası",
            detail:
              "Turboya giden hava akışını düzenleyen basınç kontrol valfinin arızalanması turbonun devreye girmemesine ve belirgin güç kaybına yol açabiliyor.",
            costLevel: "Orta",
            sourceNote: "DonanımHaber forumunda belgelenmiş, tekrar eden bir kullanıcı bulgusu.",
          },
        ],
      },
      {
        engineLabel: "1.4 Fire",
        fuelType: "Benzin",
        transmission: "Manuel",
        issues: [
          {
            id: "linea-14fire-yagsizma",
            severity: "low",
            title: "Conta/keçe kaynaklı yağ sızıntısı",
            detail: "Motor contaları ve keçelerinden yağ sızıntısı ve buna bağlı yağ eksiltme bildiriliyor.",
            costLevel: "Orta",
            sourceNote: "Kronik sorun derleme sitelerinde tekrarlanan bulgu.",
          },
        ],
      },
    ],
  },
  {
    brand: "Fiat",
    model: "Doblo",
    yearFrom: 2010,
    yearTo: 2022,
    generalNote:
      "Ticari/yük taşıma amaçlı yoğun kullanım nedeniyle şanzıman ve turbo gibi güç aktarma organlarında aşınma özel araçlara göre daha erken görülebiliyor.",
    engines: [
      {
        engineLabel: "1.3 Multijet",
        fuelType: "Dizel",
        transmission: "Manuel",
        issues: [
          {
            id: "doblo-13mjet-enjektor",
            severity: "medium",
            title: "Enjektör arızası",
            detail: "Enjektör arızası güç kaybı, duman atma ve yakıt tüketiminde artışa yol açabiliyor.",
            costLevel: "Orta",
            sourceNote: "Şikayetvar ve DonanımHaber forumunda tekrarlanan kullanıcı bildirimleri.",
          },
          {
            id: "doblo-13mjet-turbo",
            severity: "medium",
            title: "Turbo körüğü çatlağı / yağ sızdırması",
            detail:
              "Turbo körüklerinde çatlak oluşumu güç düşüşüne ve aşırı duman çıkışına, ayrıca turbo yağ sızdırmasına yol açabiliyor.",
            typicalOnset: "100.000 km sonrası",
            costLevel: "Yüksek",
            sourceNote: "Team Doblo ve Şikayetvar'da tekrarlanan bulgu.",
          },
          {
            id: "doblo-13mjet-krank-sensor",
            severity: "medium",
            title: "Krank mili pozisyon sensörü arızası",
            detail:
              "Sensör arızası aracın sürüş sırasında aniden durmasına veya çalışmaz hale gelmesine yol açabiliyor.",
            costLevel: "Düşük",
            sourceNote: "Team Doblo forumunda tekrarlanan kullanıcı bildirimi.",
          },
          {
            id: "doblo-13mjet-vites",
            severity: "low",
            title: "Vites kutusu/bağlantı çubuklarında aşınma",
            detail:
              "Yoğun yük taşıma kullanımında vites körüğü ve bağlantı çubukları zamanla aşınıyor; vitesler boşa kaçabiliyor veya geçişler sertleşebiliyor.",
            costLevel: "Orta",
            sourceNote: "Forum kaynaklarında ticari kullanım bağlamında tekrarlanan gözlem.",
          },
        ],
      },
      {
        engineLabel: "1.6 Multijet",
        fuelType: "Dizel",
        transmission: "Manuel",
        issues: [
          {
            id: "doblo-16mjet-enjektor",
            severity: "medium",
            title: "Enjektör arızaları",
            detail:
              "1.6 Multijet motorlarda enjektör arızası, güç kaybı, aşırı duman ve arıza lambası ile kendini gösteriyor.",
            costLevel: "Orta",
            sourceNote: "Şikayetvar ve Team Doblo forumunda tekrarlanan bulgu.",
          },
          {
            id: "doblo-16mjet-dpf",
            severity: "medium",
            title: "DPF tıkanması",
            detail:
              "Partikül filtresi tıkanması güç kaybı ve artan yakıt tüketimine yol açabiliyor, özellikle kısa mesafe kullanımda.",
            costLevel: "Yüksek",
            sourceNote: "Forum kaynaklarında tekrarlanan bulgu.",
          },
          {
            id: "doblo-16mjet-ckv",
            severity: "medium",
            title: "Çift kütleli volan / debriyaj sorunları",
            detail:
              "Vites değişiminde tıkırtı veya titreşim şeklinde kendini gösteren çift kütleli volan aşınması bildiriliyor.",
            costLevel: "Yüksek",
            sourceNote: "Forum kaynaklarında tekrarlanan gözlem.",
          },
        ],
      },
      {
        engineLabel: "1.4 Fire",
        fuelType: "Benzin",
        transmission: "Manuel",
        issues: [
          {
            id: "doblo-14fire-beyin",
            severity: "medium",
            title: "Motor beyni (ECU) arızası",
            detail:
              "Motor beyninin motor üzerinde konumlanmış olması nedeniyle motor ısısından etkilenip arızalandığı, kullanıcılar tarafından bildiriliyor.",
            costLevel: "Yüksek",
            sourceNote:
              "Şikayetvar'da tekrarlanan kullanıcı şikayeti; tek platform ağırlıklı olduğu için orta güvenilirlikte değerlendirildi.",
          },
        ],
      },
    ],
  },
  {
    brand: "Fiat",
    model: "Punto",
    generation: "Punto II / Grande Punto / Punto Evo / Punto",
    yearFrom: 2000,
    yearTo: 2018,
    generalNote:
      "Türkiye'de 1.2/1.4 Fire benzinli ve 1.3 Multijet dizel versiyonları yaygındır. Modelde motor kadar elektrikli direksiyon (EPS) ve şehir içi kullanım kaynaklı alt takım kontrolü önemlidir.",
    engines: [
      {
        engineLabel: "1.2 Fire",
        fuelType: "Benzin",
        transmission: "Manuel",
        yearFrom: 2000,
        yearTo: 2012,
        issues: [
          {
            id: "punto-12fire-eps-coil",
            severity: "medium",
            title: "Elektrikli direksiyon (EPS) ve ateşleme bobini kontrolü",
            detail:
              "Punto ailesinde EPS City direksiyon arızası, gösterge/elektrik sorunları ve bobin-buji kaynaklı tekleme sık kontrol edilen başlıklardır.",
            typicalOnset: "Yaş ve kullanım koşuluna bağlı",
            costLevel: "Orta",
            sourceNote:
              "DonanımHaber, Şikayetvar ve Punto kullanıcı forumlarında EPS/direksiyon sertleşmesi ile ateşleme sorunları tekrar eden bulgulardır.",
          },
        ],
      },
      {
        engineLabel: "1.4 Fire / StarJet",
        fuelType: "Benzin",
        transmission: "Manuel",
        yearFrom: 2005,
        yearTo: 2018,
        issues: [
          {
            id: "punto-14fire-oil-eps",
            severity: "medium",
            title: "EPS, yağ kaçakları ve debriyaj/alt takım aşınması",
            detail:
              "1.4 benzinli Punto'da motor basit kabul edilir; asıl kontrol kalemleri EPS direksiyon, yağ sızıntısı, bobin/buji, debriyaj ve ön takım sesleridir.",
            typicalOnset: "100.000 km sonrası",
            costLevel: "Orta",
            sourceNote:
              "Punto/Grande Punto kullanıcı forumları ve bağımsız servis alım listelerinde tekrar eden bulgular.",
          },
        ],
      },
      {
        engineLabel: "1.3 Multijet 75/90/95",
        fuelType: "Dizel",
        transmission: "Manuel",
        yearFrom: 2003,
        yearTo: 2018,
        issues: [
          {
            id: "punto-13mjet-egr-chain",
            severity: "medium",
            title: "EGR/enjektör, zincir sesi ve turbo kontrolü",
            detail:
              "1.3 Multijet Punto'da EGR kurumlanması, enjektör duman/tekleme, turbo hortumu ve zincir sesi alımda kontrol edilmeli. Düzenli yağ bakımı yapılmayan araçlarda zincir sesi riski artar.",
            typicalOnset: "120.000 km sonrası",
            costLevel: "Orta",
            sourceNote: "1.3 Multijet motor ailesi ve Punto forumlarında tekrar eden dizel yan sistem/bakım bulguları.",
          },
          {
            id: "punto-13mjet-eps",
            severity: "medium",
            title: "Motor bağımsız kronik: EPS direksiyon sertleşmesi",
            detail:
              "Dizel veya benzinli fark etmeksizin Punto ailesinde elektrikli direksiyon arızası en çok bildirilen model riski olarak kontrol edilmelidir.",
            costLevel: "Orta",
            sourceNote:
              "Şikayetvar Punto kronik kayıtları ve Fiat forumlarında direksiyon sertleşmesi tekrar eden ana şikayetlerden biridir.",
          },
        ],
      },
    ],
  },
  {
    brand: "Fiat",
    model: "Fiorino",
    generation: "Qubo/Fiorino",
    yearFrom: 2008,
    yearTo: 2026,
    generalNote:
      "Ticari kullanım oranı yüksek olduğu için motor kadar debriyaj, şanzıman bağlantıları, alt takım ve yük kullanım geçmişi önemlidir.",
    engines: [
      {
        engineLabel: "1.3 Multijet",
        fuelType: "Dizel",
        transmission: "Manuel",
        yearFrom: 2008,
        yearTo: 2026,
        issues: [
          {
            id: "fiorino-13mjet-egr-injector",
            severity: "medium",
            title: "EGR/enjektör, turbo hortumu ve debriyaj aşınması",
            detail:
              "Fiorino 1.3 Multijet'te kısa mesafe/yük kullanımı EGR, enjektör ve debriyaj aşınmasını hızlandırabilir. Duman, rölanti, turbo hortumu ve vites geçişi kontrol edilmeli.",
            typicalOnset: "100.000 km sonrası",
            costLevel: "Orta",
            sourceNote:
              "Fiat ticari Multijet kullanıcı forumları ve bağımsız servis kayıtlarında tekrar eden bulgular.",
          },
        ],
      },
      {
        engineLabel: "1.4 Fire",
        fuelType: "Benzin",
        transmission: "Manuel",
        yearFrom: 2008,
        yearTo: 2026,
        issues: [
          {
            id: "fiorino-14fire-lpg-valve",
            severity: "medium",
            title: "LPG montajı, subap/bobin ve yağ kaçağı kontrolü",
            detail:
              "Benzinli Fiorino'lar sık LPG'li kullanılır; LPG ayarı, subap sesi/kompresyon, bobin/buji ve yağ kaçakları kontrol edilmelidir.",
            typicalOnset: "LPG'li yüksek km araçlarda",
            costLevel: "Orta",
            sourceNote:
              "Fiat Fire LPG kullanıcı deneyimleri ve ticari Fiorino servis kayıtlarında tekrar eden kontrol başlığı.",
          },
        ],
      },
    ],
  },
  {
    brand: "Fiat",
    model: "500",
    generation: "500 / 500C / 500L / 500X",
    yearFrom: 2007,
    yearTo: 2026,
    engines: [
      {
        engineLabel: "1.2 Fire",
        fuelType: "Benzin",
        transmission: "Manuel",
        yearFrom: 2007,
        yearTo: 2020,
        issues: [
          {
            id: "fiat500-12fire-dualogic",
            severity: "medium",
            title: "Dualogic varsa robotize şanzıman ve debriyaj aktüatörü",
            detail:
              "1.2 Fire motor basit kabul edilir; asıl pahalı risk Dualogic robotize şanzımanlı araçlarda aktüatör/pompa/debriyaj davranışıdır. Manuel araçlarda yağ kaçakları ve bobin kontrol edilir.",
            typicalOnset: "80.000-130.000 km",
            costLevel: "Orta",
            sourceNote: "Fiat 500/Dualogic kullanıcı forumları ve şanzıman servis kayıtlarında tekrar eden bulgu.",
          },
        ],
      },
      {
        engineLabel: "0.9 TwinAir",
        fuelType: "Benzin",
        transmission: "Manuel",
        yearFrom: 2010,
        yearTo: 2020,
        issues: [
          {
            id: "fiat500-twinair-oil-module",
            severity: "medium",
            title: "TwinAir yağ kalitesi ve elektro-hidrolik kontrol modülü hassasiyeti",
            detail:
              "TwinAir motor yağ kalitesi ve bakım aralığına hassastır; tekleme, MultiAir/TwinAir modül davranışı ve turbo sesi kontrol edilmelidir.",
            typicalOnset: "90.000 km sonrası",
            costLevel: "Orta",
            sourceNote:
              "TwinAir motor ailesi teknik servis kaynakları ve Fiat 500 kullanıcı forumlarında tekrar eden bakım hassasiyeti.",
          },
        ],
      },
      {
        engineLabel: "1.3 Multijet",
        fuelType: "Dizel",
        transmission: "Manuel",
        yearFrom: 2007,
        yearTo: 2018,
        issues: [
          {
            id: "fiat500-13mjet-dpf-egr",
            severity: "medium",
            title: "DPF/EGR ve kısa mesafe dizel kullanımı",
            detail:
              "Küçük şehir otomobili olarak kısa mesafe kullanılan 1.3 Multijet 500'lerde DPF/EGR doluluğu, enjektör dumanı ve turbo hortumu kontrol edilmeli.",
            typicalOnset: "100.000 km sonrası",
            costLevel: "Orta",
            sourceNote:
              "1.3 Multijet ailesi ve Fiat 500 dizel kullanıcı kayıtlarında tekrar eden şehir içi kullanım riski.",
          },
        ],
      },
    ],
  },
  {
    brand: "Fiat",
    model: "Panda",
    yearFrom: 2003,
    yearTo: 2026,
    engines: [
      {
        engineLabel: "1.2 Fire",
        fuelType: "Benzin",
        transmission: "Manuel",
        yearFrom: 2003,
        yearTo: 2020,
        issues: [
          {
            id: "panda-12fire-eps-rust",
            severity: "medium",
            title: "EPS direksiyon, yağ kaçakları ve pas kontrolü",
            detail:
              "Panda'da Fire motor basit ve dayanıklıdır; ancak elektrikli direksiyon arızası, yağ kaçakları, arka aks/alt takım ve yaşa bağlı pas kontrol edilmelidir.",
            typicalOnset: "Yaş ve kilometreye bağlı",
            costLevel: "Orta",
            sourceNote:
              "Fiat Panda alım rehberleri ve kullanıcı forumlarında EPS/pas/alt takım kontrolleri tekrar eder.",
          },
        ],
      },
      {
        engineLabel: "0.9 TwinAir",
        fuelType: "Benzin",
        transmission: "Manuel",
        yearFrom: 2012,
        yearTo: 2020,
        issues: [
          {
            id: "panda-twinair-oil-turbo",
            severity: "medium",
            title: "TwinAir yağ bakımı, turbo ve tekleme kontrolü",
            detail:
              "TwinAir motorlarda doğru yağ ve bakım aralığı kritik; tekleme, turbo sesi ve modül davranışı alımda kontrol edilmeli.",
            typicalOnset: "90.000 km sonrası",
            costLevel: "Orta",
            sourceNote:
              "TwinAir motor ailesi servis kaynakları ve Panda/500 kullanıcı forumlarında tekrar eden bakım hassasiyeti.",
          },
        ],
      },
      {
        engineLabel: "1.3 Multijet",
        fuelType: "Dizel",
        transmission: "Manuel",
        yearFrom: 2003,
        yearTo: 2018,
        issues: [
          {
            id: "panda-13mjet-egr-turbo",
            severity: "medium",
            title: "EGR, turbo hortumu ve enjektör kontrolü",
            detail:
              "1.3 Multijet Panda'da EGR kurumlanması, enjektör dumanı, turbo hortumu ve kısa mesafe kullanım kaynaklı dizel yan sistem sorunları kontrol edilmelidir.",
            typicalOnset: "100.000 km sonrası",
            costLevel: "Orta",
            sourceNote: "1.3 Multijet motor ailesi kullanıcı forumları ve bağımsız servis kayıtları.",
          },
        ],
      },
    ],
  },
  {
    brand: "Fiat",
    model: "Tipo",
    yearFrom: 2015,
    yearTo: 2026,
    generalNote:
      "Tipo adı birçok pazarda Egea ile aynı temel platform/motor ailesini ifade eder; Türkiye ikinci elinde Egea ile aynı motor riskleri uygulanır.",
    engines: [
      {
        engineLabel: "1.4 Fire",
        fuelType: "Benzin",
        transmission: "Manuel",
        yearFrom: 2015,
        yearTo: 2026,
        issues: [
          {
            id: "tipo-14fire-oil-coil",
            severity: "medium",
            title: "Yağ kaçakları, bobin ve LPG montaj kontrolü",
            detail:
              "1.4 Fire Tipo/Egea'da yağ sızıntısı, bobin/buji teklemesi, LPG varsa ayar ve subap sesi kontrol edilmelidir.",
            typicalOnset: "80.000 km sonrası",
            costLevel: "Orta",
            sourceNote: "Fiat Fire motor ailesi ve Egea/Tipo kullanıcı kayıtlarında tekrar eden bulgular.",
          },
        ],
      },
      {
        engineLabel: "1.6 E-torQ AT6",
        fuelType: "Benzin",
        transmission: "Otomatik",
        yearFrom: 2015,
        yearTo: 2020,
        issues: [
          {
            id: "tipo-16etorq-at6-thermostat",
            severity: "medium",
            title: "Termostat, yağ sızıntısı ve AT6 bakım geçmişi",
            detail:
              "1.6 E-torQ otomatikte termostat/soğutma sistemi, yağ kaçakları ve otomatik şanzıman yağ bakım geçmişi kontrol edilmelidir.",
            typicalOnset: "70.000-120.000 km",
            costLevel: "Orta",
            sourceNote: "Egea/Tipo 1.6 E-torQ kullanıcı forumları ve teknik servis kayıtlarında tekrar eden bulgu.",
          },
        ],
      },
      {
        engineLabel: "1.3 Multijet",
        fuelType: "Dizel",
        transmission: "Manuel",
        yearFrom: 2015,
        yearTo: 2020,
        issues: [
          {
            id: "tipo-13mjet-egr-injector",
            severity: "medium",
            title: "EGR/enjektör ve turbo hortumu kontrolü",
            detail: "1.3 Multijet Tipo'da EGR, enjektör duman/tekleme, turbo hortumu ve zincir sesi kontrol edilmeli.",
            typicalOnset: "100.000 km sonrası",
            costLevel: "Orta",
            sourceNote: "Fiat 1.3 Multijet motor ailesi ve Tipo/Egea kullanıcı kayıtları.",
          },
        ],
      },
      {
        engineLabel: "1.6 Multijet",
        fuelType: "Dizel",
        transmission: "Manuel",
        yearFrom: 2015,
        yearTo: 2026,
        issues: [
          {
            id: "tipo-16mjet-dpf-dmf",
            severity: "medium",
            title: "DPF/EGR, enjektör ve çift kütleli volan kontrolü",
            detail:
              "1.6 Multijet Tipo/Egea'da DPF/EGR kurumlanması, enjektör arızası, turbo aktüatör ve debriyaj/volan aşınması kontrol edilmeli.",
            typicalOnset: "100.000 km sonrası",
            costLevel: "Yüksek",
            sourceNote: "Fiat 1.6 Multijet ailesi ve Egea/Tipo kullanıcı kayıtlarında tekrar eden bulgular.",
          },
        ],
      },
      {
        engineLabel: "1.0 FireFly Turbo",
        fuelType: "Benzin",
        transmission: "Manuel",
        yearFrom: 2020,
        yearTo: 2026,
        issues: [
          {
            id: "tipo-10firefly-turbo",
            severity: "medium",
            title: "Turbo/yağ bakımı ve bobin-sensör kontrolü",
            detail:
              "1.0 FireFly Turbo'da turbo sesi, yağ bakımı, bobin/buji teklemesi ve soğutma sistemi kontrol edilmelidir.",
            typicalOnset: "100.000 km sonrası",
            costLevel: "Orta",
            sourceNote: "FireFly turbo motor ailesi ve Egea/Tipo kullanıcı deneyimleri.",
          },
        ],
      },
    ],
  },
];
