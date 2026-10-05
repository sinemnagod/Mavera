import RoleTopBar from "@/components/RoleTopBar";
import locations from "@/data/locations.json";

const KADIKOY = locations.find((location) => location.id === "kadikoy").name;

export default function WaiterLayout({ children }) {
  return (
    <div className="flex flex-1 flex-col">
      <RoleTopBar
        role="Waiter"
        location={KADIKOY}
        links={[{ href: "/waiter/floor-plan", label: "Floor plan" }]}
        showReportSpill
      />
      <div className="flex-1">{children}</div>
    </div>
  );
}
