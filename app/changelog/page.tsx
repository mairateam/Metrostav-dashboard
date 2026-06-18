import { HistoryRow } from '@/lib/types';
import { fetchData } from '@/lib/fetchData';
import Changelog from '@/components/Changelog';
import Footer from '@/components/Footer';

export default async function ChangelogPage() {
  let data = null;
  let error: string | null = null;

  try {
    data = await fetchData();
  } catch {
    error = 'Nepodařilo se načíst data ze Sheetu.';
  }

  const history   = (data?.history ?? []) as HistoryRow[];
  const fetchedAt = data?.fetchedAt ?? '';

  return (
    <main style={{ background: '#f5f5f3', minHeight: '100vh' }}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 text-sm mb-6">
            {error}
          </div>
        )}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-5 rounded-full" style={{ background: '#DB0D15' }} />
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest">Historie změn</h2>
        </div>
        <Changelog history={history} />
      </div>
      <Footer fetchedAt={fetchedAt} />
    </main>
  );
}
