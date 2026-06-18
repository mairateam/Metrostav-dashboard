'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Unit } from '@/lib/types';
import { parseNum } from '@/lib/utils';

interface Props {
  units: Unit[];
}

export default function PriceHistogram({ units }: Props) {
  const volne = units.filter(u => u.status === 'volný' && parseNum(u.price) > 0);
  if (!volne.length) return null;

  const prices = volne.map(u => parseNum(u.price));
  const min = Math.floor(Math.min(...prices) / 1_000_000) * 1_000_000;
  const max = Math.ceil( Math.max(...prices) / 1_000_000) * 1_000_000;
  const step = 1_000_000;

  const buckets: { label: string; count: number }[] = [];
  for (let lo = min; lo < max; lo += step) {
    const hi = lo + step;
    buckets.push({
      label: `${lo / 1_000_000}M`,
      count: prices.filter(p => p >= lo && p < hi).length,
    });
  }

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-5">
      <h3 className="font-semibold text-gray-700 mb-4">Distribuce cen — volné byty</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={buckets} barSize={20}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} interval={1} />
          <YAxis tick={{ fontSize: 11 }} tickLine={false} allowDecimals={false} />
          <Tooltip formatter={(v) => [`${v} bytů`, 'Počet']} labelFormatter={l => `Cena: ${l}–${parseInt(l) + 1}M Kč`} />
          <Bar dataKey="count" fill="#3b82f6" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
