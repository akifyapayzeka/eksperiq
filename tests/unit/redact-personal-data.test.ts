import { describe, expect, it } from "vitest";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { redactPersonalData } = require("../../api/_lib/redact-personal-data.js");

describe("redactPersonalData", () => {
  it("redacts a mobile phone number", () => {
    expect(redactPersonalData("Aramak için 0532 123 45 67 numarasını arayın")).toBe(
      "Aramak için [PHONE_REDACTED] numarasını arayın",
    );
  });

  it("redacts a phone number with +90 country code and no spaces", () => {
    expect(redactPersonalData("+905321234567 whatsapp")).toBe("[PHONE_REDACTED] whatsapp");
  });

  it("redacts a landline number", () => {
    expect(redactPersonalData("Servis: 0212 555 12 34")).toBe("Servis: [PHONE_REDACTED]");
  });

  it("redacts an email address", () => {
    expect(redactPersonalData("iletisim: ahmet.yilmaz@example.com adresinden yazabilirsiniz")).toBe(
      "iletisim: [EMAIL_REDACTED] adresinden yazabilirsiniz",
    );
  });

  it("redacts a Turkish vehicle plate", () => {
    expect(redactPersonalData("Plaka 34 ABC 123 ile tescilli")).toBe("Plaka [PLATE_REDACTED] ile tescilli");
  });

  it("redacts multiple personal data types in the same text", () => {
    const input = "Sahibi Ahmet Bey, 0532 111 22 33 veya ahmet@example.com, plaka 06 A 1234.";
    const result = redactPersonalData(input);
    expect(result).toContain("[PHONE_REDACTED]");
    expect(result).toContain("[EMAIL_REDACTED]");
    expect(result).toContain("[PLATE_REDACTED]");
    expect(result).not.toMatch(/0532|ahmet@example\.com|06 A 1234/);
  });

  it("preserves ordinary vehicle technical data (price, mileage, engine, year)", () => {
    const input = "2020 model, 1.6 dizel, 116 hp, 125.430 km, fiyatı 850.000 TL, İstanbul'da";
    expect(redactPersonalData(input)).toBe(input);
  });

  it("preserves brand/model text and does not over-redact short digit runs", () => {
    const input = "Toyota Corolla 1.6 Vision, şasi son 4 hane 4521, motor 1598 cc";
    expect(redactPersonalData(input)).toBe(input);
  });

  it("returns non-string input unchanged", () => {
    expect(redactPersonalData(undefined)).toBeUndefined();
    expect(redactPersonalData("")).toBe("");
  });
});
