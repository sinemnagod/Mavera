import Link from "next/link";

const SECTIONS = [
  { id: "main", label: "Main" },
  { id: "terrace", label: "Terrace" },
  { id: "family", label: "Family" },
];

export default async function FloorPlanPage({ searchParams }) {
  const { section: rawSection } = await searchParams;
  const activeSection = SECTIONS.some((s) => s.id === rawSection) ? rawSection : "main";

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-white">Floor plan</h1>

      <div role="tablist" aria-label="Floor plan section" className="mt-4 flex gap-2">
        {SECTIONS.map((section) => {
          const isActive = section.id === activeSection;
          return (
            <Link
              key={section.id}
              href={`/waiter/floor-plan?section=${section.id}`}
              role="tab"
              aria-selected={isActive}
              className={`rounded-full px-4 py-1.5 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 ${
                isActive
                  ? "bg-amber-400 text-stone-950"
                  : "bg-stone-800 text-stone-300 hover:bg-stone-700"
              }`}
            >
              {section.label}
            </Link>
          );
        })}
      </div>

      <p className="mt-8 rounded-xl border border-dashed border-white/10 p-8 text-center text-stone-400">
        {SECTIONS.find((s) => s.id === activeSection).label} tables placeholder — table tiles with
        status colours (free / seated / ordered / ready / check requested) land in a later
        milestone.
      </p>
    </div>
  );
}
