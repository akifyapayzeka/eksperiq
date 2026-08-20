import type { ModelEntry } from "../types";

// Kaynak: Renault/Megane sahip forumları (renaultforums.co.uk,
// meganeownersclub.co.uk), bağımsız motor inceleme siteleri
// (motorreviewer.com, carchecker.pro, autoricambitritella.it,
// enginescope.gr, automotive24.center) ve şanzıman/servis uzmanlığı
// kaynakları genelinde tekrar eden bulgular. NOT: aynı marka/model için
// tek kayıt tutulur (nesiller arası ayrım motor bazında yearFrom/yearTo
// ile yapılır) — eşleştirme mantığı brand+model başına tek kayıt bulur.
export const RENAULT_ENTRIES: ModelEntry[] = [
  {
    brand: "Renault",
    model: "Clio",
    generation: "III (2005-2012) ve IV (2012-2019)",
    yearFrom: 2005,
    yearTo: 2019,
    generalNote:
      "Motor dışı ama yaygın olarak raporlanan konular: arka jant rulmanı 80.000-150.000 km arası aşınabiliyor; ön şasi özellikle tuzlu/nemli iklimlerde korozyona uğrayabiliyor; UPC (gövde elektronik ünitesi) su kaçağı ve elektrik arızaları raporlanıyor. EDC (çift kavramalı otomatik, Clio IV) şanzımanlı versiyonlarda düşük hızda sarsıntı/tereddüt bildiriliyor.",
    engines: [
      {
        engineLabel: "1.5 dCi",
        fuelType: "Dizel",
        transmission: "Manuel",
        reliabilityNote:
          "K9K, Avrupa'nın en çok üretilen dizel motorlarından biri; blok kendisi 200.000 km üzerini görebiliyor, ancak destekleyici sistemler (enjektör, EGR, turbo) zayıf nokta olarak öne çıkıyor.",
        issues: [
          {
            id: "clio-15dci-enjektor",
            severity: "high",
            title: "Common rail enjektör arızası",
            detail:
              "Enjektörler düşük kilometrede bile sorun çıkarabiliyor; tekleme, rölanti bozukluğu, siyah duman, çalışma güçlüğü ve metalik vuruntu şeklinde belirti veriyor.",
            typicalOnset: "100.000 km sonrası artan sıklıkta",
            costLevel: "Yüksek",
            sourceNote:
              "Birden fazla bağımsız teknik kaynakta K9K enjektörlerinin tasarımsal zayıf nokta olduğu tekrar ediyor.",
          },
          {
            id: "clio-15dci-turbo-egr",
            severity: "medium",
            title: "Turbo ve EGR/DPF tıkanması",
            detail:
              "Turbo kanat mekanizması ve EGR valfi tıkanması/yapışması yaygın arıza noktaları arasında; kısa mesafe kullanımda DPF de tıkanabiliyor.",
            costLevel: "Orta",
            sourceNote: "Bağımsız motor inceleme kaynakları ve K9K teknik incelemeleri.",
          },
          {
            id: "clio-15dci-dmf",
            severity: "medium",
            title: "Çift kütleli volan (DMF) / debriyaj aşınması",
            detail:
              "Manuel şanzımanlı dCi modellerde çift kütleli volan iç yayları zamanla zayıflar; debriyaj basarken sarsıntı, rölantide takırtı ve hızlanmada titreşim görülür.",
            typicalOnset: "100.000-150.000 km",
            costLevel: "Yüksek",
            sourceNote: "Renault/Megane sahip forumları, K9K dCi raporlarıyla tutarlı.",
          },
        ],
      },
      {
        engineLabel: "1.2 16V",
        fuelType: "Benzin",
        transmission: "Manuel",
        reliabilityNote:
          "Doğal emişli, görece basit yapılı bir motor; triger kayışı zamanında değiştirildiğinde 200.000 km üzerini rahatlıkla görebiliyor. Bu motora özgü belgelenmiş bir kronik mekanik arıza kalıbı bulunamadı.",
        issues: [],
      },
      {
        engineLabel: "1.6 16V",
        fuelType: "Benzin",
        transmission: "Manuel",
        yearFrom: 2005,
        yearTo: 2012,
        reliabilityNote: "K4M ailesi Renault/Dacia genelinde kanıtlanmış bir motor; 250.000 km üzerini görebiliyor.",
        issues: [
          {
            id: "clio-16-16v-bobin",
            severity: "medium",
            title: "Ateşleme bobini arızası",
            detail:
              "Tekleme, sarsıntılı çalışma, güç kaybı ve yanıp sönen arıza lambası ile kendini gösterir; yakıt tüketimini artırır.",
            typicalOnset: "80.000-140.000 km",
            costLevel: "Düşük",
            sourceNote: "Motor inceleme kaynakları (aynı K4M ailesi için genel bulgular).",
          },
          {
            id: "clio-16-16v-vvt",
            severity: "medium",
            title: "Değişken supap zamanlaması (VVT) kasnağı arızası",
            detail:
              "Soğuk çalıştırmada takırtı sesi ve kalıcı arıza lambası ile ortaya çıkar; yağ bakımı ihmal edildiğinde daha erken görülür.",
            typicalOnset: "~100.000 km sonrası",
            costLevel: "Orta",
            sourceNote: "K4M motor ailesi için tekrarlanan teknik kaynaklar.",
          },
        ],
      },
      {
        engineLabel: "0.9 TCe",
        fuelType: "Benzin",
        transmission: "Manuel",
        yearFrom: 2012,
        yearTo: 2019,
        issues: [
          {
            id: "clio4-09tce-triger",
            severity: "high",
            title: "Triger zinciri ve gergi arızası",
            detail:
              "Zincir gerginliğini kaybediyor, gergi mekanizması erken aşınabiliyor; sabah soğuk çalıştırmada belirgin zincir sesi tipik erken belirti.",
            typicalOnset: "~100.000 km civarı, bakım geçmişine bağlı olarak daha erken de olabilir",
            costLevel: "Yüksek",
            sourceNote: "Renault servis paylaşımları ve bağımsız motor incelemeleri.",
          },
        ],
      },
      {
        engineLabel: "1.2 TCe",
        fuelType: "Benzin",
        transmission: "Manuel",
        yearFrom: 2013,
        yearTo: 2019,
        reliabilityNote:
          "Birden fazla bağımsız kaynakta belgelenmiş kalıcı tasarım sorunları olan, ikinci elde dikkatli değerlendirilmesi gereken bir motor ailesi.",
        issues: [
          {
            id: "clio4-12tce-yag",
            severity: "high",
            title: "Aşırı yağ tüketimi",
            detail:
              "Piston/segman/silindir toleranslarının geniş olması nedeniyle yağ yanma odasına geçiyor; 1000 km'de 1 litreyi aşan tüketim vakaları raporlanmış.",
            costLevel: "Yüksek",
            sourceNote: "Bağımsız motor inceleme kaynakları (H5Ft motor incelemeleri).",
          },
          {
            id: "clio4-12tce-triger",
            severity: "high",
            title: "Triger zinciri erken gerginlik kaybı",
            detail:
              "Ömür boyu tasarlanmış olmasına rağmen zincir erken uzayabiliyor; zinciri yağlayan yağ memesinin kurumla tıkanması sorunu ağırlaştırıyor.",
            typicalOnset: "80.000-120.000 km",
            costLevel: "Yüksek",
            sourceNote: "Bağımsız motor inceleme kaynakları ve forum tartışmaları.",
          },
          {
            id: "clio4-12tce-supap-turbo",
            severity: "high",
            title: "Supap hasarı ve turbo yağ açlığı",
            detail:
              "Yanma odasında yanan yağ egzoz sıcaklığını artırarak supaplarda çarpılma/yanmaya yol açabiliyor; tıkanan yağ hatları turbo yataklarında yağ açlığına neden olabiliyor.",
            typicalOnset: "~100.000 km sonrası",
            costLevel: "Yüksek",
            sourceNote: "Bağımsız motor güvenilirlik değerlendirmeleri.",
          },
        ],
      },
    ],
  },
  {
    brand: "Renault",
    model: "Megane",
    generation: "III (2008-2016) ve IV (2016-2020)",
    yearFrom: 2008,
    yearTo: 2020,
    generalNote:
      "Genel olarak Alman/Japon rakiplerine göre karışık bir güvenilirlik ünü var. Kaporta/pas (eşik ve çamurluk kemeri), UCH elektronik ünitesi kaynaklı elektrik arızaları ve panoramik cam tavanlı versiyonlarda su sızıntısı sıkça bildiriliyor.",
    engines: [
      {
        engineLabel: "1.5 dCi",
        fuelType: "Dizel",
        transmission: "Manuel",
        issues: [
          {
            id: "megane-15dci-enjektor",
            severity: "high",
            title: "Common rail enjektör arızası",
            detail:
              "K9K'nın en çok bilinen zayıf noktası; tekleme, güç kaybı, siyah duman ve zor çalışma ile kendini gösterir.",
            typicalOnset: "100.000 km sonrası",
            costLevel: "Yüksek",
            sourceNote: "Bağımsız güvenilirlik raporları Megane 1.5 dCi'nin zayıf noktası olarak açıkça belirtiyor.",
          },
          {
            id: "megane-15dci-egr-dpf",
            severity: "medium",
            title: "Turbo ve EGR/DPF tıkanması",
            detail:
              "Turbo kanat mekanizması ve EGR valfi tıkanması güç kaybı ve arıza lambasına yol açabiliyor; kısa mesafe kullanımda DPF de tıkanabiliyor.",
            costLevel: "Orta",
            sourceNote: "Genel K9K teknik incelemeleri.",
          },
          {
            id: "megane-15dci-dmf",
            severity: "medium",
            title: "Çift kütleli volan (DMF) / debriyaj aşınması",
            detail: "Manuel şanzımanda debriyaj basarken sarsıntı ve rölantide takırtı.",
            typicalOnset: "100.000-150.000 km",
            costLevel: "Yüksek",
            sourceNote: "Sahip forumları tartışmaları.",
          },
        ],
      },
      {
        engineLabel: "1.9 dCi",
        fuelType: "Dizel",
        transmission: "Manuel",
        yearFrom: 2008,
        yearTo: 2016,
        issues: [
          {
            id: "megane3-19dci-pompa",
            severity: "high",
            title: "Yüksek basınç pompası arızası",
            detail:
              "Pompa iç yapısı dağılabiliyor; ortaya çıkan metal parçacıklar tüm yakıt sistemine (enjektörler dahil) yayılıp ciddi hasara yol açabiliyor.",
            costLevel: "Yüksek",
            sourceNote: "Sahip forumları tartışmaları (1.9 dCi yüksek basınç pompası arızaları).",
          },
          {
            id: "megane3-19dci-enjektor",
            severity: "medium",
            title: "Enjektör tıkanması / kontaminasyon",
            detail: "Enjeksiyon arıza kodlarını tetikleyebiliyor; metal kalıntı kontaminasyonu ile ilişkilendiriliyor.",
            costLevel: "Orta",
            sourceNote: "Kullanıcı soru-cevap platformları ve sahip forumları.",
          },
        ],
      },
      {
        engineLabel: "1.6 16V",
        fuelType: "Benzin",
        transmission: "Manuel",
        yearFrom: 2008,
        yearTo: 2016,
        reliabilityNote:
          "Genel olarak sağlam kabul edilen, 250.000 km üzerini görebilen bir motor; triger kayışı zamanında değiştirilmeli.",
        issues: [
          {
            id: "megane3-16-16v-bobin",
            severity: "medium",
            title: "Ateşleme bobini arızası",
            detail: "Tekleme, sarsıntılı çalışma, yanıp sönen arıza lambası ve artan yakıt tüketimi.",
            typicalOnset: "80.000-140.000 km",
            costLevel: "Düşük",
            sourceNote: "Bağımsız motor inceleme kaynakları.",
          },
          {
            id: "megane3-16-16v-vvt",
            severity: "medium",
            title: "VVT kasnağı arızası",
            detail: "Soğuk çalıştırmada takırtı sesi ve kalıcı arıza lambası.",
            typicalOnset: "~100.000 km sonrası",
            costLevel: "Orta",
            sourceNote: "K4M motor ailesi için tekrarlanan bulgu.",
          },
        ],
      },
      {
        engineLabel: "2.0 16V",
        fuelType: "Benzin",
        transmission: "Manuel",
        yearFrom: 2008,
        yearTo: 2016,
        reliabilityNote:
          "Doğal emişli, düzgün çalışan, triger kayışlı (zincirli değil) bir motor; belgelenmiş kronik mekanik arıza bulunamadı.",
        issues: [],
      },
      {
        engineLabel: "1.4 TCe",
        fuelType: "Benzin",
        transmission: "Manuel",
        yearFrom: 2008,
        yearTo: 2016,
        issues: [
          {
            id: "megane3-14tce-conta",
            severity: "high",
            title: "Silindir kapağı contası (head gasket) arızası",
            detail:
              "3. silindirde aşırı ısınma, soğutma sıvısı kaybı ve egzoz gazının soğutma sistemine karışması ile kendini gösterir.",
            costLevel: "Yüksek",
            sourceNote: "Bağımsız güvenilirlik raporları ve sahip forumları.",
          },
          {
            id: "megane3-14tce-turbo",
            severity: "medium",
            title: "Turbo arızası",
            detail:
              "Yetersiz yağlama veya arızalı wastegate nedeniyle turbo aşırı basınca maruz kalıp erken yıpranabiliyor.",
            costLevel: "Orta",
            sourceNote: "Bağımsız motor inceleme kaynakları.",
          },
          {
            id: "megane3-14tce-yag",
            severity: "medium",
            title: "Artan yağ tüketimi",
            detail: "Yaklaşık 100.000 km sonrası belirgin şekilde artan yağ tüketimi bildiriliyor.",
            typicalOnset: "~100.000 km",
            costLevel: "Orta",
            sourceNote: "Bağımsız motor inceleme kaynakları.",
          },
        ],
      },
      {
        engineLabel: "1.2 TCe",
        fuelType: "Benzin",
        transmission: "Manuel",
        yearFrom: 2014,
        yearTo: 2020,
        reliabilityNote:
          "Birden fazla bağımsız kaynakta güvenilirlik puanı düşük olarak raporlanıyor; tasarım kusurlarının geri döndürülemez olduğu belirtiliyor.",
        issues: [
          {
            id: "megane-12tce-yag",
            severity: "high",
            title: "Aşırı yağ tüketimi",
            detail: "Piston/segman toleranslarının geniş olması yağın yanma odasına geçmesine yol açıyor.",
            costLevel: "Yüksek",
            sourceNote: "Bağımsız motor inceleme kaynakları, tutarlı biçimde tekrarlanan bulgu.",
          },
          {
            id: "megane-12tce-triger-supap",
            severity: "high",
            title: "Triger zinciri ve supap hasarı",
            detail:
              "Zincir erken gerginlik kaybedebiliyor; yağ yanmasının yol açtığı yüksek egzoz sıcaklıkları supaplarda çarpılma/yanmaya neden olabiliyor.",
            typicalOnset: "80.000-120.000 km",
            costLevel: "Yüksek",
            sourceNote: "Bağımsız motor inceleme kaynakları.",
          },
          {
            id: "megane4-12tce-turbo",
            severity: "medium",
            title: "Turbo yağ açlığı",
            detail: "Tıkanan yağ hatları turbo yataklarında yağ açlığına ve erken turbo arızasına yol açabiliyor.",
            typicalOnset: "~100.000 km sonrası",
            costLevel: "Yüksek",
            sourceNote: "Bağımsız motor inceleme kaynakları.",
          },
        ],
      },
      {
        engineLabel: "1.3 TCe",
        fuelType: "Benzin",
        transmission: "Manuel",
        yearFrom: 2018,
        yearTo: 2020,
        reliabilityNote:
          "1.2 TCe'ye kıyasla belirgin şekilde daha güvenilir bulunmuş; 150.000 km üzerini büyük sorun yaşamadan gören örnekler bildiriliyor.",
        issues: [
          {
            id: "megane4-13tce-karbon",
            severity: "low",
            title: "Emme supaplarında karbon birikimi",
            detail:
              "Direkt enjeksiyonlu motorlarda tipik olan bir durum; hafif rölanti bozukluğu, hafif güç kaybı ve artan yakıt tüketimi olarak kendini gösterir.",
            typicalOnset: "80.000-120.000 km",
            costLevel: "Orta",
            sourceNote: "Bağımsız motor inceleme kaynakları.",
          },
          {
            id: "megane4-13tce-edc",
            severity: "medium",
            title: "7 ileri EDC şanzımanda sarsıntılı vites geçişi",
            detail:
              "Özellikle facelift öncesi modellerde 1-2 vites geçişinde sertlik ve düşük hızda sarsıntı bildiriliyor.",
            costLevel: "Orta",
            sourceNote: "Kullanılmış araç rehberi kaynakları.",
          },
        ],
      },
      {
        engineLabel: "1.6 dCi",
        fuelType: "Dizel",
        transmission: "Manuel",
        yearFrom: 2016,
        yearTo: 2020,
        issues: [
          {
            id: "megane4-16dci-egr",
            severity: "medium",
            title: "EGR valfi tıkanması",
            detail:
              "Kısa mesafe/şehir içi kullanımda sık tıkanan bir arıza noktası; emisyon sistemi uyarısını tetikleyebiliyor.",
            costLevel: "Orta",
            sourceNote: "Kullanıcı soru-cevap platformları.",
          },
          {
            id: "megane4-16dci-dpf",
            severity: "medium",
            title: "DPF basınç sensörü / tıkanma arızası",
            detail: "DPF basınç sensörü hatası ile orta devirde ani güç kesilmesi vakaları raporlanmış.",
            costLevel: "Orta",
            sourceNote: "Forum tartışmaları (Renault/Nissan R9M DPF basınç sorunu).",
          },
        ],
      },
    ],
  },
  {
    brand: "Renault",
    model: "Fluence",
    yearFrom: 2010,
    yearTo: 2016,
    generalNote:
      "Elektrik sistemleri (UCH kaynaklı arıza lambaları) ve elektrikli direksiyon (EPS) pompası/motoru arızaları model genelinde bildiriliyor; EPS arızası düşük hızda sert/tepkisiz direksiyon olarak ortaya çıkıyor.",
    engines: [
      {
        engineLabel: "1.5 dCi",
        fuelType: "Dizel",
        transmission: "Manuel",
        reliabilityNote:
          "Kanıtlanmış ve ekonomik bir motor olarak tanımlanıyor, ancak enjektörler yakıt kalitesine duyarlı; 2011 öncesi modellerde kurum birikimi eğilimi bildiriliyor.",
        issues: [
          {
            id: "fluence-15dci-enjektor",
            severity: "medium",
            title: "Enjektör arızası / yakıt kalitesine duyarlılık",
            detail:
              "Düşük kaliteli yakıtla kurum birikimi ve enjektör tıkanması; tekleme ve güç kaybına yol açabiliyor.",
            costLevel: "Yüksek",
            sourceNote: "Bağımsız motor arıza rehberi kaynakları.",
          },
          {
            id: "fluence-15dci-dmf",
            severity: "medium",
            title: "Çift kütleli volan (DMF) / debriyaj aşınması",
            detail: "Manuel şanzımanda debriyaj basarken sarsıntı ve rölantide takırtı.",
            typicalOnset: "100.000-150.000 km",
            costLevel: "Yüksek",
            sourceNote: "Sahip forumları (aynı K9K ailesi için genel bulgular).",
          },
        ],
      },
      {
        engineLabel: "1.6 16V",
        fuelType: "Benzin",
        transmission: "Manuel",
        issues: [
          {
            id: "fluence-16-16v-bobin",
            severity: "medium",
            title: "Ateşleme bobini arızası",
            detail: "Tekleme, sarsıntılı çalışma ve arıza lambası ile kendini gösterir.",
            typicalOnset: "80.000-140.000 km",
            costLevel: "Düşük",
            sourceNote: "Bağımsız motor inceleme kaynakları (Clio III/Megane III ile paylaşılan aynı motor ailesi).",
          },
        ],
      },
      {
        engineLabel: "1.6 dCi",
        fuelType: "Dizel",
        transmission: "Manuel",
        yearFrom: 2013,
        yearTo: 2016,
        reliabilityNote: "Genel olarak sorunsuz kabul edilen bir motor; ciddi bir kronik arıza kalıbı bulunamadı.",
        issues: [
          {
            id: "fluence-16dci-yakit-sensor",
            severity: "low",
            title: "Yakıt seviye sensörü arızası",
            detail: "Hatalı/dalgalı yakıt göstergesi, aniden boşa düşme veya belirli seviyede takılı kalma.",
            typicalOnset: "120.000-200.000 km",
            costLevel: "Düşük",
            sourceNote: "Bağımsız motor arıza rehberi kaynakları.",
          },
        ],
      },
    ],
  },
];
