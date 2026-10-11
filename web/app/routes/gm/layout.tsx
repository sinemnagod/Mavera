import { Outlet } from "react-router";
import RoleTopBar from "~/components/RoleTopBar";
import { requireRole } from "~/lib/auth";
import type { Route } from "./+types/layout";

const LINKS = [
  { to: "/gm", label: "Overview" },
  { to: "/gm/approvals", label: "Approvals" },
];

export function clientLoader() {
  return { user: requireRole("GENERAL_MANAGER") };
}

export default function GmLayout({ loaderData }: Route.ComponentProps) {
  return (
    <div className="flex flex-1 flex-col">
      <RoleTopBar roleName="General manager" user={loaderData.user} links={LINKS} />
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}
