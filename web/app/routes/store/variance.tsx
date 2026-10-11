import { api } from "~/lib/api";
import { formatMoney, formatShortDate } from "~/lib/format";
import type { VarianceReport } from "~/lib/types";
import { card, heading } from "~/lib/ui";
import type { Route } from "./+types/variance";

export function meta() {
  return [{ title: "Variance · Mavera" }];
}

export function clientLoader() {
  return api<VarianceReport>("/stock/variance");
}

export default function Variance({ loaderData: report }: Route.ComponentProps) {
  const total = report.rows.reduce((sum, r) => sum + r.gapValue, 0);

  return (
    <div className="mx-auto max-w-5xl space-y-5 p-6">
      <div>
        <h1 className={heading}>Variance</h1>
        <p className="mt-1 max-w-prose text-sm text-stone-400">
          <strong className="text-stone-200">Theoretical</strong> is what the recipes say the week's sales should have used.{" "}
          <strong className="text-stone-200">Actual</strong> is what really left the shelf: the last count, plus deliveries, minus this count.
          The gap is waste, over-portioning, staff meals or counting error.
        </p>
      </div>

      <p className={`${card} text-stone-200`}>
        Week ending {report.weekEnding ? formatShortDate(report.weekEnding) : "–"}: the gap is worth{" "}
        <strong className={total > 0 ? "text-red-300" : "text-emerald-300"}>{formatMoney(total)}</strong> in total.
      </p>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Theoretical against actual usage, biggest gap first</caption>
          <thead className="bg-stone-900 text-stone-300">
            <tr>
              <th scope="col" className="px-4 py-3">Ingredient</th>
              <th scope="col" className="px-4 py-3 text-right">Theoretical</th>
              <th scope="col" className="px-4 py-3 text-right">Actual</th>
              <th scope="col" className="px-4 py-3 text-right">Gap</th>
              <th scope="col" className="px-4 py-3 text-right">Gap %</th>
              <th scope="col" className="px-4 py-3 text-right">Gap value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {report.rows.map((row) => (
              <tr key={row.id} className={row.gapPct > 6 ? "bg-red-950/40" : ""}>
                <th scope="row" className="px-4 py-3 font-medium text-white">{row.name}</th>
                <td className="px-4 py-3 text-right tabular-nums text-stone-300">{row.theoretical} {row.unit}</td>
                <td className="px-4 py-3 text-right tabular-nums text-stone-100">{row.actual} {row.unit}</td>
                <td className="px-4 py-3 text-right tabular-nums">{row.gap > 0 ? "+" : ""}{row.gap} {row.unit}</td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {row.gapPct > 6 && <span className="mr-1 rounded bg-red-500 px-1.5 py-0.5 text-xs font-bold text-white">HIGH</span>}
                  {row.gapPct}%
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-stone-100">{formatMoney(row.gapValue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
