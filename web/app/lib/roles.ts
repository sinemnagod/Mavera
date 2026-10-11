import type { Role } from "./types";

export interface RoleInfo {
  // The word in the address: /login/waiter
  slug: string;
  role: Role;
  label: string;
  tagline: string;
  // Soft background colours for the card's picture circle.
  tint: string;
}

// The order here is the order of the cards on the landing page.
export const ROLES: RoleInfo[] = [
  { slug: "general-manager", role: "GENERAL_MANAGER", label: "General manager", tagline: "All five locations and the AI briefing", tint: "from-violet-100 to-fuchsia-50" },
  { slug: "store-manager", role: "STORE_MANAGER", label: "Store manager", tagline: "Stock, counts and variance", tint: "from-emerald-100 to-lime-50" },
  { slug: "waiter", role: "WAITER", label: "Waiter", tagline: "Floor plan, orders and tickets", tint: "from-amber-100 to-orange-50" },
  { slug: "kitchen", role: "KITCHEN", label: "Kitchen", tagline: "The ticket rail and stations", tint: "from-rose-100 to-red-50" },
  { slug: "cleaner", role: "CLEANER", label: "Cleaner", tagline: "Spills and the daily checklist", tint: "from-sky-100 to-cyan-50" },
];

export const roleBySlug = (slug: string | undefined) => ROLES.find((r) => r.slug === slug);
export const roleInfo = (role: Role) => ROLES.find((r) => r.role === role) as RoleInfo;
