import { TrendingUp, TrendingDown, Minus, Lightbulb } from 'lucide-react';
import type { Insight } from '@/lib/analytics';

const toneMap = {
  positive: { icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  negative: { icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
  neutral: { icon: Minus, color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-100' },
} as const;

export function InsightsPanel({ insights }: { insights: Insight[] }) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <Lightbulb size={16} className="text-amber-500" />
        <h3 className="text-sm font-semibold text-slate-700">Auto-generated insights</h3>
      </div>
      {insights.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-400">
          Add transactions to see insights about your spending patterns.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {insights.map((ins, i) => {
            const t = toneMap[ins.tone];
            const Icon = t.icon;
            return (
              <li
                key={i}
                className={`rounded-xl border ${t.border} ${t.bg} p-4 transition hover:shadow-sm`}
              >
                <div className="flex items-start gap-3">
                  <Icon size={18} className={`mt-0.5 shrink-0 ${t.color}`} />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{ins.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{ins.body}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
