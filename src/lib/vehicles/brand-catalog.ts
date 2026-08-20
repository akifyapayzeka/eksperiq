/**
 * Marka/model referans verisi. Alan yapısı sahibinden.com'un "Detaylı Arama"
 * ilan formundaki Marka -> Seri -> Model kademeli seçim mantığından esinlenir
 * (canlı sayfa bot korumasından 403 döndürdüğü için doğrudan kazınamadı, bu
 * yüzden o formun bilinen, uzun süredir değişmeyen genel yapısı esas alındı):
 * Marka ve Yakıt/Vites gibi sonlu kümeler seçmeli, Model ise markaya göre
 * öneri sunan ama serbest girişe de izin veren bir alan (sahibinden'deki
 * "Seri" -> "Model" kademesinin tamamını burada birebir taşımak, bu
 * uygulamanın kapsamını aşan bir pazar yeri veritabanı gerektirir).
 * Plaka ve Kilometre sahibinden'de de her zaman serbest/manuel alanlardır.
 */

export const VEHICLE_BRANDS = [
  "Fiat",
  "Renault",
  "Volkswagen",
  "Ford",
  "Opel",
  "Toyota",
  "Hyundai",
  "Peugeot",
  "Citroën",
  "Dacia",
  "BMW",
  "Mercedes-Benz",
  "Audi",
  "Skoda",
  "Nissan",
  "Honda",
  "Kia",
  "Seat",
  "Volvo",
  "Mazda",
  "Suzuki",
  "Mitsubishi",
  "Jeep",
  "Land Rover",
  "Mini",
  "Porsche",
  "Alfa Romeo",
  "Chevrolet",
  "MG",
  "Tofaş",
  "Togg",
  "Diğer",
] as const;

export type VehicleBrand = (typeof VEHICLE_BRANDS)[number];

export const VEHICLE_MODELS_BY_BRAND: Record<string, string[]> = {
  Fiat: ["Egea", "Egea Cross", "500", "Doblo", "Panda", "Tipo", "Fiorino", "Linea"],
  Renault: ["Clio", "Megane", "Symbol", "Talisman", "Kadjar", "Captur", "Taliant", "Fluence", "Kangoo"],
  Volkswagen: ["Polo", "Golf", "Passat", "Jetta", "Tiguan", "T-Roc", "T-Cross", "Caddy", "Arteon"],
  Ford: ["Focus", "Fiesta", "Mondeo", "Kuga", "Puma", "Courier", "EcoSport", "Ranger"],
  Opel: ["Corsa", "Astra", "Insignia", "Mokka", "Crossland", "Grandland", "Combo"],
  Toyota: ["Corolla", "Yaris", "C-HR", "RAV4", "Auris", "Camry", "Hilux", "Corolla Cross"],
  Hyundai: ["i20", "i10", "Elantra", "Tucson", "Bayon", "Accent Blue", "Kona", "Santa Fe"],
  Peugeot: ["208", "301", "308", "2008", "3008", "508", "5008", "Partner"],
  Citroën: ["C3", "C-Elysée", "C4", "C4 Cactus", "Berlingo", "C5 Aircross"],
  Dacia: ["Duster", "Sandero", "Logan", "Jogger", "Spring"],
  BMW: ["1 Serisi", "2 Serisi", "3 Serisi", "4 Serisi", "5 Serisi", "X1", "X3", "X5"],
  "Mercedes-Benz": ["A Serisi", "B Serisi", "C Serisi", "E Serisi", "CLA", "GLA", "GLC", "Vito"],
  Audi: ["A1", "A3", "A4", "A5", "A6", "Q2", "Q3", "Q5"],
  Skoda: ["Fabia", "Octavia", "Superb", "Kamiq", "Karoq", "Kodiaq", "Scala"],
  Nissan: ["Micra", "Note", "Qashqai", "Juke", "X-Trail", "Navara"],
  Honda: ["Civic", "City", "CR-V", "HR-V", "Jazz"],
  Kia: ["Rio", "Ceed", "Sportage", "Stonic", "Sorento", "Picanto", "Niro"],
  Seat: ["Ibiza", "Leon", "Arona", "Ateca", "Tarraco"],
  Volvo: ["S60", "S90", "V40", "V60", "XC40", "XC60", "XC90"],
  Mazda: ["2", "3", "6", "CX-3", "CX-5", "CX-30"],
  Suzuki: ["Swift", "Vitara", "S-Cross", "Baleno", "Jimny"],
  Mitsubishi: ["Lancer", "ASX", "Outlander", "Space Star", "L200"],
  Jeep: ["Renegade", "Compass", "Grand Cherokee", "Wrangler"],
  "Land Rover": ["Range Rover Evoque", "Range Rover Sport", "Discovery Sport", "Defender"],
  Mini: ["Cooper", "Cooper S", "Countryman", "Clubman"],
  Porsche: ["911", "Cayenne", "Macan", "Panamera", "Taycan"],
  "Alfa Romeo": ["Giulietta", "Giulia", "Stelvio", "Mito"],
  Chevrolet: ["Aveo", "Cruze", "Captiva", "Spark", "Lacetti"],
  MG: ["ZS", "HS", "MG5", "MG4"],
  Tofaş: ["Şahin", "Doğan", "Kartal", "Fiat Doblo (Tofaş üretim)"],
  Togg: ["T10X"],
};

export function modelsForBrand(brand: string): string[] {
  return VEHICLE_MODELS_BY_BRAND[brand] ?? [];
}
