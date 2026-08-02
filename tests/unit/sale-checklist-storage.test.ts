import { beforeEach, describe, expect, it } from "vitest";
import { loadSaleChecklist, saveSaleChecklist } from "@/lib/storage/sale-checklist-storage";

const items = ["Son bakım faturalarını hazırla", "Yedek anahtarı bul", "Rehin/haciz durumunu kontrol et"];

describe("sale checklist storage", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("returns nothing when no checklist has been saved yet", () => {
    expect(loadSaleChecklist(items)).toEqual([]);
  });

  it("persists checked items across a reload within the same session", () => {
    saveSaleChecklist([items[0], items[2]]);

    expect(loadSaleChecklist(items)).toEqual([items[0], items[2]]);
  });

  it("drops saved items that no longer belong to the current checklist", () => {
    saveSaleChecklist([items[0], "Eski liste maddesi"]);

    expect(loadSaleChecklist(items)).toEqual([items[0]]);
  });
});
