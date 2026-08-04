import { afterEach, describe, expect, it } from "vitest";
import { appConfig } from "@/lib/constants/app";
import { getStorageUsageSummary, formatBytes } from "@/lib/data-management/storage-usage";
import { EXPORTABLE_STORAGE_KEYS } from "@/lib/data-management/keys";

describe("getStorageUsageSummary", () => {
  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("reports zero bytes for every key when storage is empty", async () => {
    const summary = await getStorageUsageSummary();
    expect(summary.totalLocalBytes).toBe(0);
    expect(summary.totalSessionBytes).toBe(0);
    expect(summary.entries).toHaveLength(Object.keys(EXPORTABLE_STORAGE_KEYS).length);
    expect(summary.entries.every((entry) => entry.bytes === 0)).toBe(true);
  });

  it("counts real bytes for populated keys", async () => {
    const payload = JSON.stringify([{ id: "v1", label: "Aracım", createdAt: "2026-01-01T00:00:00.000Z" }]);
    localStorage.setItem(appConfig.vehiclesStorageKey, payload);

    const summary = await getStorageUsageSummary();
    const vehiclesEntry = summary.entries.find((entry) => entry.label === "vehicles");

    expect(vehiclesEntry?.bytes).toBe(new Blob([payload]).size);
    expect(summary.totalLocalBytes).toBeGreaterThan(0);
  });

  it("counts session storage separately from local storage", async () => {
    sessionStorage.setItem(appConfig.storageKey, JSON.stringify({ some: "analysis" }));

    const summary = await getStorageUsageSummary();

    expect(summary.totalSessionBytes).toBeGreaterThan(0);
  });
});

describe("formatBytes", () => {
  it("formats bytes, kilobytes, and megabytes readably", () => {
    expect(formatBytes(500)).toBe("500 B");
    expect(formatBytes(2048)).toBe("2.0 KB");
    expect(formatBytes(5 * 1024 * 1024)).toBe("5.0 MB");
  });
});
