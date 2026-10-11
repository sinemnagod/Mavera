import { Link, useNavigate } from "react-router";
import SpillDialog from "~/components/SpillDialog";
import { clearSession } from "~/lib/session";
import type { SessionUser } from "~/lib/types";
import { focus } from "~/lib/ui";

interface RoleTopBarProps {
  roleName: string;
  user: SessionUser;
  links?: { to: string; label: string }[];
  showReportSpill?: boolean;
}

export default function RoleTopBar({ roleName, user, links = [], showReportSpill = false }: RoleTopBarProps) {
  const navigate = useNavigate();

  function signOut() {
    clearSession();
    navigate("/");
  }

  return (
    <header className="flex flex-wrap items-center gap-4 border-b border-white/10 bg-stone-950 px-6 py-4 text-stone-100">
      <span className="text-sm font-semibold tracking-wide text-amber-400">Mavera</span>

      <span className="text-sm text-stone-300">
        {roleName} · {user.locationName ?? "All locations"}
      </span>

      {links.length > 0 && (
        <nav aria-label={`${roleName} sections`} className="flex flex-wrap gap-2 text-sm">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`rounded-full px-3 py-1 text-stone-300 hover:bg-white/10 hover:text-white ${focus}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}

      <div className="ml-auto flex items-center gap-3">
        {showReportSpill && <SpillDialog />}
        <span className="hidden text-sm text-stone-400 xl:inline">{user.name}</span>
        <button
          type="button"
          onClick={signOut}
          className={`rounded-full border border-white/15 px-3 py-1.5 text-sm text-stone-300 hover:bg-white/10 ${focus}`}
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
