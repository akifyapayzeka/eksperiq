export type AiUsageDecision =
  | {
      allowed: true;
      remaining: number;
    }
  | {
      allowed: false;
      reason: string;
      remaining: number;
    };

export type AiUsageInput = {
  isConfigured: boolean;
  isFeatureEnabled: boolean;
  usedToday: number;
  dailyLimit: number;
};

export const DEFAULT_AI_DAILY_LIMIT = 20;

export function parseDailyLimit(value: string | undefined, fallback = DEFAULT_AI_DAILY_LIMIT): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function decideAiUsage(input: AiUsageInput): AiUsageDecision {
  const remaining = Math.max(input.dailyLimit - input.usedToday, 0);

  if (!input.isFeatureEnabled) {
    return {
      allowed: false,
      reason: "AI karar destek notu şu anda kapalı.",
      remaining,
    };
  }

  if (!input.isConfigured) {
    return {
      allowed: false,
      reason: "OpenRouter key tanımlı değil.",
      remaining,
    };
  }

  if (input.usedToday >= input.dailyLimit) {
    return {
      allowed: false,
      reason: "Günlük AI deneme limiti doldu.",
      remaining: 0,
    };
  }

  return {
    allowed: true,
    remaining,
  };
}
