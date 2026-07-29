import { getDailyUsage, getTodayKey, incrementDailyUsage } from "./daily-counter";

const UPSTASH_TTL_SECONDS = 60 * 60 * 48;

type Fetcher = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

export type DailyUsageReservation =
  | {
      allowed: true;
      remaining: number;
      used: number;
      store: "memory" | "upstash";
    }
  | {
      allowed: false;
      remaining: 0;
      used: number;
      store: "memory" | "upstash";
      reason: string;
    };

type UsageStoreOptions = {
  env?: NodeJS.ProcessEnv;
  fetcher?: Fetcher;
  date?: Date;
};

type UpstashResponse = {
  result?: unknown;
  error?: string;
};

function buildDailyUsageKey(key: string, date: Date): string {
  return `eksperiq:ai:${key}:${getTodayKey(date)}`;
}

function getUpstashConfig(env: NodeJS.ProcessEnv): { url: string; token: string } | null {
  const url = env.UPSTASH_REDIS_REST_URL?.trim();
  const token = env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) return null;
  return { url: url.replace(/\/$/, ""), token };
}

function parseCount(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

async function reserveWithUpstash(
  key: string,
  dailyLimit: number,
  config: { url: string; token: string },
  fetcher: Fetcher,
  date: Date,
): Promise<DailyUsageReservation> {
  const dailyKey = buildDailyUsageKey(key, date);
  const response = await fetcher(`${config.url}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      ["INCR", dailyKey],
      ["EXPIRE", dailyKey, UPSTASH_TTL_SECONDS],
    ]),
  });

  if (!response.ok) {
    throw new Error(`Upstash usage store failed: ${response.status}`);
  }

  const payload: unknown = await response.json();
  if (!Array.isArray(payload)) {
    throw new Error("Upstash usage store returned invalid payload.");
  }

  const firstResult = payload[0] as UpstashResponse | undefined;
  if (firstResult?.error) {
    throw new Error("Upstash usage store rejected INCR command.");
  }

  const used = parseCount(firstResult?.result);
  if (used > dailyLimit) {
    return {
      allowed: false,
      remaining: 0,
      used,
      store: "upstash",
      reason: "Günlük AI deneme limiti doldu.",
    };
  }

  return {
    allowed: true,
    remaining: Math.max(dailyLimit - used, 0),
    used,
    store: "upstash",
  };
}

function reserveWithMemory(key: string, dailyLimit: number, date: Date): DailyUsageReservation {
  const usedToday = getDailyUsage(key, date);
  if (usedToday >= dailyLimit) {
    return {
      allowed: false,
      remaining: 0,
      used: usedToday,
      store: "memory",
      reason: "Günlük AI deneme limiti doldu.",
    };
  }

  const used = incrementDailyUsage(key, date);
  return {
    allowed: true,
    remaining: Math.max(dailyLimit - used, 0),
    used,
    store: "memory",
  };
}

export async function reserveDailyAiUsage(
  key: string,
  dailyLimit: number,
  { env = process.env, fetcher = fetch, date = new Date() }: UsageStoreOptions = {},
): Promise<DailyUsageReservation> {
  const config = getUpstashConfig(env);
  if (!config) return reserveWithMemory(key, dailyLimit, date);
  return reserveWithUpstash(key, dailyLimit, config, fetcher, date);
}
