import type { ModelEntry } from "../types";

// Kaynaklar: 2024-2026 ikinci el pazar raporlarıyla Türkiye'de öne çıkan
// premium/ithal markalar, bağımsız servis teknik notları, model bazlı alım
// rehberleri ve tekrar eden kullanıcı/uzman kayıtları. Paket/donanım adı
// yalnızca mekanik farkı kanıtlandığında kullanılır; çoğu sorun motor,
// şanzıman ve üretim yılına bağlıdır.
export const PREMIUM_VOLVO_SUZUKI_ENTRIES: ModelEntry[] = [
  {
    brand: "BMW",
    model: "3 Serisi",
    generation: "E90/E91/E92 (2005-2012), F30/F31 (2012-2019)",
    yearFrom: 2005,
    yearTo: 2019,
    generalNote:
      "Türkiye ikinci elde özellikle 316i/320i/320d varyantları sık görülür. Kronik riskler kasa adından çok motor kodu ve şanzıman bakım geçmişine bağlıdır.",
    engines: [
      {
        engineLabel: "N47 2.0d",
        fuelType: "Dizel",
        yearFrom: 2007,
        yearTo: 2015,
        reliabilityNote:
          "N47 dizel motor E90 son dönem ve F30 erken dönem 316d/318d/320d araçlarda görülür; B47 sonrası risk belirgin şekilde azalır.",
        issues: [
          {
            id: "bmw-3-n47-timing-chain",
            severity: "high",
            title: "Arkadan konumlu triger zinciri uzaması/kopması",
            detail:
              "N47'de zincir motorun arka tarafındadır; soğuk çalıştırmada metalik sürtme/rattle, kam-krank zamanlama hatası ve zincir koparsa ağır motor hasarı riski vardır. Değişim işçiliği yüksek olduğu için alımda zincir sesi ve değişim faturası özellikle aranmalı.",
            typicalOnset: "120.000-190.000 km; bazı bakımsız örneklerde daha erken",
            costLevel: "Yüksek",
            sourceNote:
              "ClickMechanic BMW 3 Series, CarHealth F30 rehberi, Autoza 3 Series buyer guide ve BMW N47 teknik/kullanıcı kayıtlarında tekrar eden yüksek öncelikli risk.",
          },
          {
            id: "bmw-3-n47-egr-dpf",
            severity: "medium",
            title: "EGR/DPF ve emme kurumlanması",
            detail:
              "Kısa mesafe kullanılan dizellerde EGR valfi/soğutucu, DPF doluluk ve emme manifoldu kurumlanması güç düşüşü, sık rejenerasyon ve arıza lambasına yol açabilir.",
            typicalOnset: "120.000 km sonrası",
            costLevel: "Orta",
            sourceNote:
              "BMW dizel bağımsız servis kaynakları ve model bazlı alım rehberlerinde tekrar eden bakım riski.",
          },
        ],
      },
      {
        engineLabel: "B47 2.0d",
        fuelType: "Dizel",
        yearFrom: 2015,
        yearTo: 2019,
        reliabilityNote:
          "B47, N47'ye göre daha güvenilir kabul edilir; yine de zincir sesi, EGR/DPF ve yağ bakım geçmişi kontrol edilmelidir.",
        issues: [
          {
            id: "bmw-3-b47-egr-nox",
            severity: "medium",
            title: "EGR/NOx sensörü ve emisyon sistemi arızaları",
            detail:
              "B47 motorlu F30/F31 dizellerde EGR, NOx sensörü ve DPF/emisyon sistemi arızaları yüksek kilometrede masraf çıkarabilir. N47 zincir riskiyle aynı seviyede kronik kabul edilmez.",
            typicalOnset: "120.000-180.000 km",
            costLevel: "Orta",
            sourceNote:
              "BMW F30 320d alım rehberleri B47'yi daha sağlam, fakat EGR/NOx/DPF bakımını kritik olarak listeler.",
          },
        ],
      },
      {
        engineLabel: "N13 1.6 Turbo",
        fuelType: "Benzin",
        yearFrom: 2012,
        yearTo: 2015,
        issues: [
          {
            id: "bmw-3-n13-chain-vanos",
            severity: "medium",
            title: "Zincir/VANOS ve soğutma sistemi hassasiyeti",
            detail:
              "316i/320i EfficientDynamics gibi N13 motorlu araçlarda zincir sesi, VANOS/valvetronic arızaları ve soğutma kaçakları yüksek kilometrede masraf çıkarabilir. Düzenli yağ değişimi ve hararet geçmişi kritik.",
            typicalOnset: "100.000 km sonrası",
            costLevel: "Orta",
            sourceNote:
              "BMW bağımsız servis ve kullanıcı kayıtlarında N13 için zincir/VANOS/soğutma hassasiyetleri tekrar eder.",
          },
        ],
      },
    ],
  },
  {
    brand: "BMW",
    model: "5 Serisi",
    generation: "F10/F11 (2010-2017), G30 (2017-2023)",
    yearFrom: 2010,
    yearTo: 2023,
    generalNote:
      "Türkiye'de 520d ağırlıklıdır. Risk, 3 Serisi ile paylaşılan N47/B47 dizel motor ailesi ve otomatik şanzıman bakım geçmişine bağlıdır.",
    engines: [
      {
        engineLabel: "N47 2.0d",
        fuelType: "Dizel",
        transmission: "Otomatik",
        yearFrom: 2010,
        yearTo: 2015,
        issues: [
          {
            id: "bmw-5-n47-chain",
            severity: "high",
            title: "N47 triger zinciri ve yüksek işçilikli motor arızası riski",
            detail:
              "F10 520d erken dönem N47 motorlarda 3 Serisi ile aynı arkadan zincir mimarisi bulunur. Soğuk start zincir sesi, yağ bakım aralığı ve değişim faturası mutlaka doğrulanmalı.",
            typicalOnset: "120.000-190.000 km",
            costLevel: "Yüksek",
            sourceNote:
              "N47 motor ailesi için BMW 3/5 Serisi alım rehberleri ve bağımsız servis kayıtlarında tekrar eden bulgu.",
          },
        ],
      },
      {
        engineLabel: "ZF 8HP otomatik",
        fuelType: "Dizel",
        transmission: "Otomatik",
        yearFrom: 2010,
        yearTo: 2023,
        reliabilityNote:
          "ZF 8HP genel olarak sağlamdır; 'ömürlük yağ' algısına rağmen yüksek kilometrede yağ/filtre bakımı ihmal edilmişse sarsıntılı geçiş ve tork konvertörü şikayetleri görülebilir.",
        issues: [
          {
            id: "bmw-5-zf8-service",
            severity: "medium",
            title: "ZF 8HP yağ bakım geçmişi belirsizliği",
            detail:
              "Geçişte vuruntu, gecikme veya lock-up titreşimi varsa yağ/filtre bakım geçmişi, adaptasyon ve mekatronik contaları kontrol edilmeli. Sorun paket seviyesine değil kullanım/bakım geçmişine bağlıdır.",
            typicalOnset: "120.000 km sonrası",
            costLevel: "Orta",
            sourceNote:
              "ZF 8HP uzman servisleri ve BMW alım rehberlerinde bakım geçmişi kritik kontrol kalemi olarak tekrar eder.",
          },
        ],
      },
    ],
  },
  {
    brand: "Mercedes-Benz",
    model: "C Serisi",
    generation: "W204 (2007-2014), W205 (2014-2021)",
    yearFrom: 2007,
    yearTo: 2021,
    generalNote:
      "Türkiye'de C180/C200 benzinli ve C200d/C220d dizel varyantları yaygındır. AMG/Avantgarde/Exclusive paket farkı çoğunlukla donanımdır; mekanik risk motor ve şanzımanla ayrılır.",
    engines: [
      {
        engineLabel: "M271 CGI/Kompressor",
        fuelType: "Benzin",
        yearFrom: 2007,
        yearTo: 2014,
        issues: [
          {
            id: "mercedes-c-m271-chain",
            severity: "high",
            title: "M271 triger zinciri ve eksantrik dişlisi aşınması",
            detail:
              "W204 C180/C200/C250 benzinli M271 motorlarda soğuk çalıştırmada metalik rattle, P0016/P0017 benzeri zamanlama hataları ve ilerlerse zincir atlama riski bildirilir.",
            typicalOnset: "120.000-150.000 km",
            costLevel: "Yüksek",
            sourceNote:
              "Autodoc W204 problem rehberi, CarChecker C250 W204 raporu ve Mercedes bağımsız servis kayıtlarında tekrar eden ciddi zayıf nokta.",
          },
        ],
      },
      {
        engineLabel: "OM651 2.1 CDI",
        fuelType: "Dizel",
        yearFrom: 2009,
        yearTo: 2018,
        issues: [
          {
            id: "mercedes-c-om651-injector-chain",
            severity: "medium",
            title: "OM651 enjektör, zincir ve EGR/DPF masraf riski",
            detail:
              "Erken OM651 dizellerde enjektör arızası, yüksek kilometrede zincir sesi ve EGR/DPF problemleri raporlanır. Soğuk çalışma, enjektör düzeltme değerleri ve emisyon sistemi kontrol edilmelidir.",
            typicalOnset: "120.000 km sonrası",
            costLevel: "Orta",
            sourceNote:
              "Ammstar Mercedes common problems ve model bazlı Mercedes DTC/servis kaynaklarında OM651 enjektör/zincir/emisyon bulguları tekrar eder.",
          },
        ],
      },
      {
        engineLabel: "7G-Tronic",
        fuelType: "Benzin",
        transmission: "Otomatik",
        yearFrom: 2007,
        yearTo: 2018,
        issues: [
          {
            id: "mercedes-c-7g-conductor-plate",
            severity: "medium",
            title: "7G-Tronic beyin/conductor plate ve yağ soğutucu kontrolü",
            detail:
              "Vites geçişinde vuruntu, acil moda geçme ve sensör hata kodları conductor plate/valf gövdesi kaynaklı olabilir. Yağ soğutucu ve şanzıman yağı bakımı kontrol edilmeli.",
            typicalOnset: "120.000 km sonrası",
            costLevel: "Orta",
            sourceNote:
              "Autodoc W204 problem rehberi 7G-Tronic yağ soğutucu/şanzıman riskini, bağımsız Mercedes servisleri conductor plate arızasını tekrar eder.",
          },
        ],
      },
    ],
  },
  {
    brand: "Mercedes-Benz",
    model: "E Serisi",
    generation: "W212 (2009-2016), W213 (2016-2023)",
    yearFrom: 2009,
    yearTo: 2023,
    generalNote:
      "Türkiye'de E180/E200 benzinli ve E220 CDI/d dizel yaygındır. Ağır kasa, yüksek kilometre ve bakım geçmişi kronik risklerin maliyetini artırır.",
    engines: [
      {
        engineLabel: "OM651 2.1 CDI",
        fuelType: "Dizel",
        transmission: "Otomatik",
        yearFrom: 2009,
        yearTo: 2016,
        issues: [
          {
            id: "mercedes-e-om651-injector-egr",
            severity: "medium",
            title: "OM651 enjektör/EGR/DPF ve zincir sesi kontrolü",
            detail:
              "W212 E220 CDI gibi OM651 dizellerde yüksek kilometrede enjektör düzeltmeleri, EGR/DPF tıkanması ve zincir sesi masraf çıkarabilir. Uzun yol geçmişi avantaj, kısa mesafe kullanımı dezavantajdır.",
            typicalOnset: "150.000 km sonrası",
            costLevel: "Orta",
            sourceNote:
              "Mercedes OM651 common problem kaynakları ve W212/W204 bağımsız servis notlarında tekrar eden bulgular.",
          },
        ],
      },
    ],
  },
  {
    brand: "Audi",
    model: "A3",
    generation: "8P (2003-2012), 8V (2012-2020)",
    yearFrom: 2003,
    yearTo: 2020,
    generalNote:
      "A3, Golf/Leon/Octavia ile çok sayıda VAG motor ve DSG bileşenini paylaşır. Risk motor ailesi ve S tronic/DSG tipine göre ayrılmalıdır.",
    engines: [
      {
        engineLabel: "1.4 TFSI / TSI",
        fuelType: "Benzin",
        yearFrom: 2008,
        yearTo: 2020,
        issues: [
          {
            id: "audi-a3-14tfsi-oil-chain",
            severity: "medium",
            title: "TFSI yağ tüketimi ve zincir/gerdirici kontrolü",
            detail:
              "1.4 TFSI/TFSI ailesinde yağ tüketimi, soğuk start zincir sesi ve turbo/wastegate şikayetleri raporlanır. Motor kodu ve üretim yılına göre risk seviyesi değişir.",
            typicalOnset: "80.000-140.000 km",
            costLevel: "Orta",
            sourceNote:
              "ClickMechanic Audi A3 common problems ve Automotive24 A3 8V sorun derlemesinde TFSI yağ tüketimi ve zincir/DSG riskleri tekrar eder.",
          },
        ],
      },
      {
        engineLabel: "1.6 TDI",
        fuelType: "Dizel",
        yearFrom: 2009,
        yearTo: 2020,
        issues: [
          {
            id: "audi-a3-16tdi-egr-dpf-injector",
            severity: "medium",
            title: "EGR/DPF ve enjektör hassasiyeti",
            detail:
              "VAG 1.6 TDI ailesinde kısa mesafe kullanımda EGR/DPF tıkanması, bazı dönemlerde enjektör arızası ve emme kurumlanması görülebilir.",
            typicalOnset: "100.000-160.000 km",
            costLevel: "Orta",
            sourceNote:
              "VAG 1.6 TDI ailesi için A3/Golf/Leon platform kaynaklarında tekrar eden dizel emisyon/enjektör bulguları.",
          },
        ],
      },
      {
        engineLabel: "S tronic / DSG7 DQ200",
        fuelType: "Benzin",
        transmission: "Yarı otomatik",
        yearFrom: 2008,
        yearTo: 2019,
        issues: [
          {
            id: "audi-a3-dq200-mechatronic",
            severity: "high",
            title: "DQ200 mekatronik ve kuru kavrama arızaları",
            detail:
              "Kalkışta titreme, vites geçişinde vuruntu/gecikme, no drive/reverse, EPC/şanzıman lambası ve mekatronik iletişim hataları A3 S tronic/DQ200 araçlarda sık raporlanır.",
            typicalOnset: "60.000-120.000 km",
            costLevel: "Yüksek",
            sourceNote:
              "ECU Testing Audi A3 DSG7 common fault ve bağımsız DSG uzman kaynaklarında mekatronik arızası tekrar eder.",
          },
        ],
      },
    ],
  },
  {
    brand: "Audi",
    model: "A4",
    generation: "B8 (2008-2015), B9 (2015-2023)",
    yearFrom: 2008,
    yearTo: 2023,
    generalNote:
      "A4'te 1.8/2.0 TFSI yağ tüketimi ve 2.0 TDI EGR/DPF riskleri öne çıkar; Multitronic/S tronic ayrımı şanzıman açısından önemlidir.",
    engines: [
      {
        engineLabel: "1.8/2.0 TFSI EA888 Gen2",
        fuelType: "Benzin",
        yearFrom: 2008,
        yearTo: 2015,
        issues: [
          {
            id: "audi-a4-ea888-oil-chain",
            severity: "high",
            title: "EA888 yağ tüketimi ve zincir gerdirici riski",
            detail:
              "B8 döneminde 1.8/2.0 TFSI motorlarda piston segmanı kaynaklı yağ tüketimi ve eski tip zincir gerdirici riski bilinir. Yağ eksiltme geçmişi ve gerdirici revizyonu sorgulanmalı.",
            typicalOnset: "80.000-140.000 km",
            costLevel: "Yüksek",
            sourceNote:
              "Audi/VW EA888 teknik servis ve kullanıcı kaynaklarında B8 TFSI yağ tüketimi/zincir bulgusu tekrarlanır.",
          },
        ],
      },
      {
        engineLabel: "2.0 TDI",
        fuelType: "Dizel",
        yearFrom: 2008,
        yearTo: 2023,
        issues: [
          {
            id: "audi-a4-20tdi-egr-dpf",
            severity: "medium",
            title: "2.0 TDI EGR/DPF ve soğutma sistemi kontrolü",
            detail:
              "Yüksek kilometrede EGR soğutucu/valf, DPF doluluk, turbo aktüatör ve soğutma kaçakları masraf çıkarabilir. Bakım geçmişi ve uzun yol kullanımı kritik.",
            typicalOnset: "140.000 km sonrası",
            costLevel: "Orta",
            sourceNote:
              "Audi/VAG 2.0 TDI platform kaynakları ve A3/A4 alım rehberlerinde tekrar eden emisyon/soğutma kontrolleri.",
          },
        ],
      },
    ],
  },
  {
    brand: "Volvo",
    model: "V40",
    generation: "P1/V40 (2012-2019)",
    yearFrom: 2012,
    yearTo: 2019,
    generalNote:
      "Türkiye'de D2/D3/D4 dizel ve T3/T4 benzinli versiyonlar görülür. Motor kaynağı ve şanzıman tipi yıllara göre değiştiği için ilan metni dikkatle okunmalı.",
    engines: [
      {
        engineLabel: "D2 1.6 dizel",
        fuelType: "Dizel",
        yearFrom: 2012,
        yearTo: 2016,
        issues: [
          {
            id: "volvo-v40-d2-egr-dpf",
            severity: "medium",
            title: "D2 EGR/DPF ve kısa mesafe kullanım hassasiyeti",
            detail:
              "D2 dizellerde EGR tıkanması, DPF rejenerasyon problemleri ve yakıt/emisyon sistemi masrafları kısa mesafe kullanımda öne çıkar.",
            typicalOnset: "100.000 km sonrası",
            costLevel: "Orta",
            sourceNote:
              "Volvo kullanıcı deneyimleri ve bağımsız V40 alım rehberlerinde D2/EGR-DPF bulguları tekrar eder.",
          },
        ],
      },
      {
        engineLabel: "PowerShift çift kavrama",
        fuelType: "Dizel",
        transmission: "Yarı otomatik",
        yearFrom: 2012,
        yearTo: 2016,
        issues: [
          {
            id: "volvo-v40-powershift",
            severity: "high",
            title: "PowerShift sarsıntı/ısınma ve kavrama arızaları",
            detail:
              "PowerShift şanzımanda sarsıntılı geçiş, kalkışta titreme ve ısınma şikayetleri özellikle 1.6 dizel ve bazı 2.0T versiyonlarda raporlanır. Yağ bakım kaydı ve test sürüşü kritik.",
            typicalOnset: "50.000-100.000 km",
            costLevel: "Yüksek",
            sourceNote:
              "Autodoc Volvo V40 problem rehberi PowerShift arızalarını sık görülen zayıf nokta olarak listeler.",
          },
        ],
      },
    ],
  },
  {
    brand: "Volvo",
    model: "S60",
    generation: "P3 (2010-2018)",
    yearFrom: 2010,
    yearTo: 2018,
    engines: [
      {
        engineLabel: "D3/D4 dizel",
        fuelType: "Dizel",
        yearFrom: 2010,
        yearTo: 2018,
        issues: [
          {
            id: "volvo-s60-d3d4-egr",
            severity: "medium",
            title: "D3/D4 EGR ve emisyon sistemi masrafları",
            detail:
              "D3/D4 motorlarda EGR valfi/soğutucu ve DPF tarafı yüksek kilometrede masraf çıkarabilir; soğuk çalışma, arıza kodu ve servis kampanyaları kontrol edilmeli.",
            typicalOnset: "120.000 km sonrası",
            costLevel: "Orta",
            sourceNote: "Volvo kullanıcı kayıtlarında D4 EGR sorunu ve bağımsız servis tecrübeleri tekrar eder.",
          },
        ],
      },
    ],
  },
  {
    brand: "Suzuki",
    model: "Swift",
    generation: "ZC/ZD (2010-2017), A2L (2017-2023)",
    yearFrom: 2010,
    yearTo: 2023,
    generalNote:
      "Swift genel olarak basit ve sağlam kabul edilir; kronik riskler çoğunlukla CVT/otomatik bakım geçmişi, süspansiyon ve küçük elektrik/klima ekipmanlarıdır.",
    engines: [
      {
        engineLabel: "1.2 Dualjet / K12",
        fuelType: "Benzin",
        yearFrom: 2010,
        yearTo: 2023,
        reliabilityNote:
          "Belirgin ağır motor kroniği azdır; yağ bakımı, soğutma kaçakları ve zincir sesi standart kontrol kalemidir.",
        issues: [
          {
            id: "suzuki-swift-cvt-suspension",
            severity: "low",
            title: "CVT bakım geçmişi ve ön takım/süspansiyon sesleri",
            detail:
              "CVT'li araçlarda yağ bakım geçmişi, kalkışta titreme ve uğultu; yüksek kilometrede ön amortisör, salıncak burcu ve direksiyon/süspansiyon sesleri kontrol edilmeli.",
            typicalOnset: "80.000 km sonrası",
            costLevel: "Düşük",
            sourceNote:
              "Swift kullanıcı/alım rehberlerinde ağır motor kroniğinden çok CVT ve yürüyen aksam kontrolleri tekrar eder.",
          },
        ],
      },
    ],
  },
  {
    brand: "Suzuki",
    model: "Vitara",
    generation: "LY (2015-2023)",
    yearFrom: 2015,
    yearTo: 2023,
    generalNote:
      "Türkiye'de 1.6 atmosferik ve 1.4 Boosterjet versiyonları yaygındır. Genel güvenilirliği iyi; turbo/otomatik bakım geçmişi ve 4x4 aktarma kontrolü önemlidir.",
    engines: [
      {
        engineLabel: "1.4 Boosterjet",
        fuelType: "Benzin",
        yearFrom: 2016,
        yearTo: 2023,
        issues: [
          {
            id: "suzuki-vitara-boosterjet-turbo",
            severity: "low",
            title: "Turbo/soğutma ve otomatik şanzıman bakım geçmişi",
            detail:
              "1.4 Boosterjet ağır kronik arızasıyla öne çıkmaz; yine de turbo yağlama, soğutma kaçakları, otomatik şanzıman yağı ve 4x4 aktarma test sürüşü kontrol edilmeli.",
            typicalOnset: "100.000 km sonrası",
            costLevel: "Orta",
            sourceNote:
              "Vitara kullanıcı/alım rehberlerinde ağır motor kroniği yerine turbo/otomatik/aktarma bakım kontrolü öne çıkar.",
          },
        ],
      },
    ],
  },
  {
    brand: "BMW",
    model: "1 Serisi",
    generation: "E87/F20/F40",
    yearFrom: 2004,
    yearTo: 2026,
    engines: [
      {
        engineLabel: "N47 2.0d",
        fuelType: "Dizel",
        transmission: "Otomatik",
        yearFrom: 2007,
        yearTo: 2015,
        issues: [
          {
            id: "bmw-1-n47-chain",
            severity: "high",
            title: "N47 arkadan zincir uzaması/kopması",
            detail:
              "116d/118d/120d N47 motorlarda soğuk çalıştırmada zincir sesi, değişim faturası ve yağ bakım aralığı kritik; zincir kopması ağır motor hasarı yaratabilir.",
            typicalOnset: "120.000-190.000 km",
            costLevel: "Yüksek",
            sourceNote:
              "BMW N47 motor ailesi teknik kaynakları ve 1/3 Serisi kullanıcı forumlarında tekrar eden iyi belgelenmiş risk.",
          },
        ],
      },
      {
        engineLabel: "B37/B47 dizel",
        fuelType: "Dizel",
        transmission: "Otomatik",
        yearFrom: 2015,
        yearTo: 2026,
        issues: [
          {
            id: "bmw-1-b37-b47-egr",
            severity: "medium",
            title: "EGR/DPF/NOx ve otomatik şanzıman bakım kontrolü",
            detail:
              "Yeni dizellerde N47 zincir riski azalır; EGR/DPF/NOx, AdBlue varsa emisyon sistemi ve otomatik şanzıman bakım geçmişi kontrol edilmeli.",
            typicalOnset: "120.000 km sonrası",
            costLevel: "Orta",
            sourceNote:
              "BMW B37/B47 kullanıcı servis kayıtları ve dizel emisyon sistemi şikayetlerinde tekrar eden bulgu.",
          },
        ],
      },
      {
        engineLabel: "N13/B38/B48 benzin",
        fuelType: "Benzin",
        transmission: "Otomatik",
        yearFrom: 2011,
        yearTo: 2026,
        issues: [
          {
            id: "bmw-1-petrol-cooling-valvetronic",
            severity: "medium",
            title: "Soğutma, VANOS/Valvetronic ve turbo kontrolü",
            detail:
              "Benzinli 1 Serisi'nde N13 döneminde zincir/VANOS/Valvetronic, B38/B48 döneminde su pompası/termostat, bobin ve turbo-soğutma kontrol edilmeli.",
            typicalOnset: "90.000 km sonrası",
            costLevel: "Orta",
            sourceNote:
              "BMW N13/B38/B48 motor ailesi kullanıcı forumları ve bağımsız servis kayıtlarında tekrar eden bulgular.",
          },
        ],
      },
    ],
  },
  {
    brand: "BMW",
    model: "2 Serisi",
    generation: "F22/F45/F46/F44",
    yearFrom: 2014,
    yearTo: 2026,
    engines: [
      {
        engineLabel: "B37/B47 dizel",
        fuelType: "Dizel",
        transmission: "Otomatik",
        yearFrom: 2014,
        yearTo: 2026,
        issues: [
          {
            id: "bmw-2-b47-egr-dpf",
            severity: "medium",
            title: "EGR/DPF/NOx ve otomatik şanzıman kontrolü",
            detail:
              "218d/220d varyantlarında EGR, DPF, NOx/AdBlue ve otomatik şanzıman bakım geçmişi kontrol edilmeli; yüksek km'de turbo ve motor kulağı da izlenmeli.",
            typicalOnset: "120.000 km sonrası",
            costLevel: "Orta",
            sourceNote:
              "BMW B47 dizel servis kayıtları ve 2 Serisi kullanıcı forumlarında tekrar eden kontrol başlıkları.",
          },
        ],
      },
      {
        engineLabel: "B38/B48 benzin",
        fuelType: "Benzin",
        transmission: "Otomatik",
        yearFrom: 2014,
        yearTo: 2026,
        issues: [
          {
            id: "bmw-2-b38-b48-cooling",
            severity: "medium",
            title: "Soğutma sistemi, bobin ve turbo kontrolü",
            detail:
              "B38/B48 motorlarda su pompası/termostat, soğutma kaçakları, bobin/buji ve turbo yağlama kontrol edilmelidir.",
            typicalOnset: "100.000 km sonrası",
            costLevel: "Orta",
            sourceNote:
              "BMW B serisi motor kullanıcı forumları ve bağımsız servis kontrol listelerinde tekrar eden bulgular.",
          },
        ],
      },
    ],
  },
  {
    brand: "BMW",
    model: "4 Serisi",
    generation: "F32/F33/F36/G22",
    yearFrom: 2013,
    yearTo: 2026,
    engines: [
      {
        engineLabel: "N47/B47 2.0d",
        fuelType: "Dizel",
        transmission: "Otomatik",
        yearFrom: 2013,
        yearTo: 2026,
        issues: [
          {
            id: "bmw-4-diesel-chain-egr",
            severity: "medium",
            title: "N47 zincir dönemi ve B47 EGR/DPF kontrolü",
            detail:
              "Erken 420d N47'de zincir sesi/fatura; B47 döneminde EGR/DPF/NOx ve ZF otomatik bakım geçmişi kontrol edilmeli.",
            typicalOnset: "120.000 km sonrası",
            costLevel: "Yüksek",
            sourceNote: "BMW N47/B47 motor ailesi ve 3/4 Serisi kullanıcı kaynaklarında tekrar eden bulgular.",
          },
        ],
      },
      {
        engineLabel: "N20/B48 benzin",
        fuelType: "Benzin",
        transmission: "Otomatik",
        yearFrom: 2013,
        yearTo: 2026,
        issues: [
          {
            id: "bmw-4-n20-b48-chain-cooling",
            severity: "medium",
            title: "N20 zincir/yağ kaçağı ve B48 soğutma kontrolü",
            detail:
              "N20 döneminde zincir kılavuzu/yağ kaçağı, B48 döneminde soğutma sistemi, turbo ve bobin/buji kontrol edilmelidir.",
            typicalOnset: "100.000 km sonrası",
            costLevel: "Orta",
            sourceNote:
              "BMW N20/B48 kullanıcı forumları ve bağımsız servis kayıtlarında tekrar eden kontrol başlıkları.",
          },
        ],
      },
    ],
  },
  {
    brand: "BMW",
    model: "6 Serisi",
    generation: "E63/F12/F13/F06",
    yearFrom: 2003,
    yearTo: 2018,
    engines: [
      {
        engineLabel: "3.0d N57",
        fuelType: "Dizel",
        transmission: "Otomatik",
        yearFrom: 2011,
        yearTo: 2018,
        issues: [
          {
            id: "bmw-6-n57-egr-swirl",
            severity: "medium",
            title: "N57 EGR/DPF, swirl flap ve ZF bakım kontrolü",
            detail:
              "640d/630d N57'de EGR/DPF, swirl flap, turbo, yağ kaçağı ve ZF otomatik yağ bakım geçmişi kontrol edilmeli.",
            typicalOnset: "150.000 km sonrası",
            costLevel: "Yüksek",
            sourceNote: "BMW N57 motor ve 5/6 Serisi kullanıcı servis kayıtlarında tekrar eden bulgular.",
          },
        ],
      },
      {
        engineLabel: "V8 benzin N62/N63",
        fuelType: "Benzin",
        transmission: "Otomatik",
        yearFrom: 2003,
        yearTo: 2018,
        issues: [
          {
            id: "bmw-6-v8-valvestem-cooling",
            severity: "high",
            title: "V8 supap keçesi, soğutma ve turbo/yağ kaçağı masrafı",
            detail:
              "V8 6 Serisi'nde supap keçesi dumanı, soğutma kaçakları, yağ sızıntıları ve N63 turbo/ısı yönetimi yüksek maliyetli kontrol kalemleridir.",
            typicalOnset: "120.000 km sonrası",
            costLevel: "Yüksek",
            sourceNote:
              "BMW N62/N63 motor kullanıcı forumları ve bağımsız servis kayıtlarında tekrar eden pahalı riskler.",
          },
        ],
      },
    ],
  },
  {
    brand: "BMW",
    model: "7 Serisi",
    generation: "E65/F01/G11",
    yearFrom: 2001,
    yearTo: 2022,
    engines: [
      {
        engineLabel: "3.0d N57/B57",
        fuelType: "Dizel",
        transmission: "Otomatik",
        yearFrom: 2008,
        yearTo: 2022,
        issues: [
          {
            id: "bmw-7-diesel-airmatic-electronics",
            severity: "high",
            title: "Dizel emisyon, havalı süspansiyon ve elektronik donanım masrafı",
            detail:
              "7 Serisi'nde motor kadar havalı süspansiyon, aktif direksiyon, konfor elektronik donanımları, EGR/DPF/AdBlue ve ZF bakım geçmişi kritik.",
            typicalOnset: "120.000 km sonrası veya yaşa bağlı",
            costLevel: "Yüksek",
            sourceNote:
              "BMW 7 Serisi alım rehberleri ve bağımsız servis kayıtlarında tekrar eden yüksek maliyetli kontrol başlıkları.",
          },
        ],
      },
      {
        engineLabel: "V8/V12 benzin",
        fuelType: "Benzin",
        transmission: "Otomatik",
        yearFrom: 2001,
        yearTo: 2022,
        issues: [
          {
            id: "bmw-7-v8-v12-cooling-oil",
            severity: "high",
            title: "V8/V12 yağ kaçakları, soğutma ve valf keçesi kontrolü",
            detail:
              "V8/V12 7 Serisi'nde yağ kaçakları, supap keçesi dumanı, soğutma sistemi, yakıt sistemi ve elektronik donanım arızaları yüksek maliyetlidir.",
            typicalOnset: "100.000 km sonrası",
            costLevel: "Yüksek",
            sourceNote:
              "BMW V8/V12 motor servis kayıtları ve 7 Serisi kullanıcı forumlarında tekrar eden pahalı riskler.",
          },
        ],
      },
    ],
  },
  {
    brand: "BMW",
    model: "X1",
    generation: "E84/F48/U11",
    yearFrom: 2009,
    yearTo: 2026,
    engines: [
      {
        engineLabel: "N47/B47 dizel",
        fuelType: "Dizel",
        transmission: "Otomatik",
        yearFrom: 2009,
        yearTo: 2026,
        issues: [
          {
            id: "bmw-x1-diesel-chain-egr-xdrive",
            severity: "medium",
            title: "N47 zincir dönemi, B47 EGR/DPF ve xDrive kontrolü",
            detail:
              "Erken X1 N47'de zincir; yeni B47'de EGR/DPF/NOx, xDrive varsa transfer kutusu ve otomatik şanzıman bakım geçmişi kontrol edilmeli.",
            typicalOnset: "120.000 km sonrası",
            costLevel: "Yüksek",
            sourceNote: "BMW N47/B47 ve xDrive servis kayıtlarında tekrar eden bulgular.",
          },
        ],
      },
      {
        engineLabel: "B38/B48 benzin",
        fuelType: "Benzin",
        transmission: "Otomatik",
        yearFrom: 2015,
        yearTo: 2026,
        issues: [
          {
            id: "bmw-x1-petrol-cooling",
            severity: "medium",
            title: "Soğutma/turbo ve otomatik şanzıman kontrolü",
            detail:
              "Benzinli X1'de soğutma kaçakları, turbo sesi, bobin/buji ve otomatik şanzıman geçişleri kontrol edilmeli.",
            typicalOnset: "100.000 km sonrası",
            costLevel: "Orta",
            sourceNote: "BMW B38/B48 kullanıcı forumları ve X1 servis kayıtlarında tekrar eden kontrol başlıkları.",
          },
        ],
      },
    ],
  },
  {
    brand: "BMW",
    model: "X2",
    yearFrom: 2018,
    yearTo: 2026,
    engines: [
      {
        engineLabel: "B47 dizel",
        fuelType: "Dizel",
        transmission: "Otomatik",
        yearFrom: 2018,
        yearTo: 2026,
        issues: [
          {
            id: "bmw-x2-b47-egr-xdrive",
            severity: "medium",
            title: "EGR/DPF/NOx, xDrive ve otomatik şanzıman kontrolü",
            detail:
              "X2 B47 dizelde EGR/DPF/NOx, AdBlue, xDrive transfer ve otomatik şanzıman bakım kayıtları kontrol edilmeli.",
            typicalOnset: "100.000 km sonrası",
            costLevel: "Orta",
            sourceNote: "BMW B47/xDrive servis kayıtları ve X1/X2 kullanıcı deneyimleri.",
          },
        ],
      },
      {
        engineLabel: "B38/B48 benzin",
        fuelType: "Benzin",
        transmission: "Otomatik",
        yearFrom: 2018,
        yearTo: 2026,
        issues: [
          {
            id: "bmw-x2-petrol-cooling",
            severity: "medium",
            title: "Soğutma sistemi, turbo ve bobin kontrolü",
            detail:
              "Benzinli X2'de soğutma kaçakları, turbo sesi, bobin/buji ve otomatik şanzıman geçişleri kontrol edilmelidir.",
            typicalOnset: "100.000 km sonrası",
            costLevel: "Orta",
            sourceNote: "BMW B serisi motor kullanıcı/servis kayıtlarında tekrar eden bulgular.",
          },
        ],
      },
    ],
  },
  {
    brand: "BMW",
    model: "X3",
    yearFrom: 2003,
    yearTo: 2026,
    engines: [
      {
        engineLabel: "2.0d N47/B47",
        fuelType: "Dizel",
        transmission: "Otomatik",
        yearFrom: 2007,
        yearTo: 2026,
        issues: [
          {
            id: "bmw-x3-20d-chain-egr-transfer",
            severity: "medium",
            title: "N47 zincir, B47 EGR/DPF ve transfer kutusu kontrolü",
            detail:
              "X3 20d'de erken N47 zincir, yeni B47 emisyon sistemi, xDrive transfer kutusu, diferansiyel ve ZF otomatik bakım geçmişi kontrol edilmeli.",
            typicalOnset: "120.000 km sonrası",
            costLevel: "Yüksek",
            sourceNote: "BMW X3/N47-B47 ve xDrive servis kayıtlarında tekrar eden bulgular.",
          },
        ],
      },
      {
        engineLabel: "3.0d N57/B57",
        fuelType: "Dizel",
        transmission: "Otomatik",
        yearFrom: 2010,
        yearTo: 2026,
        issues: [
          {
            id: "bmw-x3-30d-n57-egr",
            severity: "medium",
            title: "N57/B57 EGR/DPF, turbo ve xDrive aktarma kontrolü",
            detail:
              "30d X3'te EGR/DPF/AdBlue, turbo, ZF şanzıman ve xDrive transfer/diferansiyel bakım geçmişi kontrol edilmelidir.",
            typicalOnset: "150.000 km sonrası",
            costLevel: "Yüksek",
            sourceNote: "BMW N57/B57 ve xDrive SUV kullanıcı/servis kayıtlarında tekrar eden kontrol başlıkları.",
          },
        ],
      },
    ],
  },
  {
    brand: "BMW",
    model: "X4",
    yearFrom: 2014,
    yearTo: 2026,
    engines: [
      {
        engineLabel: "2.0d / 3.0d",
        fuelType: "Dizel",
        transmission: "Otomatik",
        yearFrom: 2014,
        yearTo: 2026,
        issues: [
          {
            id: "bmw-x4-diesel-egr-transfer",
            severity: "medium",
            title: "Dizel emisyon sistemi, xDrive ve ZF bakım kontrolü",
            detail:
              "X4 dizellerde EGR/DPF/AdBlue, turbo, xDrive transfer kutusu, diferansiyel ve ZF otomatik yağ bakım geçmişi kontrol edilmeli.",
            typicalOnset: "120.000 km sonrası",
            costLevel: "Yüksek",
            sourceNote: "BMW X3/X4 dizel ve xDrive servis kayıtlarında tekrar eden kontrol başlıkları.",
          },
        ],
      },
      {
        engineLabel: "B48/B58 benzin",
        fuelType: "Benzin",
        transmission: "Otomatik",
        yearFrom: 2014,
        yearTo: 2026,
        issues: [
          {
            id: "bmw-x4-petrol-cooling",
            severity: "medium",
            title: "Soğutma, turbo ve xDrive aktarma kontrolü",
            detail:
              "Benzinli X4'te soğutma kaçakları, turbo, bobin/buji, ZF bakım ve xDrive transfer kutusu kontrol edilmeli.",
            typicalOnset: "100.000 km sonrası",
            costLevel: "Orta",
            sourceNote: "BMW B48/B58 ve xDrive kullanıcı/servis kayıtları.",
          },
        ],
      },
    ],
  },
  {
    brand: "BMW",
    model: "X5",
    yearFrom: 2000,
    yearTo: 2026,
    engines: [
      {
        engineLabel: "3.0d M57/N57/B57",
        fuelType: "Dizel",
        transmission: "Otomatik",
        yearFrom: 2000,
        yearTo: 2026,
        issues: [
          {
            id: "bmw-x5-30d-air-transfer",
            severity: "high",
            title: "Dizel emisyon/turbo, havalı süspansiyon ve xDrive masrafı",
            detail:
              "X5'te EGR/DPF/AdBlue, turbo, swirl flap, ZF otomatik, xDrive transfer kutusu ve havalı süspansiyon yüksek maliyetli kontrol kalemleridir.",
            typicalOnset: "150.000 km sonrası veya yaşa bağlı",
            costLevel: "Yüksek",
            sourceNote: "BMW X5 alım rehberleri ve bağımsız servis kayıtlarında tekrar eden pahalı riskler.",
          },
        ],
      },
      {
        engineLabel: "V8 benzin N62/N63",
        fuelType: "Benzin",
        transmission: "Otomatik",
        yearFrom: 2000,
        yearTo: 2026,
        issues: [
          {
            id: "bmw-x5-v8-cooling-valvestem",
            severity: "high",
            title: "V8 soğutma, yağ kaçakları ve supap keçesi/turbo masrafı",
            detail:
              "V8 X5'te supap keçesi dumanı, yağ kaçakları, soğutma sistemi, turbo/ısı yönetimi ve havalı süspansiyon yüksek maliyetlidir.",
            typicalOnset: "120.000 km sonrası",
            costLevel: "Yüksek",
            sourceNote: "BMW N62/N63 motor ve X5 kullanıcı/servis kayıtlarında tekrar eden pahalı riskler.",
          },
        ],
      },
    ],
  },
  {
    brand: "BMW",
    model: "X6",
    yearFrom: 2008,
    yearTo: 2026,
    engines: [
      {
        engineLabel: "3.0d N57/B57",
        fuelType: "Dizel",
        transmission: "Otomatik",
        yearFrom: 2008,
        yearTo: 2026,
        issues: [
          {
            id: "bmw-x6-diesel-air-transfer",
            severity: "high",
            title: "Dizel emisyon sistemi, xDrive ve havalı süspansiyon kontrolü",
            detail:
              "X6 dizellerde EGR/DPF/AdBlue, turbo, ZF otomatik, xDrive transfer/diferansiyel ve havalı süspansiyon masrafı kontrol edilmelidir.",
            typicalOnset: "150.000 km sonrası",
            costLevel: "Yüksek",
            sourceNote: "BMW X5/X6 dizel ve xDrive servis kayıtlarında tekrar eden kontrol başlıkları.",
          },
        ],
      },
      {
        engineLabel: "V8 benzin N63",
        fuelType: "Benzin",
        transmission: "Otomatik",
        yearFrom: 2008,
        yearTo: 2026,
        issues: [
          {
            id: "bmw-x6-v8-n63",
            severity: "high",
            title: "N63 V8 yağ/soğutma/turbo ve elektronik donanım masrafı",
            detail:
              "N63 V8 X6'da turbo/ısı yönetimi, yağ kaçakları, supap keçesi dumanı, soğutma ve aktif süspansiyon/elektronik donanımlar yüksek maliyetlidir.",
            typicalOnset: "100.000 km sonrası",
            costLevel: "Yüksek",
            sourceNote: "BMW N63 ve X6 kullanıcı/servis kayıtlarında tekrar eden pahalı riskler.",
          },
        ],
      },
    ],
  },
];
