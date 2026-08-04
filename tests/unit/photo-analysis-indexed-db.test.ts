import "fake-indexeddb/auto";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  clearAllThumbnails,
  deleteThumbnails,
  loadThumbnails,
  saveThumbnails,
} from "@/lib/photo-analysis/indexed-db";

describe("photo-analysis indexed-db", () => {
  afterEach(async () => {
    await clearAllThumbnails();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("saves and loads thumbnails for a given id", async () => {
    const result = await saveThumbnails("photo-1", ["data:image/jpeg;base64,AAA", "data:image/jpeg;base64,BBB"]);
    expect(result).toEqual({ ok: true });

    const loaded = await loadThumbnails("photo-1");
    expect(loaded).toEqual(["data:image/jpeg;base64,AAA", "data:image/jpeg;base64,BBB"]);
  });

  it("returns an empty array for an id that was never saved", async () => {
    expect(await loadThumbnails("never-saved")).toEqual([]);
  });

  it("deletes only the requested id's thumbnails", async () => {
    await saveThumbnails("photo-a", ["a"]);
    await saveThumbnails("photo-b", ["b"]);

    await deleteThumbnails("photo-a");

    expect(await loadThumbnails("photo-a")).toEqual([]);
    expect(await loadThumbnails("photo-b")).toEqual(["b"]);
  });

  it("clearAllThumbnails wipes every record", async () => {
    await saveThumbnails("photo-a", ["a"]);
    await saveThumbnails("photo-b", ["b"]);

    await clearAllThumbnails();

    expect(await loadThumbnails("photo-a")).toEqual([]);
    expect(await loadThumbnails("photo-b")).toEqual([]);
  });

  it("overwrites a previous save for the same id", async () => {
    await saveThumbnails("photo-1", ["old"]);
    await saveThumbnails("photo-1", ["new"]);

    expect(await loadThumbnails("photo-1")).toEqual(["new"]);
  });

  it("reports 'unavailable' instead of throwing when IndexedDB doesn't exist", async () => {
    vi.stubGlobal("indexedDB", undefined);

    const result = await saveThumbnails("photo-1", ["a"]);

    expect(result).toEqual({ ok: false, reason: "unavailable" });
    expect(await loadThumbnails("photo-1")).toEqual([]);
    await expect(deleteThumbnails("photo-1")).resolves.toBeUndefined();
    await expect(clearAllThumbnails()).resolves.toBeUndefined();
  });
});
