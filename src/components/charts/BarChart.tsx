interface Bar {
  label: string;
  value: number;
  color: string;
}

interface Props {
  data: Bar[];
  height?: number;
  valueFormatter?: (n: number) => string;
}

export function BarChart({ data, height = 240, valueFormatter }: Props) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="w-full">
      <div className="flex items-end gap-3" style={{ height }}>
        {data.map((d, i) => {
          const h = (d.value / max) * (height - 28);
          return (
            <div key={i} className="group flex flex-1 flex-col items-center justify-end gap-2">
              <div className="relative flex w-full justify-center">
                <div
                  className="w-full max-w-[56px] rounded-t-lg transition-all duration-500 hover:opacity-90"
                  style={{ height: Math.max(h, 4), background: d.color }}
                >
                  <div className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-900 px-2 py-1 text-[10px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
                    {valueFormatter ? valueFormatter(d.value) : d.value}
                  </div>
                </div>
              </div>
              <span className="truncate text-xs font-medium text-slate-500">{d.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
