interface KpiCardProps {
  label: string;
  value: string;
  note?: string;
  tone?: "good" | "bad" | "neutral";
}

export default function KpiCard({ label, value, note, tone = "neutral" }: KpiCardProps) {
  const color = tone === "bad" ? "text-red-300" : tone === "good" ? "text-emerald-300" : "text-white";
  return (
    <div className="rounded-xl border border-white/10 bg-stone-900 p-4">
      <p className="text-xs uppercase tracking-wide text-stone-400">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tabular-nums ${color}`}>{value}</p>
      {note && <p className="mt-1 text-xs text-stone-400">{note}</p>}
    </div>
  );
}
