import { useState } from 'react';
import { Trash2, ArrowDownCircle, ArrowUpCircle, Search } from 'lucide-react';
import { supabase, type ExpenseRow } from '@/lib/supabase';
import { formatINR, formatDate } from '@/lib/analytics';
import { colorFor } from '@/lib/constants';

interface Props {
  rows: ExpenseRow[];
  onChanged: () => void;
}

type SortKey = 'date' | 'amount';
type SortDir = 'asc' | 'desc';

export function ExpenseTable({ rows, onChanged }: Props) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Expense' | 'Income'>('All');
  const [deleting, setDeleting] = useState<string | null>(null);

  const filtered = rows
    .filter((r) => (typeFilter === 'All' ? true : r.type === typeFilter))
    .filter((r) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        r.category.toLowerCase().includes(q) ||
        (r.description ?? '').toLowerCase().includes(q) ||
        r.payment_method.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'date') cmp = a.date.localeCompare(b.date);
      else cmp = a.amount - b.amount;
      return sortDir === 'asc' ? cmp : -cmp;
    });

  async function handleDelete(id: string) {
    setDeleting(id);
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    setDeleting(null);
    if (error) return;
    onChanged();
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search category, description, method…"
            className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          />
        </div>
        <div className="flex rounded-lg bg-slate-100 p-1">
          {(['All', 'Expense', 'Income'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                typeFilter === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <div className="max-h-[420px] overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 z-10 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th
                  className="cursor-pointer select-none px-4 py-3 font-semibold"
                  onClick={() => toggleSort('date')}
                >
                  Date {sortKey === 'date' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Description</th>
                <th className="px-4 py-3 font-semibold">Method</th>
                <th
                  className="cursor-pointer select-none px-4 py-3 text-right font-semibold"
                  onClick={() => toggleSort('amount')}
                >
                  Amount {sortKey === 'amount' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                    No transactions match your filters.
                  </td>
                </tr>
              )}
              {filtered.map((r) => (
                <tr key={r.id} className="border-t border-slate-100 transition hover:bg-slate-50">
                  <td className="px-4 py-3">
                    {r.type === 'Expense' ? (
                      <ArrowDownCircle size={18} className="text-red-500" />
                    ) : (
                      <ArrowUpCircle size={18} className="text-emerald-500" />
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDate(r.date)}</td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium"
                      style={{ background: `${colorFor(r.category)}1a`, color: colorFor(r.category) }}
                    >
                      {r.category}
                    </span>
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-slate-600">
                    {r.description || <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{r.payment_method}</td>
                  <td
                    className={`px-4 py-3 text-right font-semibold ${
                      r.type === 'Expense' ? 'text-slate-800' : 'text-emerald-600'
                    }`}
                  >
                    {r.type === 'Expense' ? '−' : '+'}
                    {formatINR(Number(r.amount))}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(r.id)}
                      disabled={deleting === r.id}
                      className="rounded-md p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      aria-label="Delete transaction"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-400">{filtered.length} transaction(s)</p>
    </div>
  );
}
