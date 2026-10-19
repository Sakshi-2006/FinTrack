import type { LucideIcon } from 'lucide-react';

interface Props {
  label: string;
  value: string;
  delta?: string;
  deltaPositive?: boolean;
  icon: LucideIcon;
  accent: string; // tailwind text color e.g. 'text-red-500'
  bg: string; // tailwind bg e.g. 'bg-red-50'
}

export function StatCard({ label, value, delta, deltaPositive, icon: Icon, accent, bg }: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
        </div>
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg} ${accent}`}>
          <Icon size={20} />
        </span>
      </div>
      {delta && (
        <p className={`mt-3 text-xs font-medium ${deltaPositive ? 'text-emerald-600' : 'text-red-600'}`}>
          {delta}
        </p>
      )}
    </div>
  );
}
