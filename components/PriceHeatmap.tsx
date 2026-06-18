'use client';

import { useState } from 'react';
import { Unit } from '@/lib/types';
import { parseNum } from '@/lib/utils';

const NON_RESIDENTIAL = ['kancelář', 'komerce'];

interface Props {
  units: Unit[];
}

function heatColor(val: number, min: number, max: number): string {
  const t = (val - min) / (max - min || 1);
  const r = Math.round(220 * t + 34  * (1 - t));
  const g = Math.round(38  * t + 197 * (1 - t));
  const b = Math.round(38  * t + 94  * (1 - t));
  return `rgb(${r},${g},${b})`;
}

function avg(units: Unit[], key: 'pricePerM2' | 'price'): number | null {
  const vals = units.map(u => parseNum(u[key])).filter(n => n > 0);
  if (!vals.length) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

function formatCell(val: number, mode: 'perM2' | 'total'): string {
  if (mode === 'perM2') return (val / 1000).toFixed(0) + 'k';
  // celková cena — v milionech
  return (val / 1_000_000).toFixed(1) + 'M';
}

function formatTooltip(val: number, mode: 'perM2' | 'total'): string {
  if (mode === 'perM2') return Math.round(val).toLocaleString('cs-CZ') + ' Kč/m²';
  return Math.round(val).toLocaleString('cs-CZ') + ' Kč';
}

export default function PriceHeatmap({ units }: Props) {
  const [mode, setMode] = useState<'perM2' | 'total'>('perM2');

  const active = units.filter(u => u.status !== 'staženo' && parseNum(u.pricePerM2) > 0);
  if (!active.length) return null;

  const residential    = active.filter(u => !NON_RESIDENTIAL.includes(u.disposition.toLowerCase()));
  const nonResidential = active.filter(u =>  NON_RESIDENTIAL.includes(u.disposition.toLowerCase()));

  const resDispo = Array.from(new Set(residential.map(u => u.disposition))).sort();
  const nonDispo = Array.from(new Set(nonResidential.map(u => u.disposition))).sort();
  const floors   = Array.from(new Set(active.map(u => u.floor).filter(Boolean)))
    .sort((a, b) => parseNum(a) - parseNum(b));

  const key = mode === 'perM2' ? 'pricePerM2' : 'price';

  const matrix: Record<string, Record<string, number | null>> = {};
  floors.forEach(f => {
    matrix[f] = {};
    [...resDispo, ...nonDispo].forEach(d => {
      matrix[f][d] = avg(active.filter(u => u.floor === f && u.disposition === d), key);
    });
  });

  const resVals = floors.flatMap(f => resDispo.map(d => matrix[f][d]).filter((v): v is number => v !== null));
  const minVal  = resVals.length ? Math.min(...resVals) : 0;
  const maxVal  = resVals.length ? Math.max(...resVals) : 0;

  const btnStyle = (active: boolean) => ({
    padding: '4px 12px', fontSize: 12, borderRadius: 6, border: 'none', cursor: 'pointer',
    fontFamily: 'Inter, sans-serif', fontWeight: active ? 600 : 400,
    background: active ? '#DB0D15' : '#f3f4f6',
    color: active ? '#fff' : '#6b7280',
    transition: 'all 0.15s',
  });

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-gray-700">Cenová mapa per patro × dispozice</h3>
        <div className="flex items-center gap-4">
          {/* Přepínač */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            <button style={btnStyle(mode === 'perM2')} onClick={() => setMode('perM2')}>Kč/m²</button>
            <button style={btnStyle(mode === 'total')} onClick={() => setMode('total')}>Celková cena</button>
          </div>
          {/* Legenda */}
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <div className="flex items-center gap-1.5">
              <div className="flex gap-0.5">
                {[0, 0.25, 0.5, 0.75, 1].map(t => (
                  <div key={t} className="w-4 h-3 rounded-sm" style={{ background: heatColor(minVal + t * (maxVal - minVal), minVal, maxVal) }} />
                ))}
              </div>
              <span>levné → drahé</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-3 rounded-sm bg-blue-100 border border-blue-200" />
              <span>kancelář / komerce</span>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="text-xs w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left pr-4 py-1.5 text-gray-400 font-normal w-20">Patro</th>
              {resDispo.map(d => (
                <th key={d} className="px-2 py-1.5 text-gray-600 font-semibold text-center whitespace-nowrap">{d}</th>
              ))}
              {nonDispo.length > 0 && <th className="w-4" />}
              {nonDispo.map(d => (
                <th key={d} className="px-2 py-1.5 text-blue-400 font-semibold text-center whitespace-nowrap">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {floors.map(f => (
              <tr key={f}>
                <td className="pr-4 py-1.5 text-gray-500 font-medium whitespace-nowrap">{f}. patro</td>
                {resDispo.map(d => {
                  const val = matrix[f][d];
                  return (
                    <td key={d} className="px-1 py-1">
                      {val ? (
                        <div
                          className="rounded-md px-2 py-1.5 font-semibold text-white text-center text-xs"
                          style={{ background: heatColor(val, minVal, maxVal), minWidth: 68 }}
                          title={formatTooltip(val, mode)}
                        >
                          {formatCell(val, mode)}
                        </div>
                      ) : (
                        <div className="rounded-md px-2 py-1.5 bg-gray-50 text-gray-300 text-center" style={{ minWidth: 68 }}>—</div>
                      )}
                    </td>
                  );
                })}
                {nonDispo.length > 0 && <td className="w-4" />}
                {nonDispo.map(d => {
                  const val = matrix[f][d];
                  return (
                    <td key={d} className="px-1 py-1">
                      {val ? (
                        <div
                          className="rounded-md px-2 py-1.5 font-semibold text-blue-700 text-center text-xs bg-blue-50 border border-blue-100"
                          style={{ minWidth: 68 }}
                          title={formatTooltip(val, mode)}
                        >
                          {formatCell(val, mode)}
                        </div>
                      ) : (
                        <div className="rounded-md px-2 py-1.5 bg-gray-50 text-gray-300 text-center" style={{ minWidth: 68 }}>—</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
