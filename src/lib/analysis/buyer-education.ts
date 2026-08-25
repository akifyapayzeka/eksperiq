export type BuyerEducationNote = {
  title: string;
  why: string;
  check: string;
};

export type BuyerDecisionGuideItem = {
  title: string;
  meaning: string;
  action: string;
};

export const BUYER_DECISION_GUIDE: BuyerDecisionGuideItem[] = [
  {
    title: "Önce belge iste",
    meaning: "Satıcının 'hatasız, bakımlı, masrafsız' demesi tek başına kanıt değildir.",
    action: "TRAMER, muayene kilometresi, bakım faturası ve varsa ekspertiz raporunu aynı araçla eşleştir.",
  },
  {
    title: "Sonra pahalı risklere bak",
    meaning:
      "Motor, şanzıman, şasi, podye, airbag ve ağır hasar sorunları küçük kozmetik kusurlardan çok daha önemlidir.",
    action: "Ekspertize bu başlıkları özellikle söyle; yalnızca boya ölçümüyle yetinme.",
  },
  {
    title: "Eksik bilgi varsa acele etme",
    meaning: "Belirsiz kalan her bilgi satın aldıktan sonra masraf veya değer kaybı olarak dönebilir.",
    action: "Satıcı cevaplamıyorsa, belge yoksa veya ekspertizden kaçıyorsa aracı beklet.",
  },
  {
    title: "Fiyatı riske göre düşün",
    meaning: "Ucuz araç her zaman avantaj değildir; yakın masrafı olan araç toplamda pahalıya gelebilir.",
    action: "Lastik, akü, muayene, ağır bakım, triger ve şanzıman risklerini pazarlığa dahil et.",
  },
];

export const BUYER_EDUCATION_NOTES: BuyerEducationNote[] = [
  {
    title: "Triger kayışı veya zinciri",
    why: "Motorun zamanlamasını tutar. Koparsa ya da atlama yaparsa supap-piston temasıyla çok ağır motor masrafı çıkarabilir.",
    check: "Değişim tarihi, kilometresi ve faturasını isteyin; bilgi yoksa ekspertizde özellikle sorulsun.",
  },
  {
    title: "Düzenli bakım geçmişi",
    why: "Yağ, filtre ve sıvı bakımı gecikmiş araçta turbo, zincir, enjektör, soğutma ve şanzıman arızaları daha pahalıya dönebilir.",
    check: "Servis/fatura kayıtlarını görün; yalnızca 'bakımlı' yazması belge yerine geçmez.",
  },
  {
    title: "Şanzıman bakımı",
    why: "Otomatik, yarı otomatik ve CVT kutularda yağ/kavrama bakımı ihmal edilirse titreme, vuruntu ve mekatronik masrafı oluşabilir.",
    check: "Soğuk-sıcak test sürüşü yapın; yağ bakım faturası ve geçiş davranışını kontrol ettirin.",
  },
  {
    title: "Şasi, podye ve airbag",
    why: "Bu bölgelerde işlem aracın güvenliğini, ikinci el değerini ve kaza sonrası davranışını doğrudan etkiler.",
    check: "Kaporta boyasından ayrı olarak şasi/podye ölçümü ve airbag beyin/kayıt kontrolü isteyin.",
  },
  {
    title: "TRAMER ve hasar kaydı",
    why: "Tutar tek başına yeterli değildir; hangi parçaya, hangi tarihte ve nasıl bir işlem yapıldığı asıl riski belirler.",
    check: "Sigorta kaydını ekspertiz bulgusu ve satıcı açıklamasıyla karşılaştırın.",
  },
  {
    title: "Kilometre ve yaş dengesi",
    why: "Çok düşük km uzun yatma, çok yüksek km yoğun kullanım riski taşıyabilir; ikisi de bakım geçmişiyle birlikte değerlendirilir.",
    check: "Muayene km kayıtları, servis kayıtları ve direksiyon/koltuk/pedal aşınmasını birlikte kontrol edin.",
  },
  {
    title: "Lastik, akü ve muayene",
    why: "Küçük gibi görünür ama alımdan hemen sonra nakit masraf çıkarır ve pazarlık gücünüzü etkiler.",
    check: "Lastik üretim tarihini, akü yaşını ve muayene bitiş tarihini teslim almadan önce netleştirin.",
  },
  {
    title: "Ekspertiz raporu",
    why: "İlan açıklaması satıcı beyanıdır; bağımsız ekspertiz mekanik, kaporta, elektronik ve güvenlik risklerini ayrı ayrı görmenizi sağlar.",
    check:
      "Raporun tarihini, firma bilgisini ve fotoğraflarını isteyin; mümkünse kendi seçtiğiniz yerde tekrar kontrol ettirin.",
  },
];
