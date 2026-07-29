import { beforeEach, describe, expect, it } from "vitest";
import { clearAiNoteFeedback, loadAiNoteFeedback, saveAiNoteFeedback } from "@/lib/storage/ai-feedback-storage";

describe("ai feedback storage", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("stores and clears local ai note feedback", () => {
    expect(loadAiNoteFeedback()).toBeNull();
    saveAiNoteFeedback("helpful");
    expect(loadAiNoteFeedback()).toBe("helpful");
    clearAiNoteFeedback();
    expect(loadAiNoteFeedback()).toBeNull();
  });
});
