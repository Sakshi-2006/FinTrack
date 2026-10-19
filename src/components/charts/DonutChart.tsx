interface Segment {
  label: string;
  value: number;
  color: string;
}

interface Props {
  data: Segment[];
  size?: number;
  thickness?: number;
}

export function DonutChart({ data, size = 220, thickness = 28 }: Props) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const radius = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;
  const segments =
    total === 0
      ? []
      : data.map((d) => {
          const fraction = d.value / total;
          const dash = fraction * circumference;
          const seg = {
            ...d,
            dash,
            gap: circumference - dash,
            offset: -offset,
            pct: fraction * 100,
          };
          offset += dash;
          return seg;
        });

  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#f1f5f9" strokeWidth={thickness} />
        {segments.map((s, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={s.color}
            strokeWidth={thickness}
            strokeDasharray={`${s.dash} ${s.gap}`}
            strokeDashoffset={s.offset}
            transform={`rotate(-90 ${cx} ${cy})`}
            strokeLinecap="butt"
          >
            <title>{`${s.label}: ${s.pct.toFixed(1)}%`}</title>
          </circle>
        ))}
        <text x={cx} y={cy - 4} textAnchor="middle" className="fill-slate-400 text-xs font-medium">
          Total
        </text>
        <text x={cx} y={cy + 16} textAnchor="middle" className="fill-slate-800 text-lg font-bold">
          {total === 0 ? '—' : `₹${Math.round(total).toLocaleString('en-IN')}`}
        </text>
      </svg>
      <ul className="space-y-2 text-sm">
        {data.slice(0, 6).map((d, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-sm" style={{ background: d.color }} />
            <span className="text-slate-600">{d.label}</span>
            <span className="ml-auto font-semibold text-slate-800">
              {total === 0 ? '0%' : `${((d.value / total) * 100).toFixed(1)}%`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
