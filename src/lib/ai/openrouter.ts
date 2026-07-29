import { appConfig } from "@/lib/constants/app";

const OPENROUTER_CHAT_COMPLETIONS_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_OPENROUTER_MODEL = "openrouter/free";
const DEFAULT_TIMEOUT_MS = 15000;

type OpenRouterRole = "system" | "user" | "assistant";

type OpenRouterMessage = {
  role: OpenRouterRole;
  content: string;
};

type OpenRouterChatRequest = {
  model?: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  maxTokens?: number;
};

export type OpenRouterChatResult =
  | {
      status: "disabled";
      reason: string;
    }
  | {
      status: "success";
      content: string;
      model: string;
    }
  | {
      status: "error";
      reason: string;
    };

type Fetcher = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function extractAssistantContent(payload: unknown): string | null {
  if (!isRecord(payload)) return null;
  const choices = payload.choices;
  if (!Array.isArray(choices)) return null;
  const firstChoice = choices[0];
  if (!isRecord(firstChoice)) return null;
  const message = firstChoice.message;
  if (!isRecord(message)) return null;
  const content = message.content;
  return typeof content === "string" && content.trim().length > 0 ? content : null;
}

export function isOpenRouterConfigured(env: NodeJS.ProcessEnv = process.env): boolean {
  return Boolean(env.OPENROUTER_API_KEY?.trim());
}

export async function requestOpenRouterChat(
  request: OpenRouterChatRequest,
  {
    env = process.env,
    fetcher = fetch,
    timeoutMs = DEFAULT_TIMEOUT_MS,
  }: {
    env?: NodeJS.ProcessEnv;
    fetcher?: Fetcher;
    timeoutMs?: number;
  } = {},
): Promise<OpenRouterChatResult> {
  const apiKey = env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) {
    return {
      status: "disabled",
      reason: "OPENROUTER_API_KEY tanımlı değil; kural tabanlı analiz kullanılmalı.",
    };
  }

  const model = request.model ?? env.OPENROUTER_MODEL ?? DEFAULT_OPENROUTER_MODEL;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetcher(OPENROUTER_CHAT_COMPLETIONS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": appConfig.productionUrl,
        "X-OpenRouter-Title": appConfig.name,
      },
      body: JSON.stringify({
        model,
        messages: request.messages,
        temperature: request.temperature ?? 0.2,
        max_tokens: request.maxTokens ?? 700,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      return {
        status: "error",
        reason: `OpenRouter isteği başarısız oldu: ${response.status}`,
      };
    }

    const payload: unknown = await response.json();
    const content = extractAssistantContent(payload);
    if (!content) {
      return {
        status: "error",
        reason: "OpenRouter yanıtında okunabilir içerik bulunamadı.",
      };
    }

    return {
      status: "success",
      content,
      model,
    };
  } catch (error) {
    return {
      status: "error",
      reason: error instanceof Error ? error.message : "OpenRouter isteği tamamlanamadı.",
    };
  } finally {
    clearTimeout(timeout);
  }
}
