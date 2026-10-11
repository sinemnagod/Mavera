import { useState } from "react";
import { Link } from "react-router";
import SeatDialog from "~/components/SeatDialog";
import TabNav from "~/components/TabNav";
import { usePolling } from "~/hooks/usePolling";
import { api } from "~/lib/api";
import type { FloorTable, TableStatus } from "~/lib/types";
import { focus, heading } from "~/lib/ui";
import type { Route } from "./+types/floor-plan";

const SECTIONS = [
  { id: "main", label: "Main" },
  { id: "terrace", label: "Terrace" },
  { id: "family", label: "Family" },
] as const;

// Every status has a colour AND a word, so nothing depends on colour alone.
const STATUS: Record<TableStatus, { label: string; style: string }> = {
  FREE: { label: "Free", style: "border-white/15 bg-stone-900 text-stone-300" },
  SEATED: { label: "Seated", style: "border-sky-400/60 bg-sky-950 text-sky-100" },
  ORDERED: { label: "Ordered", style: "border-amber-400/60 bg-amber-950 text-amber-100" },
  READY: { label: "Food ready", style: "border-emerald-400 bg-emerald-900 text-emerald-50" },
  CHECK_REQUESTED: { label: "Check requested", style: "border-violet-400/60 bg-violet-950 text-violet-100" },
};

export function meta() {
  return [{ title: "Floor plan · Mavera" }];
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const requested = new URL(request.url).searchParams.get("section");
  const section = SECTIONS.find((s) => s.id === requested) ?? SECTIONS[0];
  const tables = await api<FloorTable[]>("/tables");
  return { section, tables };
}

export default function FloorPlan({ loaderData }: Route.ComponentProps) {
  const { section, tables } = loaderData;
  const [seating, setSeating] = useState<FloorTable | null>(null);
  usePolling(4000);

  const visible = tables.filter((t) => t.section === section.id);
  const ready = tables.filter((t) => t.status === "READY");

  return (
    <div className="mx-auto max-w-[1600px] p-6">
      <h1 className={heading}>Floor plan</h1>

      {/* Flow 2: the kitchen marks an order ready, and it appears here within a few seconds. */}
      <div role="status" aria-live="polite" className="mt-4 space-y-2">
        {ready.map((table) => (
          <p key={table.id} className="rounded-lg border border-emerald-400 bg-emerald-900/60 px-4 py-2 text-emerald-50">
            <strong>Table {table.code}:</strong> food is ready — run it to the table.{" "}
            {table.orderId && (
              <Link to={`/waiter/ticket/${table.orderId}`} className={`underline ${focus}`}>
                Open ticket
              </Link>
            )}
          </p>
        ))}
      </div>

      <TabNav label="Floor plan section" basePath="/waiter/floor-plan" param="section" tabs={SECTIONS} activeId={section.id} />

      <ul className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-4">
        {visible.map((table) => {
          const status = STATUS[table.status];
          const body = (
            <>
              <span className="text-2xl font-semibold">{table.code}</span>
              <span className="text-sm">{status.label}</span>
              <span className="text-xs opacity-80">
                {table.covers ? `${table.covers} of ${table.seats} seats` : `${table.seats} seats`}
              </span>
            </>
          );
          const tile = `flex h-full min-h-28 w-full flex-col items-start justify-between rounded-xl border-2 p-4 text-left ${status.style} ${focus}`;
          return (
            <li key={table.id}>
              {table.status === "FREE" ? (
                <button type="button" onClick={() => setSeating(table)} className={tile} aria-label={`Table ${table.code}, free, ${table.seats} seats. Seat guests`}>
                  {body}
                </button>
              ) : (
                <Link
                  to={table.status === "SEATED" || !table.orderId ? `/waiter/order/${table.id}` : `/waiter/ticket/${table.orderId}`}
                  className={tile}
                  aria-label={`Table ${table.code}, ${status.label.toLowerCase()}. Open`}
                >
                  {body}
                </Link>
              )}
            </li>
          );
        })}
      </ul>

      <SeatDialog key={seating?.id ?? "none"} table={seating} onClose={() => setSeating(null)} />
    </div>
  );
}
