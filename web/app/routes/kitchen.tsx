import { useState } from "react";
import { useRevalidator } from "react-router";
import RoleTopBar from "~/components/RoleTopBar";
import TabNav from "~/components/TabNav";
import { useNow } from "~/hooks/useNow";
import { usePolling } from "~/hooks/usePolling";
import { api } from "~/lib/api";
import { requireRole } from "~/lib/auth";
import { formatElapsed, minutesSince } from "~/lib/format";
import type { KitchenTicket, Station } from "~/lib/types";
import { button, focus, heading } from "~/lib/ui";
import type { Route } from "./+types/kitchen";

const STATIONS = [
  { id: "all", label: "All" },
  { id: "grill", label: "Grill" },
  { id: "cold", label: "Cold" },
  { id: "dessert", label: "Dessert" },
] as const;

export function meta() {
  return [{ title: "Ticket rail · Mavera" }];
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const user = requireRole("KITCHEN");
  const requested = new URL(request.url).searchParams.get("station");
  const station = STATIONS.find((s) => s.id === requested) ?? STATIONS[0];
  const tickets = await api<KitchenTicket[]>("/tickets");
  return { user, station, tickets };
}

// Green, then amber, then red. Each also has a word, so colour is never the only signal.
function timing(minutes: number) {
  if (minutes < 8) return { label: "On time", style: "bg-emerald-500 text-emerald-950" };
  if (minutes < 15) return { label: "Getting late", style: "bg-amber-400 text-stone-950" };
  return { label: "Late", style: "bg-red-600 text-white" };
}

export default function Kitchen({ loaderData }: Route.ComponentProps) {
  const { user, station, tickets } = loaderData;
  const now = useNow();
  const { revalidate } = useRevalidator();
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  usePolling(3000);

  const mine: Station | null = station.id === "all" ? null : (station.id.toUpperCase() as Station);
  // The rail shows every ticket that has something for this station, oldest first.
  const visible = mine ? tickets.filter((t) => t.items.some((i) => i.station === mine)) : tickets;

  async function move(ticket: KitchenTicket, action: "start" | "ready" | "bump") {
    setBusyId(ticket.id);
    setError(null);
    try {
      await api(`/tickets/${ticket.id}/${action}`, { method: "POST" });
      await revalidate();
    } catch (e) {
      setError(e instanceof Error ? e.message : "That did not work.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <RoleTopBar roleName="Kitchen" user={user} showReportSpill />

      <div className="mx-auto w-full max-w-[1800px] p-6">
        <h1 className={heading}>Ticket rail</h1>
        <TabNav label="Station" basePath="/kitchen" param="station" tabs={STATIONS} activeId={station.id} />

        <p role="alert" className="mt-3 min-h-5 text-sm text-red-700">
          {error}
        </p>

        {visible.length === 0 ? (
          <p className="mt-10 rounded-xl border border-dashed border-stone-300 p-10 text-center text-lg text-stone-600">
            No open tickets{mine ? ` for ${station.label.toLowerCase()}` : ""}. New orders appear here by themselves.
          </p>
        ) : (
          <ul className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-5">
            {visible.map((ticket, index) => {
              const minutes = minutesSince(ticket.createdAt, now);
              const clock = timing(minutes);
              const ready = ticket.status === "READY";
              return (
                <li
                  key={ticket.id}
                  style={{ animationDelay: `${index * 70}ms` }}
                  className={`animate-fade-up flex flex-col rounded-2xl border-2 p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg ${ready ? "border-emerald-400 bg-emerald-50" : "border-stone-300 bg-white"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-3xl font-bold text-stone-900">Table {ticket.tableCode}</h2>
                      <p className="text-sm text-stone-600">
                        {ticket.covers} covers · {ticket.status === "NEW" ? "New" : ticket.status === "STARTED" ? "Cooking" : "Ready"}
                      </p>
                    </div>
                    <p className={`rounded-lg px-3 py-1 text-right ${ready ? "bg-emerald-500 text-emerald-950" : clock.style}`}>
                      <span className="block text-2xl font-bold tabular-nums">{formatElapsed(ticket.createdAt, now)}</span>
                      <span className="block text-xs font-semibold">{ready ? "Ready" : clock.label}</span>
                    </p>
                  </div>

                  {ticket.flags.length > 0 && (
                    <p className="mt-3 flex flex-wrap gap-2">
                      {ticket.flags.map((f) => (
                        <span key={f} className="rounded-md bg-red-600 px-3 py-1 text-sm font-bold uppercase text-white">
                          ⚠ {f.replace("_", " ")}
                        </span>
                      ))}
                    </p>
                  )}

                  <ul className="mt-4 flex-1 space-y-3">
                    {ticket.items.map((item) => {
                      const dimmed = mine !== null && item.station !== mine;
                      return (
                        <li key={item.id} className={dimmed ? "opacity-40" : ""}>
                          <p className="text-xl font-semibold text-stone-900">
                            {item.quantity} × {item.name}
                            <span className="ml-2 text-xs font-normal uppercase text-stone-600">{item.station.toLowerCase()}</span>
                          </p>
                          {item.modifiers.length > 0 && <p className="text-base text-amber-700">{item.modifiers.join(" · ")}</p>}
                          {item.allergens.length > 0 && (
                            <p className="mt-1 flex flex-wrap gap-1">
                              {item.allergens.map((a) => (
                                <span key={a} className="rounded bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-900">
                                  Allergen: {a}
                                </span>
                              ))}
                            </p>
                          )}
                        </li>
                      );
                    })}
                  </ul>

                  <div className="mt-5">
                    {ticket.status === "NEW" && (
                      <button type="button" disabled={busyId === ticket.id} onClick={() => move(ticket, "start")} className={`${button.secondary} w-full py-3 text-base`}>
                        Start
                      </button>
                    )}
                    {ticket.status === "STARTED" && (
                      <button type="button" disabled={busyId === ticket.id} onClick={() => move(ticket, "ready")} className={`${button.primary} w-full py-3 text-base`}>
                        Mark ready
                      </button>
                    )}
                    {ticket.status === "READY" && (
                      <button type="button" disabled={busyId === ticket.id} onClick={() => move(ticket, "bump")} className={`w-full rounded-lg bg-emerald-400 py-3 text-base font-bold text-emerald-950 hover:bg-emerald-300 disabled:opacity-50 ${focus}`}>
                        Bump
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
