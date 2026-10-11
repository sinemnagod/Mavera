import { Outlet } from "react-router";
import RoleTopBar from "~/components/RoleTopBar";
import { requireRole } from "~/lib/auth";
import type { Route } from "./+types/layout";

const LINKS = [
  { to: "/store/stock", label: "Stock" },
  { to: "/store/counts", label: "Counts" },
  { to: "/store/movements", label: "Movements" },
  { to: "/store/variance", label: "Variance" },
  { to: "/store/checklist", label: "Checklist editor" },
];

export function clientLoader() {
  return { user: requireRole("STORE_MANAGER") };
}

export default function StoreLayout({ loaderData }: Route.ComponentProps) {
  return (
    <div className="flex flex-1 flex-col">
      <RoleTopBar roleName="Store manager" user={loaderData.user} links={LINKS} showReportSpill />
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}
