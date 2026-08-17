import type { ProductModule } from "./types";

export const productModules: ProductModule[] = [
  {
    id: "listing-analysis",
    title: "İlan Analizi",
    status: "active",
    href: "/analiz",
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
    dataPolicy: "Sunucuya kayıt yoktur; analiz geçmişiniz yalnızca bu cihazda saklanır.",
    certaintyPolicy: "Kesin ekspertiz sonucu veya satın alma garantisi vermez.",
  },
  {
    id: "photo-damage-analysis",
    title: "Fotoğraftan Hasar Analizi",
    status: "active",
    href: "/fotograf-hasar",
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
      {
        title: "Tahmini onarım maliyeti",
        description: "Bulunan hasar kalemi ve servis tipine göre yaklaşık maliyet aralığı gösterir.",
      },
    ],
    dataPolicy: "Fotoğraflar için açık kullanıcı onayı, geçici işleme ve silme politikası gerektirir.",
    certaintyPolicy: "Kesin hasar iddiası veya net fiyat üretmez; olasılık ve aralıklarla konuşur.",
  },
  {
    id: "expertise-report-analysis",
    title: "Ekspertiz Raporu Analizi",
    status: "active",
    href: "/ekspertiz-raporu",
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
    id: "maintenance-payment-calendar",
    title: "Bakım Takibi",
    status: "active",
    href: "/bakim-odeme-takvimi",
    summary: "Bakım, muayene, MTV, trafik sigortası ve kasko gibi tarihleri araç bazında tek takvimde takip eder.",
    capabilities: [
      {
        title: "Tek takvim",
        description: "Tüm ödeme ve bakım tarihlerini yaklaşan/geciken sırayla listeler.",
      },
      {
        title: "Bildirim",
        description: "Son tarihe 30 ve 15 gün kala isteğe bağlı push bildirimi gönderir.",
      },
      {
        title: "Çoklu araç",
        description: "Birden fazla araç için ayrı takvim tutabilirsiniz; araçlar arasında serbestçe geçiş yapın.",
      },
    ],
    dataPolicy: "Kayıtlar cihazda saklanır; bildirim açıksa yalnızca bildirim için sunucuda tutulur.",
    certaintyPolicy: "Tutarları kullanıcı girer; güncel resmi tutarları garanti etmez.",
  },
  {
    id: "test-drive-checklist",
    title: "Test Sürüşü Kontrol Listesi",
    status: "active",
    href: "/test-surusu-kontrol",
    summary:
      "Test sürüşü öncesi, sırası ve sonrasında dikkat edilecek noktaları adım adım işaretlenebilir liste olarak sunar.",
    capabilities: [
      {
        title: "Adım adım kontrol",
        description:
          "Başlamadan önce, sürüş sırasında, farklı yol koşullarında ve sürüş sonrasında bakılacak noktaları gruplar.",
      },
    ],
    dataPolicy: "İşaretler yalnızca mevcut tarayıcı oturumunda tutulur; sunucuya kaydedilmez.",
    certaintyPolicy: "Teknik arıza teşhisi yapmaz; şüpheli bulguları bağımsız ekspertize yönlendirir.",
  },
  {
    id: "expense-ledger",
    title: "Gider Defteri",
    status: "active",
    href: "/gider-defteri",
    summary: "Yakıt, bakım, sigorta ve diğer masrafları kaydedip aylık toplam ve yaklaşık km başı maliyeti gösterir.",
    capabilities: [
      {
        title: "Aylık takip",
        description: "Son 12 ayın gider toplamını basit bir grafikle gösterir.",
      },
      {
        title: "Km başı maliyet",
        description: "Kilometre girilen kayıtlardan yaklaşık km başı maliyeti hesaplar.",
      },
      {
        title: "Çoklu araç",
        description: "Birden fazla araç için ayrı gider defteri tutabilirsiniz.",
      },
    ],
    dataPolicy: "Kayıtlar yalnızca cihazda saklanır; sunucuya gönderilmez.",
    certaintyPolicy: "Resmi mali kayıt değildir; yalnızca kullanıcının girdiği verilerle yaklaşık gösterge sunar.",
  },
  {
    id: "listing-comparison",
    title: "Karşılaştırmalı İlan Analizi",
    status: "active",
    href: "/karsilastirma",
    summary: "En fazla 3 analiz sonucunu risk skoru, fiyat, kilometre ve bulgu sayısıyla yan yana gösterir.",
    capabilities: [
      {
        title: "Yan yana özet",
        description: "Sonuç sayfasından eklenen ilanları tek tabloda karşılaştırır.",
      },
    ],
    dataPolicy: "Karşılaştırma listesi yalnızca cihazda saklanır; sunucuya gönderilmez.",
    certaintyPolicy: "Hangi ilanın alınacağına karar vermez; yalnızca yan yana özet sunar.",
  },
  {
    id: "vehicle-health-record",
    title: "Araç Sağlık Karnesi",
    status: "active",
    href: "/arac-saglik-karnesi",
    summary: "Araçla ilgili bakım, hasar, ekspertiz, masraf, servis geçmişi ve hatırlatmaları tek ekranda toplar.",
    capabilities: [
      {
        title: "Zaman çizelgesi",
        description: "Araç geçmişini modüllerden gelen bilgilerle bağımsız kayıtlar halinde gösterir.",
      },
      {
        title: "Sağlık skoru trendi",
        description: "Kayıtlara eklenen isteğe bağlı skorların zaman içindeki değişimini basit bir grafikle gösterir.",
      },
      {
        title: "Çoklu araç",
        description: "Birden fazla araç için ayrı sağlık karnesi tutabilirsiniz.",
      },
    ],
    dataPolicy: "Kayıtlar hesaba değil, yalnızca cihaza kaydedilir; kullanıcı istediği zaman silebilir.",
    certaintyPolicy: "Geçmiş kayıtları düzenler; aracın genel durumunu garanti etmez.",
  },
  {
    id: "vehicle-value-tracking",
    title: "Araç Değer Takibi",
    status: "active",
    href: "/arac-deger-takibi",
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
    status: "active",
    href: "/satis-hazirligi",
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
