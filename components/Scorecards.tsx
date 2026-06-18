'use client';

import { Unit, DailySnapshot } from '@/lib/types';
import { parseNum, formatPricePerM2 } from '@/lib/utils';
import { Home, Clock, TrendingDown, TrendingUp, Tag, BarChart2, Plus, Minus } from 'lucide-react';

interface Props {
  units: Unit[];
  snapshot: DailySnapshot[];
  lastUpdated: string;
}

interface CardProps {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  accentColor?: string;
  badge?: { text: string; color: string };
}

function Card({ label, value, sub, icon, accentColor = '#e5e7eb', badge }: CardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col">
      <div className="h-1 w-full" style={{ background: accentColor }} />
      <div className="p-5 flex flex-col gap-2 flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-400">
            {icon}
            <span className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</span>
          </div>
          {badge && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.color}`}>{badge.text}</span>
          )}
        </div>
        <p className="text-3xl font-bold text-gray-900 leading-none">{value}</p>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>
    </div>
  );
}

function getLatestSnapshot(snapshot: DailySnapshot[]) {
  const byProjekt: Record<string, DailySnapshot> = {};
  snapshot.forEach(row => {
    const p = row['Projekt'];
    if (!byProjekt[p] || row['Datum'] > byProjekt[p]['Datum']) byProjekt[p] = row;
  });
  return Object.values(byProjekt);
}

export default function Scorecards({ units, snapshot, lastUpdated }: Props) {
  const active  = units.filter(u => u.status !== 'staženo');
  const volne   = active.filter(u => u.status === 'volný');
  const rezerv  = active.filter(u => u.status === 'rezervovaný');
  const prodane = active.filter(u => u.status === 'prodaný');
  const slevove = units.filter(u => parseNum(u.priceChangeTotal) < 0 && u.status === 'volný');

  const avgAll = (() => {
    const p = active.map(u => parseNum(u.pricePerM2)).filter(n => n > 0);
    return p.length ? formatPricePerM2(p.reduce((a, b) => a + b, 0) / p.length) : '—';
  })();

  const avgVolne = (() => {
    const p = volne.map(u => parseNum(u.pricePerM2)).filter(n => n > 0);
    return p.length ? formatPricePerM2(p.reduce((a, b) => a + b, 0) / p.length) : '—';
  })();

  const pctVolne = active.length ? Math.round((volne.length / active.length) * 100) : 0;

  const latest   = getLatestSnapshot(snapshot);
  const noveSum  = latest.reduce((s, r) => s + parseNum(r['Nové dnes']), 0);
  const odesvSum = latest.reduce((s, r) => s + parseNum(r['Odešly dnes']), 0);
  const latestDatum = latest[0]?.['Datum'] ?? '';

  const absorpce = latest.filter(r => parseNum(r['Absorption today (%)']) > 0);
  const avgAbsorption = absorpce.length
    ? (absorpce.reduce((s, r) => s + parseNum(r['Absorption today (%)']), 0) / absorpce.length).toFixed(1)
    : null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-500 uppercase tracking-widest pl-1">Aktuální stav</h2>
        <p className="text-xs text-gray-400">Aktualizováno: {lastUpdated}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card label="Volné byty"     value={String(volne.length)}  sub={`${pctVolne} % nabídky`}  icon={<Home className="w-4 h-4" />}       accentColor="#22c55e" />
        <Card label="Rezervované"    value={String(rezerv.length)} sub="bytů"                      icon={<Clock className="w-4 h-4" />}      accentColor="#f59e0b" />
        <Card label="Prodané"        value={String(prodane.length)} sub="bytů"                     icon={<TrendingDown className="w-4 h-4" />} accentColor="#ef4444" />
        <Card label="Avg cena/m² (vše)"   value={avgAll}   sub="aktivní nabídka"  icon={<BarChart2 className="w-4 h-4" />} accentColor="#3b82f6" />
        <Card label="Avg cena/m² (volné)" value={avgVolne} sub="pouze volné byty" icon={<BarChart2 className="w-4 h-4" />} accentColor="#6366f1" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card
          label="Nové dnes"
          value={noveSum > 0 ? `+${noveSum}` : '0'}
          sub={latestDatum}
          icon={<Plus className="w-4 h-4" />}
          accentColor={noveSum > 0 ? '#22c55e' : '#e5e7eb'}
        />
        <Card
          label="Odešly dnes"
          value={odesvSum > 0 ? String(odesvSum) : '0'}
          sub={latestDatum}
          icon={<Minus className="w-4 h-4" />}
          accentColor={odesvSum > 0 ? '#ef4444' : '#e5e7eb'}
        />
        <Card
          label="Byty se slevou"
          value={String(slevove.length)}
          sub="z volných bytů"
          icon={<Tag className="w-4 h-4" />}
          accentColor={slevove.length > 0 ? '#10b981' : '#e5e7eb'}
          badge={slevove.length > 0 ? { text: 'sleva', color: 'bg-green-100 text-green-700' } : undefined}
        />
        <Card
          label="Absorption rate"
          value={avgAbsorption ? `${avgAbsorption} %` : '—'}
          sub="prodáno z volných / den"
          icon={<TrendingUp className="w-4 h-4" />}
          accentColor="#8b5cf6"
        />
      </div>
    </div>
  );
}
