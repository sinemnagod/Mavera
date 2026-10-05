import RoleTopBar from "@/components/RoleTopBar";
import locations from "@/data/locations.json";

const KADIKOY = locations.find((location) => location.id === "kadikoy").name;

const LINKS = [
  { href: "/store/stock", label: "Stock" },
  { href: "/store/counts", label: "Counts" },
  { href: "/store/movements", label: "Movements" },
  { href: "/store/variance", label: "Variance" },
  { href: "/store/checklist", label: "Checklist editor" },
];

export default function StoreLayout({ children }) {
  return (
    <div className="flex flex-1 flex-col">
      <RoleTopBar role="Store manager" location={KADIKOY} links={LINKS} showReportSpill />
      <div className="flex-1">{children}</div>
    </div>
  );
}
