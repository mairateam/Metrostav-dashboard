'use client';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { DailyPrice } from '@/lib/types';
import { parseNum } from '@/lib/utils';

// Barvy dispozic
const DISP_COLORS: Record<string, string> = {
  '1+kk': '#8b5cf6',
  '2+kk': '#3b82f6',
  '3+kk': '#10b981',
  '4+kk': '#f59e0b',
  '5+kk': '#ef4444',
};

interface Props {
  prices: DailyPrice[];
  projekt: string;
}

export default function PriceChart({ prices, projekt }: Props) {
  const filtered = prices.filter(r => r['Projekt'] === projekt);
  const dispozice = Array.from(new Set(filtered.map(r => r['Dispozice']))).sort();

  const byDate: Record<string, Record<string, number>> = {};
  filtered.forEach(row => {
    const datum = row['Datum'];
    if (!datum) return;
    if (!byDate[datum]) byDate[datum] = {};
    byDate[datum][row['Dispozice']] = parseNum(row['Avg cena/m² (Kč)']);
  });

  const data = Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([datum, vals]) => ({ datum, ...vals }));

  if (!data.length) {
    return <p className="text-sm text-gray-400 py-8 text-center">Žádná data pro {projekt}.</p>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-5">
      <h3 className="font-semibold text-gray-700 mb-4">
        Vývoj avg ceny/m² — {projekt}
      </h3>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="datum" tick={{ fontSize: 11 }} tickLine={false} />
          <YAxis
            tick={{ fontSize: 11 }}
            tickLine={false}
            tickFormatter={v => (v / 1000).toFixed(0) + 'k'}
          />
          <Tooltip formatter={(v) => typeof v === 'number' ? v.toLocaleString('cs-CZ') + ' Kč/m²' : v} />
          <Legend />
          {dispozice.map(d => (
            <Line
              key={d}
              type="monotone"
              dataKey={d}
              name={d}
              stroke={DISP_COLORS[d] ?? '#6b7280'}
              dot={false}
              strokeWidth={2}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
