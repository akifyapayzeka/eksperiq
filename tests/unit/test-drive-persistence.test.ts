import { beforeEach, describe, expect, it } from "vitest";
import { loadTestDriveChecklist, saveTestDriveChecklist } from "@/lib/storage/test-drive-storage";
import { appConfig } from "@/lib/constants/app";
import { EXPORTABLE_STORAGE_KEYS, EPHEMERAL_SESSION_STORAGE_KEYS } from "@/lib/data-management/keys";

/**
 * Test sürüşü kontrol listesi oturumluk (`sessionStorage`) tutuluyordu. Bu
 * listenin doldurulduğu an, kullanıcının satıcının yanında aracın başında
 * olduğu an: iOS uygulamayı bellek için sonlandırdığında (aynı uygulamada
 * kamera da kullanıldığı için olasılığı düşük değil) doldurulan liste
 * tamamen kayboluyordu. Uygulamadaki en yüksek veri kaybı riski tam da
 * kullanıcının en çok emek verdiği yerdeydi.
 *
 * Kalıcı hâle getirildiğinde iki şey de düzeltilmeli, yoksa yeni sessiz
 * hatalar doğar: yedeklemeye dahil olmalı ve "tüm verilerimi sil"
 * süpürgesinin DOĞRU deposundan silinmeli.
 */

const ITEMS = ["Motor sesi", "Fren hissi", "Vites geçişleri"];

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

describe("test sürüşü kontrol listesi kalıcılığı", () => {
  it("oturum kapansa da kayıt durur", () => {
    saveTestDriveChecklist(["Motor sesi"]);

    // Oturum deposunun tamamen gitmesi = uygulamanin sonlandirilmasi.
    sessionStorage.clear();

    expect(loadTestDriveChecklist(ITEMS)).toEqual(["Motor sesi"]);
  });

  it("yedeklemeye dahildir", () => {
    expect(Object.values(EXPORTABLE_STORAGE_KEYS)).toContain(appConfig.testDriveChecklistStorageKey);
  });

  it("artık oturumluk anahtar listesinde değildir — yanlış depodan silinmeye çalışılmasın", () => {
    expect(EPHEMERAL_SESSION_STORAGE_KEYS).not.toContain(appConfig.testDriveChecklistStorageKey);
  });
});
