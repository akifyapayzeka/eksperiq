import type { ModelEntry } from "../types";

// Kaynak: VW/Audi resmi teknik servis bültenleri (2012 zincir gerdirici
// TSB'si dahil), forum konsensüsü (VWVortex, PistonHeads, UK Volkswagen
// Forum, Volkswagen Owners Club), bağımsız uzman servis blogları (ShopDAP,
// Alex's Autohaus, Atlantic Motorcar) ve motor/güvenilirlik veritabanları
// (motorreviewer.com, carchecker.pro) genelinde tekrar eden bulgular.
export const VW_ENTRIES: ModelEntry[] = [
  {
    brand: "Volkswagen",
    model: "Golf",
    yearFrom: 2009,
    yearTo: 2020,
    generalNote:
      "Mk6 (2009-2012) ve Mk7 (2012-2020) nesillerini kapsar. Mk6'da EA111/EA189 motor ailesi, Mk7'de EA211/EA288 motor ailesi kullanılır; bu iki nesil arasında mekanik güvenilirlik profili belirgin şekilde farklıdır.",
    engines: [
      {
        engineLabel: "1.2 TSI",
        fuelType: "Benzin",
        yearFrom: 2009,
        yearTo: 2012,
        reliabilityNote: "EA111 ailesi motordur (Mk6 dönemi). Manuel ve DSG7 (DQ200) seçenekleri mevcuttur.",
        issues: [
          {
            id: "vw-golf-mk6-12tsi-timing-chain",
            severity: "high",
            title: "Zincir gerdirici arızası",
            detail:
              "EA111 1.2 TSI motorlarda zincir gerdiricisinin tasarım kusuru nedeniyle zincirde boşluk oluşabilir ve ilerlemiş vakalarda supap-piston teması ile ciddi motor hasarı bildirilir. VW bu konuda 2012'de bir teknik servis bülteni yayınlamıştır.",
            typicalOnset: "40.000-90.000 km",
            costLevel: "Yüksek",
            sourceNote: "Yaygın forum raporları, VW TSB'si ve bağımsız servis kaynaklarında tekrarlanan bir sorun.",
          },
          {
            id: "vw-golf-mk6-12tsi-dsg-dq200",
            severity: "medium",
            title: "DQ200 kuru kavramalı DSG'de kavrama titremesi",
            detail:
              "DQ200 kuru çift kavramalı otomatik şanzımanda kalkışta titreme, sarsıntılı vites geçişi ve mekatronik ünitede arıza bildirilmektedir.",
            typicalOnset: "60.000-120.000 km",
            costLevel: "Orta",
            sourceNote: "Yaygın forum ve bağımsız servis raporlarında sık bildirilen bir sorun.",
          },
        ],
      },
      {
        engineLabel: "1.4 TSI",
        fuelType: "Benzin",
        yearFrom: 2009,
        yearTo: 2012,
        reliabilityNote: "EA111 ailesi motordur; 122 PS tekli turbo ve 160/170 PS twincharger versiyonları bulunur.",
        issues: [
          {
            id: "vw-golf-mk6-14tsi-timing-chain",
            severity: "high",
            title: "Zincir gerdirici arızası",
            detail:
              "1.2 TSI ile aynı EA111 motor mimarisini paylaşan 1.4 TSI'de de zincir gerdiricisi kusuru bildirilir; zincir sesi (özellikle soğuk çalıştırmada) erken uyarı belirtisidir.",
            typicalOnset: "40.000-90.000 km",
            costLevel: "Yüksek",
            sourceNote: "Yaygın forum raporları ve VW'nin 2012 TSB'si.",
          },
        ],
      },
      {
        engineLabel: "2.0 TSI",
        fuelType: "Benzin",
        yearFrom: 2009,
        yearTo: 2012,
        reliabilityNote:
          "EA888 Gen1/Gen2 ailesi (GTI/R gibi performans versiyonları). 2012 öncesi üretimde belirgin bir zincir gerdirici kusuru bildirilir.",
        issues: [
          {
            id: "vw-golf-mk6-20tsi-timing-chain",
            severity: "high",
            title: "Zincir gerdirici arızası (2012 öncesi üretim)",
            detail:
              "2008-2012 arası üretilen EA888 Gen1/Gen2 2.0 TSI motorlarda hatalı tasarımlı alt zincir gerdiricisi bildirilir; hidrolik basıncı kaybeden gerdirici düşük kilometrelerde bile ciddi motor hasarına yol açabilir. 2012 sonrası üretimde revize gerdirici kullanılmıştır.",
            typicalOnset: "30.000-80.000 km",
            costLevel: "Yüksek",
            sourceNote:
              "Yaygın forum raporları, bağımsız servis vaka çalışmaları ve toplu dava/uzlaşma kayıtlarında tekrarlanan bir sorun.",
          },
        ],
      },
      {
        engineLabel: "1.6 TDI",
        fuelType: "Dizel",
        yearFrom: 2009,
        yearTo: 2012,
        reliabilityNote: "EA189 ailesi motordur (Mk6 dönemi, common-rail).",
        issues: [
          {
            id: "vw-golf-mk6-16tdi-injector",
            severity: "high",
            title: "Enjektör arızası (piezo enjektör izolasyon bozulması)",
            detail:
              "2009-2013 arası üretilen Siemens piezoelektrik enjektörlerde iç izolasyon bozulması bildirilir; sarsıntılı rölanti, ateşleme boşlukları, siyah duman ve güç kaybına yol açar.",
            typicalOnset: "100.000-180.000 km",
            costLevel: "Yüksek",
            sourceNote: "Yaygın forum raporları ve bağımsız servis kaynaklarında tekrarlanan bir sorun.",
          },
          {
            id: "vw-golf-mk6-16tdi-dmf",
            severity: "medium",
            title: "Çift kütleli volan (DMF) aşınması",
            detail:
              "Rölantide metalik tıkırtı ve pedaldan titreşim ile kendini gösteren DMF aşınması, manuel şanzımanlı versiyonlarda orta-yüksek kilometrelerde bildirilir.",
            typicalOnset: "150.000-220.000 km",
            costLevel: "Orta",
            sourceNote: "Yaygın forum ve servis raporlarında tekrarlanan bir sorun.",
          },
        ],
      },
      {
        engineLabel: "2.0 TDI",
        fuelType: "Dizel",
        yearFrom: 2009,
        yearTo: 2012,
        reliabilityNote:
          "EA189 ailesi motordur; DSG6 (DQ250, ıslak kavrama) yüksek torklu versiyonlarda yaygın eşleşmedir.",
        issues: [
          {
            id: "vw-golf-mk6-20tdi-injector",
            severity: "high",
            title: "Enjektör arızası",
            detail:
              "Common-rail enjektörlerde zamanla tıkanma veya elektriksel arıza bildirilir; güç kaybı, sarsıntılı çalışma ve artan yakıt tüketimi ile kendini gösterir.",
            typicalOnset: "120.000-180.000 km",
            costLevel: "Yüksek",
            sourceNote: "Yaygın forum ve bağımsız servis kaynaklarında tekrarlanan bir sorun.",
          },
          {
            id: "vw-golf-mk6-20tdi-dmf",
            severity: "medium",
            title: "Çift kütleli volan (DMF) aşınması",
            detail:
              "2.0 TDI'nin yüksek torku nedeniyle DMF ömrü diğer motorlara göre daha kısa bildirilir; rölantide tıkırtı ve kavrama kaymasıyla kendini gösterir.",
            typicalOnset: "150.000-220.000 km",
            costLevel: "Orta",
            sourceNote: "Yaygın forum ve servis raporlarında tekrarlanan bir sorun.",
          },
        ],
      },
      {
        engineLabel: "1.2 TSI",
        fuelType: "Benzin",
        yearFrom: 2012,
        yearTo: 2020,
        reliabilityNote:
          "EA211 ailesi motordur (Mk7 dönemi); zincir yerine ömür boyu tasarlanmış triger kayışı kullanır ve EA111'e göre belirgin şekilde daha güvenilir kabul edilir.",
        issues: [
          {
            id: "vw-golf-mk7-12tsi-waterpump",
            severity: "low",
            title: "Su pompası/termostat gövdesi sızıntısı",
            detail:
              "EA211 ailesinde paylaşılan plastik termostat gövdesi ve entegre su pompasında zamanla küçük soğutucu sızıntıları bildirilir.",
            typicalOnset: "80.000-130.000 km",
            costLevel: "Düşük",
            sourceNote: "Yaygın forum ve servis raporlarında tekrarlanan bir sorun.",
          },
          {
            id: "vw-golf-mk7-12tsi-dsg-dq200",
            severity: "medium",
            title: "DQ200 kuru kavramalı DSG'de kavrama titremesi",
            detail:
              "1.2 TSI'nin eşleştiği DQ200 kuru kavramalı DSG'de kalkışta titreme ve mekatronik adaptasyon kayması bildirilir.",
            typicalOnset: "60.000-120.000 km",
            costLevel: "Orta",
            sourceNote: "Yaygın forum ve bağımsız servis raporlarında sık bildirilen bir sorun.",
          },
        ],
      },
      {
        engineLabel: "1.4 TSI",
        fuelType: "Benzin",
        yearFrom: 2012,
        yearTo: 2020,
        reliabilityNote:
          "EA211 ailesi motordur; 125/150 PS versiyonları mevcuttur, 140-150 PS versiyonlar ACT (silindir devre dışı bırakma) özelliğine sahiptir.",
        issues: [
          {
            id: "vw-golf-mk7-14tsi-act-rocker",
            severity: "high",
            title: "ACT (silindir kapatma) rocker kolu aşınması",
            detail:
              "Silindir devre dışı bırakma mekanizmasındaki kayan rocker kolları zamanla aşınabilir veya kırılabilir; emme kamının ve takipçi elemanların değişimini gerektirir. ACT özelliği olmayan düşük güçlü versiyonlarda görülmez.",
            typicalOnset: "100.000+ km",
            costLevel: "Yüksek",
            sourceNote: "Uzman VAG servislerinden ve bağımsız güvenilirlik raporlarından tekrarlanan bir sorun.",
          },
          {
            id: "vw-golf-mk7-14tsi-wastegate",
            severity: "medium",
            title: "Turbo wastegate mekanizmasında gevşeme/tıkırtı",
            detail:
              "Soğuk çalıştırmada turbo tarafından gelen tıkırtı sesi, EPC arıza lambası ve boost basıncı dalgalanmaları ile kendini gösteren wastegate aktüatör sorunları bildirilir.",
            typicalOnset: "60.000-120.000 km",
            costLevel: "Orta",
            sourceNote: "Yaygın forum ve servis raporlarında tekrarlanan bir sorun.",
          },
          {
            id: "vw-golf-mk7-14tsi-dsg-dq200",
            severity: "medium",
            title: "DQ200 kuru kavramalı DSG'de kavrama titremesi",
            detail:
              "Kuru kavramalı DQ200 şanzımanda kalkışta titreme ve mekatronik valf gövdesinde çatlama bildirilir.",
            typicalOnset: "60.000-120.000 km",
            costLevel: "Orta",
            sourceNote: "Yaygın forum ve bağımsız servis raporlarında sık bildirilen bir sorun.",
          },
        ],
      },
      {
        engineLabel: "1.6 TDI",
        fuelType: "Dizel",
        yearFrom: 2012,
        yearTo: 2020,
        reliabilityNote: "EA288 ailesi motordur (Mk7 dönemi); zincir yerine triger kayışı kullanır.",
        issues: [
          {
            id: "vw-golf-mk7-16tdi-injector",
            severity: "medium",
            title: "Enjektör kokslanması/elektriksel arıza",
            detail:
              "Yüksek kilometrelerde common-rail enjektörlerde kokslanma veya elektriksel arıza bildirilir; güç kaybı ve düzensiz çalışmaya yol açar.",
            typicalOnset: "120.000-180.000 km",
            costLevel: "Orta",
            sourceNote: "Yaygın forum ve bağımsız servis kaynaklarında tekrarlanan bir sorun.",
          },
          {
            id: "vw-golf-mk7-16tdi-adblue",
            severity: "medium",
            title: "AdBlue/SCR sistemi arızaları (2015 sonrası Euro 6 versiyonlar)",
            detail:
              "AdBlue enjeksiyon sistemi ve sensörlerinde arıza bildirilir; genellikle arıza lambası ve motor gücü kısıtlaması ile kendini gösterir.",
            typicalOnset: "80.000-150.000 km",
            costLevel: "Orta",
            sourceNote: "Yaygın forum ve servis raporlarında tekrarlanan bir sorun.",
          },
        ],
      },
      {
        engineLabel: "2.0 TDI",
        fuelType: "Dizel",
        yearFrom: 2012,
        yearTo: 2020,
        reliabilityNote: "EA288 ailesi motordur; DSG6 (DQ250) yüksek torklu versiyonlarda yaygın eşleşmedir.",
        issues: [
          {
            id: "vw-golf-mk7-20tdi-injector",
            severity: "medium",
            title: "Enjektör kokslanması/elektriksel arıza",
            detail: "Yüksek kilometrelerde enjektörlerde kokslanma veya arıza bildirilir.",
            typicalOnset: "120.000-180.000 km",
            costLevel: "Orta",
            sourceNote: "Yaygın forum ve bağımsız servis kaynaklarında tekrarlanan bir sorun.",
          },
          {
            id: "vw-golf-mk7-20tdi-adblue",
            severity: "medium",
            title: "AdBlue/SCR sistemi arızaları",
            detail: "AdBlue enjeksiyon sistemi ve sensörlerinde arıza bildirilir.",
            typicalOnset: "80.000-150.000 km",
            costLevel: "Orta",
            sourceNote: "Yaygın forum ve servis raporlarında tekrarlanan bir sorun.",
          },
        ],
      },
    ],
  },
  {
    brand: "Volkswagen",
    model: "Passat",
    yearFrom: 2010,
    yearTo: 2020,
    generalNote:
      "B7 (2010-2014) ve B8 (2014-2020) nesillerini kapsar. B7'de EA111/EA888 Gen2/EA189 motor ailesi, B8'de EA211/EA888 Gen3/EA288 motor ailesi kullanılır.",
    engines: [
      {
        engineLabel: "1.8 TSI",
        fuelType: "Benzin",
        yearFrom: 2010,
        yearTo: 2014,
        reliabilityNote: "EA888 Gen2 ailesi motordur; 2.0 TSI ile aynı temel mimariyi paylaşır.",
        issues: [
          {
            id: "vw-passat-b7-18tsi-timing-chain",
            severity: "high",
            title: "Zincir gerdirici arızası (2012 öncesi üretim)",
            detail:
              "Aynı EA888 ailesindeki 2.0 TSI'de belgelenen zincir gerdirici kusuru, 1.8 TSI'de de bazı kaynaklarda bildirilmektedir.",
            typicalOnset: "30.000-80.000 km",
            costLevel: "Yüksek",
            sourceNote:
              "Esas olarak 2.0 TSI için belgelenmiş olup, aynı motor ailesindeki 1.8 TSI'de de forum raporlarında bildirilmiştir.",
          },
        ],
      },
      {
        engineLabel: "2.0 TSI",
        fuelType: "Benzin",
        yearFrom: 2010,
        yearTo: 2014,
        reliabilityNote:
          "EA888 Gen2 ailesi motordur. 2012 öncesi üretimde belirgin bir zincir gerdirici kusuru bildirilir.",
        issues: [
          {
            id: "vw-passat-b7-20tsi-timing-chain",
            severity: "high",
            title: "Zincir gerdirici arızası (2012 öncesi üretim)",
            detail:
              "2008-2012 arası üretilen EA888 Gen2 2.0 TSI motorlarda hatalı tasarımlı alt zincir gerdiricisi bildirilir; düşük kilometrelerde bile ciddi motor hasarına yol açabilir.",
            typicalOnset: "30.000-80.000 km",
            costLevel: "Yüksek",
            sourceNote:
              "Yaygın forum raporları, bağımsız servis vaka çalışmaları ve toplu dava/uzlaşma kayıtlarında tekrarlanan bir sorun.",
          },
        ],
      },
      {
        engineLabel: "1.6 TDI",
        fuelType: "Dizel",
        yearFrom: 2010,
        yearTo: 2014,
        reliabilityNote: "EA189 ailesi motordur.",
        issues: [
          {
            id: "vw-passat-b7-16tdi-injector",
            severity: "high",
            title: "Enjektör arızası (piezo enjektör izolasyon bozulması)",
            detail:
              "2009-2013 arası üretilen Siemens piezoelektrik enjektörlerde iç izolasyon bozulması bildirilir; sarsıntılı rölanti ve güç kaybına yol açar.",
            typicalOnset: "100.000-180.000 km",
            costLevel: "Yüksek",
            sourceNote: "Yaygın forum raporları ve bağımsız servis kaynaklarında tekrarlanan bir sorun.",
          },
        ],
      },
      {
        engineLabel: "2.0 TDI",
        fuelType: "Dizel",
        yearFrom: 2010,
        yearTo: 2014,
        reliabilityNote: "EA189 ailesi motordur; DSG6 (DQ250) yüksek güç versiyonlarında yaygın eşleşmedir.",
        issues: [
          {
            id: "vw-passat-b7-20tdi-dmf",
            severity: "medium",
            title: "Çift kütleli volan (DMF) aşınması",
            detail:
              "2.0 TDI'nin yüksek torku, özellikle yüksek viteste düşük devirde sürüşle birleştiğinde DMF ömrünü kısaltır; rölantide metalik tıkırtı ve kavrama kayması ile kendini gösterir.",
            typicalOnset: "150.000-220.000 km",
            costLevel: "Orta",
            sourceNote: "Passat B7 2.0 TDI'ye özgü olarak yaygın forum ve servis raporlarında tekrarlanan bir sorun.",
          },
          {
            id: "vw-passat-b7-20tdi-injector",
            severity: "high",
            title: "Enjektör arızası",
            detail: "Common-rail enjektörlerde zamanla tıkanma veya elektriksel arıza bildirilir.",
            typicalOnset: "120.000-180.000 km",
            costLevel: "Yüksek",
            sourceNote: "Yaygın forum ve bağımsız servis kaynaklarında tekrarlanan bir sorun.",
          },
        ],
      },
      {
        engineLabel: "1.4 TSI",
        fuelType: "Benzin",
        yearFrom: 2014,
        yearTo: 2020,
        reliabilityNote:
          "EA211 ailesi motordur (B8 dönemi); 150 PS versiyon ACT (silindir devre dışı bırakma) özelliğine sahiptir.",
        issues: [
          {
            id: "vw-passat-b8-14tsi-act-rocker",
            severity: "high",
            title: "ACT (silindir kapatma) rocker kolu aşınması",
            detail:
              "Silindir devre dışı bırakma mekanizmasındaki rocker kollarında zamanla aşınma bildirilir; kamin ve takipçi elemanların değişimini gerektirebilir.",
            typicalOnset: "100.000+ km",
            costLevel: "Yüksek",
            sourceNote: "Uzman VAG servislerinden ve bağımsız güvenilirlik raporlarından tekrarlanan bir sorun.",
          },
        ],
      },
      {
        engineLabel: "1.6 TDI",
        fuelType: "Dizel",
        yearFrom: 2014,
        yearTo: 2020,
        reliabilityNote: "EA288 ailesi motordur.",
        issues: [
          {
            id: "vw-passat-b8-16tdi-adblue",
            severity: "medium",
            title: "AdBlue/SCR sistemi arızaları",
            detail:
              "AdBlue enjeksiyon sistemi ve sensörlerinde arıza bildirilir; arıza lambası ve motor gücü kısıtlamasına yol açabilir.",
            typicalOnset: "80.000-150.000 km",
            costLevel: "Orta",
            sourceNote: "Yaygın forum ve servis raporlarında tekrarlanan bir sorun.",
          },
        ],
      },
      {
        engineLabel: "2.0 TDI",
        fuelType: "Dizel",
        yearFrom: 2014,
        yearTo: 2020,
        reliabilityNote: "EA288 ailesi motordur; DSG6 (DQ250) yüksek güç versiyonlarında yaygın eşleşmedir.",
        issues: [
          {
            id: "vw-passat-b8-20tdi-adblue",
            severity: "medium",
            title: "AdBlue/SCR sistemi arızaları",
            detail: "AdBlue enjeksiyon sistemi ve sensörlerinde arıza bildirilir.",
            typicalOnset: "80.000-150.000 km",
            costLevel: "Orta",
            sourceNote: "Yaygın forum ve servis raporlarında tekrarlanan bir sorun.",
          },
        ],
      },
    ],
  },
  {
    brand: "Volkswagen",
    model: "Polo",
    yearFrom: 2009,
    yearTo: 2021,
    generalNote:
      "6R/6C (2009-2017) ve AW (2017-2021) nesillerini kapsar. 6R/6C'de EA111/EA189 motor ailesi, AW'de EA211 motor ailesi kullanılır.",
    engines: [
      {
        engineLabel: "1.2 TSI",
        fuelType: "Benzin",
        yearFrom: 2009,
        yearTo: 2014,
        reliabilityNote: "Turbolu EA111 ailesi motordur.",
        issues: [
          {
            id: "vw-polo-6r-12tsi-timing-chain",
            severity: "high",
            title: "Zincir gerdirici arızası",
            detail:
              "EA111 ailesinin bilinen zincir gerdirici kusuru bu motorda da bildirilir; soğuk çalıştırmada metalik zincir sesi erken uyarı belirtisi olarak tarif edilir.",
            typicalOnset: "40.000-90.000 km",
            costLevel: "Yüksek",
            sourceNote: "Yaygın forum raporları ve VW'nin 2012 TSB'si.",
          },
        ],
      },
      {
        engineLabel: "1.2 TDI",
        fuelType: "Dizel",
        yearFrom: 2009,
        yearTo: 2017,
        reliabilityNote:
          "EA189 ailesi 3 silindirli küçük hacimli dizel motordur; küçük hacme rağmen tam emisyon donanımı taşıması nedeniyle 1.6 TDI'ye göre daha kırılgan kabul edilir.",
        issues: [
          {
            id: "vw-polo-6r-12tdi-egr-dpf",
            severity: "medium",
            title: "EGR/DPF tıkanması",
            detail:
              "Küçük hacimli 3 silindirli dizelde EGR ve DPF tıkanması, özellikle kısa mesafe kullanımında sık bildirilir.",
            typicalOnset: "70.000-130.000 km",
            costLevel: "Orta",
            sourceNote: "Yaygın forum ve servis raporlarında sık bildirilen bir sorun.",
          },
        ],
      },
      {
        engineLabel: "1.6 TDI",
        fuelType: "Dizel",
        yearFrom: 2009,
        yearTo: 2017,
        reliabilityNote: "EA189 ailesi motordur; timing kayışı kullanır (temaslı motor tipi).",
        issues: [
          {
            id: "vw-polo-6r-16tdi-injector",
            severity: "high",
            title: "Enjektör arızası",
            detail:
              "Piezo enjektörlerde izolasyon bozulması veya tıkanma bildirilir; sarsıntılı rölanti ve güç kaybına yol açar.",
            typicalOnset: "100.000-180.000 km",
            costLevel: "Yüksek",
            sourceNote: "Yaygın forum ve bağımsız servis kaynaklarında tekrarlanan bir sorun.",
          },
          {
            id: "vw-polo-6r-16tdi-timing-belt",
            severity: "high",
            title: "Zamanında değiştirilmeyen triger kayışının kopması riski",
            detail:
              "1.6 TDI temaslı bir motordur; VW'nin öngördüğü yaklaşık 140.000 km / 5 yıllık değişim aralığı kaçırılırsa kayış kopması durumunda supap-piston teması ile ağır motor hasarı oluşabilir. Bu, motorun kusuru değil, bakım takvimine uyulmamasıyla ortaya çıkan bilinen bir risktir.",
            typicalOnset: "140.000 km / 5 yıl (bakım aralığı)",
            costLevel: "Yüksek",
            sourceNote: "VW bakım şeması ve yaygın servis/forum kaynaklarında tekrarlanan bir uyarı.",
          },
        ],
      },
      {
        engineLabel: "1.0 MPI",
        fuelType: "Benzin",
        yearFrom: 2017,
        yearTo: 2021,
        reliabilityNote:
          "Atmosferik EA211 3 silindirli motordur (AW dönemi). Basit tasarımı nedeniyle genel olarak güvenilir kabul edilir.",
        issues: [
          {
            id: "vw-polo-aw-10mpi-waterpump",
            severity: "medium",
            title: "Su pompası keçesi sızıntısı",
            detail:
              "Zamanla su pompası keçesinde küçük sızıntılar başlar; ihmal edilirse soğutucu kaybına ve aşırı ısınmaya yol açabilir.",
            typicalOnset: "80.000 km civarı",
            costLevel: "Orta",
            sourceNote: "Yaygın forum ve servis raporlarında tekrarlanan bir sorun.",
          },
        ],
      },
      {
        engineLabel: "1.0 TSI",
        fuelType: "Benzin",
        yearFrom: 2017,
        yearTo: 2021,
        reliabilityNote: "Turbolu EA211 3 silindirli motordur (AW dönemi).",
        issues: [
          {
            id: "vw-polo-aw-10tsi-dsg-dq200",
            severity: "medium",
            title: "DQ200 kuru kavramalı DSG'de kavrama titremesi",
            detail:
              "Otomatik (DQ200 kuru kavramalı DSG) donanımlı araçlarda kalkışta titreme ve mekatronik adaptasyon kayması bildirilir.",
            typicalOnset: "60.000-120.000 km",
            costLevel: "Orta",
            sourceNote: "Yaygın forum ve bağımsız servis raporlarında sık bildirilen bir sorun.",
          },
        ],
      },
    ],
  },
  {
    brand: "Volkswagen",
    model: "Bora",
    generation: "Mk4 platform",
    yearFrom: 2000,
    yearTo: 2005,
    generalNote:
      "Golf 4/Jetta platformuyla ortak mekanik kullanır; yaş nedeniyle motor kadar pas, elektrik tesisatı, tavan döşemesi ve alt takım kontrolü önemlidir.",
    engines: [
      {
        engineLabel: "1.6 8V",
        fuelType: "Benzin",
        transmission: "Manuel",
        yearFrom: 2000,
        yearTo: 2005,
        issues: [
          {
            id: "vw-bora-16-8v-throttle-coil",
            severity: "medium",
            title: "Gaz kelebeği, bobin ve yağ kaçakları",
            detail:
              "1.6 8V Bora'da gaz kelebeği kirlenmesi/adaptasyon, bobin-buji tekleme, yağ kaçakları ve LPG'li araçlarda subap/ayar kontrolü yapılmalıdır.",
            typicalOnset: "Yaş ve LPG kullanımına bağlı",
            costLevel: "Orta",
            sourceNote: "Golf 4/Bora kullanıcı forumları ve bağımsız servis kayıtlarında tekrar eden bulgular.",
          },
        ],
      },
      {
        engineLabel: "1.9 TDI",
        fuelType: "Dizel",
        transmission: "Manuel",
        yearFrom: 2000,
        yearTo: 2005,
        issues: [
          {
            id: "vw-bora-19tdi-turbo-maf",
            severity: "medium",
            title: "Turbo geometri, MAF ve EGR kurumlanması",
            detail:
              "1.9 TDI dayanıklı kabul edilir; ancak turbo geometri sıkışması, MAF sensörü, EGR kurumlanması ve triger bakım geçmişi kontrol edilmelidir.",
            typicalOnset: "180.000 km sonrası",
            costLevel: "Orta",
            sourceNote: "VW 1.9 TDI alım rehberleri ve Bora/Golf forumlarında tekrar eden kontrol başlıkları.",
          },
        ],
      },
    ],
  },
  {
    brand: "Volkswagen",
    model: "Jetta",
    generation: "A5/A6",
    yearFrom: 2005,
    yearTo: 2018,
    engines: [
      {
        engineLabel: "1.4 TSI EA111",
        fuelType: "Benzin",
        yearFrom: 2007,
        yearTo: 2014,
        issues: [
          {
            id: "vw-jetta-14tsi-ea111-chain",
            severity: "high",
            title: "EA111 zincir gergisi ve turbo/kompresör ekipmanı riski",
            detail:
              "Erken 1.4 TSI Jetta'larda zincir uzaması/gergi arızası, turbo wastegate ve çift şarjlı versiyonlarda ek mekanik riskler kontrol edilmelidir.",
            typicalOnset: "60.000-120.000 km",
            costLevel: "Yüksek",
            sourceNote:
              "VW EA111 TSI teknik kaynakları, Jetta/Golf forumları ve bağımsız servis kayıtlarında iyi belgelenmiş risk.",
          },
        ],
      },
      {
        engineLabel: "1.2 TSI EA111",
        fuelType: "Benzin",
        yearFrom: 2011,
        yearTo: 2015,
        issues: [
          {
            id: "vw-jetta-12tsi-chain-turbo",
            severity: "medium",
            title: "Zincir sesi, turbo aktüatör ve bobin kontrolü",
            detail:
              "1.2 TSI EA111'de soğuk çalıştırmada zincir sesi, turbo aktüatör boşluğu ve bobin/buji teklemesi alımda kontrol edilmeli.",
            typicalOnset: "70.000-130.000 km",
            costLevel: "Orta",
            sourceNote: "EA111 1.2 TSI kullanıcı forumları ve VW servis kayıtlarında tekrar eden bulgular.",
          },
        ],
      },
      {
        engineLabel: "1.6 MPI",
        fuelType: "Benzin",
        transmission: "Manuel",
        yearFrom: 2005,
        yearTo: 2014,
        issues: [
          {
            id: "vw-jetta-16mpi-lpg-auto",
            severity: "medium",
            title: "LPG montajı, boğaz kelebeği ve otomatik şanzıman kontrolü",
            detail:
              "1.6 MPI basit kabul edilir; LPG'li örneklerde subap/ayar, boğaz kelebeği ve otomatik versiyonlarda geçiş/vuruntu kontrol edilmelidir.",
            typicalOnset: "Yaş ve LPG kullanımına bağlı",
            costLevel: "Orta",
            sourceNote: "Jetta 1.6 MPI kullanıcı forumları ve LPG servis deneyimlerinde tekrar eden kontrol kalemi.",
          },
        ],
      },
      {
        engineLabel: "1.6 TDI EA189/EA288",
        fuelType: "Dizel",
        yearFrom: 2010,
        yearTo: 2018,
        issues: [
          {
            id: "vw-jetta-16tdi-egr-dpf-injector",
            severity: "medium",
            title: "EGR/DPF, enjektör ve triger bakım geçmişi",
            detail:
              "1.6 TDI Jetta'da EGR/DPF kurumlanması, enjektör düzeltme değerleri ve triger kayışı bakım geçmişi kontrol edilmelidir.",
            typicalOnset: "120.000 km sonrası",
            costLevel: "Orta",
            sourceNote: "VW 1.6 TDI motor ailesi alım rehberleri ve kullanıcı forumlarında tekrar eden bulgu.",
          },
        ],
      },
      {
        engineLabel: "DSG DQ200",
        fuelType: "Benzin",
        transmission: "Yarı otomatik",
        yearFrom: 2011,
        yearTo: 2018,
        issues: [
          {
            id: "vw-jetta-dq200-mechatronic",
            severity: "high",
            title: "DQ200 kuru kavrama mekatronik/kavrama arızası",
            detail:
              "1.2/1.4 TSI DSG Jetta'larda kalkış titremesi, vites geçiş gecikmesi, mekatronik arızası ve kavrama aşınması özellikle dur-kalk trafikte kontrol edilmeli.",
            typicalOnset: "60.000-120.000 km",
            costLevel: "Yüksek",
            sourceNote:
              "VW DQ200 DSG kullanıcı şikayetleri ve şanzıman servis kayıtlarında yaygın, iyi belgelenmiş risk.",
          },
        ],
      },
    ],
  },
  {
    brand: "Volkswagen",
    model: "Caddy",
    yearFrom: 2004,
    yearTo: 2026,
    generalNote:
      "Ticari/filo kullanımı yaygın olduğu için gerçek kullanım tipi, yük geçmişi, şanzıman ve dizel emisyon sistemi motor kadar önemlidir.",
    engines: [
      {
        engineLabel: "1.9 TDI",
        fuelType: "Dizel",
        transmission: "Manuel",
        yearFrom: 2004,
        yearTo: 2010,
        issues: [
          {
            id: "vw-caddy-19tdi-turbo-flywheel",
            severity: "medium",
            title: "Turbo geometri, debriyaj/volan ve enjektör tesisatı",
            detail:
              "1.9 TDI Caddy dayanıklı kabul edilir; ticari kullanımda turbo geometri, çift kütleli volan/debriyaj ve enjektör tesisatı kontrol edilmeli.",
            typicalOnset: "180.000 km sonrası",
            costLevel: "Orta",
            sourceNote: "VW 1.9 TDI ve Caddy kullanıcı forumlarında tekrar eden ticari kullanım bulguları.",
          },
        ],
      },
      {
        engineLabel: "1.6 TDI",
        fuelType: "Dizel",
        yearFrom: 2010,
        yearTo: 2015,
        issues: [
          {
            id: "vw-caddy-16tdi-egr-injector",
            severity: "medium",
            title: "EGR/DPF ve enjektör kontrolü",
            detail:
              "1.6 TDI Caddy'de kısa mesafe/filo kullanımı EGR, DPF ve enjektör sorunlarını öne çıkarır; triger bakım faturası aranmalıdır.",
            typicalOnset: "120.000 km sonrası",
            costLevel: "Orta",
            sourceNote: "VW 1.6 TDI ailesi ve Caddy kullanıcı kayıtlarında tekrar eden bulgular.",
          },
        ],
      },
      {
        engineLabel: "2.0 TDI",
        fuelType: "Dizel",
        yearFrom: 2015,
        yearTo: 2026,
        issues: [
          {
            id: "vw-caddy-20tdi-adblue-dsg",
            severity: "medium",
            title: "AdBlue/EGR/DPF ve DSG bakım kontrolü",
            detail:
              "Yeni Caddy 2.0 TDI'da AdBlue sistemi, EGR/DPF, turbo ve DSG varsa yağ-bakım/adaptasyon geçmişi kontrol edilmeli.",
            typicalOnset: "100.000 km sonrası",
            costLevel: "Orta",
            sourceNote:
              "EA288 2.0 TDI ve VW ticari kullanıcı forumlarında tekrar eden emisyon/şanzıman kontrol başlığı.",
          },
        ],
      },
      {
        engineLabel: "1.2/1.4 TSI",
        fuelType: "Benzin",
        yearFrom: 2010,
        yearTo: 2020,
        issues: [
          {
            id: "vw-caddy-tsi-chain-dq200",
            severity: "medium",
            title: "TSI zincir/turbo ve DSG varsa DQ200 kontrolü",
            detail:
              "Benzinli TSI Caddy'lerde erken EA111 zincir sesi, turbo aktüatör ve DSG'li versiyonda kuru kavrama davranışı kontrol edilmelidir.",
            typicalOnset: "80.000-130.000 km",
            costLevel: "Orta",
            sourceNote: "VW TSI/DSG ailesi kronik bulgularının Caddy kullanıcı deneyimleriyle örtüşen kontrol başlığı.",
          },
        ],
      },
    ],
  },
  {
    brand: "Volkswagen",
    model: "Tiguan",
    yearFrom: 2007,
    yearTo: 2026,
    engines: [
      {
        engineLabel: "1.4 TSI EA111",
        fuelType: "Benzin",
        yearFrom: 2007,
        yearTo: 2015,
        issues: [
          {
            id: "vw-tiguan-14tsi-ea111-chain-piston",
            severity: "high",
            title: "EA111 zincir gergisi, piston/segman ve turbo-kompresör sistemi",
            detail:
              "İlk nesil Tiguan 1.4 TSI'da zincir/gergi, yağ tüketimi, piston/segman ve çift şarjlı versiyonlarda turbo-kompresör ekipmanı yüksek maliyetli risk oluşturabilir.",
            typicalOnset: "70.000-130.000 km",
            costLevel: "Yüksek",
            sourceNote:
              "VW 1.4 TSI EA111 teknik kaynakları ve Tiguan/Golf forumlarında tekrar eden iyi belgelenmiş risk.",
          },
        ],
      },
      {
        engineLabel: "1.5 TSI EA211 evo",
        fuelType: "Benzin",
        transmission: "Yarı otomatik",
        yearFrom: 2018,
        yearTo: 2026,
        issues: [
          {
            id: "vw-tiguan-15tsi-dq200-kangaroo",
            severity: "medium",
            title: "1.5 TSI düşük hız silkelenmesi ve DSG kavrama kontrolü",
            detail:
              "1.5 TSI Tiguan'da düşük hız silkelenmesi/yazılım güncellemesi ve DSG kavrama davranışı test sürüşünde kontrol edilmeli.",
            typicalOnset: "Düşük km'de dahi görülebilir",
            costLevel: "Orta",
            sourceNote:
              "VW Grubu 1.5 TSI kullanıcı forumları ve teknik yazılım güncelleme kayıtlarında tekrar eden bulgu.",
          },
        ],
      },
      {
        engineLabel: "2.0 TDI",
        fuelType: "Dizel",
        transmission: "Yarı otomatik",
        yearFrom: 2008,
        yearTo: 2026,
        issues: [
          {
            id: "vw-tiguan-20tdi-egr-dsg4motion",
            severity: "medium",
            title: "EGR/DPF, DSG DQ250/DQ381 ve 4Motion Haldex bakımı",
            detail:
              "2.0 TDI Tiguan'da EGR/DPF, turbo, DSG yağ bakımı ve 4Motion Haldex yağ/filtre bakımı ihmal edilirse yüksek maliyet doğabilir.",
            typicalOnset: "120.000 km sonrası",
            costLevel: "Yüksek",
            sourceNote:
              "VW 2.0 TDI, DSG ve Haldex servis kaynakları ile Tiguan kullanıcı forumlarında tekrar eden kontrol başlığı.",
          },
        ],
      },
    ],
  },
  {
    brand: "Volkswagen",
    model: "T-Cross",
    yearFrom: 2019,
    yearTo: 2026,
    engines: [
      {
        engineLabel: "1.0 TSI",
        fuelType: "Benzin",
        transmission: "Yarı otomatik",
        yearFrom: 2019,
        yearTo: 2026,
        issues: [
          {
            id: "vw-tcross-10tsi-dq200",
            severity: "medium",
            title: "1.0 TSI turbo/soğutma ve DQ200 kavrama kontrolü",
            detail:
              "T-Cross 1.0 TSI'da turbo sesi, su pompası/soğutma kaçakları, bobin/buji ve DSG'li araçta DQ200 kavrama davranışı kontrol edilmeli.",
            typicalOnset: "80.000 km sonrası",
            costLevel: "Orta",
            sourceNote: "VW 1.0 TSI ve DQ200 DSG kullanıcı/servis kayıtlarında tekrar eden bulgular.",
          },
        ],
      },
    ],
  },
  {
    brand: "Volkswagen",
    model: "T-Roc",
    yearFrom: 2017,
    yearTo: 2026,
    engines: [
      {
        engineLabel: "1.5 TSI",
        fuelType: "Benzin",
        transmission: "Yarı otomatik",
        yearFrom: 2017,
        yearTo: 2026,
        issues: [
          {
            id: "vw-troc-15tsi-dq200",
            severity: "medium",
            title: "1.5 TSI silkelenme, su pompası ve DSG kavrama kontrolü",
            detail:
              "T-Roc 1.5 TSI'da düşük hız silkelenmesi, soğutma/su pompası kaçakları ve DSG kavrama-mekatronik davranışı kontrol edilmelidir.",
            typicalOnset: "60.000-120.000 km",
            costLevel: "Orta",
            sourceNote:
              "VW 1.5 TSI ve DSG kullanıcı forumları ile bağımsız servis kayıtlarında tekrar eden kontrol başlığı.",
          },
        ],
      },
      {
        engineLabel: "1.0 TSI",
        fuelType: "Benzin",
        transmission: "Manuel",
        yearFrom: 2017,
        yearTo: 2026,
        issues: [
          {
            id: "vw-troc-10tsi-turbo-cooling",
            severity: "low",
            title: "Turbo, bobin ve soğutma sistemi kontrolü",
            detail:
              "1.0 TSI T-Roc'ta turbo sesi, bobin/buji teklemesi ve su pompası/soğutma kaçakları alımda kontrol edilmelidir.",
            typicalOnset: "90.000 km sonrası",
            costLevel: "Orta",
            sourceNote: "VW 1.0 TSI motor ailesi servis ve kullanıcı kayıtlarında tekrar eden bulgular.",
          },
        ],
      },
    ],
  },
  {
    brand: "Volkswagen",
    model: "Touran",
    yearFrom: 2003,
    yearTo: 2020,
    engines: [
      {
        engineLabel: "1.4 TSI EA111",
        fuelType: "Benzin",
        yearFrom: 2006,
        yearTo: 2015,
        issues: [
          {
            id: "vw-touran-14tsi-chain-dsg",
            severity: "high",
            title: "EA111 zincir/gergi ve DSG DQ200 riski",
            detail:
              "Touran 1.4 TSI'da zincir gergisi, yağ tüketimi ve DSG'li araçlarda DQ200 kavrama/mekatronik kontrolü yapılmalıdır.",
            typicalOnset: "70.000-130.000 km",
            costLevel: "Yüksek",
            sourceNote: "VW EA111 TSI ve DQ200 DSG teknik/kullanıcı kayıtlarında tekrar eden risk.",
          },
        ],
      },
      {
        engineLabel: "1.6 TDI",
        fuelType: "Dizel",
        yearFrom: 2010,
        yearTo: 2020,
        issues: [
          {
            id: "vw-touran-16tdi-egr-dpf",
            severity: "medium",
            title: "EGR/DPF ve enjektör kontrolü",
            detail:
              "Aile aracı/kısa mesafe kullanımında 1.6 TDI Touran EGR/DPF ve enjektör sorunlarına açıktır; triger kaydı aranmalıdır.",
            typicalOnset: "120.000 km sonrası",
            costLevel: "Orta",
            sourceNote: "VW 1.6 TDI motor ailesi ve Touran kullanıcı forumlarında tekrar eden bulgu.",
          },
        ],
      },
      {
        engineLabel: "2.0 TDI DSG",
        fuelType: "Dizel",
        transmission: "Yarı otomatik",
        yearFrom: 2003,
        yearTo: 2020,
        issues: [
          {
            id: "vw-touran-20tdi-dsg",
            severity: "medium",
            title: "2.0 TDI emisyon sistemi ve DSG yağ bakım geçmişi",
            detail:
              "2.0 TDI Touran'da EGR/DPF, turbo, DSG yağ bakım geçmişi ve yüksek km'de volan/kavrama kontrol edilmeli.",
            typicalOnset: "140.000 km sonrası",
            costLevel: "Yüksek",
            sourceNote: "VW 2.0 TDI ve DSG servis kayıtlarında tekrar eden kontrol başlığı.",
          },
        ],
      },
    ],
  },
  {
    brand: "Volkswagen",
    model: "Transporter",
    generation: "T5/T6/T6.1",
    yearFrom: 2003,
    yearTo: 2026,
    generalNote:
      "Ticari, servis ve uzun yol kullanımı çok değişken olduğu için motor kadar şasi, kilometre tutarlılığı, DSG, 4Motion ve yük/çekme geçmişi önemlidir.",
    engines: [
      {
        engineLabel: "1.9 TDI",
        fuelType: "Dizel",
        transmission: "Manuel",
        yearFrom: 2003,
        yearTo: 2009,
        issues: [
          {
            id: "vw-transporter-19tdi-turbo-dmf",
            severity: "medium",
            title: "Turbo, debriyaj/volan ve yüksek km yıpranması",
            detail:
              "1.9 TDI T5 dayanıklı kabul edilir; ancak yüksek km'de turbo, volan/debriyaj, soğutma kaçakları ve kilometre tutarlılığı kontrol edilmelidir.",
            typicalOnset: "200.000 km sonrası",
            costLevel: "Orta",
            sourceNote:
              "VW Transporter T5 kullanıcı forumları ve ticari araç servis kayıtlarında tekrar eden bulgular.",
          },
        ],
      },
      {
        engineLabel: "2.0 TDI",
        fuelType: "Dizel",
        yearFrom: 2010,
        yearTo: 2026,
        issues: [
          {
            id: "vw-transporter-20tdi-egr-turbo",
            severity: "medium",
            title: "EGR/DPF, turbo ve yağ tüketimi kontrolü",
            detail:
              "2.0 TDI Transporter'da EGR soğutucu, DPF, turbo, yağ tüketimi ve AdBlue sistemi kontrol edilmeli; ticari kullanım masrafı büyütebilir.",
            typicalOnset: "140.000 km sonrası",
            costLevel: "Yüksek",
            sourceNote: "EA189/EA288 2.0 TDI ve Transporter T5/T6 servis/kullanıcı kayıtlarında tekrar eden bulgular.",
          },
        ],
      },
      {
        engineLabel: "DSG / 4Motion",
        fuelType: "Dizel",
        transmission: "Yarı otomatik",
        yearFrom: 2010,
        yearTo: 2026,
        issues: [
          {
            id: "vw-transporter-dsg-4motion",
            severity: "medium",
            title: "DSG yağ bakımı ve 4Motion Haldex/diferansiyel kontrolü",
            detail:
              "DSG Transporter'da yağ/filtre bakım geçmişi, kavrama adaptasyonu; 4Motion varsa Haldex ve diferansiyel yağ bakımı mutlaka kontrol edilmelidir.",
            typicalOnset: "120.000 km sonrası",
            costLevel: "Yüksek",
            sourceNote:
              "VW ticari DSG/4Motion servis kayıtları ve Transporter kullanıcı forumlarında tekrar eden kontrol başlığı.",
          },
        ],
      },
    ],
  },
];
