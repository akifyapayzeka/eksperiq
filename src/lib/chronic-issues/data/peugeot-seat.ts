import type { ModelEntry } from "../types";

// Kaynak: Peugeot/Seat sahip forumları (peugeotforums.com, seatcupra.net,
// honestjohn.co.uk), bağımsız teknik servis kaynakları
// (propeugeotspares.co.za, stedmansgarage.co.uk, eco-torque.co.uk),
// karşılaştırmalı güvenilirlik raporları (carchecker.pro) ve resmi geri
// çağırma/yazılım güncellemesi kayıtları (Stellantis PureTech ıslak kayış,
// VW Grubu'nun 1.5 TSI EVO "kanguru zıplaması" kabulü) genelinde tekrar
// eden bulgular. Kullanıcının önerdiği paket (Reference/Style) bazlı
// mekanik ayrım için güvenilir kaynak bulunamadı — yalnızca motor
// kodu/üretim tarihi bazlı ayrımlar (ör. Ibiza 1.2 TSI CBZB "10/2011
// öncesi") kullanıldı.
export const PEUGEOT_SEAT_ENTRIES: ModelEntry[] = [
  {
    brand: "Peugeot",
    model: "301",
    yearFrom: 2012,
    yearTo: 2021,
    generalNote:
      "301'de motor kodu asıl belirleyicidir; paket (Access/Active/Allure) bazında ayrı bir mekanik sorun deseni için güvenilir kaynak bulunamadı.",
    engines: [
      {
        engineLabel: "1.6 VTi",
        fuelType: "Benzin",
        transmission: "Manuel",
        reliabilityNote:
          "Bu motor Peugeot'nun sorunlu EP6/Prince ailesinden değil, daha eski ve dayanıklı TU5/EC5 zincirli motor bloğundan türetildiği için zincir gerdirici sorunu genel olarak raporlanmamıştır.",
        issues: [],
      },
      {
        engineLabel: "1.2 PureTech",
        fuelType: "Benzin",
        transmission: "Manuel",
        reliabilityNote:
          "PureTech ailesinin karakteristik 'ıslak triger kayışı' tasarımı bu motoru da kapsar; kayış yağ karteri içinde yağa batırılmış halde çalışır ve gözle kolayca kontrol edilemez.",
        issues: [
          {
            id: "301-12puretech-wetbelt",
            severity: "high",
            title: "Islak triger kayışı erken yıpranma / parçalanma",
            detail:
              "Kayış zamanla lastik parçacıkları döküyor; bu parçacıklar yağ emiş süzgecini tıkayarak yağlama basıncı düşüşüne ve ciddi motor hasarına (yatak sıkışması) yol açabiliyor. Stellantis 2013-2017 üretim bazı araçlarda resmi geri çağırma yapmıştır.",
            typicalOnset: "80.000-100.000 km civarı, sık kısa mesafe/şehir içi kullanımda daha erken",
            costLevel: "Yüksek",
            sourceNote:
              "Birden fazla bağımsız oto servis/parça tedarikçisi teknik makalesi ve resmi geri çağırma kayıtları (Stellantis).",
          },
          {
            id: "301-12puretech-oildilution",
            severity: "medium",
            title: "Yağ seyrelmesi ve yüksek yağ tüketimi/duman şikayeti",
            detail:
              "Özellikle kısa mesafe kullanımda yanmamış yakıtın yağa karışması sonucu yağ kalitesinin hızlı bozulması; bazı kullanıcılar yağ değişiminden kısa süre sonra belirgin yağ eksilmesi ve egzozdan duman bildirmektedir.",
            typicalOnset: "İlk 20.000-40.000 km içinde belirti verebilir",
            costLevel: "Orta",
            sourceNote:
              "Türkçe kullanıcı şikayet platformu yorumları ile teknik kaynaklardaki yağ seyrelmesi açıklaması örtüşüyor.",
          },
        ],
      },
      {
        engineLabel: "1.6 HDi",
        fuelType: "Dizel",
        transmission: "Manuel",
        reliabilityNote: "e-HDi versiyonlarında ayrıca start-stop sistemine özgü ek zayıf noktalar bulunuyor.",
        issues: [
          {
            id: "301-16hdi-injector-egr-dpf",
            severity: "medium",
            title: "Enjektör keçesi, EGR ve DPF tıkanması",
            detail:
              "Piezo enjektörlerin keçe sızdırması egzoz gazının yağa karışmasına, EGR valfinde kurum birikimi güç kaybı/kekemeliğe, kısa mesafe kullanımda ise DPF tıkanmasına yol açabiliyor.",
            typicalOnset: "100.000 km sonrası, kısa mesafe kullanımda daha erken",
            costLevel: "Orta",
            sourceNote: "Peugeot 1.6 HDi ailesi için birden fazla bağımsız teknik servis kaynağı.",
          },
        ],
      },
    ],
  },
  {
    brand: "Peugeot",
    model: "308",
    generation: "T7 (2007-2013) ve T9 (2013-2021)",
    yearFrom: 2007,
    yearTo: 2021,
    generalNote:
      "T7 ve T9 nesilleri farklı motor aileleri paylaşıyor; T7 döneminde EP6/Prince benzinliler ve 1.6/2.0 HDi dizeller, T9 döneminde ise facelift sonrası 1.2 PureTech ve BlueHDi motorları öne çıkıyor.",
    engines: [
      {
        engineLabel: "1.6 THP",
        fuelType: "Benzin",
        transmission: "Manuel",
        yearFrom: 2007,
        yearTo: 2015,
        reliabilityNote: "THP (turbolu) versiyonlarda sorun daha belirgin ve yaygın raporlanmış.",
        issues: [
          {
            id: "308-16thp-timingchain",
            severity: "high",
            title: "Triger zinciri gerilmesi / soğuk çalıştırmada zincir sesi",
            detail:
              "Hidrolik zincir gerdirici gece boyunca basıncını kaybediyor; soğuk çalıştırmada zincir birkaç saniye boşluklu çalışıyor. Zaman içinde zincir uzayarak diş atlayabilir, bu da supap-piston teması ve ağır motor hasarına yol açabilir. 2012-2013 sonrası üretimde gerdirici ve kılavuzlar güçlendirildi.",
            typicalOnset: "80.000 km sonrası soğuk start sesi ile belirti veriyor",
            costLevel: "Yüksek",
            sourceNote: "Birden fazla bağımsız Peugeot/BMW Prince motor teknik kaynağı ve marka forumları.",
          },
        ],
      },
      {
        engineLabel: "1.6 HDi",
        fuelType: "Dizel",
        transmission: "Manuel",
        yearFrom: 2007,
        yearTo: 2017,
        reliabilityNote:
          "Bu aile için enjektör keçesinden türbo yağ besleme hattına sızıntı zinciri literatürde 'kötü şöhretli' olarak nitelendiriliyor.",
        issues: [
          {
            id: "308-16hdi-injector-turbo",
            severity: "high",
            title: "Enjektör keçesi sızıntısı ve türbo yağ besleme hattı tıkanması",
            detail:
              "Piezo enjektör üst keçesinden sızan yağ/is karışımı türbo yağ besleme hattını tıkayabiliyor; ihmal edilirse türbo yağlama yetersizliğinden arızalanabiliyor. Motor üstünden gelen tıslama/püskürme sesi erken belirtidir.",
            typicalOnset: "100.000-150.000 km aralığında",
            costLevel: "Yüksek",
            sourceNote: "Birden fazla bağımsız Peugeot dizel teknik kaynağı ve karşılaştırmalı güvenilirlik raporları.",
          },
        ],
      },
      {
        engineLabel: "2.0 HDi",
        fuelType: "Dizel",
        transmission: "Manuel",
        yearFrom: 2007,
        yearTo: 2014,
        reliabilityNote:
          "Bu motor 1.6 HDi'deki enjektör-türbo arıza zincirine sahip değil ve genel olarak dönemin en güvenilir Peugeot dizeli olarak değerlendiriliyor.",
        issues: [
          {
            id: "308-20hdi-turbo-egr-dmf",
            severity: "low",
            title: "Türbo kanat yapışması, EGR kurumu ve çift kütleli volan yıpranması",
            detail:
              "Klasik yaşlı dizel sorunları: değişken geometrili türbo kanatlarında yapışma, EGR'de kurum birikimi ve zamanla çift kütleli volanda aşınma; kısa yolculuklar DPF/EGR tıkanmasını hızlandırıyor.",
            typicalOnset: "150.000 km sonrası",
            costLevel: "Orta",
            sourceNote: "Bağımsız güvenilirlik karşılaştırma kaynağı ve marka forumları.",
          },
        ],
      },
      {
        engineLabel: "1.2 PureTech",
        fuelType: "Benzin",
        transmission: "Manuel",
        yearFrom: 2014,
        yearTo: 2021,
        reliabilityNote:
          "301'deki ile aynı ıslak triger kayışı tasarımı; 308'in daha ağır gövdesinde ve yüksek güç versiyonlarında (130 hp) yük daha fazla.",
        issues: [
          {
            id: "308-12puretech-wetbelt",
            severity: "high",
            title: "Islak triger kayışı erken yıpranma / parçalanma",
            detail:
              "Kayış lastik parçacıkları dökerek yağ emiş süzgecini tıkayabiliyor, bu da yağlama basıncı düşüşü ve ciddi motor hasarına yol açabiliyor. 2013-2017 üretim bazı araçlar resmi geri çağırma kapsamındaydı.",
            typicalOnset: "80.000-100.000 km civarı",
            costLevel: "Yüksek",
            sourceNote: "Birden fazla bağımsız teknik kaynak ve resmi geri çağırma kayıtları.",
          },
        ],
      },
      {
        engineLabel: "1.5/1.6 BlueHDi",
        fuelType: "Dizel",
        transmission: "Manuel",
        yearFrom: 2016,
        yearTo: 2021,
        issues: [
          {
            id: "308-bluehdi-egr-dpf",
            severity: "medium",
            title: "EGR/manifold kurumu ve DPF/SCR (AdBlue) arızaları",
            detail:
              "Düşük basınçlı EGR devresi şehir içi kullanımda kirlenmeye eğilimli; DPF aşırı rejenerasyon ihtiyacı genelde önce arızalı EGR, yanlış yağ, enjektör veya türbodan kaynaklanıyor. AdBlue tankı içindeki entegre pompa/kontrol modülünün bozulması SCR arızasına yol açabiliyor.",
            typicalOnset: "80.000-120.000 km aralığı, kısa mesafe kullanımda daha erken",
            costLevel: "Orta",
            sourceNote: "Birden fazla bağımsız BlueHDi teknik kaynağı ve AdBlue servis uzmanlığı sitesi.",
          },
        ],
      },
    ],
  },
  {
    brand: "Seat",
    model: "Ibiza",
    generation: "6J (2008-2017) ve 6P/KJ (2017-2021)",
    yearFrom: 2008,
    yearTo: 2021,
    generalNote:
      "Kronik sorunlar büyük ölçüde motor koduna ve şanzımana göre değişiyor. Reference/Style gibi paketler donanım seviyesi; aynı motor-şanzımanla satıldığında pakete özgü ayrı bir mekanik kronik arıza deseni için güvenilir kanıt bulunamadı.",
    engines: [
      {
        engineLabel: "1.2 TSI EA111 / CBZB 105 PS (zincirli)",
        fuelType: "Benzin",
        transmission: "Manuel",
        yearFrom: 2009,
        yearTo: 2015,
        reliabilityNote:
          "2015 civarında Ibiza'da hem EA111 zincirli hem EA211 kayışlı 1.2 TSI varyantları görülebildiği için motor kodu kritik. CBZB/EA111 zincirli 105 PS versiyonda zincir-gerdirici riski vardır; aynı risk EA211 kayışlı CJZ* versiyon için aynı şekilde uygulanmaz.",
        issues: [
          {
            id: "ibiza-12tsi-cbzb-chain",
            severity: "high",
            title: "Triger zinciri erken uzama/gerdirici arızası (EA111/CBZB)",
            detail:
              "EA111/CBZB 1.2 TSI zincirli motorda soğuk çalıştırmada çıtırtı/tıkırtı, kam-krank korelasyon hatası ve ilerleyen aşamada zincir atlama riski bildiriliyor. Sadece zincir değil, gerdirici ve kılavuz setinin birlikte kontrol edilmesi gerekir. Reference/Style paketi bu mekanik riski değiştirmez.",
            typicalOnset: "60.000-100.000 km aralığında; bakımsız/uzun yağ aralıklı araçlarda daha erken",
            costLevel: "Yüksek",
            sourceNote:
              "ClickMechanic, Au7o, Volksmaster ve SeatCupra kullanıcı/teknik tartışmalarında 1.2 TSI zincir rattle/uzama bulgusu tekrar ediyor; parça katalogları CBZB'nin zincirli olduğunu doğruluyor.",
          },
          {
            id: "ibiza-12tsi-cbzb-wastegate",
            severity: "medium",
            title: "Turbo wastegate/aktüatör rattle ve düşük yükte metalik ses",
            detail:
              "1.2 TSI ve bazı 1.4 TSI Ibiza'larda hafif gazda veya gaz kesince metalik rattle/wastegate sesi raporlanıyor. Performans düşüşü, turbo basınç hatası veya arıza lambası eşlik ediyorsa turbo aktüatör boşluğu ve basınç kontrolü kontrol edilmeli.",
            typicalOnset: "60.000 km sonrası daha sık raporlanır",
            costLevel: "Orta",
            sourceNote:
              "ClickMechanic 1.2/1.4 TSI Ibiza Mk4 için turbo wastegate rattle belirtisini model bazlı yaygın sorun olarak listeliyor; VAG özel servis kaynakları benzer kontrol öneriyor.",
          },
        ],
      },
      {
        engineLabel: "1.2 TSI EA211 / CJZ* 90-110 PS (kayışlı)",
        fuelType: "Benzin",
        transmission: "Manuel",
        yearFrom: 2012,
        yearTo: 2017,
        reliabilityNote:
          "EA211/CJZ* kayışlı 1.2 TSI, EA111/CBZB zincirli motorla karıştırılmamalı. Zincir uzama kroniği bu motor için doğrudan uygulanmaz; alımda motor kodu ve triger kayışı bakım kaydı doğrulanmalı.",
        issues: [
          {
            id: "ibiza-12tsi-ea211-belt-service",
            severity: "low",
            title: "EA111 zincir sorunu yok; triger kayışı bakım geçmişi doğrulanmalı",
            detail:
              "Kayışlı EA211 1.2 TSI'da CBZB zincir-gerdirici arızası beklenmez. Ancak triger kayışı, su pompası, doğru yağ ve soğutma sistemi bakımı belgelenmelidir; ilan yalnızca '1.2 TSI' diyorsa motor kodu ile ayrım yapılmadan zincir/kayış hükmü verilmemeli.",
            typicalOnset: "Periyodik bakım aralığına bağlı",
            costLevel: "Orta",
            sourceNote:
              "SeatCupra kullanıcı kayıtları 2015 FR 1.2 TSI'da zincirli 105 PS ile kayışlı EA211 varyant ayrımını, parça katalogları CJZD/CJZ* kayış setini gösteriyor.",
          },
        ],
      },
      {
        engineLabel: "DSG7 DQ200 (kuru kavrama)",
        fuelType: "Benzin",
        transmission: "Yarı otomatik",
        yearFrom: 2009,
        yearTo: 2017,
        reliabilityNote:
          "Bu şanzıman riski, motor paketinden bağımsız olarak DQ200 kuru kavramalı DSG bulunan Ibiza'lar için değerlendirilir; manuel vitesli Reference/Style araçlara uygulanmaz.",
        issues: [
          {
            id: "ibiza-dq200-mechatronic-clutch",
            severity: "high",
            title: "DQ200 mekatronik/kuru kavrama titreme ve vites geçiş arızaları",
            detail:
              "Düşük hızda titreme, 1-2 geçişinde vuruntu, kalkışta gecikme, PRNDS/şanzıman arızası ve mekatronik basınç kaybı DQ200 ailesinde sık raporlanır. Şehir içi yoğun kullanım ve eski yağ/yazılım durumu riski artırır.",
            typicalOnset: "60.000-130.000 km aralığında",
            costLevel: "Yüksek",
            sourceNote:
              "Au7o Ibiza sorun derlemesi ve bağımsız DSG uzman kaynakları DQ200 mekatronik/kavrama arızasını Ibiza/Leon/Polo platformunda tekrarlayan yüksek maliyetli risk olarak listeliyor.",
          },
        ],
      },
      {
        engineLabel: "1.4 TSI",
        fuelType: "Benzin",
        transmission: "Manuel",
        yearFrom: 2008,
        yearTo: 2015,
        issues: [
          {
            id: "ibiza-14tsi-tensioner",
            severity: "high",
            title: "Hidrolik zincir gerdiricisi basınç kaybı",
            detail:
              "Motor kapatıldığında gerdirici basıncını kaybediyor, bu da zincirde boşluk ve soğuk startta belirgin çıtırtıya yol açıyor. Zamanla zincir uzayıp diş atlayabilir, ciddi supap/motor hasarı riski taşıyor.",
            typicalOnset: "48.000-96.000 km aralığında",
            costLevel: "Yüksek",
            sourceNote: "Bağımsız İngiliz oto servis teknik kaynakları ve otomotiv arıza veritabanları.",
          },
        ],
      },
      {
        engineLabel: "1.6 TDI",
        fuelType: "Dizel",
        transmission: "Manuel",
        yearFrom: 2009,
        yearTo: 2017,
        issues: [
          {
            id: "ibiza-16tdi-egr-dpf",
            severity: "medium",
            title: "EGR/DPF tıkanması ve yüksek basınç pompası aşınması",
            detail:
              "Şehir içi ağırlıklı kullanımda EGR ve DPF birlikte tıkanma eğiliminde. Ayrıca yüksek basınç yakıt pompası zamanla aşınabiliyor.",
            typicalOnset: "100.000-150.000 km aralığında, kısa mesafe kullanımda daha erken",
            costLevel: "Orta",
            sourceNote: "VAG 1.6 TDI ailesi için birden fazla bağımsız teknik kaynak ve marka forumları.",
          },
          {
            id: "ibiza-16tdi-injector-2009-2013",
            severity: "medium",
            title: "Siemens enjektör izolasyon arızası (2009-2013 üretim)",
            detail:
              "2009-2013 arası üretilen VAG 1.6 TDI motorlarda Siemens enjektörlerin izolasyonunda üretim kaynaklı sorun bildirilmiştir; sert çalışma, güç dalgalanması ve arıza lambası ile kendini gösterebiliyor.",
            typicalOnset: "Üretim yılına bağlı, genelde 60.000 km sonrası",
            costLevel: "Orta",
            sourceNote: "VAG 1.6 TDI motor ailesi için tekrarlanan bağımsız teknik kaynaklar.",
          },
        ],
      },
      {
        engineLabel: "1.0 TSI",
        fuelType: "Benzin",
        transmission: "Manuel",
        yearFrom: 2017,
        yearTo: 2021,
        reliabilityNote:
          "Atmosferik 1.0 MPI için belirgin bir kronik mekanik sorun belgelenemedi; asıl zayıf nokta turbolu 1.0 TSI versiyonunda raporlanıyor.",
        issues: [
          {
            id: "ibiza-10tsi-turbo-wear",
            severity: "low",
            title: "Turbo performans düşüşü ve düzensiz rölanti",
            detail:
              "Küçük hacimli turbo ünitesi yüksek yük altında zamanla performans kaybı, düzensiz rölanti ve artan yakıt tüketimi gösterebiliyor; üretici standart yerine daha sık yağ değişimi öneriliyor.",
            typicalOnset: "60.000-80.000 km aralığında",
            costLevel: "Düşük",
            sourceNote: "Karşılaştırmalı güvenilirlik değerlendirme kaynakları.",
          },
        ],
      },
    ],
  },
  {
    brand: "Seat",
    model: "Leon",
    generation: "5F (2012-2020)",
    yearFrom: 2012,
    yearTo: 2020,
    generalNote:
      "DQ200 (kuru kavramalı 7 ileri DSG) 1.2 TSI, 1.4 TSI ve bazı 1.6 TDI versiyonlarıyla eşleştirilmiştir ve kendine özgü mekatronik arıza deseni taşır. Paket bazlı ayrım için güvenilir kaynak bulunamadı.",
    engines: [
      {
        engineLabel: "1.2 TSI",
        fuelType: "Benzin",
        transmission: "Manuel",
        yearFrom: 2012,
        yearTo: 2018,
        issues: [
          {
            id: "leon-12tsi-chain",
            severity: "medium",
            title: "Triger zinciri gerilmesi / kam-krank korelasyon hatası",
            detail:
              "Zincir, yumuşak kılavuzlar ve yetersiz gerdirici tasarımı nedeniyle zamanla geriliyor; belirtiler soğuk startta kısa çıtırtı, sürekli tıkırtı ve ilerleyen durumlarda motor arıza lambası ile kam-krank korelasyon hata kodudur.",
            typicalOnset: "48.000-96.000 km aralığında",
            costLevel: "Yüksek",
            sourceNote:
              "Marka forumları ve otomotiv arıza veritabanları; benzer şikayetler VW/Audi/Skoda EA211 ailesinde de tekrarlanıyor.",
          },
        ],
      },
      {
        engineLabel: "1.4 TSI",
        fuelType: "Benzin",
        transmission: "Manuel",
        yearFrom: 2012,
        yearTo: 2016,
        issues: [
          {
            id: "leon-14tsi-tensioner",
            severity: "high",
            title: "Zincir gerdirici arızası",
            detail:
              "Zayıf/gerilim kaybeden gerdirici zincirde boşluğa yol açıyor, soğuk startta gürültülü çalışma ve ilerleyen aşamada ciddi motor hasarı riski taşıyor.",
            typicalOnset: "48.000-96.000 km aralığında",
            costLevel: "Yüksek",
            sourceNote: "Bağımsız İngiliz oto servis teknik kaynağı.",
          },
        ],
      },
      {
        engineLabel: "1.5 TSI",
        fuelType: "Benzin",
        transmission: "Manuel",
        yearFrom: 2017,
        yearTo: 2020,
        issues: [
          {
            id: "leon-15tsievo-kangaroo",
            severity: "medium",
            title: "Düşük devirde 'kanguru zıplaması' (kararsız güç iletimi)",
            detail:
              "1.200-2.000 devir aralığında, özellikle soğuk motorda ve trafik içinde motorun düzensiz, sarsıntılı güç vermesi. VW Grubu sorunu Ocak 2019'da resmen kabul etti ve Şubat 2020'de yazılım güncellemesi yayınladı.",
            typicalOnset: "Genelde ilk kullanımdan itibaren fark ediliyor",
            costLevel: "Düşük",
            sourceNote: "Marka forumları ve VW Grubu'nun resmi olarak kabul ettiği yazılım güncellemesi kaydı.",
          },
        ],
      },
      {
        engineLabel: "1.6 TDI",
        fuelType: "Dizel",
        transmission: "Manuel",
        yearFrom: 2012,
        yearTo: 2020,
        issues: [
          {
            id: "leon-16tdi-egr-dpf",
            severity: "medium",
            title: "EGR/DPF tıkanması ve emme manifoldu flap arızası",
            detail:
              "Kısa mesafe kullanımda EGR soğutucu/valf kurum birikimiyle tıkanabiliyor; emme manifoldu flap motorundaki plastik dişliler aşınıp kırılabiliyor.",
            typicalOnset: "100.000-150.000 km aralığında",
            costLevel: "Orta",
            sourceNote: "VAG 1.6 TDI ailesi için birden fazla bağımsız teknik kaynak.",
          },
        ],
      },
      {
        engineLabel: "DSG7 (DQ200)",
        fuelType: "Benzin",
        transmission: "Yarı otomatik",
        yearFrom: 2012,
        yearTo: 2020,
        reliabilityNote:
          "Bu satır, DQ200 şanzımanla satılan 1.2 TSI, 1.4 TSI ve bazı 1.6 TDI versiyonlarını kapsar; DQ250 (6 ileri, ıslak kavramalı) şanzıman farklı bir arıza profiline sahiptir.",
        issues: [
          {
            id: "leon-dq200-mechatronic",
            severity: "high",
            title: "Mekatronik ünite arızası",
            detail:
              "Düşük hızda 1-2 vites arası sert/gecikmeli geçiş, gösterge panelinde PRNDS yanıp sönmesi ve zaman zaman vites bağlamama şikayetleri; valf gövdesindeki ince cidarlı yerleşim yuvasının çatlaması bilinen bir tasarım zaafı olarak raporlanıyor.",
            typicalOnset: "60.000-100.000 km aralığında",
            costLevel: "Yüksek",
            sourceNote: "Birden fazla bağımsız DSG/mekatronik onarım uzmanı teknik kaynağı.",
          },
        ],
      },
    ],
  },
];
