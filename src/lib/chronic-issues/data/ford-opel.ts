import type { ModelEntry } from "../types";

// Kaynak: Ford/Vauxhall-Opel sahip forumları (TalkFord, FordOwnersClub,
// FocusFanatics, AstraOwnersNetwork, AstraKForums), motor tamir/inceleme
// siteleri (Autodoc, Gaga.ba) ve Ford'un resmi geri çağırma kayıtları
// (1.0 EcoBoost soğutma sıvısı kaybı) genelinde tekrar eden bulgular.
export const FORD_OPEL_ENTRIES: ModelEntry[] = [
  {
    brand: "Ford",
    model: "Focus",
    generation: "Mk3 (2011-2018) ve Mk4 (2018-2020)",
    yearFrom: 2011,
    yearTo: 2020,
    generalNote:
      "Powershift (kuru çift kavramalı) otomatik şanzıman, Mk3 döneminde 1.6 ve 2.0 TDCi ile bazı benzinli varyantlarda opsiyonel sunulmuştur; ABD'de toplu dava ve soruşturmalara konu olacak kadar yaygın şikayet almıştır. Bu kutuyla eşleşen herhangi bir motoru alırken şanzıman geçmişi ayrıca sorgulanmalıdır.",
    engines: [
      {
        engineLabel: "1.6 TDCi",
        fuelType: "Dizel",
        transmission: "Manuel",
        yearFrom: 2011,
        yearTo: 2018,
        reliabilityNote: "Duratorq DV6 ailesi; Fiesta ile aynı motor platformunu paylaşır.",
        issues: [
          {
            id: "focus-16tdci-injector",
            severity: "medium",
            title: "Enjektör tıkanması ve sızdırmazlık sorunu",
            detail:
              "Enjektör contalarında ve gövdesinde zamanla sızıntı/karbon birikimi oluşabiliyor; sonucunda çalışma sesinde dizel vuruntusu, duman ve rölantide dengesizlik görülüyor.",
            typicalOnset: "80.000-150.000 km",
            costLevel: "Orta",
            sourceNote:
              "Birden fazla bağımsız Ford forumu (TalkFord, FordOwnersClub, FocusFanatics) ve motor tamir bloglarında tekrar eden şikayet.",
          },
          {
            id: "focus-16tdci-dmf",
            severity: "medium",
            title: "Çift kütleli volan (DMF) aşınması",
            detail:
              "Aynı motor ailesi Fiesta'da düşük kilometrede DMF arızası ile belgelenmiştir; Focus'ta da vites değişiminde titreşim/tıkırtı şikayetleri bildiriliyor.",
            typicalOnset: "100.000-160.000 km",
            costLevel: "Orta",
            sourceNote:
              "Aynı motor ailesini paylaşan Fiesta forum verilerinden çıkarım; Focus'a özgü doğrudan kaynak sayısı sınırlı.",
          },
        ],
      },
      {
        engineLabel: "2.0 TDCi",
        fuelType: "Dizel",
        transmission: "Otomatik",
        yearFrom: 2011,
        yearTo: 2018,
        issues: [
          {
            id: "focus-20tdci-powershift",
            severity: "high",
            title: "Powershift kuru çift kavramalı şanzıman arızaları",
            detail:
              "Kalkışta sarsılma/titreme, 1-2. vites geçişinde sertlik, gecikmeli vites değişimi bildiriliyor. Kavrama paketine yağ/sızıntı bulaşması kaymaya neden olabiliyor; TCM (şanzıman kontrol ünitesi) arızaları da yaygın.",
            typicalOnset: "40.000-100.000 km arası belirti başlangıcı",
            costLevel: "Yüksek",
            sourceNote:
              "ABD'de toplu dava ve resmi soruşturmalara konu olmuş, çok sayıda bağımsız forum ve teknik servis kaynağında tekrarlanan, iyi belgelenmiş bir sorun.",
          },
        ],
      },
      {
        engineLabel: "1.0 EcoBoost",
        fuelType: "Benzin",
        transmission: "Manuel",
        yearFrom: 2011,
        yearTo: 2020,
        reliabilityNote: "Küçük hacimli turbo motor; soğutma sistemi toleransı düşük, bakım geçmişi kritik önemde.",
        issues: [
          {
            id: "focus-10ecoboost-wetbelt",
            severity: "high",
            title: "Yağ içinde çalışan (ıslak) zamanlama kayışının aşınması",
            detail:
              "Kayış motor yağı içinde çalıştığından yanlış yağ spesifikasyonu veya geciken yağ değişimlerinde erken aşınıp parçalanabiliyor; bu durum yağ süzgecinin tıkanmasına ve ciddi motor hasarına yol açabiliyor.",
            typicalOnset: "60.000-100.000 km, bakım ihmalinde daha erken",
            costLevel: "Yüksek",
            sourceNote:
              "Çok sayıda bağımsız motor tamir/inceleme sitesinde tutarlı biçimde tekrarlanan, yaygın kabul görmüş sorun.",
          },
          {
            id: "focus-10ecoboost-coolant",
            severity: "high",
            title: "Soğutma sıvısı kaybı ve aşırı ısınma riski",
            detail:
              "Plastik degas hortumu, genleşme tankı ve termostat gövdesi O-ringi zamanla çatlayıp sızdırabiliyor; hızlı soğutucu kaybı motoru hızla ısıtıp silindir kapağı hasarına kadar gidebiliyor. Ekim 2011-Ekim 2013 arası üretilen araçlarda resmi geri çağırma uygulanmıştır.",
            costLevel: "Yüksek",
            sourceNote:
              "Ford'un resmi geri çağırma kaydı ve çok sayıda bağımsız motor tamir/servis kaynağında tutarlı biçimde belgelenmiş.",
          },
        ],
      },
      {
        engineLabel: "1.5 EcoBlue",
        fuelType: "Dizel",
        transmission: "Manuel",
        yearFrom: 2018,
        yearTo: 2020,
        issues: [
          {
            id: "focus-15ecoblue-dilution",
            severity: "medium",
            title: "Yağ seyrelmesi (dizel yakıtın motor yağına karışması)",
            detail:
              "DPF rejenerasyon döngüleri sırasında az miktarda yakıt yağ karterine karışabiliyor; uzun vadede yağ seviyesinin yükselmesi ve yağlama kalitesinin düşmesi riski var. Kısa mesafe/şehir içi kullanımda daha belirgin.",
            typicalOnset: "Servis aralıklarında yağ seviyesi takibiyle fark edilir, genellikle 20.000-40.000 km",
            costLevel: "Orta",
            sourceNote:
              "Ford sahip forumları ve bağımsız motor/servis inceleme siteleri genelinde tekrar eden, EcoBlue ailesinde yaygın bilinen bir konu.",
          },
        ],
      },
    ],
  },
  {
    brand: "Ford",
    model: "Fiesta",
    generation: "Mk6 (2008-2012) ve Mk7 (2012-2017)",
    yearFrom: 2008,
    yearTo: 2017,
    engines: [
      {
        engineLabel: "1.4 TDCi",
        fuelType: "Dizel",
        transmission: "Manuel",
        yearFrom: 2008,
        yearTo: 2017,
        reliabilityNote: "Duratorq DV/TDCi ailesi; Focus ile aynı motor platformunu paylaşır.",
        issues: [
          {
            id: "fiesta-14tdci-dmf",
            severity: "high",
            title: "Çift kütleli volan (DMF) erken arızası",
            detail:
              "Nispeten düşük kilometrede DMF sertleşmesi/aşınması bildiriliyor; titreşim, tıkırtı ve vites geçişinde sarsıntı ile ortaya çıkıyor.",
            typicalOnset: "60.000-100.000 km gibi erken kilometrelerde bile görülebiliyor",
            costLevel: "Orta",
            sourceNote: "Ford sahip forumlarında tekrarlanan, iyi belgelenmiş şikayet.",
          },
          {
            id: "fiesta-14tdci-turbo-oil",
            severity: "medium",
            title: "Enjektör keçesi bozulmasına bağlı türbo yağ açlığı",
            detail:
              "Enjektör keçelerindeki bozulma yağ kaçağına ve türbine giden yağlamanın azalmasına yol açarak türbo aşınmasını hızlandırabiliyor.",
            typicalOnset: "100.000 km sonrası",
            costLevel: "Orta",
            sourceNote: "Ford sahip forumlarında tekrar eden teknik gözlem.",
          },
        ],
      },
      {
        engineLabel: "1.0 EcoBoost",
        fuelType: "Benzin",
        transmission: "Manuel",
        yearFrom: 2012,
        yearTo: 2017,
        issues: [
          {
            id: "fiesta-10ecoboost-wetbelt",
            severity: "high",
            title: "Yağ içinde çalışan (ıslak) zamanlama kayışının aşınması",
            detail:
              "Focus ile aynı motor ailesi; yanlış yağ kullanımı veya geciken yağ değişiminde kayış erken aşınıp ciddi motor hasarına yol açabiliyor.",
            typicalOnset: "60.000-100.000 km, bakım ihmalinde daha erken",
            costLevel: "Yüksek",
            sourceNote:
              "Aynı 1.0 EcoBoost motor ailesi için çok sayıda bağımsız kaynakta tekrarlanan, yaygın kabul görmüş sorun.",
          },
          {
            id: "fiesta-10ecoboost-coolant",
            severity: "high",
            title: "Soğutma sıvısı kaybı ve aşırı ısınma riski",
            detail:
              "Degas hortumu ve genleşme tankındaki çatlaklar hızlı soğutucu kaybına yol açabiliyor. Ekim 2011-Ekim 2013 üretim aralığı için resmi geri çağırma uygulanmıştır.",
            costLevel: "Yüksek",
            sourceNote:
              "Ford resmi geri çağırma kaydı ve bağımsız motor tamir kaynaklarında tutarlı biçimde belgelenmiş.",
          },
        ],
      },
    ],
  },
  {
    brand: "Opel",
    model: "Corsa",
    generation: "D (2006-2014) ve E (2014-2019)",
    yearFrom: 2006,
    yearTo: 2019,
    engines: [
      {
        engineLabel: "1.3 CDTI",
        fuelType: "Dizel",
        transmission: "Manuel",
        issues: [
          {
            id: "corsa-13cdti-timingchain",
            severity: "medium",
            title: "Zamanlama zinciri gerdiricisinde aşınma",
            detail:
              "Hidrolik zincir gerdiricisi zamanla basınç kaybedip zincirin gevşemesine yol açabiliyor; soğuk çalıştırmada tıkırtı, dengesiz rölanti ve zor çalışma ile kendini gösteriyor.",
            typicalOnset: "100.000-150.000 km",
            costLevel: "Orta",
            sourceNote: "Birden fazla bağımsız kaynak genelinde tekrarlanan bulgu.",
          },
          {
            id: "corsa-13cdti-turbo",
            severity: "medium",
            title: "Türboda yağ açlığına bağlı aşınma",
            detail:
              "Yağ değişimi ihmal edilirse veya düşük kaliteli yağ kullanılırsa türboda ıslık sesi, güç kaybı, aşırı duman ve yağ sızıntısı görülebiliyor.",
            typicalOnset: "100.000 km sonrası, bakım ihmalinde daha erken",
            costLevel: "Orta",
            sourceNote: "Forum kaynaklarında tekrar eden bulgu.",
          },
        ],
      },
      {
        engineLabel: "1.0 Turbo / 1.4 Turbo",
        fuelType: "Benzin",
        transmission: "Manuel",
        yearFrom: 2014,
        yearTo: 2019,
        issues: [
          {
            id: "corsae-turbo-oilconsumption",
            severity: "medium",
            title: "Yüksek kilometrede artan yağ tüketimi",
            detail: "3 silindirli 1.0 turbo motorda 96.000 km üzerinde belirgin yağ tüketimi artışı bildiriliyor.",
            typicalOnset: "96.000 km sonrası",
            costLevel: "Orta",
            sourceNote: "Motor tamir kaynaklarında tekrarlanan bulgu.",
          },
          {
            id: "corsae-turbo-timingchain",
            severity: "medium",
            title: "Zamanlama zinciri üst kılavuz rayı aşınması",
            detail:
              "Yağ değişimi geciktirilir veya yanlış yağ kullanılırsa üst kılavuz rayı erken aşınıp soğuk çalıştırmada tıkırtıya yol açıyor; ihmal edilirse zincir kayması/kopması ve supap hasarı riski var.",
            typicalOnset: "Bakım kalitesine bağlı, genelde 80.000 km sonrası",
            costLevel: "Yüksek",
            sourceNote: "Otomotiv arıza veritabanları genelinde tekrarlanan bulgu.",
          },
        ],
      },
    ],
  },
  {
    brand: "Opel",
    model: "Astra",
    generation: "J (2009-2015) ve K (2015-2021)",
    yearFrom: 2009,
    yearTo: 2021,
    engines: [
      {
        engineLabel: "1.6 CDTI",
        fuelType: "Dizel",
        transmission: "Manuel",
        issues: [
          {
            id: "astra-16cdti-timingchain",
            severity: "high",
            title: "Zamanlama zinciri gerdiricisinde tasarım kaynaklı yağ kaçağı ve tıkırtı",
            detail:
              "Orijinal zincir gerdiricisinde conta bulunmuyor; motor kapatıldığında yağ boşalıyor ve yeniden çalıştırmada yağ basıncı oluşana kadar zincir tıkırdıyor. İhmal edilirse zincir kılavuzlarının plastik parçaları kırılıp yağ pompası emişini tıkayarak ciddi motor hasarına yol açabiliyor.",
            typicalOnset: "80.000-150.000 km arası, genelde 100.000 km civarı",
            costLevel: "Yüksek",
            sourceNote:
              "Çok sayıda bağımsız Vauxhall/Opel forumu ve bağımsız servis kaynağı genelinde tutarlı ve yaygın biçimde belgelenmiş, iyi bilinen bir sorun.",
          },
          {
            id: "astra-16cdti-dpf",
            severity: "medium",
            title: "Partikül filtresi (DPF) arızası",
            detail: "Özellikle şehir içi/kısa mesafe kullanımda partikül filtresi tıkanması yaygın görülüyor.",
            typicalOnset: "60.000-100.000 km",
            costLevel: "Orta",
            sourceNote: "Astra J diesel ailesi genelinde tekrarlanan bulgu.",
          },
        ],
      },
      {
        engineLabel: "1.4 Turbo",
        fuelType: "Benzin",
        transmission: "Manuel",
        issues: [
          {
            id: "astra-14turbo-turbo",
            severity: "medium",
            title: "Türbo aşınması ve wastegate arızası",
            detail:
              "100.000-150.000 km aralığında türbin çarkı aşınması, arızalı wastegate valfi ve yağ hattı sızıntıları görülüyor; belirtiler arasında zor çalıştırma, belirgin güç kaybı ve mavimsi egzoz dumanı var.",
            typicalOnset: "100.000-150.000 km",
            costLevel: "Yüksek",
            sourceNote: "Birden fazla bağımsız kaynakta tutarlı biçimde tekrarlanan bulgu.",
          },
          {
            id: "astra-14turbo-timingchain",
            severity: "medium",
            title: "Zamanlama zinciri aşınması",
            detail:
              "Soğuk çalıştırmada tıkırtı/vuruntu sesi ile kendini gösteriyor; Astra K'da bu belirtiler nispeten erken kilometrelerde de bildiriliyor.",
            typicalOnset: "60.000 km kadar erken başlayabiliyor",
            costLevel: "Orta",
            sourceNote: "Forum kaynaklarında tekrarlanan bulgu.",
          },
        ],
      },
    ],
  },
  {
    brand: "Ford",
    model: "B-Max",
    yearFrom: 2012,
    yearTo: 2018,
    engines: [
      {
        engineLabel: "1.0 EcoBoost",
        fuelType: "Benzin",
        transmission: "Manuel",
        yearFrom: 2012,
        yearTo: 2018,
        issues: [
          {
            id: "ford-bmax-10ecoboost-wetbelt",
            severity: "high",
            title: "1.0 EcoBoost ıslak triger kayışı ve soğutma sistemi riski",
            detail:
              "Yağ içinde çalışan kayışın parçalanması yağ süzgecini tıkayabilir; soğutma hortumu/genleşme kabı kaçakları hararet ve ağır motor hasarı riski yaratır.",
            typicalOnset: "100.000-160.000 km veya yaşa bağlı",
            costLevel: "Yüksek",
            sourceNote:
              "Ford 1.0 EcoBoost resmi geri çağırma/servis kayıtları ve bağımsız motor kaynaklarında tekrar eden iyi belgelenmiş risk.",
          },
        ],
      },
      {
        engineLabel: "1.5 / 1.6 TDCi",
        fuelType: "Dizel",
        transmission: "Manuel",
        yearFrom: 2012,
        yearTo: 2018,
        issues: [
          {
            id: "ford-bmax-tdci-egr-dpf",
            severity: "medium",
            title: "EGR/DPF, enjektör contası ve turbo hortumu kontrolü",
            detail:
              "TDCi B-Max'te kısa mesafe kullanım EGR/DPF doluluğunu, enjektör conta kaçaklarını ve turbo hortumu çatlaklarını öne çıkarır.",
            typicalOnset: "100.000 km sonrası",
            costLevel: "Orta",
            sourceNote:
              "Ford TDCi ailesi forumları ve bağımsız servis kayıtlarında tekrar eden dizel yan sistem bulguları.",
          },
        ],
      },
    ],
  },
  {
    brand: "Ford",
    model: "C-Max",
    yearFrom: 2003,
    yearTo: 2019,
    engines: [
      {
        engineLabel: "1.6 TDCi",
        fuelType: "Dizel",
        transmission: "Manuel",
        yearFrom: 2003,
        yearTo: 2015,
        issues: [
          {
            id: "ford-cmax-16tdci-turbo-injector",
            severity: "medium",
            title: "Turbo yağ beslemesi, enjektör contası ve DPF kontrolü",
            detail:
              "1.6 TDCi'de turbo yağ besleme hattı, enjektör conta kaçakları, EGR/DPF ve çift kütleli volan kontrol edilmeli.",
            typicalOnset: "120.000 km sonrası",
            costLevel: "Orta",
            sourceNote: "PSA/Ford 1.6 TDCi teknik kaynakları ve C-Max kullanıcı forumlarında tekrar eden bulgular.",
          },
        ],
      },
      {
        engineLabel: "1.0 EcoBoost",
        fuelType: "Benzin",
        transmission: "Manuel",
        yearFrom: 2012,
        yearTo: 2019,
        issues: [
          {
            id: "ford-cmax-10ecoboost-wetbelt-cooling",
            severity: "high",
            title: "Islak kayış ve soğutma kaçakları",
            detail:
              "1.0 EcoBoost C-Max'te ıslak kayış parçalanması, yağ basıncı sorunu ve soğutma sistemi kaçakları alımda özellikle sorgulanmalı.",
            typicalOnset: "100.000-160.000 km",
            costLevel: "Yüksek",
            sourceNote: "Ford 1.0 EcoBoost motor ailesi için çok sayıda bağımsız kaynakta tekrar eden risk.",
          },
        ],
      },
      {
        engineLabel: "PowerShift",
        fuelType: "Dizel",
        transmission: "Yarı otomatik",
        yearFrom: 2010,
        yearTo: 2019,
        issues: [
          {
            id: "ford-cmax-powershift",
            severity: "high",
            title: "PowerShift kavrama/mechatronic ve yağ bakım geçmişi",
            detail:
              "PowerShift şanzımanda kalkış titremesi, geçiş gecikmesi, kavrama ve mekatronik arızaları pahalı olabilir; yağ bakım faturası ve test sürüşü kritik.",
            typicalOnset: "80.000-140.000 km",
            costLevel: "Yüksek",
            sourceNote:
              "Ford PowerShift kullanıcı şikayetleri ve şanzıman servis kayıtlarında tekrar eden iyi bilinen risk.",
          },
        ],
      },
    ],
  },
  {
    brand: "Ford",
    model: "Courier",
    yearFrom: 2014,
    yearTo: 2026,
    generalNote:
      "Türkiye'de ticari kullanımı çok yaygındır; gerçek kullanım tipi, yük geçmişi ve bakım aralığı motor kadar belirleyicidir.",
    engines: [
      {
        engineLabel: "1.5 TDCi / EcoBlue",
        fuelType: "Dizel",
        transmission: "Manuel",
        yearFrom: 2014,
        yearTo: 2026,
        issues: [
          {
            id: "ford-courier-15tdci-ecoblue",
            severity: "medium",
            title: "EGR/DPF, enjektör ve turbo hortumu kontrolü",
            detail:
              "Courier dizellerde kısa mesafe ve ticari kullanım EGR/DPF, enjektör, turbo hortumu ve debriyaj/volan aşınmasını öne çıkarır.",
            typicalOnset: "100.000 km sonrası",
            costLevel: "Orta",
            sourceNote:
              "Ford Courier/TDCi kullanıcı kayıtları ve ticari araç servis kaynaklarında tekrar eden bulgular.",
          },
        ],
      },
      {
        engineLabel: "1.0 EcoBoost",
        fuelType: "Benzin",
        transmission: "Manuel",
        yearFrom: 2014,
        yearTo: 2026,
        issues: [
          {
            id: "ford-courier-10ecoboost-wetbelt",
            severity: "high",
            title: "1.0 EcoBoost ıslak kayış ve soğutma sistemi",
            detail:
              "Benzinli Courier'de 1.0 EcoBoost wet belt bakım geçmişi, yağ kalitesi ve soğutma sistemi kaçakları kontrol edilmelidir.",
            typicalOnset: "100.000-160.000 km",
            costLevel: "Yüksek",
            sourceNote: "Ford 1.0 EcoBoost ailesi için tekrar eden teknik kaynak bulgusu.",
          },
        ],
      },
    ],
  },
  {
    brand: "Ford",
    model: "Tourneo Courier",
    yearFrom: 2014,
    yearTo: 2026,
    generalNote:
      "Courier ile aynı temel motor ailesini paylaşır; binek kullanımda dahi ticari geçmiş kontrol edilmelidir.",
    engines: [
      {
        engineLabel: "1.5 TDCi / EcoBlue",
        fuelType: "Dizel",
        transmission: "Manuel",
        yearFrom: 2014,
        yearTo: 2026,
        issues: [
          {
            id: "ford-tourneo-courier-15tdci-egr-dpf",
            severity: "medium",
            title: "EGR/DPF, enjektör ve debriyaj/volan kontrolü",
            detail:
              "Tourneo Courier'de kısa mesafe dizel kullanımı EGR/DPF doluluğu, enjektör değerleri ve debriyaj-volan aşınmasını artırabilir.",
            typicalOnset: "100.000 km sonrası",
            costLevel: "Orta",
            sourceNote: "Ford TDCi/EcoBlue kullanıcı forumları ve ticari araç servis kayıtları.",
          },
        ],
      },
      {
        engineLabel: "1.0 EcoBoost",
        fuelType: "Benzin",
        transmission: "Manuel",
        yearFrom: 2014,
        yearTo: 2026,
        issues: [
          {
            id: "ford-tourneo-courier-10ecoboost",
            severity: "high",
            title: "Islak triger kayışı ve turbo/soğutma kontrolü",
            detail:
              "1.0 EcoBoost'ta wet belt, yağ basıncı, turbo sesi ve soğutma kaçakları servis faturasıyla doğrulanmalı.",
            typicalOnset: "100.000-160.000 km",
            costLevel: "Yüksek",
            sourceNote: "Ford 1.0 EcoBoost teknik kaynakları ve kullanıcı kayıtlarında tekrar eden risk.",
          },
        ],
      },
    ],
  },
  {
    brand: "Ford",
    model: "Tourneo Connect",
    yearFrom: 2002,
    yearTo: 2026,
    engines: [
      {
        engineLabel: "1.8 TDCi",
        fuelType: "Dizel",
        transmission: "Manuel",
        yearFrom: 2002,
        yearTo: 2013,
        issues: [
          {
            id: "ford-connect-18tdci-injector-turbo",
            severity: "medium",
            title: "Enjektör, turbo ve yüksek km ticari yıpranma",
            detail:
              "Eski Connect 1.8 TDCi'de enjektör, turbo, debriyaj/volan, mazot pompası ve kilometre tutarlılığı özellikle kontrol edilmelidir.",
            typicalOnset: "180.000 km sonrası",
            costLevel: "Orta",
            sourceNote: "Ford Connect kullanıcı forumları ve ticari servis kayıtlarında tekrar eden bulgular.",
          },
        ],
      },
      {
        engineLabel: "1.5 / 1.6 TDCi",
        fuelType: "Dizel",
        transmission: "Manuel",
        yearFrom: 2013,
        yearTo: 2026,
        issues: [
          {
            id: "ford-connect-tdci-egr-dpf-dmf",
            severity: "medium",
            title: "EGR/DPF, enjektör ve çift kütleli volan kontrolü",
            detail:
              "Yeni Connect dizellerde EGR/DPF doluluğu, enjektör conta/değerleri ve debriyaj/volan ticari kullanımda erken masraf çıkarabilir.",
            typicalOnset: "120.000 km sonrası",
            costLevel: "Orta",
            sourceNote: "Ford TDCi/EcoBlue ailesi ve Connect servis kayıtlarında tekrar eden bulgular.",
          },
        ],
      },
    ],
  },
  {
    brand: "Ford",
    model: "EcoSport",
    yearFrom: 2013,
    yearTo: 2022,
    engines: [
      {
        engineLabel: "1.0 EcoBoost",
        fuelType: "Benzin",
        transmission: "Manuel",
        yearFrom: 2013,
        yearTo: 2022,
        issues: [
          {
            id: "ford-ecosport-10ecoboost-wetbelt",
            severity: "high",
            title: "1.0 EcoBoost wet belt ve soğutma sistemi",
            detail:
              "EcoSport 1.0 EcoBoost'ta ıslak triger kayışı, yağ basıncı ve soğutma kaçakları alım öncesi mutlaka kontrol edilmelidir.",
            typicalOnset: "100.000-160.000 km",
            costLevel: "Yüksek",
            sourceNote: "Ford 1.0 EcoBoost ailesi için tekrar eden teknik ve kullanıcı kayıtları.",
          },
        ],
      },
      {
        engineLabel: "1.5 TDCi",
        fuelType: "Dizel",
        transmission: "Manuel",
        yearFrom: 2013,
        yearTo: 2022,
        issues: [
          {
            id: "ford-ecosport-15tdci-dpf",
            severity: "medium",
            title: "DPF/EGR ve turbo hortumu kontrolü",
            detail:
              "EcoSport dizellerde şehir içi kullanım DPF/EGR ve turbo hortumu sorunlarını artırabilir; enjektör ve triger kaydı kontrol edilmeli.",
            typicalOnset: "100.000 km sonrası",
            costLevel: "Orta",
            sourceNote: "Ford 1.5 TDCi kullanıcı forumları ve servis kayıtlarında tekrar eden bulgular.",
          },
        ],
      },
    ],
  },
  {
    brand: "Ford",
    model: "Kuga",
    yearFrom: 2008,
    yearTo: 2026,
    engines: [
      {
        engineLabel: "1.5 / 1.6 EcoBoost",
        fuelType: "Benzin",
        transmission: "Otomatik",
        yearFrom: 2013,
        yearTo: 2020,
        issues: [
          {
            id: "ford-kuga-ecoboost-cooling-powershift",
            severity: "high",
            title: "EcoBoost soğutma/hararet ve otomatik şanzıman kontrolü",
            detail:
              "EcoBoost Kuga'da soğutma suyu kaybı, hararet geçmişi, silindir kapağı riski ve otomatik/PowerShift davranışı kontrol edilmeli.",
            typicalOnset: "80.000-140.000 km",
            costLevel: "Yüksek",
            sourceNote: "Ford EcoBoost soğutma sistemi geri çağırma/servis kayıtları ve Kuga kullanıcı forumları.",
          },
        ],
      },
      {
        engineLabel: "2.0 TDCi",
        fuelType: "Dizel",
        transmission: "Yarı otomatik",
        yearFrom: 2008,
        yearTo: 2020,
        issues: [
          {
            id: "ford-kuga-20tdci-powershift-awd",
            severity: "high",
            title: "PowerShift, AWD ve dizel emisyon sistemi",
            detail:
              "2.0 TDCi Kuga'da PowerShift yağ/kavrama, AWD/haldex benzeri aktarma bakım geçmişi, EGR/DPF ve turbo kontrol edilmelidir.",
            typicalOnset: "120.000 km sonrası",
            costLevel: "Yüksek",
            sourceNote: "Ford Kuga/PowerShift kullanıcı şikayetleri ve bağımsız servis kayıtlarında tekrar eden risk.",
          },
        ],
      },
      {
        engineLabel: "1.5 EcoBlue",
        fuelType: "Dizel",
        transmission: "Otomatik",
        yearFrom: 2020,
        yearTo: 2026,
        issues: [
          {
            id: "ford-kuga-15ecoblue-adblue",
            severity: "medium",
            title: "AdBlue/DPF/EGR ve otomatik şanzıman bakım kontrolü",
            detail:
              "Yeni Kuga EcoBlue'da AdBlue sistemi, DPF/EGR, turbo ve otomatik şanzıman servis kayıtları alımda kontrol edilmeli.",
            typicalOnset: "100.000 km sonrası",
            costLevel: "Orta",
            sourceNote: "Ford EcoBlue servis kayıtları ve Kuga kullanıcı deneyimlerinde tekrar eden kontrol başlığı.",
          },
        ],
      },
    ],
  },
  {
    brand: "Ford",
    model: "Mondeo",
    yearFrom: 2000,
    yearTo: 2022,
    engines: [
      {
        engineLabel: "2.0 TDCi",
        fuelType: "Dizel",
        transmission: "Manuel",
        yearFrom: 2000,
        yearTo: 2022,
        issues: [
          {
            id: "ford-mondeo-20tdci-injector-dpf",
            severity: "medium",
            title: "Enjektör, turbo, DPF/EGR ve çift kütleli volan kontrolü",
            detail:
              "Mondeo 2.0 TDCi'de yüksek km enjektör, turbo, DPF/EGR, debriyaj/volan ve otomatik varsa PowerShift kontrol edilmelidir.",
            typicalOnset: "150.000 km sonrası",
            costLevel: "Yüksek",
            sourceNote: "Ford Mondeo TDCi kullanıcı forumları ve bağımsız servis kayıtlarında tekrar eden bulgular.",
          },
        ],
      },
      {
        engineLabel: "1.5 / 1.6 EcoBoost",
        fuelType: "Benzin",
        transmission: "Otomatik",
        yearFrom: 2010,
        yearTo: 2022,
        issues: [
          {
            id: "ford-mondeo-ecoboost-cooling",
            severity: "medium",
            title: "EcoBoost soğutma sistemi ve turbo kontrolü",
            detail:
              "EcoBoost Mondeo'da soğutma kaçakları, turbo sesi, yağ bakımı ve otomatik şanzıman geçişleri kontrol edilmelidir.",
            typicalOnset: "100.000 km sonrası",
            costLevel: "Orta",
            sourceNote: "Ford EcoBoost ailesi ve Mondeo kullanıcı kayıtlarında tekrar eden kontrol başlığı.",
          },
        ],
      },
    ],
  },
  {
    brand: "Ford",
    model: "Puma",
    yearFrom: 2019,
    yearTo: 2026,
    engines: [
      {
        engineLabel: "1.0 EcoBoost mHEV",
        fuelType: "Hibrit",
        transmission: "Manuel",
        yearFrom: 2019,
        yearTo: 2026,
        issues: [
          {
            id: "ford-puma-10ecoboost-mhev-wetbelt",
            severity: "medium",
            title: "EcoBoost wet belt, 48V sistem ve yazılım kontrolü",
            detail:
              "Puma mHEV'de 1.0 EcoBoost wet belt bakım geçmişi, 48V akü/şarj sistemi, yazılım güncellemeleri ve soğutma sistemi kontrol edilmeli.",
            typicalOnset: "Garanti devri ve 100.000 km sonrası",
            costLevel: "Orta",
            sourceNote: "Ford 1.0 EcoBoost mHEV kullanıcı deneyimleri ve teknik servis kayıtları.",
          },
        ],
      },
    ],
  },
  {
    brand: "Ford",
    model: "Ranger",
    yearFrom: 2006,
    yearTo: 2026,
    engines: [
      {
        engineLabel: "2.2 TDCi",
        fuelType: "Dizel",
        transmission: "Manuel",
        yearFrom: 2012,
        yearTo: 2022,
        issues: [
          {
            id: "ford-ranger-22tdci-injector-turbo",
            severity: "medium",
            title: "Enjektör, turbo, EGR ve arazi/yük kullanım izi",
            detail:
              "Ranger 2.2 TDCi'de enjektör, turbo, EGR/DPF, transfer kutusu, diferansiyel ve şasi-alt takım arazi/yük kullanım izleri kontrol edilmeli.",
            typicalOnset: "Kullanım tarzına bağlı",
            costLevel: "Yüksek",
            sourceNote: "Pickup alım rehberleri ve Ford Ranger kullanıcı forumlarında tekrar eden kontrol başlığı.",
          },
        ],
      },
      {
        engineLabel: "3.2 TDCi",
        fuelType: "Dizel",
        transmission: "Otomatik",
        yearFrom: 2012,
        yearTo: 2022,
        issues: [
          {
            id: "ford-ranger-32tdci-egr-auto",
            severity: "medium",
            title: "EGR/soğutma, otomatik şanzıman ve 4x4 aktarma kontrolü",
            detail:
              "3.2 TDCi Ranger'da EGR/soğutma, turbo, otomatik şanzıman yağ bakımı, 4x4 aktarma ve çekme/yük geçmişi kontrol edilmeli.",
            typicalOnset: "120.000 km sonrası veya ağır kullanımda",
            costLevel: "Yüksek",
            sourceNote: "Ranger 3.2 TDCi kullanıcı forumları ve pickup servis kayıtlarında tekrar eden bulgular.",
          },
        ],
      },
      {
        engineLabel: "2.0 EcoBlue Bi-Turbo",
        fuelType: "Dizel",
        transmission: "Otomatik",
        yearFrom: 2019,
        yearTo: 2026,
        issues: [
          {
            id: "ford-ranger-20ecoblue-adblue-biturbo",
            severity: "medium",
            title: "AdBlue/DPF, çift turbo ve 10 ileri otomatik bakım kontrolü",
            detail:
              "Yeni Ranger 2.0 EcoBlue'da AdBlue/DPF, çift turbo, 10 ileri otomatik şanzıman davranışı ve arazi kullanım izleri kontrol edilmelidir.",
            typicalOnset: "100.000 km sonrası",
            costLevel: "Yüksek",
            sourceNote:
              "Ford EcoBlue/Ranger kullanıcı deneyimleri ve pickup alım rehberlerinde tekrar eden kontrol başlığı.",
          },
        ],
      },
    ],
  },
  {
    brand: "Opel",
    model: "Vectra",
    generation: "B/C",
    yearFrom: 2000,
    yearTo: 2008,
    generalNote: "2000 sonrası ikinci elde yaş kaynaklı elektrik, pas, soğutma ve LPG geçmişi motor kadar önemlidir.",
    engines: [
      {
        engineLabel: "1.6 / 1.8 Ecotec",
        fuelType: "Benzin",
        transmission: "Manuel",
        yearFrom: 2000,
        yearTo: 2008,
        issues: [
          {
            id: "opel-vectra-ecotec-egr-oil",
            severity: "medium",
            title: "EGR, yağ kaçakları ve soğutma sistemi kontrolü",
            detail:
              "Ecotec Vectra'da EGR, bobin/buji, yağ kaçakları, termostat/su pompası ve LPG'li araçlarda subap/kompresyon kontrol edilmelidir.",
            typicalOnset: "Yaş ve LPG kullanımına bağlı",
            costLevel: "Orta",
            sourceNote: "Opel Vectra/Ecotec kullanıcı forumları ve bağımsız servis kayıtlarında tekrar eden bulgular.",
          },
        ],
      },
      {
        engineLabel: "2.0 / 2.2 DTI",
        fuelType: "Dizel",
        transmission: "Manuel",
        yearFrom: 2000,
        yearTo: 2005,
        issues: [
          {
            id: "opel-vectra-dti-pump-turbo",
            severity: "medium",
            title: "Mazot pompası, turbo ve EGR kontrolü",
            detail:
              "DTI dizellerde yüksek km'de mazot pompası/elektronik pompa, turbo, EGR ve soğutma sistemi kontrol edilmelidir.",
            typicalOnset: "180.000 km sonrası",
            costLevel: "Yüksek",
            sourceNote: "Opel DTI kullanıcı forumları ve dizel servis kayıtlarında tekrar eden kontrol başlığı.",
          },
        ],
      },
    ],
  },
  {
    brand: "Opel",
    model: "Zafira",
    yearFrom: 2000,
    yearTo: 2019,
    engines: [
      {
        engineLabel: "1.6 / 1.8 Ecotec",
        fuelType: "Benzin",
        transmission: "Manuel",
        yearFrom: 2000,
        yearTo: 2014,
        issues: [
          {
            id: "opel-zafira-ecotec-lpg-egr",
            severity: "medium",
            title: "LPG/subap, EGR ve soğutma sistemi kontrolü",
            detail:
              "Zafira benzinlilerde LPG montajı, subap/kompresyon, EGR, bobin ve soğutma sistemi aile aracı kullanımında kontrol edilmelidir.",
            typicalOnset: "120.000 km sonrası veya LPG'li kullanımda",
            costLevel: "Orta",
            sourceNote: "Opel Zafira/Ecotec kullanıcı forumları ve LPG servis kayıtlarında tekrar eden bulgular.",
          },
        ],
      },
      {
        engineLabel: "1.9 CDTI",
        fuelType: "Dizel",
        transmission: "Manuel",
        yearFrom: 2005,
        yearTo: 2014,
        issues: [
          {
            id: "opel-zafira-19cdti-egr-swirl",
            severity: "medium",
            title: "EGR, swirl flap, DPF ve volan kontrolü",
            detail:
              "1.9 CDTI Zafira'da EGR, emme manifoldu swirl flap, DPF, turbo ve çift kütleli volan kontrol edilmelidir.",
            typicalOnset: "130.000 km sonrası",
            costLevel: "Yüksek",
            sourceNote: "Fiat/GM 1.9 CDTI-JTD motor ailesi ve Zafira forumlarında tekrar eden bulgular.",
          },
        ],
      },
      {
        engineLabel: "1.6 CDTI",
        fuelType: "Dizel",
        transmission: "Manuel",
        yearFrom: 2014,
        yearTo: 2019,
        issues: [
          {
            id: "opel-zafira-16cdti-chain-dpf",
            severity: "high",
            title: "1.6 CDTI zincir gergisi ve DPF/EGR kontrolü",
            detail:
              "1.6 CDTI'da soğuk çalıştırma zincir sesi/gergi, DPF/EGR ve AdBlue varsa emisyon sistemi kontrol edilmelidir.",
            typicalOnset: "80.000-150.000 km",
            costLevel: "Yüksek",
            sourceNote: "Opel/Vauxhall 1.6 CDTI zincir ve DPF kayıtlarında tekrar eden bulgu.",
          },
        ],
      },
    ],
  },
  {
    brand: "Opel",
    model: "Insignia",
    yearFrom: 2008,
    yearTo: 2022,
    engines: [
      {
        engineLabel: "1.6 Turbo",
        fuelType: "Benzin",
        transmission: "Manuel",
        yearFrom: 2008,
        yearTo: 2017,
        issues: [
          {
            id: "opel-insignia-16turbo-cooling",
            severity: "medium",
            title: "Turbo, soğutma sistemi ve M32 manuel şanzıman kontrolü",
            detail:
              "Insignia 1.6 Turbo'da turbo/soğutma, yağ kaçakları ve M32 manuel şanzımanda rulman uğultusu kontrol edilmelidir.",
            typicalOnset: "100.000 km sonrası",
            costLevel: "Orta",
            sourceNote: "Opel Insignia forumları ve M32 şanzıman servis kayıtlarında tekrar eden bulgular.",
          },
        ],
      },
      {
        engineLabel: "1.6 CDTI",
        fuelType: "Dizel",
        transmission: "Otomatik",
        yearFrom: 2015,
        yearTo: 2022,
        issues: [
          {
            id: "opel-insignia-16cdti-chain-adblue",
            severity: "high",
            title: "1.6 CDTI zincir sesi, DPF/EGR ve AdBlue kontrolü",
            detail:
              "Insignia 1.6 CDTI'da zincir/gergi sesi, DPF/EGR, AdBlue/NOx ve otomatik şanzıman bakım geçmişi kontrol edilmelidir.",
            typicalOnset: "90.000-160.000 km",
            costLevel: "Yüksek",
            sourceNote: "Opel 1.6 CDTI teknik kaynakları ve Insignia kullanıcı kayıtlarında tekrar eden bulgu.",
          },
        ],
      },
      {
        engineLabel: "2.0 CDTI",
        fuelType: "Dizel",
        transmission: "Otomatik",
        yearFrom: 2008,
        yearTo: 2022,
        issues: [
          {
            id: "opel-insignia-20cdti-egr-dpf-auto",
            severity: "medium",
            title: "EGR/DPF, emme klapesi ve otomatik şanzıman kontrolü",
            detail:
              "2.0 CDTI Insignia'da EGR/DPF, emme manifoldu/klape, turbo ve otomatik şanzıman geçişleri kontrol edilmelidir.",
            typicalOnset: "140.000 km sonrası",
            costLevel: "Yüksek",
            sourceNote: "Insignia 2.0 CDTI kullanıcı forumları ve bağımsız servis kayıtlarında tekrar eden bulgular.",
          },
        ],
      },
    ],
  },
  {
    brand: "Opel",
    model: "Mokka",
    yearFrom: 2012,
    yearTo: 2026,
    engines: [
      {
        engineLabel: "1.4 Turbo",
        fuelType: "Benzin",
        transmission: "Otomatik",
        yearFrom: 2012,
        yearTo: 2020,
        issues: [
          {
            id: "opel-mokka-14turbo-pcv-cooling",
            severity: "medium",
            title: "PCV/kapak, turbo ve soğutma sistemi kontrolü",
            detail:
              "Mokka 1.4 Turbo'da PCV/kapak diyaframı, turbo wastegate, soğutma kaçakları ve otomatik şanzıman geçişleri kontrol edilmelidir.",
            typicalOnset: "90.000 km sonrası",
            costLevel: "Orta",
            sourceNote: "Opel 1.4 Turbo kullanıcı forumları ve Mokka servis kayıtlarında tekrar eden bulgular.",
          },
        ],
      },
      {
        engineLabel: "1.6 CDTI",
        fuelType: "Dizel",
        transmission: "Otomatik",
        yearFrom: 2015,
        yearTo: 2020,
        issues: [
          {
            id: "opel-mokka-16cdti-chain-dpf",
            severity: "high",
            title: "1.6 CDTI zincir ve DPF/EGR kontrolü",
            detail:
              "Mokka 1.6 CDTI'da zincir sesi/gergi, EGR/DPF, AdBlue varsa emisyon sistemi ve otomatik şanzıman davranışı kontrol edilmelidir.",
            typicalOnset: "90.000-150.000 km",
            costLevel: "Yüksek",
            sourceNote: "Opel 1.6 CDTI motor ailesi ve Mokka kullanıcı kayıtlarında tekrar eden bulgu.",
          },
        ],
      },
      {
        engineLabel: "1.2 PureTech",
        fuelType: "Benzin",
        transmission: "Otomatik",
        yearFrom: 2021,
        yearTo: 2026,
        issues: [
          {
            id: "opel-mokka-12puretech-wetbelt",
            severity: "high",
            title: "PureTech ıslak triger kayışı ve yağ tüketimi kontrolü",
            detail:
              "PSA ortak 1.2 PureTech'te yağ içinde çalışan triger kayışı, yağ tüketimi ve turbo/soğutma sistemi kontrol edilmelidir.",
            typicalOnset: "60.000-120.000 km",
            costLevel: "Yüksek",
            sourceNote:
              "PSA 1.2 PureTech teknik servis kampanyaları ve kullanıcı kayıtlarında tekrar eden iyi bilinen risk.",
          },
        ],
      },
    ],
  },
  {
    brand: "Opel",
    model: "Grandland",
    yearFrom: 2017,
    yearTo: 2026,
    engines: [
      {
        engineLabel: "1.2 PureTech",
        fuelType: "Benzin",
        transmission: "Otomatik",
        yearFrom: 2017,
        yearTo: 2026,
        issues: [
          {
            id: "opel-grandland-12puretech-wetbelt",
            severity: "high",
            title: "1.2 PureTech ıslak kayış, yağ tüketimi ve turbo kontrolü",
            detail:
              "Grandland 1.2 PureTech'te wet belt parçalanması/yağ süzgeci, yağ tüketimi, turbo ve servis kampanya geçmişi kontrol edilmelidir.",
            typicalOnset: "60.000-120.000 km",
            costLevel: "Yüksek",
            sourceNote:
              "PSA 1.2 PureTech ailesi teknik kaynakları ve Opel/Peugeot kullanıcı kayıtlarında tekrar eden risk.",
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
            id: "opel-grandland-15bluehdi-adblue-chain",
            severity: "medium",
            title: "AdBlue/NOx ve 1.5 BlueHDi zincir/eksantrik kontrolü",
            detail:
              "Grandland 1.5 dizelde AdBlue deposu/pompası, NOx sensörü, DPF/EGR ve 1.5 BlueHDi üst kapak/eksantrik zinciri riski kontrol edilmelidir.",
            typicalOnset: "80.000-150.000 km",
            costLevel: "Orta",
            sourceNote: "PSA 1.5 BlueHDi teknik kaynakları ve kullanıcı şikayetlerinde tekrar eden bulgu.",
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
            id: "opel-grandland-phev-battery-awd",
            severity: "medium",
            title: "Hibrit batarya, şarj sistemi ve AWD modül kontrolü",
            detail:
              "Plug-in hibrit Grandland'da batarya sağlığı, şarj portu, garanti devri, inverter/soğutma ve AWD çift motorlu versiyonda arka elektrik motoru kontrol edilmelidir.",
            typicalOnset: "Garanti devri ve yüksek km öncesi",
            costLevel: "Orta",
            sourceNote: "PHEV alım rehberleri ve PSA/Opel hibrit kullanıcı deneyimlerinde tekrar eden kontrol başlığı.",
          },
        ],
      },
    ],
  },
  {
    brand: "Opel",
    model: "Combo",
    yearFrom: 2001,
    yearTo: 2026,
    generalNote:
      "Ticari kullanım ve PSA/Fiat/GM ortak motor dönemleri nedeniyle gerçek kullanım tipi, yük geçmişi ve bakım aralığı kritik.",
    engines: [
      {
        engineLabel: "1.3 CDTI",
        fuelType: "Dizel",
        transmission: "Manuel",
        yearFrom: 2004,
        yearTo: 2018,
        issues: [
          {
            id: "opel-combo-13cdti-chain-egr",
            severity: "medium",
            title: "1.3 CDTI zincir sesi, EGR/enjektör ve turbo kontrolü",
            detail:
              "Fiat Multijet tabanlı 1.3 CDTI'da zincir sesi, EGR kurumlanması, enjektör ve turbo hortumu kontrol edilmelidir.",
            typicalOnset: "120.000 km sonrası",
            costLevel: "Orta",
            sourceNote:
              "Fiat/Opel 1.3 CDTI-Multijet kullanıcı forumları ve ticari servis kayıtlarında tekrar eden bulgular.",
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
            id: "opel-combo-15bluehdi-adblue",
            severity: "medium",
            title: "AdBlue/NOx, DPF/EGR ve ticari kullanım yıpranması",
            detail:
              "Yeni Combo 1.5 dizelde AdBlue/NOx, DPF/EGR, turbo ve ticari kullanım kaynaklı debriyaj/alt takım kontrol edilmelidir.",
            typicalOnset: "100.000 km sonrası",
            costLevel: "Orta",
            sourceNote: "PSA 1.5 BlueHDi ve Opel Combo kullanıcı/servis kayıtlarında tekrar eden bulgular.",
          },
        ],
      },
    ],
  },
];
