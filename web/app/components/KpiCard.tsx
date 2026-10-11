interface KpiCardProps {
  label: string;
  value: string;
  note?: string;
  tone?: "good" | "bad" | "neutral";
}

export default function KpiCard({ label, value, note, tone = "neutral" }: KpiCardProps) {
  const color = tone === "bad" ? "text-red-700" : tone === "good" ? "text-emerald-700" : "text-stone-900";
  return (
    <div className="animate-fade-up rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <p className="text-xs uppercase tracking-wide text-stone-600">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tabular-nums ${color}`}>{value}</p>
      {note && <p className="mt-1 text-xs text-stone-600">{note}</p>}
    </div>
  );
}
