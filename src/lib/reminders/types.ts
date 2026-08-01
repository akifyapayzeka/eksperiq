export type ReminderCategory = "mtv" | "trafik-sigortasi" | "kasko" | "muayene" | "bakim" | "lastik" | "aku" | "diger";

export type ReminderRecurrence = "none" | "yearly" | "semiannual";

export type ReminderHistoryEntry = {
  date: string;
  amount?: number;
};

export type ReminderRecord = {
  id: string;
  category: ReminderCategory;
  title: string;
  dueDate: string;
  amount?: number;
  note?: string;
  recurrence: ReminderRecurrence;
  history: ReminderHistoryEntry[];
  createdAt: string;
};

export type ReminderUrgency = "overdue" | "urgent" | "upcoming" | "later";

export const reminderCategoryLabels: Record<ReminderCategory, string> = {
  mtv: "MTV",
  "trafik-sigortasi": "Trafik sigortası",
  kasko: "Kasko",
  muayene: "Muayene",
  bakim: "Bakım",
  lastik: "Lastik",
  aku: "Akü",
  diger: "Diğer",
};
