import type { VehicleFormData } from "@/lib/schemas/vehicle";
import { MAX_PRIORITY_ACTIONS } from "@/lib/constants/analysis";
import { maintenanceHistoryUnresolved } from "./rules/maintenance-rules";
import { inspectionStatus } from "./inspection";
import type { AnalysisFinding, CostSignal, DataCompleteness, PriorityAction } from "./types";

/**
 * Muayene satırı gerçek tarihten türetilir. Önceden tarih girilmiş olması tek
 * başına "Yakın tarihli" sayılıyordu: 2 yıl sonrası da, 8 ay önce dolmuş bir
 * muayene de aynı satırı üretiyordu — yani bu satır veriyi hiç okumuyordu.
 */
function inspectionCostLevel(inspectionEndDate: string | undefined): CostSignal["level"] {
  switch (inspectionStatus(inspectionEndDate)) {
    case "unknown":
      return "Bilgi yetersiz";
    case "expired":
      return "Yüksek";
    case "soon":
      return "Yakın tarihli";
    case "later":
      return "Düşük";
  }
}

export const finalChecklist = [
  "Ruhsat sahibini doğruladım",
  "Tramer kaydını gördüm",
  "Kilometre geçmişini kontrol ettim",
  "Aracı soğuk çalıştırdım",
  "Bağımsız ekspertize götürdüm",
  "Şasi numarasını doğruladım",
  "Rehin ve haciz durumunu kontrol ettim",
  "Test sürüşü yaptım",
  "Satış sözleşmesini okudum",
  "Ödemeyi güvenli yöntemle yapacağım",
];

const baseInspectionFocus = [
  "Elektronik arıza taraması",
  "Boya kalınlık ölçümü",
  "Alt takım",
  "Fren sistemi",
  "Motor kompresyonu",
  "Yağ kaçağı",
  "Soğutma sistemi",
];

function addUnique(items: string[], item: string): void {
  if (!items.includes(item)) items.push(item);
}

function addUniqueAction(actions: PriorityAction[], action: PriorityAction): void {
  if (!actions.some((item) => item.title === action.title)) actions.push(action);
}

export function dynamicInspectionFocus(input: VehicleFormData, findings: AnalysisFinding[]): string[] {
  const focus: string[] = [];
  const findingIds = new Set(findings.map((finding) => finding.id));

  if (input.hasChassisRepair || input.hasHeavyDamage || input.hasTotalLossHistory || findingIds.has("chassis-repair")) {
    addUnique(focus, "Şasi, podye, direk ve tavan");
  }
  if (/aç|ac|değiş|degis|patla/i.test(input.airbagStatus ?? "") || findingIds.has("airbag")) {
    addUnique(focus, "Airbag sistemi ve emniyet kemerleri");
  }
  if (input.transmission === "Otomatik" || findingIds.has("gearbox-unknown")) {
    addUnique(focus, "Otomatik şanzıman");
  }
  if (/var/i.test(input.lpgStatus ?? "")) {
    addUnique(focus, "LPG sistemi ve ruhsat uyumu");
  }
  if (findingIds.has("very-high-mileage") || findingIds.has("high-mileage")) {
    addUnique(focus, "Motor kompresyonu");
    addUnique(focus, "Yağ kaçağı");
    addUnique(focus, "Soğutma sistemi");
    addUnique(focus, "Alt takım");
  }
  if (
    findingIds.has("multiple-replaced") ||
    findingIds.has("tramer-unexplained") ||
    findingIds.has("high-tramer-price-ratio")
  ) {
    addUnique(focus, "Boya kalınlık ölçümü");
    addUnique(focus, "Kaporta bağlantı noktaları");
  }
  if (findingIds.has("bad-tires")) {
    addUnique(focus, "Lastik diş derinliği ve üretim tarihi");
  }

  for (const item of baseInspectionFocus) {
    addUnique(focus, item);
  }

  return focus.slice(0, 12);
}

export function costSignals(input: VehicleFormData): CostSignal[] {
  return [
    {
      item: "Lastik değişimi",
      level: /kötü|zayıf|bitik/i.test(input.tireStatus ?? "") ? "Orta" : input.tireStatus ? "Düşük" : "Bilgi yetersiz",
    },
    {
      item: "Ağır bakım",
      level: !input.timingBeltInfo
        ? "Bilgi yetersiz"
        : /yaklaşmış/i.test(input.timingBeltInfo)
          ? "Orta"
          : maintenanceHistoryUnresolved(input.timingBeltInfo)
            ? "Bilgi yetersiz"
            : "Düşük",
    },
    { item: "Muayene", level: inspectionCostLevel(input.inspectionEndDate) },
    { item: "Yedek anahtar", level: input.hasSpareKey ? "Düşük" : "Orta" },
  ];
}

export function strengths(input: VehicleFormData): string[] {
  const items: string[] = [];
  if (input.hasMaintenanceInvoices) items.push("Bakım faturaları mevcut");
  if (input.hasExpertiseReport) items.push("Ekspertiz raporu bulunuyor");
  if (!input.hasHeavyDamage) items.push("Ağır hasar kaydı belirtilmemiş");
  if (!input.hasTotalLossHistory) items.push("Pert geçmişi belirtilmemiş");
  if (input.hasSpareKey) items.push("Yedek anahtar mevcut");
  return items.length ? items : ["Olumlu tarafları netleştirmek için daha fazla belge gerekiyor"];
}

export function priorityActions(
  findings: AnalysisFinding[],
  costs: CostSignal[],
  completeness: DataCompleteness,
): PriorityAction[] {
  const actions: PriorityAction[] = [];

  for (const finding of findings.filter((item) => item.severity === "high")) {
    addUniqueAction(actions, {
      title: finding.recommendation,
      reason: finding.title,
    });
  }

  for (const finding of findings.filter((item) => item.severity === "medium")) {
    addUniqueAction(actions, {
      title: finding.recommendation,
      reason: finding.title,
    });
  }

  for (const cost of costs.filter((item) => item.level !== "Düşük")) {
    addUniqueAction(actions, {
      title: `${cost.item} kalemini ekspertiz ve pazarlık öncesi netleştirin.`,
      reason: `${cost.item}: ${cost.level}`,
    });
  }

  for (const missing of completeness.missing.slice(0, MAX_PRIORITY_ACTIONS)) {
    addUniqueAction(actions, {
      title: `${missing} bilgisini satıcıdan belge veya kayıtla isteyin.`,
      reason: "Eksik bilgi",
    });
  }

  return actions.slice(0, MAX_PRIORITY_ACTIONS);
}
