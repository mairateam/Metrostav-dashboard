import { Unit } from './types';

export function parseNum(val: string): number {
  if (!val) return 0;
  return parseFloat(val.toString().replace(/\s/g, '').replace(',', '.')) || 0;
}

export function formatPrice(val: string | number): string {
  const n = typeof val === 'string' ? parseNum(val) : val;
  if (!n) return '—';
  return n.toLocaleString('cs-CZ') + ' Kč';
}

export function formatPricePerM2(val: string | number): string {
  const n = typeof val === 'string' ? parseNum(val) : val;
  if (!n) return '—';
  return n.toLocaleString('cs-CZ') + ' Kč/m²';
}

// Barva stavu
export function statusColor(status: string): string {
  switch (status) {
    case 'volný':       return 'bg-green-100 text-green-800';
    case 'rezervovaný': return 'bg-yellow-100 text-yellow-800';
    case 'prodaný':     return 'bg-red-100 text-red-800';
    case 'staženo':     return 'bg-gray-100 text-gray-500';
    default:            return 'bg-gray-100 text-gray-600';
  }
}

// Unikátní hodnoty sloupce z pole bytů
export function uniqueValues(units: Unit[], key: keyof Unit): string[] {
  return Array.from(new Set(units.map(u => u[key]).filter(Boolean))).sort();
}

// Převod řádků ze Sheets API (Record<string,string>) na Unit
export function toUnit(row: Record<string, string>): Unit {
  return {
    projekt:              row['Projekt']                  ?? '',
    unitId:               row['ID bytu']                  ?? '',
    disposition:          row['Dispozice']                ?? '',
    sizeM2:               row['Plocha (m²)']              ?? '',
    floor:                row['Patro']                    ?? '',
    orientation:          row['Orientace']                ?? '',
    outdoorM2:            row['Venkovní plocha (m²)']     ?? '',
    price:                row['Cena vč. DPH (Kč)']        ?? '',
    pricePerM2:           row['Cena za m² (Kč/m²)']       ?? '',
    status:               row['Stav']                     ?? '',
    docUrl:               row['Odkaz na detail']          ?? '',
    firstSeen:            row['First seen']               ?? '',
    lastSeen:             row['Last seen']                ?? '',
    daysOnMarket:         row['Days on market']           ?? '',
    listPriceAtFirstSeen: row['Cena při prvním výskytu']  ?? '',
    priceChangeTotal:     row['Změna ceny celkem (Kč)']   ?? '',
    priceChangePct:       row['Změna ceny (%)']           ?? '',
    lastUpdated:          row['Last updated']             ?? '',
  };
}
