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

  it("starts empty", () => {
    expect(loadPhotoAnalyses()).toEqual([]);
  });

  it("saves a record and lists it newest-first", () => {
    const first = buildRecord();
    const second = buildRecord();

    upsertPhotoAnalysis(first);
    const records = upsertPhotoAnalysis(second);

    expect(records.map((item) => item.id)).toEqual([second.id, first.id]);
    expect(loadPhotoAnalyses().map((item) => item.id)).toEqual([second.id, first.id]);
  });

  it("persists thumbnails and findings across loads", () => {
    const record = buildRecord({ thumbnails: ["data:image/jpeg;base64,fake"], aiSummary: "Test özeti" });

    upsertPhotoAnalysis(record);

    expect(loadPhotoAnalyses()[0]).toEqual(record);
  });

  it("deletes a record by id", () => {
    const record = buildRecord();
    upsertPhotoAnalysis(record);

    const remaining = deletePhotoAnalysis(record.id);

    expect(remaining).toEqual([]);
    expect(loadPhotoAnalyses()).toEqual([]);
  });

  it("caps stored records so history can't grow without bound", () => {
    for (let i = 0; i < 25; i += 1) {
      upsertPhotoAnalysis(buildRecord());
    }

    expect(loadPhotoAnalyses().length).toBeLessThanOrEqual(20);
  });
});
