import { describe, expect, it } from "vitest";
import { officialLookupDisclaimer, officialLookupItems } from "@/lib/vehicle-checks/official-lookup";

const urlPattern = /https?:\/\/\S+|\b[a-z0-9-]+\.(gov|com|org|net)\.tr\b/gi;

describe("official lookup guide", () => {
  it("has a non-empty guidance list", () => {
    expect(officialLookupItems.length).toBeGreaterThan(0);
    for (const item of officialLookupItems) {
      expect(item.title.length).toBeGreaterThan(0);
      expect(item.where.length).toBeGreaterThan(0);
    }
  });

  it("only references the single trusted, well-known government domain and never a guessed deep link", () => {
    const corpus = officialLookupItems.map((item) => item.where).join(" ");
    const matches = corpus.match(urlPattern) ?? [];
    for (const match of matches) {
      expect(match.toLocaleLowerCase("tr-TR")).toBe("turkiye.gov.tr");
    }
  });

  it("does not guarantee query results", () => {
    expect(officialLookupDisclaimer).toContain("garanti etmez");
  });
});
