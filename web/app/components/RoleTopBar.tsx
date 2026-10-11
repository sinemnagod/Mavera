import { Link, useNavigate } from "react-router";
import Logo from "~/components/Logo";
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
    <header className="sticky top-0 z-30 flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-stone-200 bg-white/80 px-6 py-3 text-stone-900 shadow-sm backdrop-blur-xl">
      <Logo />

      <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-900">
        {roleName} · {user.locationName ?? "All locations"}
      </span>

      {links.length > 0 && (
        <nav aria-label={`${roleName} sections`} className="flex flex-wrap gap-1 text-sm">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`rounded-full px-3 py-1.5 font-medium text-stone-700 transition hover:bg-stone-100 hover:text-stone-900 ${focus}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}

      <div className="ml-auto flex items-center gap-3">
        {showReportSpill && <SpillDialog />}
        <span className="hidden text-sm text-stone-700 xl:inline">{user.name}</span>
        <button
          type="button"
          onClick={signOut}
          className={`rounded-full border border-stone-300 bg-white px-4 py-1.5 text-sm font-medium text-stone-800 shadow-sm transition hover:bg-stone-100 active:scale-95 ${focus}`}
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
