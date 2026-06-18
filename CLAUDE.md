# CLAUDE.md — Metrostav Tracker Frontend

Next.js frontend pro monitoring ceníků bytů. Čte data z Google Sheetu přes Sheets API.

## Stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS** — styling
- **Recharts** — grafy
- **googleapis** — čtení Sheetu přes service account

## Architektura

```
Google Sheet (5 listů)
    ↓ Sheets API v4 (service account, read-only)
/api/data route (cache 1h)
    ↓
page.tsx (server component) → komponenty (client)
```

## Klíčové soubory

| Soubor | K čemu |
|---|---|
| `app/api/data/route.ts` | API route — čte 3 listy ze Sheetu, vrací JSON |
| `lib/types.ts` | TypeScript typy (Unit, DailySnapshot, DailyPrice) |
| `lib/utils.ts` | Helper funkce (formatPrice, toUnit, statusColor…) |
| `components/Scorecards.tsx` | Horní karty: volné/rezerv/prodané/avg cena/m² |
| `components/SalesChart.tsx` | Čárový graf — volné byty v čase per projekt |
| `components/PriceChart.tsx` | Čárový graf — avg cena/m² per dispozice per projekt |
| `components/PriceTable.tsx` | Filtrovaná tabulka ceníku s řazením |
| `app/page.tsx` | Server component — orchestrace dat a layoutu |

## ENV proměnné

Viz `.env.local.example`. Kopírovat jako `.env.local` a doplnit:

- `GOOGLE_SHEET_ID` — ID spreadsheetu z URL
- `GOOGLE_SERVICE_ACCOUNT_JSON` — celý JSON service accountu (jeden řádek)
- `NEXT_PUBLIC_BASE_URL` — pro Vercel: `https://metrostav-tracker.vercel.app`

## Jak spustit lokálně

```bash
cp .env.local.example .env.local
# ... doplnit hodnoty v .env.local ...
npm run dev
```

## Vercel deployment

1. Pushni na GitHub (zeptat se uživatele na GitHub účet)
2. Připoj repo ve Vercelu
3. Nastav env proměnné v Vercel dashboard (Settings → Environment Variables)
4. Deploy

## Pravidla

- Komentáře česky
- Nikdy neautocommituj/pushuj
- Změny logovat do FIXES.md (nejnovější nahoře)
- `.env.local` je v `.gitignore` — nikdy do gitu
