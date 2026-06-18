'use client';

import { useState, useMemo } from 'react';
import { Unit, DailySnapshot, DailyPrice, HistoryRow } from '@/lib/types';
import { uniqueValues } from '@/lib/utils';
import Scorecards from './Scorecards';
import SalesChart from './SalesChart';
import PriceChart from './PriceChart';
import PriceTable from './PriceTable';
import DomChart from './DomChart';
import PriceHistogram from './PriceHistogram';
import PriceHeatmap from './PriceHeatmap';
import Changelog from './Changelog';

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-1 h-5 rounded-full" style={{ background: 'var(--brand)' }} />
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest">{children}</h2>
    </div>
  );
}

const PROJEKTY_LABELS: Record<string, string> = {
  midoharfa:      'MidoHarfa',
  nadskalou:      'Nad Skalou',
  viladomyumlyna: 'Viladomy u Mlýna',
  navackove:      'Na Vackově',
};

const PROJEKTY_ORDER = ['midoharfa', 'nadskalou', 'viladomyumlyna', 'navackove'];

interface Props {
  units: Unit[];
  snapshot: DailySnapshot[];
  prices: DailyPrice[];
  history: HistoryRow[];
  lastUpdated: string;
}

export default function Dashboard({ units, snapshot, prices, history, lastUpdated }: Props) {
  const [projektFil, setProjektFil] = useState('');
  const [dispoFil, setDispoFil]     = useState('');

  const projekty  = uniqueValues(units, 'projekt');
  const dispozice = uniqueValues(units, 'disposition');

  const filteredUnits = useMemo(() =>
    units
      .filter(u => !projektFil || u.projekt     === projektFil)
      .filter(u => !dispoFil   || u.disposition === dispoFil),
    [units, projektFil, dispoFil]
  );

  const filteredSnapshot = useMemo(() =>
    snapshot.filter(r => !projektFil || r['Projekt'] === projektFil),
    [snapshot, projektFil]
  );

  const filteredPrices = useMemo(() =>
    prices
      .filter(r => !projektFil || r['Projekt']   === projektFil)
      .filter(r => !dispoFil   || r['Dispozice'] === dispoFil),
    [prices, projektFil, dispoFil]
  );

  const filteredHistory = useMemo(() =>
    history.filter(r => !projektFil || r['Projekt'] === projektFil),
    [history, projektFil]
  );

  const visibleProjekty = projektFil
    ? [projektFil]
    : PROJEKTY_ORDER.filter(p => projekty.includes(p));

  const hasActiveFilter = projektFil || dispoFil;

  return (
    <div className="space-y-8">
      {/* Globální filtry */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-gray-500 font-medium uppercase tracking-wide">Projekt</label>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setProjektFil('')}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                !projektFil ? 'text-white border-transparent' : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'
              }`}
              style={!projektFil ? { background: 'var(--brand)' } : {}}
            >
              Všechny
            </button>
            {projekty.map(p => (
              <button
                key={p}
                onClick={() => setProjektFil(p === projektFil ? '' : p)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                  projektFil === p ? 'text-white border-transparent' : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'
                }`}
                style={projektFil === p ? { background: 'var(--brand)' } : {}}
              >
                {PROJEKTY_LABELS[p] ?? p}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-gray-500 font-medium uppercase tracking-wide">Dispozice</label>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setDispoFil('')}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                !dispoFil ? 'text-white border-transparent' : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'
              }`}
              style={!dispoFil ? { background: 'var(--brand)' } : {}}
            >
              Všechny
            </button>
            {dispozice.map(d => (
              <button
                key={d}
                onClick={() => setDispoFil(d === dispoFil ? '' : d)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                  dispoFil === d ? 'text-white border-transparent' : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'
                }`}
                style={dispoFil === d ? { background: 'var(--brand)' } : {}}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {hasActiveFilter && (
          <button
            onClick={() => { setProjektFil(''); setDispoFil(''); }}
            className="text-xs text-gray-400 hover:text-gray-600 underline self-end pb-2"
          >
            Zrušit filtry
          </button>
        )}
      </div>

      {/* Scorecards */}
      <Scorecards units={filteredUnits} snapshot={filteredSnapshot} lastUpdated={lastUpdated} />

      {/* Graf prodejnosti */}
      {filteredSnapshot.length > 0 && (
        <section>
          <SectionTitle>Prodejnost v čase</SectionTitle>
          <SalesChart snapshot={filteredSnapshot} />
        </section>
      )}

      {/* DOM + histogram */}
      <section>
        <SectionTitle>Analýza nabídky</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DomChart units={filteredUnits} />
          <PriceHistogram units={filteredUnits} />
        </div>
      </section>

      {/* Heatmapa */}
      <section>
        <SectionTitle>Cenová mapa</SectionTitle>
        <PriceHeatmap units={filteredUnits} />
      </section>

      {/* Cenový vývoj per projekt */}
      {filteredPrices.length > 0 && (
        <section>
          <SectionTitle>Cenový vývoj per projekt</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {visibleProjekty.map(p => (
              <PriceChart key={p} prices={filteredPrices} projekt={p} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
