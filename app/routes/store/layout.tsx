import { Outlet } from "react-router";
import RoleTopBar from "~/components/RoleTopBar";
import { HOME_LOCATION } from "~/lib/home-location";

const LINKS = [
  { to: "/store/stock", label: "Stock" },
  { to: "/store/counts", label: "Counts" },
  { to: "/store/movements", label: "Movements" },
  { to: "/store/variance", label: "Variance" },
  { to: "/store/checklist", label: "Checklist editor" },
];

export default function StoreLayout() {
  return (
    <div className="flex flex-1 flex-col">
      <RoleTopBar roleName="Store manager" location={HOME_LOCATION.name} links={LINKS} showReportSpill />
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}
