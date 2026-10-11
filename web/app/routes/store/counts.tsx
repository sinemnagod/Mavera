import { api } from "~/lib/api";
import { formatShortDate } from "~/lib/format";
import type { CountsGrid } from "~/lib/types";
import { heading } from "~/lib/ui";
import type { Route } from "./+types/counts";

export function meta() {
  return [{ title: "Counts · Mavera" }];
}

export function clientLoader() {
  return api<CountsGrid>("/stock/counts");
}

export default function Counts({ loaderData: grid }: Route.ComponentProps) {
  return (
    <div className="mx-auto max-w-7xl space-y-5 p-6">
      <div>
        <h1 className={heading}>Counts</h1>
        <p className="mt-1 text-sm text-stone-400">Weekly physical counts, newest week first. Stock is counted, not tracked per order.</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Weekly stock counts for each ingredient</caption>
          <thead className="bg-stone-900 text-stone-300">
            <tr>
              <th scope="col" className="sticky left-0 bg-stone-900 px-4 py-3">Ingredient</th>
              {grid.weeks.map((week) => (
                <th key={week} scope="col" className="px-3 py-3 text-right whitespace-nowrap">
                  w/e {formatShortDate(week)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {grid.rows.map((row) => (
              <tr key={row.id}>
                <th scope="row" className="sticky left-0 bg-stone-950 px-4 py-2 font-medium text-white whitespace-nowrap">
                  {row.name} <span className="text-xs text-stone-500">({row.unit})</span>
                </th>
                {row.values.map((value, i) => (
                  <td key={grid.weeks[i]} className="px-3 py-2 text-right tabular-nums text-stone-200">
                    {value ?? "–"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
