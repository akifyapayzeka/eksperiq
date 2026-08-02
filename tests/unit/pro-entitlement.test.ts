import { describe, expect, it } from "vitest";
import { isPro } from "@/lib/pro/entitlement";

describe("isPro", () => {
  it("is always false until real purchase verification is wired up", () => {
    expect(isPro()).toBe(false);
  });
});
