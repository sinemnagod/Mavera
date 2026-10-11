import { api } from "~/lib/api";
import type { StockRow } from "~/lib/types";
import { card, heading } from "~/lib/ui";
import type { Route } from "./+types/stock";

export function meta() {
  return [{ title: "Stock · Mavera" }];
}

export function clientLoader() {
  return api<StockRow[]>("/stock");
}

const STATUS = {
  reorder: { label: "Reorder now", style: "bg-red-500 text-white" },
  low: { label: "Below par", style: "bg-amber-400 text-stone-950" },
  ok: { label: "OK", style: "bg-emerald-900 text-emerald-100" },
} as const;

export default function Stock({ loaderData: rows }: Route.ComponentProps) {
  const reorder = rows.filter((r) => r.status === "reorder").length;
  const low = rows.filter((r) => r.status === "low").length;

  return (
    <div className="mx-auto max-w-5xl space-y-5 p-6">
      <div>
        <h1 className={heading}>Stock</h1>
        <p className="mt-1 text-sm text-stone-400">
          From the latest weekly count{rows[0]?.countedOn ? ` (${rows[0].countedOn})` : ""}. Below the reorder point comes first, then below par.
        </p>
      </div>

      <p className={`${card} text-stone-200`}>
        <strong className="text-red-300">{reorder}</strong> to reorder now · <strong className="text-amber-300">{low}</strong> below par ·{" "}
        <strong className="text-emerald-300">{rows.length - reorder - low}</strong> fine
      </p>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Current stock against par level and reorder point</caption>
          <thead className="bg-stone-900 text-stone-300">
            <tr>
              <th scope="col" className="px-4 py-3">Ingredient</th>
              <th scope="col" className="px-4 py-3 text-right">In stock</th>
              <th scope="col" className="px-4 py-3 text-right">Par level</th>
              <th scope="col" className="px-4 py-3 text-right">Reorder point</th>
              <th scope="col" className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {rows.map((row) => (
              <tr key={row.id} className={row.status === "reorder" ? "bg-red-950/40" : ""}>
                <th scope="row" className="px-4 py-3 font-medium text-white">{row.name}</th>
                <td className="px-4 py-3 text-right tabular-nums text-stone-100">{row.counted} {row.unit}</td>
                <td className="px-4 py-3 text-right tabular-nums text-stone-400">{row.parLevel} {row.unit}</td>
                <td className="px-4 py-3 text-right tabular-nums text-stone-400">{row.reorderPoint} {row.unit}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS[row.status].style}`}>{STATUS[row.status].label}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
