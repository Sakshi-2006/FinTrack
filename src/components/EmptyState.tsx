import { Loader2, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { seedSampleData } from '@/lib/seed';

interface Props {
  onSeeded: () => void;
}

export function EmptyState({ onSeeded }: Props) {
  const [seeding, setSeeding] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSeed() {
    setSeeding(true);
    setErr(null);
    try {
      await seedSampleData(4);
      onSeeded();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to generate sample data.');
    } finally {
      setSeeding(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-500">
        <Sparkles size={26} />
      </div>
      <h3 className="text-lg font-semibold text-slate-800">No transactions yet</h3>
      <p className="mt-2 max-w-md text-sm text-slate-500">
        Start by adding your first expense or income, or generate 4 months of realistic sample data
        to explore the dashboard and visualizations.
      </p>
      <button
        onClick={handleSeed}
        disabled={seeding}
        className="mt-6 flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
      >
        {seeding ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Generating sample data…
          </>
        ) : (
          <>
            <Sparkles size={16} /> Generate sample data
          </>
        )}
      </button>
      {err && <p className="mt-3 text-sm text-red-600">{err}</p>}
    </div>
  );
}
