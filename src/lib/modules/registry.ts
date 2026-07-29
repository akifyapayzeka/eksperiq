import type { ProductModule } from "./types";

export const productModules: ProductModule[] = [
  {
    id: "listing-analysis",
    title: "İlan Analizi",
    status: "active",
    summary: "Kullanıcının manuel girdiği ilan ve araç bilgileriyle ikinci el araç karar desteği üretir.",
    capabilities: [
      {
        title: "Risk skoru",
        description: "Hasar, bakım, kilometre, açıklama, evrak ve satıcı sinyallerini puanlar.",
      },
      {
        title: "Satıcı soruları",
        description: "Bulgulara göre satıcıya sorulacak öncelikli soruları üretir.",
      },
      {
        title: "Ekspertiz kontrol listesi",
        description: "Satın alma öncesi doğrulanacak teknik ve evrak başlıklarını listeler.",
      },
    ],
    dataPolicy: "İlk sürümde sunucuya kayıt yoktur; analiz yalnızca tarayıcı oturumunda tutulur.",
    certaintyPolicy: "Kesin ekspertiz sonucu veya satın alma garantisi vermez.",
  },
  {
    id: "photo-damage-analysis",
    title: "Fotoğraftan Hasar Analizi",
    status: "planned",
    summary: "Araç fotoğraflarında olası kozmetik ve parça risklerini güven seviyesiyle işaretler.",
    capabilities: [
      {
        title: "Dış gövde kontrolü",
        description: "Tampon, çamurluk, kapı, kaput, bagaj kapağı, tavan, far, stop, jant, lastik ve camları inceler.",
      },
      {
        title: "Olası hasar bulguları",
        description:
          "Göçük, çizik, boya çatlağı, renk farkı, panel hizasızlığı, pas, çatlak ve kırık sinyallerini arar.",
      },
    ],
    dataPolicy: "Fotoğraflar için açık kullanıcı onayı, geçici işleme ve silme politikası gerektirir.",
    certaintyPolicy: "Kesin hasar iddiası üretmez; olasılık ve güven seviyesiyle konuşur.",
  },
  {
    id: "repair-cost-estimation",
    title: "Tahmini Onarım Maliyeti",
    status: "planned",
    summary: "Olası hasar bulgularına göre şehir, servis ve parça değişkenliğini belirten maliyet aralıkları sunar.",
    capabilities: [
      {
        title: "Maliyet aralığı",
        description:
          "Tampon boya, göçük düzeltme, far/cam değişimi, jant tamiri, pasta cila ve kapı boya gibi kalemleri gruplayabilir.",
      },
    ],
    dataPolicy: "Kullanıcı girdileri ve fotoğraf analizi çıktıları üzerinden çalışır; kesin fiyat kaydı tutmaz.",
    certaintyPolicy: "Net fiyat vermez; aralık ve değişkenlik uyarısı gösterir.",
  },
  {
    id: "expertise-report-analysis",
    title: "Ekspertiz Raporu Analizi",
    status: "planned",
    summary: "PDF veya fotoğraf formatındaki ekspertiz raporunu sadeleştirip kritik riskleri özetler.",
    capabilities: [
      {
        title: "Rapor okuma",
        description: "Rapor maddelerini ayıklar, önemli bulguları öne çıkarır ve teknik ifadeleri sadeleştirir.",
      },
    ],
    dataPolicy: "Yüklenen raporlar için açık onay, geçici işleme ve saklama tercihi gerektirir.",
    certaintyPolicy: "Raporu yorumlar; resmi kayıt veya ekspertiz doğrulaması yerine geçmez.",
  },
  {
    id: "maintenance-tracking",
    title: "Bakım Takibi",
    status: "planned",
    summary: "Kullanıcının kendi aracı için bakım, muayene, vergi ve sigorta hatırlatmaları üretir.",
    capabilities: [
      {
        title: "Bakım hatırlatmaları",
        description:
          "Yağ, filtre, triger, zincir, fren, disk, lastik, akü, muayene, MTV, trafik sigortası ve kasko başlıklarını takip eder.",
      },
    ],
    dataPolicy: "Kullanıcı hesabı ve açık saklama tercihi olmadan kalıcı araç kaydı oluşturmaz.",
    certaintyPolicy: "Bakım önerileri üretir; servis teşhisi veya teknik garanti vermez.",
  },
  {
    id: "vehicle-health-record",
    title: "Araç Sağlık Karnesi",
    status: "planned",
    summary: "Araçla ilgili bakım, hasar, ekspertiz, masraf, servis geçmişi ve hatırlatmaları tek ekranda toplar.",
    capabilities: [
      {
        title: "Zaman çizelgesi",
        description: "Araç geçmişini modüllerden gelen bilgilerle bağımsız kayıtlar halinde gösterir.",
      },
    ],
    dataPolicy: "Kalıcı kayıtlar için kullanıcı hesabı, veri dışa aktarma ve silme seçenekleri gerekir.",
    certaintyPolicy: "Geçmiş kayıtları düzenler; aracın genel durumunu garanti etmez.",
  },
  {
    id: "vehicle-value-tracking",
    title: "Araç Değer Takibi",
    status: "planned",
    summary: "Aracın yaklaşık piyasa değişimini ve fiyat trendini karar desteği olarak gösterir.",
    capabilities: [
      {
        title: "Trend izleme",
        description: "Zaman içindeki fiyat değişimini yaklaşık göstergelerle sunar.",
      },
    ],
    dataPolicy: "Piyasa verisi kaynakları ve kullanıcı aracı arasında açık veri sınırı gerektirir.",
    certaintyPolicy: "Kesin ekspertiz değeri veya satış fiyatı vermez.",
  },
  {
    id: "smart-sale-preparation",
    title: "Akıllı Satış Hazırlığı",
    status: "planned",
    summary: "Satış öncesi eksik bakım, kozmetik kusur, yaklaşan masraf, fotoğraf ve evrak önerilerini listeler.",
    capabilities: [
      {
        title: "Satış kontrolü",
        description: "İlan öncesi tamamlanması gereken bakım, evrak ve görsel hazırlık adımlarını önceliklendirir.",
      },
    ],
    dataPolicy: "Kullanıcı aracı ve satış hazırlığı verileri açık onay olmadan kalıcı tutulmaz.",
    certaintyPolicy: "Satışı veya satış fiyatını garanti etmez; hazırlık önerisi üretir.",
  },
];

export function activeModules(): ProductModule[] {
  return productModules.filter((module) => module.status === "active");
}

export function plannedModules(): ProductModule[] {
  return productModules.filter((module) => module.status === "planned");
}
