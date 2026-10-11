import { Link } from "react-router";

interface TabNavProps {
  label: string;
  basePath: string;
  param: string;
  tabs: readonly { id: string; label: string }[];
  activeId: string;
}

// Tabs here are links to the same page with a different query string, so they are
// navigation (aria-current), not an ARIA tablist, which would promise arrow-key behaviour.
export default function TabNav({ label, basePath, param, tabs, activeId }: TabNavProps) {
  return (
    <nav aria-label={label} className="mt-4 flex gap-2">
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <Link
            key={tab.id}
            to={`${basePath}?${param}=${tab.id}`}
            aria-current={isActive ? "page" : undefined}
            className={`rounded-full px-4 py-1.5 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700 ${
              isActive ? "bg-amber-400 text-stone-950" : "bg-stone-100 text-stone-700 hover:bg-stone-200"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
