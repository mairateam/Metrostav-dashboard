// Jeden byt z listu "Ceník — Aktuální stav"
export interface Unit {
  projekt: string;
  unitId: string;
  disposition: string;    // dispozice, např. "2+kk"
  sizeM2: string;
  floor: string;
  orientation: string;
  outdoorM2: string;
  price: string;
  pricePerM2: string;
  status: string;         // "volný" | "rezervovaný" | "prodaný" | "staženo"
  docUrl: string;
  firstSeen: string;
  lastSeen: string;
  daysOnMarket: string;
  listPriceAtFirstSeen: string;
  priceChangeTotal: string;
  priceChangePct: string;
  lastUpdated: string;
  [key: string]: string;
}

// Jeden řádek z "Denní snapshot"
export interface DailySnapshot {
  Datum: string;
  Projekt: string;
  Volné: string;
  Rezervované: string;
  Prodané: string;
  Staženo: string;
  'Celkem viditelných': string;
  'Nové dnes': string;
  'Odešly dnes': string;
  'Absorption today (%)': string;
  [key: string]: string;
}

// Jeden řádek z "Denní ceny"
export interface DailyPrice {
  Datum: string;
  Projekt: string;
  Dispozice: string;
  Volné: string;
  'Avg cena (Kč)': string;
  'Median cena (Kč)': string;
  'Avg cena/m² (Kč)': string;
  [key: string]: string;
}

// Jeden řádek z "Historie změn"
export interface HistoryRow {
  Datum: string;
  Projekt: string;
  'ID bytu': string;
  'Typ změny': string;
  'Stará hodnota': string;
  'Nová hodnota': string;
  Poznámka: string;
  [key: string]: string;
}

export interface ApiData {
  current:  Record<string, string>[];
  snapshot: Record<string, string>[];
  prices:   Record<string, string>[];
  history:  Record<string, string>[];
  fetchedAt: string;
}
