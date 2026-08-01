import { describe, expect, it } from "vitest";
import { testDriveDisclaimer, testDriveGroups } from "@/lib/vehicle-checks/test-drive";

describe("test drive checklist", () => {
  it("groups checklist items under non-empty categories", () => {
    expect(testDriveGroups.length).toBeGreaterThan(0);
    for (const group of testDriveGroups) {
      expect(group.items.length).toBeGreaterThan(0);
    }
  });

  it("has no duplicate items across groups", () => {
    const allItems = testDriveGroups.flatMap((group) => group.items);
    expect(new Set(allItems).size).toBe(allItems.length);
  });

  it("does not make a definitive fault-diagnosis claim", () => {
    expect(testDriveDisclaimer).toContain("teşhis");
    expect(testDriveDisclaimer.toLocaleLowerCase("tr-TR")).not.toContain("kesin");
  });
});
