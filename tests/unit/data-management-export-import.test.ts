import { afterEach, describe, expect, it } from "vitest";
import { appConfig } from "@/lib/constants/app";
import { buildDataExportBundle, exportDataAsJson, importDataFromJson } from "@/lib/data-management/export-import";
import { CURRENT_DATA_SCHEMA_VERSION } from "@/lib/data-management/schema";
import { EXPORTABLE_STORAGE_KEYS } from "@/lib/data-management/keys";

function clearAllExportableKeys() {
  for (const storageKey of Object.values(EXPORTABLE_STORAGE_KEYS)) {
    window.localStorage.removeItem(storageKey);
  }
}

describe("data-management export/import", () => {
  afterEach(() => {
    clearAllExportableKeys();
  });

  it("builds an empty-but-well-formed bundle when no data exists yet", () => {
    clearAllExportableKeys();
    const bundle = buildDataExportBundle();

    expect(bundle.schemaVersion).toBe(CURRENT_DATA_SCHEMA_VERSION);
    expect(typeof bundle.exportedAt).toBe("string");
    expect(bundle.appVersion).toBe(appConfig.name);
    expect(Object.keys(bundle.data).sort()).toEqual(Object.keys(EXPORTABLE_STORAGE_KEYS).sort());
    for (const value of Object.values(bundle.data)) {
      expect(value).toEqual([]);
    }
  });

  it("round-trips real data through export then import", () => {
    window.localStorage.setItem(
      appConfig.vehiclesStorageKey,
      JSON.stringify([{ id: "v1", label: "Aracım", createdAt: "2026-01-01T00:00:00.000Z" }]),
    );
    window.localStorage.setItem(
      appConfig.remindersStorageKey,
      JSON.stringify([
        {
          id: "r1",
          category: "muayene",
          title: "Muayene",
          dueDate: "2026-09-01",
          recurrence: "none",
          history: [],
          createdAt: "2026-01-01T00:00:00.000Z",
        },
      ]),
    );

    const json = exportDataAsJson();
    clearAllExportableKeys();
    expect(window.localStorage.getItem(appConfig.vehiclesStorageKey)).toBeNull();

    const result = importDataFromJson(json);

    expect(result.ok).toBe(true);
    expect(window.localStorage.getItem(appConfig.vehiclesStorageKey)).toContain("Aracım");
    expect(window.localStorage.getItem(appConfig.remindersStorageKey)).toContain("Muayene");
  });

  it("rejects invalid JSON without throwing or touching storage", () => {
    window.localStorage.setItem(appConfig.vehiclesStorageKey, JSON.stringify([{ id: "keep-me" }]));

    const result = importDataFromJson("{not valid json");

    expect(result).toEqual({ ok: false, error: "Dosya geçerli bir JSON değil." });
    expect(window.localStorage.getItem(appConfig.vehiclesStorageKey)).toContain("keep-me");
  });

  it("rejects well-formed JSON that isn't an EksperIQ export bundle", () => {
    const result = importDataFromJson(JSON.stringify({ hello: "world" }));
    expect(result).toEqual({ ok: false, error: "Dosya EksperIQ veri yedeği formatında değil." });
  });

  it("rejects a bundle whose data values aren't arrays", () => {
    const result = importDataFromJson(
      JSON.stringify({
        schemaVersion: 1,
        exportedAt: "2026-01-01T00:00:00.000Z",
        data: { vehicles: "not-an-array" },
      }),
    );
    expect(result.ok).toBe(false);
  });

  it("imports the keys it recognizes and ignores unknown extra keys instead of failing", () => {
    const result = importDataFromJson(
      JSON.stringify({
        schemaVersion: 1,
        exportedAt: "2026-01-01T00:00:00.000Z",
        data: {
          vehicles: [{ id: "v1", label: "Aracım", createdAt: "2026-01-01T00:00:00.000Z" }],
          somethingFromAFutureVersion: [{ whatever: true }],
        },
      }),
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.importedKeys).toContain("vehicles");
      expect(result.importedKeys).not.toContain("somethingFromAFutureVersion");
    }
  });
});
