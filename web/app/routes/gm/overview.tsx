import { Link } from "react-router";
import BriefingCard from "~/components/BriefingCard";
import KpiCard from "~/components/KpiCard";
import { api } from "~/lib/api";
import { formatMoney, formatShortDate } from "~/lib/format";
import type { GmOverview } from "~/lib/types";
import { focus, heading } from "~/lib/ui";
import type { Route } from "./+types/overview";

export function meta() {
  return [{ title: "Overview · Mavera" }];
}

export function clientLoader() {
  return api<GmOverview>("/gm/overview");
}

const signed = (n: number) => `${n > 0 ? "+" : ""}${n}%`;

export default function Overview({ loaderData: overview }: Route.ComponentProps) {
  const { totals, locations, period } = overview;

  return (
    <div className="mx-auto max-w-[1500px] space-y-8 p-6">
      <h1 className={heading}>Overview</h1>

      <BriefingCard />

      {totals && period && (
        <section aria-labelledby="kpis">
          <h2 id="kpis" className="mb-3 text-lg font-semibold text-white">
            All locations, {formatShortDate(period.from)} – {formatShortDate(period.to)}
          </h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-4">
            <KpiCard label="Revenue" value={formatMoney(totals.revenue)} />
            <KpiCard label="Covers" value={totals.covers.toLocaleString("tr-TR")} />
            <KpiCard label="Average spend per cover" value={formatMoney(totals.avgSpend)} />
            <KpiCard label="Average ticket time" value={`${totals.avgTicketMinutes} min`} />
            <KpiCard label="Waste" value={`${totals.wastePct}%`} note="of stock value used" />
            <KpiCard label="Cleaning compliance" value={`${totals.cleaningCompliance}%`} tone={totals.cleaningCompliance < 80 ? "bad" : "good"} />
          </div>
        </section>
      )}

      <section aria-labelledby="compare">
        <h2 id="compare" className="mb-3 text-lg font-semibold text-white">Compare the five locations</h2>
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Key numbers for each location this week, compared with last week</caption>
            <thead className="bg-stone-900 text-stone-300">
              <tr>
                <th scope="col" className="px-4 py-3">Location</th>
                <th scope="col" className="px-4 py-3 text-right">Revenue</th>
                <th scope="col" className="px-4 py-3 text-right">vs last week</th>
                <th scope="col" className="px-4 py-3 text-right">Covers</th>
                <th scope="col" className="px-4 py-3 text-right">Avg spend</th>
                <th scope="col" className="px-4 py-3 text-right">Ticket time</th>
                <th scope="col" className="px-4 py-3 text-right">Waste</th>
                <th scope="col" className="px-4 py-3 text-right">Cleaning</th>
                <th scope="col" className="px-4 py-3">Flags</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {locations.map((l) => (
                <tr key={l.id}>
                  <th scope="row" className="px-4 py-3">
                    <Link to={`/gm/locations/${l.id}`} className={`font-semibold text-amber-300 underline ${focus}`}>
                      {l.name}
                    </Link>
                  </th>
                  <td className="px-4 py-3 text-right tabular-nums text-stone-100">{formatMoney(l.revenue)}</td>
                  <td className={`px-4 py-3 text-right tabular-nums ${l.revenueChangePct < -3 ? "font-semibold text-red-300" : "text-stone-300"}`}>{signed(l.revenueChangePct)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-stone-300">{l.covers.toLocaleString("tr-TR")}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-stone-300">{formatMoney(l.avgSpend)}</td>
                  <td className={`px-4 py-3 text-right tabular-nums ${l.avgTicketMinutes > 20 ? "font-semibold text-red-300" : "text-stone-300"}`}>{l.avgTicketMinutes} min</td>
                  <td className={`px-4 py-3 text-right tabular-nums ${l.wastePct > 5 ? "font-semibold text-red-300" : "text-stone-300"}`}>{l.wastePct}%</td>
                  <td className={`px-4 py-3 text-right tabular-nums ${l.cleaningCompliance < 75 ? "font-semibold text-red-300" : "text-stone-300"}`}>{l.cleaningCompliance}%</td>
                  <td className="px-4 py-3 text-xs text-stone-300">
                    {l.lowStock.length > 0 && <span className="mr-1 rounded bg-red-500 px-2 py-0.5 font-semibold text-white">Low: {l.lowStock.map((s) => s.name).join(", ")}</span>}
                    {l.slowDishes.length > 0 && <span className="rounded bg-amber-400 px-2 py-0.5 font-semibold text-stone-950">Slow: {l.slowDishes.map((s) => s.name).join(", ")}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
