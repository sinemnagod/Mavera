import { Link } from "react-router";
import locations from "~/data/locations.json";

export function meta() {
  return [{ title: "Overview · Mavera" }];
}

export default function Overview() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-white">Overview</h1>

      <div className="mt-4 rounded-xl border border-dashed border-white/10 p-8 text-center text-stone-400">
        AI shift briefing placeholder — pinned here once the AI route exists.
      </div>

      <div className="mt-8 rounded-xl border border-dashed border-white/10 p-8 text-center text-stone-400">
        KPI row placeholder — revenue, covers, average spend, average ticket time, waste %,
        cleaning compliance, compared across all five locations.
      </div>

      <h2 className="mt-8 text-lg font-medium text-white">Locations</h2>
      <ul className="mt-3 grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3">
        {locations.map((location) => (
          <li key={location.id}>
            <Link
              to={`/gm/locations/${location.id}`}
              className="block rounded-lg border border-white/10 bg-stone-900 px-4 py-3 text-center text-stone-200 hover:border-amber-400/60 hover:bg-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
            >
              {location.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
