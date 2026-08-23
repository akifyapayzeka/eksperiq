const OPENROUTER_CHAT_COMPLETIONS_URL = "https://openrouter.ai/api/v1/chat/completions";
// Was 20s — Vercel logs confirmed the free-tier model genuinely taking
// 20-30+ seconds on some requests, so a 20s AbortController was firing (and
// then retrying into the *same* slow model) before the call had a real
// chance to finish. All api/ai/*.js callers share this default and share
// vercel.json's api/ai/*.js maxDuration (120s) — with DEFAULT_MAX_RETRIES=1
// (two attempts), 40s x 2 + retry delay leaves ~40s of headroom under that
// ceiling for rate-limiting and response handling.
const DEFAULT_TIMEOUT_MS = 40_000;
const DEFAULT_MAX_RETRIES = 1;
const RETRY_DELAY_MS = 500;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableStatus(status) {
  return status === 429 || status >= 500;
}

function requiresZdr() {
  return process.env.OPENROUTER_REQUIRE_ZDR === "true";
}

/**
 * Calls OpenRouter's chat completions endpoint with production-hardening
 * baked in:
 *  - a hard timeout via AbortController, so a hung upstream can never hang
 *    this serverless function past its own execution limit
 *  - one bounded retry (with a short delay) on network failure or a
 *    retryable HTTP status (429/5xx) — never on 4xx client errors, which
 *    would just fail identically again
 *  - provider.data_collection="deny" on every request, so OpenRouter only
 *    routes to providers that have committed not to retain/train on it.
 *    provider.zdr is added too when OPENROUTER_REQUIRE_ZDR="true" — off by
 *    default because it's a harder provider filter that can leave zero
 *    eligible providers for a given free model (this hasn't been verified
 *    live against OpenRouter's current free-tier routing, so it stays
 *    opt-in until confirmed not to break the endpoints in production).
 *
 * Returns { ok: true, payload } or { ok: false, error }.
 */
async function callOpenRouterChatCompletions({
  apiKey,
  model,
  messages,
  responseFormat,
  temperature,
  maxTokens,
  refererUrl,
  appName,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  maxRetries = DEFAULT_MAX_RETRIES,
  reasoning,
}) {
  const provider = { data_collection: "deny" };
  if (requiresZdr()) provider.zdr = true;

  const body = JSON.stringify({
    model,
    messages,
    ...(responseFormat ? { response_format: responseFormat } : {}),
    temperature,
    max_tokens: maxTokens,
    provider,
    // OpenRouter's unified reasoning control — { exclude: true } asks
    // reasoning-capable models (their name often literally says
    // "reasoning", e.g. nvidia/nemotron-*-reasoning) to spend the
    // max_tokens budget on the actual answer instead of a visible
    // "Thinking Process:" narration. Confirmed live: a call without this
    // burned the full 900-token budget narrating its reasoning about a
    // damaged-car photo and never reached the JSON answer at all, so the
    // caller fell back to parsing that half-finished reasoning text.
    // Ignored by models that don't support reasoning, so safe to always
    // send when the caller opts in.
    ...(reasoning ? { reasoning } : {}),
  });

  let lastError = "OpenRouter isteği başarısız oldu.";

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(OPENROUTER_CHAT_COMPLETIONS_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": refererUrl,
          "X-OpenRouter-Title": appName,
        },
        body,
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!response.ok) {
        lastError = `OpenRouter isteği başarısız oldu: ${response.status}`;
        if (isRetryableStatus(response.status) && attempt < maxRetries) {
          await sleep(RETRY_DELAY_MS);
          continue;
        }
        return { ok: false, error: lastError };
      }

      const payload = await response.json();
      return { ok: true, payload };
    } catch (error) {
      clearTimeout(timer);
      lastError =
        error?.name === "AbortError" ? "OpenRouter isteği zaman aşımına uğradı." : "OpenRouter isteğine ulaşılamadı.";
      if (attempt < maxRetries) {
        await sleep(RETRY_DELAY_MS);
        continue;
      }
      return { ok: false, error: lastError };
    }
  }

  return { ok: false, error: lastError };
}

// Rewrites absolute-certainty phrasing (Turkish and English) into hedged
// language. Applied to every AI-generated string this app shows a user, so a
// model that ignores its system prompt and claims certainty never reaches
// the UI verbatim — this is the enforced backstop, not the prompt wording.
const absoluteLanguageReplacements = [
  [/kesinlikle hasar(lı|lıdır|)\b/gi, "olası hasar"],
  [/kesin hasar/gi, "olası hasar"],
  [/hasar(lı|lıdır) kesin/gi, "olası hasarlı"],
  [/kesinlikle\b/gi, "büyük olasılıkla"],
  [/kesindir\b/gi, "olabilir"],
  [/kesin\b/gi, "olası"],
  [/(100\s?%|%\s?100)\s*/gi, ""],
  [/definitely damaged/gi, "possibly damaged"],
  [/confirmed damage/gi, "possible damage"],
  [/is damaged/gi, "may be damaged"],
  [/certainly\b/gi, "possibly"],
  [/definitely\b/gi, "possibly"],
];

function hedgeCertainLanguage(text) {
  if (typeof text !== "string" || !text) return text;
  return absoluteLanguageReplacements.reduce(
    (current, [pattern, replacement]) => current.replace(pattern, replacement),
    text,
  );
}

module.exports = {
  OPENROUTER_CHAT_COMPLETIONS_URL,
  callOpenRouterChatCompletions,
  hedgeCertainLanguage,
};
