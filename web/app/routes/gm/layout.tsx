import { Outlet } from "react-router";
import RoleTopBar from "~/components/RoleTopBar";

const LINKS = [
  { to: "/gm", label: "Overview" },
  { to: "/gm/approvals", label: "Approvals" },
];

export default function GmLayout() {
  return (
    <div className="flex flex-1 flex-col">
      <RoleTopBar roleName="General manager" location="All locations" links={LINKS} />
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}
