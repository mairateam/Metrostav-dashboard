'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import { Unit } from '@/lib/types';
import { parseNum } from '@/lib/utils';

const BUCKETS = [
  { label: '0–30 dní',   min: 0,   max: 30,  color: '#10b981' },
  { label: '31–90 dní',  min: 31,  max: 90,  color: '#3b82f6' },
  { label: '91–180 dní', min: 91,  max: 180, color: '#f59e0b' },
  { label: '180+ dní',   min: 181, max: Infinity, color: '#ef4444' },
];

interface Props {
  units: Unit[];
}

export default function DomChart({ units }: Props) {
  const volne = units.filter(u => u.status === 'volný');

  const data = BUCKETS.map(b => ({
    label: b.label,
    count: volne.filter(u => {
      const dom = parseNum(u.daysOnMarket);
      return dom >= b.min && dom <= b.max;
    }).length,
    color: b.color,
  }));

  const stuck = volne.filter(u => parseNum(u.daysOnMarket) > 180);

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-5">
      <div className="flex items-start justify-between mb-4">
        <h3 className="font-semibold text-gray-700">Stáří nabídky (DOM) — volné byty</h3>
        {stuck.length > 0 && (
          <span className="text-xs bg-red-50 text-red-600 border border-red-100 rounded-full px-2 py-0.5">
            {stuck.length} stuck &gt;180 dní
          </span>
        )}
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} barSize={48}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} tickLine={false} />
          <YAxis tick={{ fontSize: 11 }} tickLine={false} allowDecimals={false} />
          <Tooltip formatter={(v) => [`${v} bytů`, 'Volné']} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {stuck.length > 0 && (
        <details className="mt-3">
          <summary className="text-xs text-red-500 cursor-pointer hover:text-red-700">
            Zobrazit stuck byty ({stuck.length})
          </summary>
          <div className="mt-2 space-y-1">
            {stuck.sort((a, b) => parseNum(b.daysOnMarket) - parseNum(a.daysOnMarket)).map(u => (
              <div key={`${u.projekt}|${u.unitId}`} className="flex items-center gap-3 text-xs text-gray-600">
                <span className="font-medium">{u.unitId}</span>
                <span className="text-gray-400">{u.projekt}</span>
                <span>{u.disposition}</span>
                <span className="ml-auto text-red-500 font-medium">{u.daysOnMarket} dní</span>
                {u.docUrl && (
                  <a href={u.docUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-600 underline">
                    detail
                  </a>
                )}
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
