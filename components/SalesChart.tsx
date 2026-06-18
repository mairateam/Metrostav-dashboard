'use client';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { DailySnapshot } from '@/lib/types';
import { parseNum } from '@/lib/utils';

const PROJEKT_COLORS: Record<string, string> = {
  midoharfa:       '#3b82f6',
  nadskalou:       '#10b981',
  viladomyumlyna:  '#f59e0b',
  navackove:       '#ef4444',
};

interface Props {
  snapshot: DailySnapshot[];
}

export default function SalesChart({ snapshot }: Props) {
  // Agregujeme per datum (součet volných přes projekty)
  const byDate: Record<string, Record<string, number>> = {};
  const projekty = Array.from(new Set(snapshot.map(r => r['Projekt'])));

  snapshot.forEach(row => {
    const datum = row['Datum'];
    if (!datum) return;
    if (!byDate[datum]) byDate[datum] = {};
    byDate[datum][row['Projekt']] = parseNum(row['Volné']);
  });

  const data = Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([datum, vals]) => ({ datum, ...vals }));

  if (!data.length) {
    return <p className="text-sm text-gray-400 py-8 text-center">Žádná historická data.</p>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-5">
      <h3 className="font-semibold text-gray-700 mb-4">Volné byty v čase (per projekt)</h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="datum" tick={{ fontSize: 11 }} tickLine={false} />
          <YAxis tick={{ fontSize: 11 }} tickLine={false} />
          <Tooltip />
          <Legend />
          {projekty.map(p => (
            <Line
              key={p}
              type="monotone"
              dataKey={p}
              name={p}
              stroke={PROJEKT_COLORS[p] ?? '#6b7280'}
              dot={false}
              strokeWidth={2}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
