'use client';

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

function avgPerM2(units: Unit[]): number | null {
  const vals = units.map(u => parseNum(u.pricePerM2)).filter(n => n > 0);
  if (!vals.length) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export default function PriceHeatmap({ units }: Props) {
  const active = units.filter(u => u.status !== 'staženo' && parseNum(u.pricePerM2) > 0);
  if (!active.length) return null;

  const residential    = active.filter(u => !NON_RESIDENTIAL.includes(u.disposition.toLowerCase()));
  const nonResidential = active.filter(u =>  NON_RESIDENTIAL.includes(u.disposition.toLowerCase()));

  const resDispo  = Array.from(new Set(residential.map(u => u.disposition))).sort();
  const nonDispo  = Array.from(new Set(nonResidential.map(u => u.disposition))).sort();
  const allDispo  = [...resDispo, ...nonDispo];
  const floors    = Array.from(new Set(active.map(u => u.floor).filter(Boolean)))
    .sort((a, b) => parseNum(a) - parseNum(b));

  // Matice průměrů — pouze residential pro škálu barev
  const matrix: Record<string, Record<string, number | null>> = {};
  floors.forEach(f => {
    matrix[f] = {};
    allDispo.forEach(d => { matrix[f][d] = avgPerM2(active.filter(u => u.floor === f && u.disposition === d)); });
  });

  const resVals = floors.flatMap(f => resDispo.map(d => matrix[f][d]).filter((v): v is number => v !== null));
  const minVal  = resVals.length ? Math.min(...resVals) : 0;
  const maxVal  = resVals.length ? Math.max(...resVals) : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-gray-700">Cena/m² per patro × dispozice</h3>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            <div className="flex gap-0.5">
              {[0, 0.25, 0.5, 0.75, 1].map(t => (
                <div key={t} className="w-4 h-3 rounded-sm" style={{ background: heatColor(minVal + t * (maxVal - minVal), minVal, maxVal) }} />
              ))}
            </div>
            <span>byty: levné → drahé</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-3 rounded-sm bg-blue-100 border border-blue-200" />
            <span>kancelář / komerce</span>
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
                          title={`${Math.round(val).toLocaleString('cs-CZ')} Kč/m²`}
                        >
                          {(val / 1000).toFixed(0)}k
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
                          title={`${Math.round(val).toLocaleString('cs-CZ')} Kč/m²`}
                        >
                          {(val / 1000).toFixed(0)}k
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
