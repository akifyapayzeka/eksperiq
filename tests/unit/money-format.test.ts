import { describe, expect, it } from "vitest";
import { formatTryAmount, formatTurkishLiraInputValue, parseTurkishLiraInput } from "@/lib/format/money";

describe("Turkish money formatting", () => {
  it("parses Turkish lira input with thousands and comma decimals", () => {
    expect(parseTurkishLiraInput("1.200")).toBe(1200);
    expect(parseTurkishLiraInput("1.200,50")).toBe(1200.5);
    expect(parseTurkishLiraInput("1200,50")).toBe(1200.5);
  });

  it("rejects mixed English separators and invalid amounts", () => {
    expect(parseTurkishLiraInput("1,200.50")).toBeNull();
    expect(parseTurkishLiraInput("12.00")).toBeNull();
    expect(parseTurkishLiraInput("abc")).toBeNull();
  });

  it("formats amounts for Turkish lira displays and edit fields", () => {
    expect(formatTryAmount(1200.5, 2)).toBe("1.200,50 TL");
    expect(formatTryAmount(1200, 2)).toBe("1.200 TL");
    expect(formatTurkishLiraInputValue(1200.5)).toBe("1.200,5");
  });
});
