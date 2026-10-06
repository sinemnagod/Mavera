import RoleTopBar from "~/components/RoleTopBar";
import TabNav from "~/components/TabNav";
import { HOME_LOCATION } from "~/lib/home-location";
import type { Route } from "./+types/kitchen";

const STATIONS = [
  { id: "all", label: "All" },
  { id: "grill", label: "Grill" },
  { id: "cold", label: "Cold" },
  { id: "dessert", label: "Dessert" },
] as const;

export function meta() {
  return [{ title: "Ticket rail · Mavera" }];
}

export function loader({ request }: Route.LoaderArgs) {
  const requested = new URL(request.url).searchParams.get("station");
  const station = STATIONS.find((s) => s.id === requested) ?? STATIONS[0];
  return { station };
}

export default function Kitchen({ loaderData }: Route.ComponentProps) {
  const { station } = loaderData;

  return (
    <div className="flex flex-1 flex-col">
      <RoleTopBar roleName="Kitchen" location={HOME_LOCATION.name} showReportSpill />

      <div className="p-6">
        <h1 className="text-2xl font-semibold text-white">Ticket rail</h1>

        <TabNav label="Station" basePath="/kitchen" param="station" tabs={STATIONS} activeId={station.id} />

        <p className="mt-8 rounded-xl border border-dashed border-white/10 p-8 text-center text-stone-400">
          {station.label} ticket rail placeholder — age timers, allergen flags, and the
          prioritise-queue AI tool land in a later milestone.
        </p>
      </div>
    </div>
  );
}
