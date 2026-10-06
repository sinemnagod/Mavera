import { Link } from "react-router";

interface RoleTopBarProps {
  roleName: string;
  location?: string;
  links?: { to: string; label: string }[];
  showReportSpill?: boolean;
}

export default function RoleTopBar({ roleName, location, links = [], showReportSpill = false }: RoleTopBarProps) {
  return (
    <header className="flex flex-wrap items-center gap-4 border-b border-white/10 bg-stone-950 px-6 py-4 text-stone-100">
      <Link to="/" className="text-sm font-semibold tracking-wide text-amber-400">
        Mavera
      </Link>

      <span className="text-sm text-stone-400">
        {roleName}
        {location ? ` · ${location}` : ""}
      </span>

      {links.length > 0 && (
        <nav aria-label={`${roleName} sections`} className="flex flex-wrap gap-2 text-sm">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded-full px-3 py-1 text-stone-300 hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}

      {showReportSpill && (
        <button
          type="button"
          className="ml-auto rounded-full bg-red-600/90 px-4 py-1.5 text-sm font-medium text-white hover:bg-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
        >
          Report spill
        </button>
      )}
    </header>
  );
}
