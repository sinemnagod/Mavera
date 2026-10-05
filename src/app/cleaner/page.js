import RoleTopBar from "@/components/RoleTopBar";
import locations from "@/data/locations.json";

const KADIKOY = locations.find((location) => location.id === "kadikoy").name;

export default function CleanerPage() {
  return (
    <div className="flex flex-1 flex-col">
      <RoleTopBar role="Cleaner" location={KADIKOY} />

      <div className="p-6">
        <h1 className="text-2xl font-semibold text-white">Task queue</h1>
        <p className="mt-4 max-w-prose text-stone-400">
          Urgent spills on top, the approved checklist for today grouped by area below, lands in a
          later milestone.
        </p>
      </div>
    </div>
  );
}
