'use client';

import { useState, useMemo } from 'react';
import { Unit } from '@/lib/types';
import { formatPrice, formatPricePerM2, statusColor, parseNum, uniqueValues } from '@/lib/utils';
import { ExternalLink, ChevronUp, ChevronDown, Download } from 'lucide-react';

interface Props {
  units: Unit[];
}

type SortKey = keyof Unit;

const PROJEKTY_LABELS: Record<string, string> = {
  midoharfa:      'MidoHarfa',
  nadskalou:      'Nad Skalou',
  viladomyumlyna: 'Viladomy u Mlýna',
  navackove:      'Na Vackově',
};

export default function PriceTable({ units }: Props) {
  // Filtry
  const [projekt, setProjekt]     = useState('');
  const [dispoFil, setDispoFil]   = useState('');
  const [statusFil, setStatusFil] = useState('');
  const [minCena, setMinCena]     = useState('');
  const [maxCena, setMaxCena]     = useState('');

  // Řazení
  const [sortKey, setSortKey]     = useState<SortKey>('projekt');
  const [sortAsc, setSortAsc]     = useState(true);

  const projekty    = uniqueValues(units, 'projekt');
  const dispozice   = uniqueValues(units, 'disposition');
  const statusy     = uniqueValues(units, 'status');

  const filtered = useMemo(() => {
    return units
      .filter(u => !projekt    || u.projekt     === projekt)
      .filter(u => !dispoFil   || u.disposition === dispoFil)
      .filter(u => !statusFil  || u.status      === statusFil)
      .filter(u => !minCena    || parseNum(u.price) >= parseNum(minCena))
      .filter(u => !maxCena    || parseNum(u.price) <= parseNum(maxCena))
      .sort((a, b) => {
        const av = a[sortKey] ?? '';
        const bv = b[sortKey] ?? '';
        const cmp = isNaN(parseNum(av)) || isNaN(parseNum(bv))
          ? av.localeCompare(bv, 'cs')
          : parseNum(av) - parseNum(bv);
        return sortAsc ? cmp : -cmp;
      });
  }, [units, projekt, dispoFil, statusFil, minCena, maxCena, sortKey, sortAsc]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(a => !a);
    else { setSortKey(key); setSortAsc(true); }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <span className="text-gray-300 ml-1">↕</span>;
    return sortAsc
      ? <ChevronUp className="inline w-3 h-3 ml-0.5 text-blue-500" />
      : <ChevronDown className="inline w-3 h-3 ml-0.5 text-blue-500" />;
  }

  function exportCsv(rows: Unit[]) {
    const headers = ['Projekt','ID bytu','Dispozice','Plocha (m²)','Patro','Cena (Kč)','Kč/m²','Stav','DOM','Změna ceny (%)'];
    const lines = [
      headers.join(';'),
      ...rows.map(u => [
        PROJEKTY_LABELS[u.projekt] ?? u.projekt,
        u.unitId, u.disposition, u.sizeM2, u.floor,
        u.price, u.pricePerM2, u.status, u.daysOnMarket, u.priceChangePct,
      ].join(';')),
    ];
    const blob = new Blob(['﻿' + lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), { href: url, download: `cenik-${new Date().toISOString().slice(0,10)}.csv` });
    a.click();
    URL.revokeObjectURL(url);
  }

  const thCls = 'px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer select-none whitespace-nowrap hover:text-gray-800';

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      {/* Filtry */}
      <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Projekt</label>
          <select
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white"
            value={projekt} onChange={e => setProjekt(e.target.value)}
          >
            <option value="">Všechny</option>
            {projekty.map(p => (
              <option key={p} value={p}>{PROJEKTY_LABELS[p] ?? p}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Dispozice</label>
          <select
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white"
            value={dispoFil} onChange={e => setDispoFil(e.target.value)}
          >
            <option value="">Všechny</option>
            {dispozice.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Stav</label>
          <select
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white"
            value={statusFil} onChange={e => setStatusFil(e.target.value)}
          >
            <option value="">Všechny</option>
            {statusy.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Cena od (Kč)</label>
          <input
            type="number"
            placeholder="např. 5000000"
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-36"
            value={minCena} onChange={e => setMinCena(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Cena do (Kč)</label>
          <input
            type="number"
            placeholder="např. 10000000"
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-36"
            value={maxCena} onChange={e => setMaxCena(e.target.value)}
          />
        </div>

        <div className="ml-auto flex items-center gap-3 self-end">
          <span className="text-sm text-gray-400">{filtered.length} bytů</span>
          <button
            onClick={() => exportCsv(filtered)}
            className="flex items-center gap-1.5 text-sm text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
            title="Exportovat do CSV"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
        </div>
      </div>

      {/* Tabulka */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className={thCls} onClick={() => toggleSort('projekt')}>
                Projekt <SortIcon col="projekt" />
              </th>
              <th className={thCls} onClick={() => toggleSort('unitId')}>
                Byt <SortIcon col="unitId" />
              </th>
              <th className={thCls} onClick={() => toggleSort('disposition')}>
                Dispoze <SortIcon col="disposition" />
              </th>
              <th className={thCls} onClick={() => toggleSort('sizeM2')}>
                Plocha <SortIcon col="sizeM2" />
              </th>
              <th className={thCls} onClick={() => toggleSort('floor')}>
                Patro <SortIcon col="floor" />
              </th>
              <th className={thCls} onClick={() => toggleSort('price')}>
                Cena <SortIcon col="price" />
              </th>
              <th className={thCls} onClick={() => toggleSort('pricePerM2')}>
                Kč/m² <SortIcon col="pricePerM2" />
              </th>
              <th className={thCls} onClick={() => toggleSort('status')}>
                Stav <SortIcon col="status" />
              </th>
              <th className={thCls} onClick={() => toggleSort('daysOnMarket')}>
                DOM <SortIcon col="daysOnMarket" />
              </th>
              <th className={thCls} onClick={() => toggleSort('priceChangePct')}>
                Změna ceny <SortIcon col="priceChangePct" />
              </th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={11} className="text-center py-10 text-gray-400">
                  Žádné byty neodpovídají filtrům.
                </td>
              </tr>
            )}
            {filtered.map(u => {
              const priceChangePct = parseNum(u.priceChangePct);
              return (
                <tr key={`${u.projekt}|${u.unitId}`} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-2 text-gray-600 whitespace-nowrap">
                    {PROJEKTY_LABELS[u.projekt] ?? u.projekt}
                  </td>
                  <td className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap">
                    {u.unitId}
                  </td>
                  <td className="px-3 py-2 text-gray-600">{u.disposition}</td>
                  <td className="px-3 py-2 text-gray-600 whitespace-nowrap">
                    {u.sizeM2 ? `${u.sizeM2} m²` : '—'}
                  </td>
                  <td className="px-3 py-2 text-gray-600">{u.floor || '—'}</td>
                  <td className="px-3 py-2 text-gray-900 font-medium whitespace-nowrap">
                    {formatPrice(u.price)}
                  </td>
                  <td className="px-3 py-2 text-gray-600 whitespace-nowrap">
                    {formatPricePerM2(u.pricePerM2)}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(u.status)}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-gray-600">{u.daysOnMarket || '—'}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {priceChangePct !== 0 ? (
                      <span className={priceChangePct < 0 ? 'text-green-600' : 'text-red-600'}>
                        {priceChangePct > 0 ? '+' : ''}{priceChangePct.toFixed(1)} %
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {u.docUrl && (
                      <a
                        href={u.docUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-600"
                        title="Otevřít detail bytu"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
