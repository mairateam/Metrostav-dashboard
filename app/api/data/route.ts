import { NextResponse } from 'next/server';

export const revalidate = 3600;

// Publikované ID Sheetu (část za /e/ v pub URL)
const PUBLISHED_ID = process.env.GOOGLE_PUBLISHED_ID!;

// GID každého listu — vidíš v URL po kliknutí na záložku listu (gid=XXXXX)
const GID_CURRENT  = process.env.GID_CURRENT  ?? '0';
const GID_SNAPSHOT = process.env.GID_SNAPSHOT ?? '';
const GID_PRICES   = process.env.GID_PRICES   ?? '';

function csvUrl(gid: string) {
  return `https://docs.google.com/spreadsheets/d/e/${PUBLISHED_ID}/pub?output=csv&gid=${gid}`;
}

// Jednoduchý CSV parser — zvládá uvozovkované hodnoty s čárkami uvnitř
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') { cell += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      row.push(cell); cell = '';
    } else if (ch === '\n' && !inQuotes) {
      row.push(cell); cell = '';
      rows.push(row); row = [];
    } else if (ch === '\r') {
      // ignoruj CR
    } else {
      cell += ch;
    }
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

function rowsToObjects(rows: string[][]): Record<string, string>[] {
  if (rows.length < 2) return [];
  const [headers, ...data] = rows;
  return data
    .filter(r => r.some(c => c.trim()))
    .map(row => Object.fromEntries(headers.map((h, i) => [h.trim(), (row[i] ?? '').trim()])));
}

async function fetchSheet(gid: string) {
  if (!gid) return [];
  const res = await fetch(csvUrl(gid), { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`CSV fetch selhal pro GID ${gid}: ${res.status}`);
  const text = await res.text();
  return rowsToObjects(parseCsv(text));
}

export async function GET() {
  try {
    const [current, snapshot, prices] = await Promise.all([
      fetchSheet(GID_CURRENT),
      fetchSheet(GID_SNAPSHOT),
      fetchSheet(GID_PRICES),
    ]);

    return NextResponse.json({
      current,
      snapshot,
      prices,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('CSV fetch chyba:', err);
    return NextResponse.json({ error: 'Nelze načíst data ze Sheetu.' }, { status: 500 });
  }
}
