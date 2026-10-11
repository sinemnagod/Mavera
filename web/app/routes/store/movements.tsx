import { api } from "~/lib/api";
import type { Movement } from "~/lib/types";
import { heading } from "~/lib/ui";
import type { Route } from "./+types/movements";

export function meta() {
  return [{ title: "Movements · Mavera" }];
}

export function clientLoader() {
  return api<Movement[]>("/stock/movements");
}

const REASON: Record<Movement["reason"], string> = {
  RECEIVED: "Received",
  USED: "Used",
  WASTED: "Wasted",
  TRANSFERRED: "Transferred",
  STAFF_MEAL: "Staff meal",
};

export default function Movements({ loaderData: rows }: Route.ComponentProps) {
  return (
    <div className="mx-auto max-w-5xl space-y-5 p-6">
      <div>
        <h1 className={heading}>Movements</h1>
        <p className="mt-1 text-sm text-stone-600">The 200 most recent stock changes, each with its reason.</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-stone-200">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Stock movements with reasons</caption>
          <thead className="bg-white text-stone-700">
            <tr>
              <th scope="col" className="px-4 py-3">When</th>
              <th scope="col" className="px-4 py-3">Ingredient</th>
              <th scope="col" className="px-4 py-3 text-right">Quantity</th>
              <th scope="col" className="px-4 py-3">Reason</th>
              <th scope="col" className="px-4 py-3">Note</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="px-4 py-2 whitespace-nowrap text-stone-600">
                  {new Date(row.timestamp).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "UTC" })}
                </td>
                <th scope="row" className="px-4 py-2 font-medium text-stone-900">{row.ingredient}</th>
                <td className={`px-4 py-2 text-right tabular-nums ${row.quantity > 0 ? "text-emerald-700" : "text-stone-800"}`}>
                  {row.quantity > 0 ? "+" : ""}{row.quantity} {row.unit}
                </td>
                <td className="px-4 py-2 text-stone-800">{REASON[row.reason]}</td>
                <td className="px-4 py-2 text-stone-600">{row.note ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
