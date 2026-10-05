import Link from "next/link";
import RoleTopBar from "@/components/RoleTopBar";
import locations from "@/data/locations.json";

const KADIKOY = locations.find((location) => location.id === "kadikoy").name;

const STATIONS = [
  { id: "all", label: "All" },
  { id: "grill", label: "Grill" },
  { id: "cold", label: "Cold" },
  { id: "dessert", label: "Dessert" },
];

export default async function KitchenPage({ searchParams }) {
  const { station: rawStation } = await searchParams;
  const activeStation = STATIONS.some((s) => s.id === rawStation) ? rawStation : "all";

  return (
    <div className="flex flex-1 flex-col">
      <RoleTopBar role="Kitchen" location={KADIKOY} showReportSpill />

      <div className="p-6">
        <h1 className="text-2xl font-semibold text-white">Ticket rail</h1>

        <div role="tablist" aria-label="Station" className="mt-4 flex gap-2">
          {STATIONS.map((station) => {
            const isActive = station.id === activeStation;
            return (
              <Link
                key={station.id}
                href={`/kitchen?station=${station.id}`}
                role="tab"
                aria-selected={isActive}
                className={`rounded-full px-4 py-1.5 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 ${
                  isActive
                    ? "bg-amber-400 text-stone-950"
                    : "bg-stone-800 text-stone-300 hover:bg-stone-700"
                }`}
              >
                {station.label}
              </Link>
            );
          })}
        </div>

        <p className="mt-8 rounded-xl border border-dashed border-white/10 p-8 text-center text-stone-400">
          {STATIONS.find((s) => s.id === activeStation).label} ticket rail placeholder — age
          timers, allergen flags, and the prioritise-queue AI tool land in a later milestone.
        </p>
      </div>
    </div>
  );
}
