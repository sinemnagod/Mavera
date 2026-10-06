import { Outlet } from "react-router";
import RoleTopBar from "~/components/RoleTopBar";
import { HOME_LOCATION } from "~/lib/home-location";

export default function WaiterLayout() {
  return (
    <div className="flex flex-1 flex-col">
      <RoleTopBar
        roleName="Waiter"
        location={HOME_LOCATION.name}
        links={[{ to: "/waiter/floor-plan", label: "Floor plan" }]}
        showReportSpill
      />
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}
