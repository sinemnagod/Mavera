interface HorizontalBarsProps {
  rows: { label: string; value: number; note?: string }[];
  format?: (value: number) => string;
}

// A labelled list with a bar behind each value. The number is always printed, so the bar is a bonus.
export default function HorizontalBars({ rows, format = (v) => String(Math.round(v)) }: HorizontalBarsProps) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <ul className="space-y-2">
      {rows.map((row) => (
        <li key={row.label}>
          <div className="flex justify-between text-sm">
            <span className="text-stone-800">{row.label}</span>
            <span className="tabular-nums text-stone-700">
              {format(row.value)}
              {row.note && <span className="ml-1 text-stone-500">{row.note}</span>}
            </span>
          </div>
          <div className="mt-1 h-2 rounded bg-stone-200">
            <div className="h-2 rounded bg-amber-400/80" style={{ width: `${(row.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
