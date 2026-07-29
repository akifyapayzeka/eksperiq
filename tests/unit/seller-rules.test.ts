import { describe, expect, it } from "vitest";
import { detectedClaims } from "@/lib/analysis/rules/seller-rules";

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
});
