import Link from "next/link";

export default function RoleTopBar({ role, location, links = [], showReportSpill = false }) {
  return (
    <header className="flex flex-wrap items-center gap-4 border-b border-white/10 bg-stone-950 px-6 py-4 text-stone-100">
      <Link href="/" className="text-sm font-semibold tracking-wide text-amber-400">
        Mavera
      </Link>

      <span className="text-sm text-stone-400">
        {role}
        {location ? ` · ${location}` : ""}
      </span>

      {links.length > 0 && (
        <nav aria-label={`${role} sections`} className="flex flex-wrap gap-2 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
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
