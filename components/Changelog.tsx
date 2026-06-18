'use client';

import { useState } from 'react';
import { HistoryRow } from '@/lib/types';
import { parseNum } from '@/lib/utils';

const PROJEKTY_LABELS: Record<string, string> = {
  midoharfa:      'MidoHarfa',
  nadskalou:      'Nad Skalou',
  viladomyumlyna: 'Viladomy u Mlýna',
  navackove:      'Na Vackově',
};

const TYP_COLORS: Record<string, string> = {
  'nový':           'bg-green-100 text-green-700',
  'prodaný':        'bg-red-100 text-red-700',
  'rezervovaný':    'bg-yellow-100 text-yellow-700',
  'volný':          'bg-green-100 text-green-700',
  'zdražení':       'bg-red-100 text-red-700',
  'sleva':          'bg-blue-100 text-blue-700',
  'staženo':        'bg-gray-100 text-gray-500',
  'vrátilo se':     'bg-purple-100 text-purple-700',
};

const PAGE_SIZE = 30;

interface Props {
  history: HistoryRow[];
}

export default function Changelog({ history }: Props) {
  const [typFil, setTypFil]       = useState('');
  const [projektFil, setProjektFil] = useState('');
  const [page, setPage]           = useState(0);

  // Nejnovější nahoře
  const sorted = [...history].reverse();

  const typy    = Array.from(new Set(history.map(r => r['Typ změny']).filter(Boolean))).sort();
  const projekty = Array.from(new Set(history.map(r => r['Projekt']).filter(Boolean))).sort();

  const filtered = sorted
    .filter(r => !typFil     || r['Typ změny'] === typFil)
    .filter(r => !projektFil || r['Projekt']   === projektFil);

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const visible   = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function formatValue(row: HistoryRow) {
    const typ = row['Typ změny'];
    const old = row['Stará hodnota'];
    const nou = row['Nová hodnota'];
    if (typ === 'sleva' || typ === 'zdražení') {
      const diff = parseNum(nou) - parseNum(old);
      const sign = diff > 0 ? '+' : '';
      return (
        <span className={diff < 0 ? 'text-green-600' : 'text-red-600'}>
          {sign}{diff.toLocaleString('cs-CZ')} Kč
          <span className="text-gray-400 ml-1">
            ({parseNum(old).toLocaleString('cs-CZ')} → {parseNum(nou).toLocaleString('cs-CZ')})
          </span>
        </span>
      );
    }
    if (old && nou) return <span className="text-gray-500">{old} → {nou}</span>;
    if (nou)        return <span className="text-gray-600">{nou}</span>;
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-700">Changelog změn</h3>
          <span className="text-xs text-gray-400">{filtered.length} záznamů</span>
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white"
            value={typFil} onChange={e => { setTypFil(e.target.value); setPage(0); }}
          >
            <option value="">Všechny typy</option>
            {typy.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white"
            value={projektFil} onChange={e => { setProjektFil(e.target.value); setPage(0); }}
          >
            <option value="">Všechny projekty</option>
            {projekty.map(p => <option key={p} value={p}>{PROJEKTY_LABELS[p] ?? p}</option>)}
          </select>
        </div>
      </div>

      <div className="divide-y divide-gray-50">
        {visible.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-10">Žádné záznamy.</p>
        )}
        {visible.map((row, i) => (
          <div key={i} className="px-5 py-3 flex items-center gap-4 text-sm hover:bg-gray-50">
            <span className="text-gray-400 text-xs w-24 shrink-0">{row['Datum']}</span>
            <span className="text-gray-500 text-xs w-28 shrink-0">{PROJEKTY_LABELS[row['Projekt']] ?? row['Projekt']}</span>
            <span className="font-medium text-gray-800 w-20 shrink-0">{row['ID bytu']}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${TYP_COLORS[row['Typ změny']] ?? 'bg-gray-100 text-gray-600'}`}>
              {row['Typ změny']}
            </span>
            <span className="text-xs">{formatValue(row)}</span>
            {row['Poznámka'] && (
              <span className="text-xs text-gray-400 ml-auto truncate max-w-xs">{row['Poznámka']}</span>
            )}
          </div>
        ))}
      </div>

      {pageCount > 1 && (
        <div className="p-4 border-t border-gray-100 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1 text-sm border border-gray-200 rounded-lg disabled:opacity-30 hover:bg-gray-50"
          >
            ← Novější
          </button>
          <span className="text-xs text-gray-400">{page + 1} / {pageCount}</span>
          <button
            onClick={() => setPage(p => Math.min(pageCount - 1, p + 1))}
            disabled={page === pageCount - 1}
            className="px-3 py-1 text-sm border border-gray-200 rounded-lg disabled:opacity-30 hover:bg-gray-50"
          >
            Starší →
          </button>
        </div>
      )}
    </div>
  );
}
