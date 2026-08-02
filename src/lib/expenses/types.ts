export type ExpenseCategory = "yakit" | "bakim" | "sigorta" | "vergi" | "diger";

export type ExpenseRecord = {
  id: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  odometer?: number;
  note?: string;
  createdAt: string;
  /** Undefined means the record belongs to the user's default (first) vehicle. */
  vehicleId?: string;
};

export const expenseCategoryLabels: Record<ExpenseCategory, string> = {
  yakit: "Yakıt",
  bakim: "Bakım",
  sigorta: "Sigorta",
  vergi: "Vergi/MTV",
  diger: "Diğer",
};
