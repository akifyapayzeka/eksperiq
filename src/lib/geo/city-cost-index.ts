/**
 * Onarım maliyeti tahminini şehre göre kabaca ayarlamak için kullanılan
 * çarpan tablosu. Bu, canlı fiyat araştırması değildir — büyük şehirlerde
 * usta/parça/işçilik maliyetlerinin genelde daha yüksek olduğu bilinen
 * eğilimi statik bir katsayıya çevirir. Amaç kesin fiyat değil, mevcut
 * "İşlem × Servis tipi" aralığını bulunduğunuz şehre göre kabaca kaydırmak.
 */
const CITY_COST_INDEX: Record<string, number> = {
  istanbul: 1.2,
  ankara: 1.08,
  izmir: 1.08,
  antalya: 1.03,
  bursa: 1.0,
  kocaeli: 1.0,
  mugla: 1.03,
  adana: 0.97,
  konya: 0.95,
  gaziantep: 0.93,
  mersin: 0.95,
  kayseri: 0.93,
  eskisehir: 0.98,
  sakarya: 0.98,
  tekirdag: 1.0,
  denizli: 0.93,
  samsun: 0.93,
  balikesir: 0.95,
  manisa: 0.93,
  trabzon: 0.9,
};

/** Şehir hiç seçilmediyse aralık zaten Türkiye ortalaması için kalibre edilmiştir — dokunma. */
const NO_CITY_MULTIPLIER = 1;
/** Tabloda olmayan (küçük/orta ölçekli) bir şehir aktif seçildiğinde. */
const OTHER_CITY_MULTIPLIER = 0.9;

export function normalizeCityName(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/İ/g, "i")
    .replace(/ş/g, "s")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ö/g, "o")
    .replace(/ü/g, "u");
}

export function getCityCostMultiplier(cityName: string | null | undefined): number {
  if (!cityName) return NO_CITY_MULTIPLIER;
  return CITY_COST_INDEX[normalizeCityName(cityName)] ?? OTHER_CITY_MULTIPLIER;
}

/** Alfabetik, kullanıcıya gösterilecek gerçek Türkçe yazımlar. */
export const CITY_DISPLAY_NAMES: string[] = [
  "Adana",
  "Ankara",
  "Antalya",
  "Balıkesir",
  "Bursa",
  "Denizli",
  "Eskişehir",
  "Gaziantep",
  "İstanbul",
  "İzmir",
  "Kayseri",
  "Kocaeli",
  "Konya",
  "Manisa",
  "Mersin",
  "Muğla",
  "Sakarya",
  "Samsun",
  "Tekirdağ",
  "Trabzon",
  "Diğer",
];
