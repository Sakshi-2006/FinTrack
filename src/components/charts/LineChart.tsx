interface Point {
  label: string;
  expense: number;
  income: number;
}

interface Props {
  data: Point[];
  height?: number;
}

export function TrendChart({ data, height = 260 }: Props) {
  const width = 640;
  const pad = { top: 20, right: 16, bottom: 32, left: 56 };
  const w = width - pad.left - pad.right;
  const h = height - pad.top - pad.bottom;
  const max = Math.max(1, ...data.map((d) => Math.max(d.expense, d.income)));
  const stepX = data.length > 1 ? w / (data.length - 1) : 0;

  const x = (i: number) => pad.left + i * stepX;
  const y = (v: number) => pad.top + h - (v / max) * h;

  const linePath = (key: 'expense' | 'income') =>
    data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(d[key])}`).join(' ');

  const areaPath = (key: 'expense' | 'income') =>
    `${linePath(key)} L ${x(data.length - 1)} ${pad.top + h} L ${x(0)} ${pad.top + h} Z`;

  const ticks = 4;
  const tickValues = Array.from({ length: ticks + 1 }, (_, i) => (max / ticks) * i);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
        </linearGradient>
      </defs>

      {tickValues.map((t, i) => (
        <g key={i}>
          <line x1={pad.left} y1={y(t)} x2={pad.left + w} y2={y(t)} stroke="#f1f5f9" strokeWidth={1} />
          <text x={pad.left - 8} y={y(t) + 4} textAnchor="end" className="fill-slate-400 text-[10px]">
            ₹{Math.round(t).toLocaleString('en-IN')}
          </text>
        </g>
      ))}

      {data.length > 1 && (
        <>
          <path d={areaPath('income')} fill="url(#incGrad)" />
          <path d={areaPath('expense')} fill="url(#expGrad)" />
          <path d={linePath('income')} fill="none" stroke="#22c55e" strokeWidth={2.5} />
          <path d={linePath('expense')} fill="none" stroke="#ef4444" strokeWidth={2.5} />
        </>
      )}

      {data.map((d, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(d.income)} r={3.5} fill="#22c55e" />
          <circle cx={x(i)} cy={y(d.expense)} r={3.5} fill="#ef4444" />
          <text x={x(i)} y={pad.top + h + 18} textAnchor="middle" className="fill-slate-500 text-[11px]">
            {d.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
