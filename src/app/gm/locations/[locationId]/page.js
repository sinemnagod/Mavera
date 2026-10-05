import { notFound } from "next/navigation";
import locations from "@/data/locations.json";

export default async function LocationDetailPage({ params }) {
  const { locationId } = await params;
  const location = locations.find((l) => l.id === locationId);

  if (!location) {
    notFound();
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-white">{location.name}</h1>
      <p className="mt-4 max-w-prose text-stone-400">
        Trends, top and bottom menu items, prep time distribution, and hourly patterns for{" "}
        {location.name} land in a later milestone.
      </p>
    </div>
  );
}
