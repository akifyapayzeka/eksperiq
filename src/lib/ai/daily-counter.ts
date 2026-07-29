type CounterRecord = {
  dayKey: string;
  count: number;
};

const counters = new Map<string, CounterRecord>();

export function getTodayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function getDailyUsage(key: string, date = new Date()): number {
  const dayKey = getTodayKey(date);
  const record = counters.get(key);
  if (!record || record.dayKey !== dayKey) return 0;
  return record.count;
}

export function incrementDailyUsage(key: string, date = new Date()): number {
  const dayKey = getTodayKey(date);
  const current = getDailyUsage(key, date);
  const next = current + 1;
  counters.set(key, { dayKey, count: next });
  return next;
}

export function resetDailyUsageForTests(): void {
  counters.clear();
}
