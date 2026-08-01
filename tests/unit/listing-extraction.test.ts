import { describe, expect, it } from "vitest";
import { extractListingFields } from "@/lib/listings/extract-listing";

describe("extractListingFields", () => {
  it("extracts common vehicle fields from listing text", () => {
    const result = extractListingFields(`
      2020 Volkswagen Passat 1.6 TDI Dizel Otomatik
      İstanbul, 87.400 km, fiyat 1.250.000 TL.
      Ekspertiz mevcut. Tramer 18.000 TL. Ağır hasar kaydı yoktur.
    `);

    expect(result.brand).toBe("Volkswagen");
    expect(result.model).toBe("Passat");
    expect(result.year).toBe(2020);
    expect(result.fuelType).toBe("Dizel");
    expect(result.transmission).toBe("Otomatik");
    expect(result.mileage).toBe(87400);
    expect(result.price).toBe(1250000);
    expect(result.city).toBe("İstanbul");
    expect(result.tramerAmount).toBe(18000);
    expect(result.hasHeavyDamage).toBe(false);
    expect(result.hasExpertiseReport).toBe(true);
  });

  it("does not turn negated damage claims into positive findings", () => {
    const result = extractListingFields("Pert kaydı yoktur. Ağır hasar yok. Tramer yok.");

    expect(result.hasTotalLossHistory).toBe(false);
    expect(result.hasHeavyDamage).toBe(false);
    expect(result.tramerAmount).toBe(0);
  });

  it("does not invent fields from weak text", () => {
    const result = extractListingFields("Temiz aile aracı, ciddi alıcılar yazsın.");

    expect(result.brand).toBeUndefined();
    expect(result.model).toBeUndefined();
    expect(result.year).toBeUndefined();
    expect(result.mileage).toBeUndefined();
    expect(result.price).toBeUndefined();
  });
});
