const TRY_AMOUNT_PATTERN = /^(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d{1,2})?$/;

export function parseTurkishLiraInput(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed || !TRY_AMOUNT_PATTERN.test(trimmed)) return null;

  const parsed = Number(trimmed.replace(/\./g, "").replace(",", "."));
  if (!Number.isFinite(parsed)) return null;
  return parsed;
}

export function formatTryAmount(amount: number, maximumFractionDigits = 0): string {
  return `${amount.toLocaleString("tr-TR", {
    minimumFractionDigits: maximumFractionDigits > 0 && !Number.isInteger(amount) ? maximumFractionDigits : 0,
    maximumFractionDigits,
  })} TL`;
}

export function formatTurkishLiraInputValue(amount: number): string {
  return amount.toLocaleString("tr-TR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}
