import { useState } from "react";
import { Link, useNavigate, useRevalidator } from "react-router";
import { usePolling } from "~/hooks/usePolling";
import { api } from "~/lib/api";
import { formatClock, formatMoney } from "~/lib/format";
import type { OrderView, TicketStatus } from "~/lib/types";
import { button, card, focus, heading } from "~/lib/ui";
import type { Route } from "./+types/ticket";

const TICKET_LABEL: Record<TicketStatus, string> = {
  NEW: "Waiting for the kitchen",
  STARTED: "Being cooked",
  READY: "Ready — run it to the table",
  BUMPED: "Served from the pass",
};

export function meta() {
  return [{ title: "Ticket · Mavera" }];
}

// The route parameter is the order id.
export function clientLoader({ params }: Route.ClientLoaderArgs) {
  return api<OrderView>(`/orders/${params.ticketId}`);
}

export default function TicketDetail({ loaderData: order }: Route.ComponentProps) {
  const navigate = useNavigate();
  const { revalidate } = useRevalidator();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  usePolling(4000);

  async function act(path: string, then?: () => void) {
    setBusy(true);
    setError(null);
    try {
      await api(path, { method: "POST" });
      if (then) then();
      else await revalidate();
    } catch (e) {
      setError(e instanceof Error ? e.message : "That did not work.");
    } finally {
      setBusy(false);
    }
  }

  const closed = order.status === "CLOSED";
  const ready = order.ticket?.status === "READY" || order.ticket?.status === "BUMPED";

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex items-baseline justify-between">
        <h1 className={heading}>Table {order.table.code} · ticket</h1>
        <Link to="/waiter/floor-plan" className={`text-sm text-stone-400 underline ${focus}`}>
          Back to floor plan
        </Link>
      </div>

      <div
        role="status"
        aria-live="polite"
        className={`rounded-lg border px-4 py-3 ${ready && !closed ? "border-emerald-400 bg-emerald-900/60 text-emerald-50" : "border-white/10 bg-stone-900 text-stone-200"}`}
      >
        {closed ? "This table is closed." : order.ticket ? TICKET_LABEL[order.ticket.status] : "Not sent yet"}
        {order.sentAt && <span className="ml-2 text-sm opacity-70">Sent at {formatClock(order.sentAt)}</span>}
      </div>

      <section className={card} aria-label="Items">
        {order.flags.length > 0 && (
          <p className="mb-3 flex flex-wrap gap-2">
            {order.flags.map((f) => (
              <span key={f} className="rounded-full bg-red-500 px-3 py-0.5 text-xs font-semibold text-white">
                {f.replace("_", " ")}
              </span>
            ))}
          </p>
        )}
        <ul className="divide-y divide-white/10">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-start justify-between gap-4 py-3">
              <div>
                <p className="font-medium text-white">
                  {item.quantity} × {item.name}
                </p>
                <p className="text-xs text-stone-400">
                  {item.station.toLowerCase()}
                  {item.modifiers.length > 0 && ` · ${item.modifiers.join(", ")}`}
                </p>
              </div>
              <p className="text-stone-300">{formatMoney(item.price * item.quantity)}</p>
            </li>
          ))}
        </ul>
        <p className="mt-3 flex justify-between border-t border-white/10 pt-3 text-lg font-semibold text-white">
          <span>Total</span>
          <span>{formatMoney(order.total)}</span>
        </p>
      </section>

      <p role="alert" className="min-h-5 text-sm text-red-400">
        {error}
      </p>

      {!closed && (
        <div className="flex flex-wrap gap-3">
          <Link to={`/waiter/order/${order.table.id}`} className={button.secondary}>
            Add more
          </Link>
          <button
            type="button"
            disabled={busy || order.table.status === "CHECK_REQUESTED"}
            onClick={() => act(`/tables/${order.table.id}/check`)}
            className={button.secondary}
          >
            {order.table.status === "CHECK_REQUESTED" ? "Check requested" : "Request check"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => act(`/tables/${order.table.id}/close`, () => navigate("/waiter/floor-plan"))}
            className={button.primary}
          >
            Close table
          </button>
        </div>
      )}
    </div>
  );
}
