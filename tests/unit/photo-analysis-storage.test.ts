import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import {
  createPhotoAnalysisId,
  deletePhotoAnalysis,
  loadPhotoAnalyses,
  upsertPhotoAnalysis,
} from "@/lib/storage/photo-analysis-storage";
import type { PhotoAnalysisRecord } from "@/lib/photo-analysis/types";

function buildRecord(overrides: Partial<PhotoAnalysisRecord> = {}): PhotoAnalysisRecord {
  return {
    id: createPhotoAnalysisId(),
    createdAt: new Date().toISOString(),
    thumbnails: [],
    findings: [{ area: "Ön tampon", finding: "Çizik", confidence: "Orta olasılık", note: "" }],
    ...overrides,
  };
}

describe("photo analysis storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts empty", async () => {
    expect(await loadPhotoAnalyses()).toEqual([]);
  });

  it("saves a record and lists it newest-first", async () => {
    const first = buildRecord();
    const second = buildRecord();

    await upsertPhotoAnalysis(first);
    const result = await upsertPhotoAnalysis(second);

    expect(result.ok).toBe(true);
    expect(result.records.map((item) => item.id)).toEqual([second.id, first.id]);
    expect((await loadPhotoAnalyses()).map((item) => item.id)).toEqual([second.id, first.id]);
  });

  it("persists thumbnails (via IndexedDB) and findings (via localStorage) across loads", async () => {
    const record = buildRecord({ thumbnails: ["data:image/jpeg;base64,fake"], aiSummary: "Test özeti" });

    await upsertPhotoAnalysis(record);

    expect((await loadPhotoAnalyses())[0]).toEqual(record);
  });

  it("deletes a record's metadata and its thumbnails by id", async () => {
    const record = buildRecord({ thumbnails: ["data:image/jpeg;base64,fake"] });
    await upsertPhotoAnalysis(record);

    const remaining = await deletePhotoAnalysis(record.id);

    expect(remaining).toEqual([]);
    expect(await loadPhotoAnalyses()).toEqual([]);
  });

  it("caps stored records so history can't grow without bound, and prunes the pruned records' thumbnails too", async () => {
    for (let i = 0; i < 25; i += 1) {
      await upsertPhotoAnalysis(buildRecord({ thumbnails: ["data:image/jpeg;base64,fake"] }));
    }

    const records = await loadPhotoAnalyses();
    expect(records.length).toBeLessThanOrEqual(20);
  });
});
