import { describe, expect, it, vi } from "vitest";
import { enrichListingImportWithPhotoEvidence } from "@/lib/listing-import/photo-evidence";
import type { ListingImportResult } from "@/lib/listing-import/types";

vi.mock("@/lib/api/client", () => ({
  apiFetch: vi.fn(),
}));

const { apiFetch } = await import("@/lib/api/client");

function baseImportResult(): ListingImportResult {
  return {
    title: "2021 Renault Clio",
    fields: {
      brand: "Renault",
      model: "Clio",
      year: 2021,
      trim: null,
      fuelType: "Benzin",
      transmission: "Manuel",
      mileage: 115000,
      price: 800000,
      city: "İstanbul",
      bodyType: null,
      engineSize: "1.0",
      enginePower: null,
      drivetrain: null,
      ownerInfo: null,
      tradeStatus: null,
      tramerAmount: null,
      paintedParts: null,
      replacedParts: null,
      localPaintedParts: null,
      airbagStatus: null,
      lpgStatus: null,
      hasHeavyDamage: null,
      hasChassisRepair: null,
      hasTotalLossHistory: null,
      hasCommercialHistory: null,
      hasExpertiseReport: null,
      lpgRegistered: null,
      hasSpareKey: null,
      hasMaintenanceInvoices: null,
      lastMaintenanceDate: null,
      timingBeltInfo: null,
      transmissionMaintenanceInfo: null,
      batteryStatus: null,
      tireStatus: null,
      inspectionEndDate: null,
      sellerDescription: "Temiz aile aracı.",
    },
    lowConfidenceFields: [],
    missingFields: ["tramerAmount", "paintedParts", "replacedParts", "hasExpertiseReport"],
    warnings: [],
    images: [
      "https://i0.shbdn.com/photos/11/22/33/x5_vehicle.jpg",
      "https://i0.shbdn.com/photos/11/22/33/x5_report.jpg",
    ],
  };
}

describe("enrichListingImportWithPhotoEvidence", () => {
  it("merges document evidence into listing fields and removes document photos from vehicle gallery", async () => {
    vi.mocked(apiFetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          analysis: {
            hasEvidence: true,
            documentImageIndexes: [1],
            documentTypes: ["Ekspertiz raporu"],
            evidenceSummary: "Rapor görselinde ön tampon değişen ve sağ ön kapı boyalı görünüyor.",
            fields: {
              tramerAmount: 18000,
              paintedParts: "Sağ ön kapı",
              replacedParts: "Ön tampon",
              hasExpertiseReport: true,
              hasMaintenanceInvoices: true,
              sellerDescriptionAppend:
                "Ekspertiz fotoğrafında ön tampon değişen, sağ ön kapı boyalı ve 18.000 TL tramer görünüyor.",
            },
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const enriched = await enrichListingImportWithPhotoEvidence(baseImportResult());

    expect(enriched.fields.tramerAmount).toBe(18000);
    expect(enriched.fields.paintedParts).toBe("Sağ ön kapı");
    expect(enriched.fields.replacedParts).toBe("Ön tampon");
    expect(enriched.fields.hasExpertiseReport).toBe(true);
    expect(enriched.fields.hasMaintenanceInvoices).toBe(true);
    expect(enriched.fields.sellerDescription).toContain("İlan görsellerinden okunan belge/kanıt notu");
    expect(enriched.images).toEqual(["https://i0.shbdn.com/photos/11/22/33/x5_vehicle.jpg"]);
    expect(enriched.missingFields).not.toContain("tramerAmount");
    expect(enriched.warnings[0]).toContain("İlan fotoğraflarındaki belge/kanıt");
  });

  it("keeps the original import result when the evidence call fails", async () => {
    const original = baseImportResult();
    vi.mocked(apiFetch).mockRejectedValueOnce(new Error("network"));

    await expect(enrichListingImportWithPhotoEvidence(original)).resolves.toBe(original);
  });

  it("infers paint and changed fields from OCR evidence text when structured fields are empty", async () => {
    vi.mocked(apiFetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          analysis: {
            hasEvidence: true,
            documentImageIndexes: [1],
            documentTypes: ["İlan açıklaması görseli"],
            evidenceSummary: "Açıklama görselinde sol ön çamurluk değişen ve iki kapı iki çamurluk yüzeysel boya yazıyor.",
            fields: {
              tramerAmount: null,
              paintedParts: null,
              replacedParts: null,
              localPaintedParts: null,
              hasExpertiseReport: null,
              sellerDescriptionAppend:
                "SOL ÖN ÇAMURLUK DEĞİŞEN. İKİ KAPI İKİ ÇAMURLUK YÜZEYSEL BOYA VARDIR.",
            },
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const enriched = await enrichListingImportWithPhotoEvidence(baseImportResult());

    expect(enriched.fields.replacedParts).toBe("Sol ön çamurluk");
    expect(enriched.fields.paintedParts).toBe("İki kapı, İki çamurluk");
    expect(enriched.missingFields).not.toContain("replacedParts");
    expect(enriched.missingFields).not.toContain("paintedParts");
  });
});
