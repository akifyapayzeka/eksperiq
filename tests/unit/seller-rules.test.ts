import { describe, expect, it } from "vitest";
import {
  detectedAmbiguousPhrases,
  detectedClaims,
  detectsGarageClaim,
  sellerRules,
} from "@/lib/analysis/rules/seller-rules";
import type { VehicleFormData } from "@/lib/schemas/vehicle";

describe("seller claim detection", () => {
  it("detects claims written without Turkish characters", () => {
    const claims = detectedClaims("Acil satilik, masrafsiz, degisensiz, sadece ciddi alicilar yaziyor.");

    expect(claims).toEqual(
      expect.arrayContaining(["Acil satılık", "Masrafsız", "Değişensiz", "Sadece ciddi alıcılar"]),
    );
  });

  it("keeps returning canonical Turkish claim labels", () => {
    const claims = detectedClaims("Ekspertize acik ve ogretmenden ifadesi var.");

    expect(claims).toEqual(expect.arrayContaining(["Ekspertize açık", "Öğretmenden"]));
  });

  it("detects garage kept claims as a low severity verification finding", () => {
    const input = {
      sellerDescription: "Kapali garajda durdu, garaj arabasi olarak kullanildi ve ekspertize acik.",
    } as VehicleFormData;

    expect(detectsGarageClaim(input.sellerDescription)).toBe(true);
    expect(sellerRules(input)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "claim-garage-kept",
          severity: "low",
          title: "Garaj kullanımı iddiası doğrulanmalı",
        }),
      ]),
    );
  });

  it("does not add garage kept finding when the claim is absent", () => {
    const input = {
      sellerDescription: "Bakımları düzenli yapılmıştır ve ekspertiz raporu mevcuttur.",
    } as VehicleFormData;

    expect(detectsGarageClaim(input.sellerDescription)).toBe(false);
    expect(sellerRules(input).some((finding) => finding.id === "claim-garage-kept")).toBe(false);
  });

  it("detects ambiguous seller phrases as verification findings", () => {
    const input = {
      sellerDescription:
        "Bana boyle soylendi, ufak tefek temizlik boyasi var. Kilometre orijinal deniyor ama belge yok.",
    } as VehicleFormData;

    expect(detectedAmbiguousPhrases(input.sellerDescription)).toEqual(
      expect.arrayContaining(["Bana böyle söylendi", "Ufak tefek", "Temizlik boyası", "Kilometre orijinal deniyor"]),
    );
    expect(sellerRules(input)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "ambiguous-bana-boyle-soylendi",
          severity: "medium",
          title: '"Bana böyle söylendi" ifadesi netleştirilmeli',
        }),
      ]),
    );
  });
});
