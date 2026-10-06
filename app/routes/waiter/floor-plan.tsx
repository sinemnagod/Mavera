import TabNav from "~/components/TabNav";
import type { Route } from "./+types/floor-plan";

const SECTIONS = [
  { id: "main", label: "Main" },
  { id: "terrace", label: "Terrace" },
  { id: "family", label: "Family" },
] as const;

export function meta() {
  return [{ title: "Floor plan · Mavera" }];
}

// The section lives in the URL (?section=terrace) so it can be bookmarked and shared.
export function loader({ request }: Route.LoaderArgs) {
  const requested = new URL(request.url).searchParams.get("section");
  const section = SECTIONS.find((s) => s.id === requested) ?? SECTIONS[0];
  return { section };
}

export default function FloorPlan({ loaderData }: Route.ComponentProps) {
  const { section } = loaderData;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-white">Floor plan</h1>

      <TabNav
        label="Floor plan section"
        basePath="/waiter/floor-plan"
        param="section"
        tabs={SECTIONS}
        activeId={section.id}
      />

      <p className="mt-8 rounded-xl border border-dashed border-white/10 p-8 text-center text-stone-400">
        {section.label} tables placeholder — table tiles with status colours (free / seated /
        ordered / ready / check requested) land in a later milestone.
      </p>
    </div>
  );
}
