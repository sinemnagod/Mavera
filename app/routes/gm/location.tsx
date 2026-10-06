import { data, Link } from "react-router";
import locations from "~/data/locations.json";
import type { Route } from "./+types/location";

export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: `${loaderData?.name ?? "Location"} · Mavera` }];
}

// Runs on the server only, so the seed data never has to ship to the browser for this screen.
export function loader({ params }: Route.LoaderArgs) {
  const location = locations.find((l) => l.id === params.locationId);
  if (!location) throw data("Location not found", { status: 404 });
  return { name: location.name };
}

export default function LocationDetail({ loaderData }: Route.ComponentProps) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-white">{loaderData.name}</h1>
      <p className="mt-4 max-w-prose text-stone-400">
        Trends, top and bottom menu items, prep time distribution, and hourly patterns for{" "}
        {loaderData.name} land in a later milestone.
      </p>
    </div>
  );
}

// Rendered inside the GM layout, so the navigation stays visible when the id doesn't exist.
export function ErrorBoundary() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-white">Location not found</h1>
      <p className="mt-4 max-w-prose text-stone-400">
        Mavera has five locations. Pick one from the{" "}
        <Link to="/gm" className="text-amber-400 underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400">
          overview
        </Link>
        .
      </p>
    </div>
  );
}
