import type { ExpenseRow } from './supabase';

export interface Totals {
  totalExpense: number;
  totalIncome: number;
  net: number;
  expenseCount: number;
  incomeCount: number;
}

export function computeTotals(rows: ExpenseRow[]): Totals {
  let totalExpense = 0;
  let totalIncome = 0;
  let expenseCount = 0;
  let incomeCount = 0;
  for (const r of rows) {
    if (r.type === 'Expense') {
      totalExpense += Number(r.amount);
      expenseCount += 1;
    } else {
      totalIncome += Number(r.amount);
      incomeCount += 1;
    }
  }
  return { totalExpense, totalIncome, net: totalIncome - totalExpense, expenseCount, incomeCount };
}

export interface CategoryAgg {
  category: string;
  total: number;
  count: number;
}

export function byCategory(rows: ExpenseRow[], type: 'Expense' | 'Income'): CategoryAgg[] {
  const map = new Map<string, CategoryAgg>();
  for (const r of rows) {
    if (r.type !== type) continue;
    const cur = map.get(r.category) ?? { category: r.category, total: 0, count: 0 };
    cur.total += Number(r.amount);
    cur.count += 1;
    map.set(r.category, cur);
  }
  return Array.from(map.values()).sort((a, b) => b.total - a.total);
}

export interface MonthAgg {
  monthKey: string; // YYYY-MM
  label: string; // e.g. "Mar"
  expense: number;
  income: number;
}

export function byMonth(rows: ExpenseRow[]): MonthAgg[] {
  const map = new Map<string, MonthAgg>();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  for (const r of rows) {
    const d = new Date(r.date + 'T00:00:00');
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const cur = map.get(key) ?? { monthKey: key, label: monthNames[d.getMonth()], expense: 0, income: 0 };
    if (r.type === 'Expense') cur.expense += Number(r.amount);
    else cur.income += Number(r.amount);
    map.set(key, cur);
  }
  return Array.from(map.values()).sort((a, b) => a.monthKey.localeCompare(b.monthKey));
}

export interface WeekdayAgg {
  weekday: string;
  total: number;
  count: number;
}

export function byWeekday(rows: ExpenseRow[]): WeekdayAgg[] {
  const order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const map = new Map<string, WeekdayAgg>(order.map((d) => [d, { weekday: d, total: 0, count: 0 }]));
  for (const r of rows) {
    if (r.type !== 'Expense') continue;
    const d = new Date(r.date + 'T00:00:00');
    const name = order[(d.getDay() + 6) % 7];
    const cur = map.get(name)!;
    cur.total += Number(r.amount);
    cur.count += 1;
  }
  return order.map((d) => map.get(d)!);
}

export interface Insight {
  title: string;
  body: string;
  tone: 'positive' | 'negative' | 'neutral';
}

export function generateInsights(rows: ExpenseRow[]): Insight[] {
  const out: Insight[] = [];
  const totals = computeTotals(rows);
  if (rows.length === 0) return out;

  const cats = byCategory(rows, 'Expense');
  if (cats.length > 0) {
    const top = cats[0];
    const share = totals.totalExpense > 0 ? (top.total / totals.totalExpense) * 100 : 0;
    out.push({
      title: 'Top spending category',
      body: `${top.category} accounts for ${share.toFixed(1)}% of total expenses (₹${top.total.toLocaleString('en-IN')} across ${top.count} transactions).`,
      tone: share > 40 ? 'negative' : 'neutral',
    });
  }

  if (totals.totalIncome > 0) {
    const savingsRate = (totals.net / totals.totalIncome) * 100;
    out.push({
      title: savingsRate >= 0 ? 'Savings rate' : 'Spending exceeds income',
      body:
        savingsRate >= 0
          ? `You saved ${savingsRate.toFixed(1)}% of your income (₹${totals.net.toLocaleString('en-IN')} net).`
          : `You overspent by ₹${Math.abs(totals.net).toLocaleString('en-IN')} relative to income.`,
      tone: savingsRate >= 20 ? 'positive' : savingsRate >= 0 ? 'neutral' : 'negative',
    });
  }

  const months = byMonth(rows);
  if (months.length >= 2) {
    const last = months[months.length - 1];
    const prev = months[months.length - 2];
    if (prev.expense > 0) {
      const change = ((last.expense - prev.expense) / prev.expense) * 100;
      out.push({
        title: 'Month-over-month spending',
        body:
          change > 0
            ? `Spending rose ${change.toFixed(1)}% in ${last.label} vs ${prev.label}.`
            : `Spending fell ${Math.abs(change).toFixed(1)}% in ${last.label} vs ${prev.label}.`,
        tone: change > 15 ? 'negative' : change < 0 ? 'positive' : 'neutral',
      });
    }
  }

  const wd = byWeekday(rows).filter((w) => w.count > 0).sort((a, b) => b.total - a.total);
  if (wd.length > 0) {
    out.push({
      title: 'Most expensive day of week',
      body: `${wd[0].weekday} is your highest-spend weekday (₹${wd[0].total.toLocaleString('en-IN')} over ${wd[0].count} transactions).`,
      tone: 'neutral',
    });
  }

  const avgTicket = totals.expenseCount > 0 ? totals.totalExpense / totals.expenseCount : 0;
  out.push({
    title: 'Average transaction size',
    body: `Average expense ticket is ₹${avgTicket.toLocaleString('en-IN', { maximumFractionDigits: 0 })} across ${totals.expenseCount} transactions.`,
    tone: 'neutral',
  });

  return out;
}

export function formatINR(n: number): string {
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

export function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
