export type PlaceCategory = "ekspertiz" | "noter" | "servis";

export type NearbyPlace = {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  lat: number;
  lng: number;
  distanceKm: number;
};

export const placeCategoryLabels: Record<PlaceCategory, string> = {
  ekspertiz: "Ekspertiz firmaları",
  noter: "Noterler",
  servis: "Bakım / servis",
};
