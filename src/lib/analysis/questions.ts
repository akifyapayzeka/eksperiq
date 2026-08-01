import type { VehicleFormData } from "@/lib/schemas/vehicle";
import type { AnalysisFinding } from "./types";

const BASE_QUESTIONS = [
  "Araç ruhsatta sizin adınıza mı?",
  "Şasi numarasının son altı hanesini paylaşır mısınız?",
  "Tramer kaydının tarih ve detaylarını paylaşır mısınız?",
  "Değişen ve boyalı parçalar hangileri?",
  "Şasi, podye, direk veya tavan işlem gördü mü?",
  "Airbag açtı mı veya değişti mi?",
  "Son bakım ne zaman ve kaç kilometrede yapıldı?",
  "Bakım faturaları mevcut mu?",
  "Triger veya zincir değişimi yapıldı mı?",
  "Otomatik şanzıman yağı değişti mi?",
  "Lastiklerin üretim tarihi nedir?",
  "Yedek anahtarı mevcut mu?",
  "Araçta aktif arıza lambası var mı?",
  "Soğuk motorda çalıştırmaya izin verir misiniz?",
  "İstediğimiz ekspertiz firmasına götürebilir miyiz?",
  "Araç üzerinde rehin, haciz veya borç var mı?",
  "Kilometre kayıtları TÜVTÜRK ve servis geçmişiyle uyumlu mu?",
  "LPG varsa ruhsata işli mi?",
  "Araçta yağ yakma, su eksiltme veya hararet geçmişi var mı?",
  "Satış sebebiniz nedir?",
];

const HIGH_MILEAGE_KM = 150_000;
const OLD_VEHICLE_AGE_YEARS = 10;

export function generateSellerQuestions(input: VehicleFormData, findings: AnalysisFinding[]): string[] {
  const priority = new Set<string>();
  if (findings.some((finding) => finding.category === "Hasar")) {
    priority.add("Tramer kaydının tarih ve detaylarını paylaşır mısınız?");
    priority.add("Şasi, podye, direk veya tavan işlem gördü mü?");
    priority.add("Airbag açtı mı veya değişti mi?");
  }
  if (!input.hasMaintenanceInvoices || !input.lastMaintenanceDate) {
    priority.add("Son bakım ne zaman ve kaç kilometrede yapıldı?");
    priority.add("Bakım faturaları mevcut mu?");
  }
  if (input.transmission === "Otomatik") priority.add("Otomatik şanzıman yağı değişti mi?");
  if (/var/i.test(input.lpgStatus ?? "")) priority.add("LPG varsa ruhsata işli mi?");

  if (input.fuelType === "Dizel") {
    priority.add("Partikül filtresi (DPF) temizliği veya değişimi yapıldı mı?");
    priority.add("Turbo arızası veya bakımı geçmişi var mı?");
  }
  if (input.fuelType === "Hibrit" || input.fuelType === "Elektrik") {
    priority.add("Batarya sağlık durumu veya garantisi hakkında belge var mı?");
  }
  if (input.drivetrain === "4x4" || input.drivetrain === "AWD") {
    priority.add("Aktarma organları (transfer kutusu, diferansiyel) yağ bakımı yapıldı mı?");
  }
  if (input.mileage >= HIGH_MILEAGE_KM) {
    priority.add("Süspansiyon burçları ve motor takozlarında değişim yapıldı mı?");
  }
  const vehicleAge = new Date().getFullYear() - input.year;
  if (vehicleAge >= OLD_VEHICLE_AGE_YEARS) {
    priority.add("Kaporta veya alt takımda pas/korozyon var mı?");
  }

  return [...priority, ...BASE_QUESTIONS.filter((question) => !priority.has(question))].slice(0, 20);
}
