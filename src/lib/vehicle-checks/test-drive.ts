export type TestDriveGroup = {
  id: string;
  title: string;
  items: string[];
};

export const testDriveGroups: TestDriveGroup[] = [
  {
    id: "before-start",
    title: "Başlamadan önce",
    items: [
      "Motoru soğukken çalıştırdım (satıcı önceden çalıştırmamış olmalı)",
      "Gösterge panelindeki uyarı lambalarını kontrol ettim",
      "Yakıt, motor sıcaklığı ve şarj göstergelerine baktım",
      "Kaputun altında yağ/su sızıntısı belirtisi aradım",
    ],
  },
  {
    id: "during-drive",
    title: "Sürüş sırasında",
    items: [
      "Direksiyonda çekme veya titreşim var mı kontrol ettim",
      "Vites geçişleri (manuel veya otomatik) yumuşak mı diye baktım",
      "Fren pedalının hissini ve düz durup durmadığını kontrol ettim",
      "Hızlanırken anormal ses veya gecikme olup olmadığına baktım",
      "Rölantide motor sesini dinledim",
      "Klima/kaloriferin ısıtma ve soğutmasını denedim",
      "Cam, ayna ve kilit motorlarını tek tek denedim",
    ],
  },
  {
    id: "road-conditions",
    title: "Farklı yol koşullarında",
    items: [
      "Kasis veya bozuk yolda süspansiyon seslerini dinledim",
      "Virajda direksiyon boşluğu veya gecikme olup olmadığına baktım",
      "Güvenli bir yerde ani fren yapıp aracın düz durduğunu kontrol ettim",
      "Geri vitesde park sensörü/kamera varsa çalıştığını kontrol ettim",
    ],
  },
  {
    id: "after-drive",
    title: "Sürüş sonrası",
    items: [
      "Motor kaputunu açıp yanık koku veya duman olup olmadığına baktım",
      "Araç altında yeni yağ/su lekesi olup olmadığına baktım",
      "Egzozdan çıkan dumanın rengini (mavi/beyaz/siyah) kontrol ettim",
    ],
  },
];

export const testDriveDisclaimer =
  "Bu liste test sürüşünde dikkat edilebilecek genel noktaları hatırlatır; teknik arıza teşhisi yapmaz. Şüpheli bir bulgu varsa bağımsız ekspertize götürün.";
