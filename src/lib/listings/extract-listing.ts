import { CURRENT_YEAR } from "@/lib/constants/analysis";

export type ExtractedListingFields = {
  brand?: string;
  model?: string;
  year?: number;
  fuelType?: string;
  transmission?: string;
  mileage?: number;
  price?: number;
  city?: string;
  bodyType?: string;
  tramerAmount?: number;
  hasHeavyDamage?: boolean;
  hasTotalLossHistory?: boolean;
  hasExpertiseReport?: boolean;
  sellerDescription?: string;
};

const brands = [
  "Audi",
  "BMW",
  "BYD",
  "Chery",
  "Chevrolet",
  "Citroen",
  "Cupra",
  "Dacia",
  "Fiat",
  "Ford",
  "Honda",
  "Hyundai",
  "Jeep",
  "Kia",
  "Lexus",
  "Mazda",
  "Mercedes-Benz",
  "MG",
  "Mini",
  "Nissan",
  "Opel",
  "Peugeot",
  "Renault",
  "Seat",
  "Skoda",
  "Suzuki",
  "Tesla",
  "Toyota",
  "Volkswagen",
  "Volvo",
];

const models = [
  "A3",
  "Astra",
  "Civic",
  "Clio",
  "Corolla",
  "Egea",
  "Fiesta",
  "Focus",
  "Golf",
  "i20",
  "Megane",
  "Octavia",
  "Passat",
  "Polo",
  "Qashqai",
  "Sandero",
  "Symbol",
  "Taliant",
  "Tiguan",
];

const cities = [
  "Adana",
  "Ankara",
  "Antalya",
  "Bursa",
  "Istanbul",
  "Izmir",
  "Kayseri",
  "Kocaeli",
  "Konya",
  "Samsun",
  "Trabzon",
];

const bodyTypes = ["Sedan", "Hatchback", "Station wagon", "SUV", "Crossover", "Coupe", "Cabrio", "MPV", "Pickup"];

const cityDisplayNames: Record<string, string> = {
  istanbul: "İstanbul",
  izmir: "İzmir",
};

function normalize(value: string): string {
  return value
    .toLocaleLowerCase("tr-TR")
    .replaceAll("ı", "i")
    .replaceAll("ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("ş", "s")
    .replaceAll("ö", "o")
    .replaceAll("ç", "c")
    .replaceAll("İ", "i");
}

function includesWord(text: string, value: string): boolean {
  return new RegExp(`(^|[^a-z0-9])${normalize(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z0-9]|$)`, "i").test(
    text,
  );
}

function firstOption(text: string, options: string[]): string | undefined {
  const match = options.find((option) => includesWord(text, option));
  if (!match) return undefined;
  const normalizedMatch = normalize(match);
  return cityDisplayNames[normalizedMatch] ?? match;
}

function parseNumber(value: string): number | undefined {
  const normalized = value.replace(/[^\d]/g, "");
  if (!normalized) return undefined;
  const parsed = Number.parseInt(normalized, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function extractYear(text: string): number | undefined {
  const years = [...text.matchAll(/\b(19[8-9]\d|20[0-2]\d)\b/g)]
    .map((match) => Number.parseInt(match[1] ?? "", 10))
    .filter((year) => year >= 1980 && year <= CURRENT_YEAR);
  return years[0];
}

function extractKm(rawText: string): number | undefined {
  const match =
    rawText.match(/(\d[\d.\s]{2,})\s*(?:km|kilometre)\b/i) ?? rawText.match(/(?:km|kilometre)\s*:?\s*(\d[\d.\s]{2,})/i);
  return match?.[1] ? parseNumber(match[1]) : undefined;
}

function extractPrice(rawText: string): number | undefined {
  const match = rawText.match(/(\d[\d.\s]{4,})\s*(?:tl|₺)/i) ?? rawText.match(/fiyat\s*:?\s*(\d[\d.\s]{4,})/i);
  return match?.[1] ? parseNumber(match[1]) : undefined;
}

function extractTramer(rawText: string, normalized: string): number | undefined {
  if (/tramer.{0,24}(yok|yoktur|bulunmuyor|bulunmamaktadir|sifir)\b/i.test(normalized)) return 0;
  if (/\btramer\s*:?\s*0\s*(tl)?\b/i.test(normalized)) return 0;
  const match = rawText.match(/tramer[^\d]{0,24}(\d[\d.\s]{2,})/i);
  return match?.[1] ? parseNumber(match[1]) : undefined;
}

function hasPositiveClaim(normalized: string, phrase: string, negatedPattern: RegExp): boolean | undefined {
  if (!includesWord(normalized, phrase)) return undefined;
  return !negatedPattern.test(normalized);
}

export function extractListingFields(rawText: string): ExtractedListingFields {
  const normalized = normalize(rawText);
  const fuelType = includesWord(normalized, "dizel")
    ? "Dizel"
    : includesWord(normalized, "benzin")
      ? "Benzin"
      : includesWord(normalized, "hibrit")
        ? "Hibrit"
        : includesWord(normalized, "elektrik")
          ? "Elektrik"
          : includesWord(normalized, "lpg")
            ? "LPG"
            : undefined;
  const transmission = includesWord(normalized, "yari otomatik")
    ? "Yarı otomatik"
    : includesWord(normalized, "otomatik")
      ? "Otomatik"
      : includesWord(normalized, "manuel")
        ? "Manuel"
        : undefined;

  return {
    brand: firstOption(normalized, brands),
    model: firstOption(normalized, models),
    year: extractYear(normalized),
    fuelType,
    transmission,
    mileage: extractKm(rawText),
    price: extractPrice(rawText),
    city: firstOption(normalized, cities),
    bodyType: firstOption(normalized, bodyTypes),
    tramerAmount: extractTramer(rawText, normalized),
    hasHeavyDamage: hasPositiveClaim(
      normalized,
      "agir hasar",
      /agir hasar.{0,32}(yok|yoktur|bulunmuyor|bulunmamaktadir|belirtilmemis)/i,
    ),
    hasTotalLossHistory: hasPositiveClaim(
      normalized,
      "pert",
      /pert.{0,32}(yok|yoktur|kaydi yok|gecmisi yok|bulunmuyor|bulunmamaktadir)/i,
    ),
    hasExpertiseReport: includesWord(normalized, "ekspertiz") ? true : undefined,
    sellerDescription: rawText.trim().length >= 20 ? rawText.trim() : undefined,
  };
}
