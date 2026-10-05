import Link from "next/link";

const roles = [
  {
    href: "/waiter/floor-plan",
    label: "Waiter",
    description: "Floor plan, orders, tickets",
    icon: (
      <path d="M4 19h16M6 19V9l6-4 6 4v10M9 19v-6h6v6" />
    ),
  },
  {
    href: "/kitchen",
    label: "Kitchen",
    description: "Ticket rail, stations",
    icon: (
      <path d="M6 3v6M10 3v6M6 6h4M14 21v-7a4 4 0 118 0v7M14 21h8" />
    ),
  },
  {
    href: "/cleaner",
    label: "Cleaner",
    description: "Task queue, checklist",
    icon: (
      <path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3zM5 19l1-2 1 2-1 2-1-2z" />
    ),
  },
  {
    href: "/store/stock",
    label: "Store manager",
    description: "Stock, counts, variance",
    icon: (
      <path d="M3 9l9-6 9 6M4 9v11h16V9M9 20v-6h6v6" />
    ),
  },
  {
    href: "/gm",
    label: "General manager",
    description: "Overview, all five locations",
    icon: (
      <path d="M4 19h16M6 19V11l4-3 4 3v8M14 19v-5l4-2v7" />
    ),
  },
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-12 px-6 py-16">
      <div className="text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-white">Mavera</h1>
        <p className="mt-2 text-stone-400">Restaurant operations, five locations, one system.</p>
      </div>

      <div className="grid w-full max-w-4xl grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        {roles.map((role) => (
          <Link
            key={role.href}
            href={role.href}
            className="group flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-stone-900 px-6 py-8 text-center transition-colors hover:border-amber-400/60 hover:bg-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-8 w-8 text-amber-400"
              aria-hidden="true"
            >
              {role.icon}
            </svg>
            <span className="text-lg font-medium text-white">{role.label}</span>
            <span className="text-sm text-stone-400">{role.description}</span>
          </Link>
        ))}
      </div>

      <p className="text-sm text-stone-500">Demo mode — no account, no real data, nothing saved beyond this browser.</p>
    </main>
  );
}
