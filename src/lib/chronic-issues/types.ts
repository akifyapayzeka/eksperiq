/**
 * "Bilinen kronik sorunlar" veritabanı tipleri. Bu, BU aracın kendi
 * geçmişi/durumuyla ilgili olan analysis/ motorundan (findings[]) ayrı
 * tutulur — burası "bu marka/model/motor ailesinde yaygın olarak
 * bildirilen" model-seviyesi bilgi, tek bir ilan/aracın kendi durumu değil.
 * Bu yüzden risk skorunu etkilemez; ayrı, bilgilendirici bir bölüm olarak
 * gösterilir.
 */

export type IssueSeverity = "high" | "medium" | "low";

export type ChronicIssue = {
  id: string;
  severity: IssueSeverity;
  title: string;
  detail: string;
  /** Ne zaman/km'de tipik olarak ortaya çıktığı, biliniyorsa. */
  typicalOnset?: string;
  /** Tahmini onarım maliyet seviyesi (kesin TL vermiyoruz — parça/işçilik zamanla değişir). */
  costLevel?: "Düşük" | "Orta" | "Yüksek";
  /** Bu bulgunun dayandığı kaynak türü — kesin hüküm gibi sunmamak için. */
  sourceNote: string;
};

export type EngineVariant = {
  /** Örn. "1.2 TSI", "1.6 TDI", "1.4 MultiJet". Motor ailesini/kodunu tanımlar. */
  engineLabel: string;
  fuelType: "Benzin" | "Dizel" | "Hibrit" | "Elektrik" | "LPG";
  /** Belirtilmezse bu motorun tüm vites tiplerine uygulanır. */
  transmission?: "Manuel" | "Otomatik" | "Yarı otomatik";
  /**
   * Yalnızca belirli paket/donanım seviyelerine özgü bir sorun varsa
   * doldurulur (nadirdir — çoğu kronik sorun motor koduna bağlıdır, pakete
   * değil). Boşsa bu motoru kullanan tüm paketlere uygulanır.
   */
  trims?: string[];
  yearFrom?: number;
  yearTo?: number;
  reliabilityNote?: string;
  issues: ChronicIssue[];
};

export type ModelEntry = {
  brand: string;
  model: string;
  /** Nesil/kasa kodu biliniyorsa (ör. Ibiza 6J), kullanıcıya gösterim için. */
  generation?: string;
  yearFrom: number;
  yearTo: number;
  generalNote?: string;
  engines: EngineVariant[];
};
