// The shapes of the data the API sends. They mirror the API's responses.

export type Role = "WAITER" | "KITCHEN" | "CLEANER" | "STORE_MANAGER" | "GENERAL_MANAGER";
export type Station = "GRILL" | "COLD" | "DESSERT";
export type TableStatus = "FREE" | "SEATED" | "ORDERED" | "READY" | "CHECK_REQUESTED";
export type TicketStatus = "NEW" | "STARTED" | "READY" | "BUMPED";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  locationId: string | null;
  locationName: string | null;
}

export interface FloorTable {
  id: string;
  code: string;
  section: string;
  seats: number;
  status: TableStatus;
  covers: number | null;
  orderId: string | null;
  ticketStatus: TicketStatus | null;
  readyAt: string | null;
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  station: Station;
  allergens: string[];
  prepMinutes: number;
}

export interface OrderView {
  id: string;
  status: string;
  flags: string[];
  covers: number;
  sentAt: string | null;
  table: { id: string; code: string; status: TableStatus };
  ticket: { status: TicketStatus; readyAt: string | null } | null;
  total: number;
  items: {
    id: string;
    name: string;
    station: Station;
    price: number;
    quantity: number;
    modifiers: string[];
    note: string | null;
  }[];
}

export interface KitchenTicket {
  id: string;
  status: TicketStatus;
  createdAt: string;
  startedAt: string | null;
  readyAt: string | null;
  tableCode: string;
  covers: number;
  flags: string[];
  items: {
    id: string;
    name: string;
    station: Station;
    allergens: string[];
    quantity: number;
    modifiers: string[];
    note: string | null;
  }[];
}

export interface Spill {
  id: string;
  area: string;
  description: string;
  reportedAt: string;
  reportedBy: string;
  reportedByRole: Role;
}

export interface CleaningTask {
  id: string;
  area: string;
  description: string;
  dueTime: string;
  completed: { by: string; at: string } | null;
  overdue: boolean;
}

export interface CleaningToday {
  version: number | null;
  tasks: CleaningTask[];
  summary: { total: number; done: number; overdue: number };
}

export interface ChecklistTaskInput {
  area: string;
  description: string;
  dueTime: string;
}

export interface ChecklistVersion {
  id: string;
  locationId: string;
  version: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  submittedAt: string;
  decidedAt: string | null;
  note: string | null;
  tasks: (ChecklistTaskInput & { id: string })[];
  locationName?: string;
  submittedBy?: string;
}

export interface StockRow {
  id: string;
  name: string;
  unit: string;
  counted: number;
  countedOn: string | null;
  parLevel: number;
  reorderPoint: number;
  status: "reorder" | "low" | "ok";
}

export interface CountsGrid {
  weeks: string[];
  rows: { id: string; name: string; unit: string; values: (number | null)[] }[];
}

export interface Movement {
  id: number;
  timestamp: string;
  ingredient: string;
  unit: string;
  quantity: number;
  reason: "RECEIVED" | "USED" | "WASTED" | "TRANSFERRED" | "STAFF_MEAL";
  note: string | null;
}

export interface VarianceReport {
  weekEnding: string | null;
  rows: {
    id: string;
    name: string;
    unit: string;
    theoretical: number;
    actual: number;
    gap: number;
    gapPct: number;
    gapValue: number;
  }[];
}

export interface LocationSummary {
  id: string;
  name: string;
  revenue: number;
  revenueChangePct: number;
  covers: number;
  coversChangePct: number;
  avgSpend: number;
  avgTicketMinutes: number;
  wastePct: number;
  cleaningCompliance: number;
  lowStock: { name: string; counted: number; unit: string; reorderPoint: number; parLevel: number }[];
  slowDishes: { name: string; listedMinutes: number; avgMinutes: number }[];
}

export interface GmOverview {
  period: { from: string; to: string } | null;
  locations: LocationSummary[];
  totals: {
    revenue: number;
    covers: number;
    avgSpend: number;
    avgTicketMinutes: number;
    wastePct: number;
    cleaningCompliance: number;
  } | null;
}

export interface LocationDetail {
  id: string;
  name: string;
  summary: LocationSummary | undefined;
  trend: { date: string; revenue: number; covers: number }[];
  topItems: { name: string; units: number; revenue: number }[];
  bottomItems: { name: string; units: number; revenue: number }[];
  prepDistribution: { label: string; count: number }[];
  hourly: { hour: string; avgCovers: number }[];
  slowDishes: { name: string; listedMinutes: number; avgMinutes: number; p90Minutes: number }[];
}

export interface Briefing {
  headline: string;
  actions: { action: string; reason: string; urgency: "now" | "today" | "this_week" }[];
  watchItems: string[];
  comparison: string;
}
