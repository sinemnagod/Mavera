import { data, Link } from "react-router";
import BarChart from "~/components/BarChart";
import HorizontalBars from "~/components/HorizontalBars";
import KpiCard from "~/components/KpiCard";
import { api, ApiError } from "~/lib/api";
import { formatMoney, formatShortDate } from "~/lib/format";
import type { LocationDetail as Detail } from "~/lib/types";
import { card, focus, heading } from "~/lib/ui";
import type { Route } from "./+types/location";

export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: `${loaderData?.name ?? "Location"} · Mavera` }];
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  try {
    return await api<Detail>(`/gm/locations/${params.locationId}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) throw data("Location not found", { status: 404 });
    throw e;
  }
}

export default function LocationDetail({ loaderData: loc }: Route.ComponentProps) {
  const s = loc.summary;

  return (
    <div className="mx-auto max-w-[1500px] space-y-8 p-6">
      <div className="flex items-baseline justify-between">
        <h1 className={heading}>{loc.name}</h1>
        <Link to="/gm" className={`text-sm text-stone-600 underline ${focus}`}>Back to overview</Link>
      </div>

      {s && (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
          <KpiCard label="Revenue (7 days)" value={formatMoney(s.revenue)} note={`${s.revenueChangePct > 0 ? "+" : ""}${s.revenueChangePct}% vs last week`} tone={s.revenueChangePct < -3 ? "bad" : "neutral"} />
          <KpiCard label="Covers" value={s.covers.toLocaleString("tr-TR")} />
          <KpiCard label="Average spend" value={formatMoney(s.avgSpend)} />
          <KpiCard label="Ticket time" value={`${s.avgTicketMinutes} min`} tone={s.avgTicketMinutes > 20 ? "bad" : "neutral"} />
          <KpiCard label="Waste" value={`${s.wastePct}%`} tone={s.wastePct > 5 ? "bad" : "neutral"} />
          <KpiCard label="Cleaning" value={`${s.cleaningCompliance}%`} tone={s.cleaningCompliance < 75 ? "bad" : "good"} />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className={card} aria-labelledby="trend">
          <h2 id="trend" className="mb-3 text-lg font-semibold text-stone-900">Revenue, last 28 days</h2>
          <BarChart
            label={`${formatShortDate(loc.trend[0].date)} – ${formatShortDate(loc.trend[loc.trend.length - 1].date)}`}
            data={loc.trend.map((d) => ({ label: formatShortDate(d.date), value: d.revenue }))}
            format={formatMoney}
          />
          <p className="mt-2 text-xs text-stone-500">Taller bars on Fridays, Saturdays and Sundays: the weekend rush.</p>
        </section>

        <section className={card} aria-labelledby="hourly">
          <h2 id="hourly" className="mb-3 text-lg font-semibold text-stone-900">Covers by hour (daily average)</h2>
          <BarChart label="11:00 to 22:00" data={loc.hourly.map((h) => ({ label: h.hour, value: h.avgCovers }))} format={(v) => `${v} covers`} />
        </section>

        <section className={card} aria-labelledby="top">
          <h2 id="top" className="mb-3 text-lg font-semibold text-stone-900">Top 5 dishes</h2>
          <HorizontalBars rows={loc.topItems.map((i) => ({ label: i.name, value: i.units, note: `· ${formatMoney(i.revenue)}` }))} format={(v) => `${v} sold`} />
        </section>

        <section className={card} aria-labelledby="bottom">
          <h2 id="bottom" className="mb-3 text-lg font-semibold text-stone-900">Bottom 5 dishes</h2>
          <HorizontalBars rows={loc.bottomItems.map((i) => ({ label: i.name, value: i.units, note: `· ${formatMoney(i.revenue)}` }))} format={(v) => `${v} sold`} />
        </section>

        <section className={card} aria-labelledby="prep">
          <h2 id="prep" className="mb-3 text-lg font-semibold text-stone-900">How long tickets take</h2>
          <HorizontalBars rows={loc.prepDistribution.map((b) => ({ label: b.label, value: b.count }))} format={(v) => `${v} tickets`} />
        </section>

        <section className={card} aria-labelledby="slow">
          <h2 id="slow" className="mb-3 text-lg font-semibold text-stone-900">Dishes slower than the menu says</h2>
          {loc.slowDishes.length === 0 ? (
            <p className="text-sm text-stone-600">None. Every dish is close to its listed time.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {loc.slowDishes.map((d) => (
                <li key={d.name} className="rounded-lg bg-amber-50 p-3 text-stone-800">
                  <strong className="text-amber-800">{d.name}</strong>: listed {d.listedMinutes} min, really {d.avgMinutes} min (slowest tenth: {d.p90Minutes} min)
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

// Shown inside the GM layout, so the navigation stays when the location doesn't exist.
export function ErrorBoundary() {
  return (
    <div className="p-6">
      <h1 className={heading}>Location not found</h1>
      <p className="mt-4 max-w-prose text-stone-600">
        Mavera has five locations. Pick one from the{" "}
        <Link to="/gm" className={`text-amber-700 underline ${focus}`}>overview</Link>.
      </p>
    </div>
  );
}
