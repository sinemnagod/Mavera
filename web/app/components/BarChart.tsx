interface BarChartProps {
  label: string;
  data: { label: string; value: number }[];
  format?: (value: number) => string;
}

// A simple column chart. It is a picture, so it carries a text summary for screen readers.
export default function BarChart({ label, data, format = (v) => String(Math.round(v)) }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const best = data.reduce((a, b) => (b.value > a.value ? b : a), data[0]);
  const worst = data.reduce((a, b) => (b.value < a.value ? b : a), data[0]);

  return (
    <figure>
      <div
        role="img"
        aria-label={`${label}. Highest: ${best?.label}, ${best ? format(best.value) : ""}. Lowest: ${worst?.label}, ${worst ? format(worst.value) : ""}.`}
        className="flex h-40 items-end gap-0.5"
      >
        {data.map((d) => (
          <div key={d.label} className="flex-1 rounded-t bg-amber-400/80" style={{ height: `${Math.max(2, (d.value / max) * 100)}%` }} title={`${d.label}: ${format(d.value)}`} />
        ))}
      </div>
      <figcaption className="mt-2 flex justify-between text-xs text-stone-600">
        <span>{data[0]?.label}</span>
        <span>{label}</span>
        <span>{data[data.length - 1]?.label}</span>
      </figcaption>
    </figure>
  );
}
