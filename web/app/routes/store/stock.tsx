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
  reorder: { label: "Reorder now", style: "bg-red-600 text-white" },
  low: { label: "Below par", style: "bg-amber-400 text-stone-950" },
  ok: { label: "OK", style: "bg-emerald-100 text-emerald-900" },
} as const;

export default function Stock({ loaderData: rows }: Route.ComponentProps) {
  const reorder = rows.filter((r) => r.status === "reorder").length;
  const low = rows.filter((r) => r.status === "low").length;

  return (
    <div className="mx-auto max-w-5xl space-y-5 p-6">
      <div>
        <h1 className={heading}>Stock</h1>
        <p className="mt-1 text-sm text-stone-600">
          From the latest weekly count{rows[0]?.countedOn ? ` (${rows[0].countedOn})` : ""}. Below the reorder point comes first, then below par.
        </p>
      </div>

      <p className={`${card} text-stone-800`}>
        <strong className="text-red-700">{reorder}</strong> to reorder now · <strong className="text-amber-700">{low}</strong> below par ·{" "}
        <strong className="text-emerald-700">{rows.length - reorder - low}</strong> fine
      </p>

      <div className="overflow-x-auto rounded-xl border border-stone-200">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Current stock against par level and reorder point</caption>
          <thead className="bg-white text-stone-700">
            <tr>
              <th scope="col" className="px-4 py-3">Ingredient</th>
              <th scope="col" className="px-4 py-3 text-right">In stock</th>
              <th scope="col" className="px-4 py-3 text-right">Par level</th>
              <th scope="col" className="px-4 py-3 text-right">Reorder point</th>
              <th scope="col" className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {rows.map((row) => (
              <tr key={row.id} className={row.status === "reorder" ? "bg-red-50" : ""}>
                <th scope="row" className="px-4 py-3 font-medium text-stone-900">{row.name}</th>
                <td className="px-4 py-3 text-right tabular-nums text-stone-900">{row.counted} {row.unit}</td>
                <td className="px-4 py-3 text-right tabular-nums text-stone-600">{row.parLevel} {row.unit}</td>
                <td className="px-4 py-3 text-right tabular-nums text-stone-600">{row.reorderPoint} {row.unit}</td>
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
