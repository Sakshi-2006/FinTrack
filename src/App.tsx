import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Scale,
  Trash2,
  Loader2,
  PieChart,
  BarChart3,
  LineChart as LineIcon,
  CalendarDays,
  type LucideIcon,
} from 'lucide-react';
import { supabase, type ExpenseRow } from '@/lib/supabase';
import {
  computeTotals,
  byCategory,
  byMonth,
  byWeekday,
  generateInsights,
  formatINR,
} from '@/lib/analytics';
import { colorFor } from '@/lib/constants';
import { StatCard } from '@/components/StatCard';
import { AddExpenseForm } from '@/components/AddExpenseForm';
import { ExpenseTable } from '@/components/ExpenseTable';
import { InsightsPanel } from '@/components/InsightsPanel';
import { EmptyState } from '@/components/EmptyState';
import { DonutChart } from '@/components/charts/DonutChart';
import { BarChart } from '@/components/charts/BarChart';
import { TrendChart } from '@/components/charts/LineChart';

export default function App() {
  const [rows, setRows] = useState<ExpenseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [clearing, setClearing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });
    setLoading(false);
    if (error) {
      setLoadError(error.message);
      return;
    }
    setRows((data ?? []) as ExpenseRow[]);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const totals = useMemo(() => computeTotals(rows), [rows]);
  const expenseCats = useMemo(() => byCategory(rows, 'Expense'), [rows]);
  const incomeCats = useMemo(() => byCategory(rows, 'Income'), [rows]);
  const months = useMemo(() => byMonth(rows), [rows]);
  const weekdays = useMemo(() => byWeekday(rows), [rows]);
  const insights = useMemo(() => generateInsights(rows), [rows]);

  const donutData = expenseCats.map((c) => ({ label: c.category, value: c.total, color: colorFor(c.category) }));
  const weekdayBars = weekdays.map((w) => ({ label: w.weekday.slice(0, 3), value: w.total, color: '#0ea5e9' }));

  async function handleClearAll() {
    if (!confirm('Delete ALL transactions? This cannot be undone.')) return;
    setClearing(true);
    const { error } = await supabase.from('expenses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    setClearing(false);
    if (error) return;
    load();
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header count={rows.length} onClearAll={handleClearAll} clearing={clearing} />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {loading ? (
          <div className="flex h-64 items-center justify-center text-slate-400">
            <Loader2 size={28} className="animate-spin" />
          </div>
        ) : loadError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            Couldn't load your data: {loadError}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState onSeeded={load} />
        ) : (
          <div className="space-y-8">
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Total Income"
                value={formatINR(totals.totalIncome)}
                icon={TrendingUp}
                accent="text-emerald-600"
                bg="bg-emerald-50"
                delta={`${totals.incomeCount} transactions`}
                deltaPositive
              />
              <StatCard
                label="Total Expenses"
                value={formatINR(totals.totalExpense)}
                icon={TrendingDown}
                accent="text-red-600"
                bg="bg-red-50"
                delta={`${totals.expenseCount} transactions`}
              />
              <StatCard
                label="Net Balance"
                value={formatINR(totals.net)}
                icon={Scale}
                accent={totals.net >= 0 ? 'text-emerald-600' : 'text-red-600'}
                bg={totals.net >= 0 ? 'bg-emerald-50' : 'bg-red-50'}
                delta={totals.net >= 0 ? 'Surplus' : 'Deficit'}
                deltaPositive={totals.net >= 0}
              />
              <StatCard
                label="Avg / Expense"
                value={formatINR(totals.expenseCount ? totals.totalExpense / totals.expenseCount : 0)}
                icon={Wallet}
                accent="text-sky-600"
                bg="bg-sky-50"
                delta="per transaction"
              />
            </section>

            <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Panel title="Monthly Income vs Expense" icon={LineIcon} className="lg:col-span-2">
                {months.length > 0 ? (
                  <TrendChart data={months} />
                ) : (
                  <EmptyChart />
                )}
                <div className="mt-3 flex items-center gap-5 text-xs text-slate-500">
                  <Legend color="#22c55e" label="Income" />
                  <Legend color="#ef4444" label="Expense" />
                </div>
              </Panel>

              <Panel title="Expense Distribution" icon={PieChart}>
                {donutData.length > 0 ? (
                  <DonutChart data={donutData} />
                ) : (
                  <EmptyChart />
                )}
              </Panel>
            </section>

            <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Panel title="Spending by Category" icon={BarChart3} className="lg:col-span-2">
                {expenseCats.length > 0 ? (
                  <BarChart
                    data={expenseCats.map((c) => ({ label: c.category, value: c.total, color: colorFor(c.category) }))}
                    valueFormatter={(n) => formatINR(n)}
                  />
                ) : (
                  <EmptyChart />
                )}
              </Panel>

              <Panel title="Spending by Weekday" icon={CalendarDays}>
                {weekdayBars.some((b) => b.value > 0) ? (
                  <BarChart data={weekdayBars} valueFormatter={(n) => formatINR(n)} />
                ) : (
                  <EmptyChart />
                )}
              </Panel>
            </section>

            {incomeCats.length > 0 && (
              <section>
                <Panel title="Income Sources" icon={TrendingUp}>
                  <BarChart
                    data={incomeCats.map((c) => ({ label: c.category, value: c.total, color: colorFor(c.category) }))}
                    valueFormatter={(n) => formatINR(n)}
                  />
                </Panel>
              </section>
            )}

            <section>
              <InsightsPanel insights={insights} />
            </section>

            <section>
              <Panel title="Transactions" icon={Wallet}>
                <ExpenseTable rows={rows} onChanged={load} />
              </Panel>
            </section>
          </div>
        )}

        {!loading && rows.length > 0 && (
          <p className="mt-10 text-center text-xs text-slate-400">
            Data is stored in your Supabase database and persists across sessions.
          </p>
        )}
      </main>

      {!loading && (
        <button
          onClick={() => setShowForm(true)}
          className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg shadow-slate-900/20 transition hover:scale-105 hover:bg-slate-800"
          aria-label="Add transaction"
        >
          {showForm ? '×' : '+'}
        </button>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 sm:items-center sm:p-4" onClick={() => setShowForm(false)}>
          <div
            className="w-full max-w-md rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Add Transaction</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            <AddExpenseForm
              onAdded={() => {
                setShowForm(false);
                load();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function Header({ count, onClearAll, clearing }: { count: number; onClearAll: () => void; clearing: boolean }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
            <Wallet size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">FinTrack</h1>
            <p className="text-xs text-slate-500">Expense Tracker Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-slate-500 sm:inline">{count} records</span>
          {count > 0 && (
            <button
              onClick={onClearAll}
              disabled={clearing}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
            >
              {clearing ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
              Clear all
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

function Panel({
  title,
  icon: Icon,
  children,
  className = '',
}: {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      <div className="mb-4 flex items-center gap-2">
        <Icon size={16} className="text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-sm" style={{ background: color }} />
      {label}
    </span>
  );
}

function EmptyChart() {
  return <div className="flex h-40 items-center justify-center text-sm text-slate-400">No data to display</div>;
}
