import { Outlet } from "react-router";
import RoleTopBar from "~/components/RoleTopBar";
import { requireRole } from "~/lib/auth";
import type { Route } from "./+types/layout";

export function clientLoader() {
  return { user: requireRole("WAITER") };
}

export default function WaiterLayout({ loaderData }: Route.ComponentProps) {
  return (
    <div className="flex flex-1 flex-col">
      <RoleTopBar
        roleName="Waiter"
        user={loaderData.user}
        links={[{ to: "/waiter/floor-plan", label: "Floor plan" }]}
        showReportSpill
      />
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}
