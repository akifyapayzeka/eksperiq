import { describe, expect, it, vi } from "vitest";
import { isOpenRouterConfigured, requestOpenRouterChat } from "@/lib/ai/openrouter";

function testEnv(values: Record<string, string | undefined>): NodeJS.ProcessEnv {
  return {
    NODE_ENV: "test",
    ...values,
  };
}

describe("openrouter service", () => {
  it("reports disabled when the api key is missing", async () => {
    const result = await requestOpenRouterChat(
      {
        messages: [{ role: "user", content: "Merhaba" }],
      },
      { env: testEnv({}) },
    );

    expect(isOpenRouterConfigured(testEnv({}))).toBe(false);
    expect(result.status).toBe("disabled");
  });

  it("parses assistant content from a successful response", async () => {
    const fetcher = vi.fn(async () =>
      Response.json({
        choices: [{ message: { content: "Kısa karar destek notu." } }],
      }),
    );

    const result = await requestOpenRouterChat(
      {
        messages: [{ role: "user", content: "Araç raporunu özetle" }],
      },
      {
        env: testEnv({
          OPENROUTER_API_KEY: "test-key",
          OPENROUTER_MODEL: "openrouter/free",
        }),
        fetcher,
      },
    );

    expect(fetcher).toHaveBeenCalledOnce();
    expect(result).toEqual({
      status: "success",
      content: "Kısa karar destek notu.",
      model: "openrouter/free",
    });
  });
});
