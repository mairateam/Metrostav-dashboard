import { DailySnapshot, DailyPrice, HistoryRow } from '@/lib/types';
import { toUnit } from '@/lib/utils';
import { fetchData } from '@/lib/fetchData';
import Dashboard from '@/components/Dashboard';
import Footer from '@/components/Footer';

export default async function HomePage() {
  let data = null;
  let error: string | null = null;

  try {
    data = await fetchData();
  } catch {
    error = 'Nepodařilo se načíst data ze Sheetu. Zkontrolujte konfiguraci API.';
  }

  const units    = (data?.current  ?? []).map(toUnit);
  const snapshot = (data?.snapshot ?? []) as DailySnapshot[];
  const prices   = (data?.prices   ?? []) as DailyPrice[];
  const history  = (data?.history  ?? []) as HistoryRow[];
  const lastUpdated = data?.fetchedAt ?? '';

  return (
    <main style={{ background: '#f5f5f3', minHeight: '100vh' }}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 text-sm mb-8">
            {error}
          </div>
        )}
        <Dashboard
          units={units}
          snapshot={snapshot}
          prices={prices}
          history={history}
          lastUpdated={lastUpdated ? new Date(lastUpdated).toLocaleString('cs-CZ') : '—'}
        />
      </div>
      <Footer fetchedAt={lastUpdated} />
    </main>
  );
}
