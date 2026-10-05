import RoleTopBar from "@/components/RoleTopBar";

const LINKS = [
  { href: "/gm", label: "Overview" },
  { href: "/gm/approvals", label: "Approvals" },
];

export default function GmLayout({ children }) {
  return (
    <div className="flex flex-1 flex-col">
      <RoleTopBar role="General manager" location="All locations" links={LINKS} />
      <div className="flex-1">{children}</div>
    </div>
  );
}
