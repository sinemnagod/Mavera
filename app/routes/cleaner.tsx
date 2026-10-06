import RoleTopBar from "~/components/RoleTopBar";
import { HOME_LOCATION } from "~/lib/home-location";

export function meta() {
  return [{ title: "Task queue · Mavera" }];
}

export default function Cleaner() {
  return (
    <div className="flex flex-1 flex-col">
      <RoleTopBar roleName="Cleaner" location={HOME_LOCATION.name} />

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
