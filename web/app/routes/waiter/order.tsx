import { useState } from "react";
import { data, Link, redirect, useNavigate } from "react-router";
import { api } from "~/lib/api";
import { formatMoney } from "~/lib/format";
import type { FloorTable, MenuItem, OrderView } from "~/lib/types";
import { button, card, focus, heading } from "~/lib/ui";
import type { Route } from "./+types/order";

// Menu categories in the order of a meal, not alphabetical.
const CATEGORY_ORDER = ["Starters", "Salads", "Mains", "Sides", "Desserts", "Drinks"];

const MODIFIERS = ["No onion", "Well done", "Extra spicy", "Sauce on the side"];
const FLAGS = [
  { id: "ALLERGY", label: "Allergy" },
  { id: "RUSH", label: "Rush" },
  { id: "VIP", label: "VIP" },
  { id: "LARGE_PARTY", label: "Large party" },
];

interface Line {
  key: string;
  item: MenuItem;
  quantity: number;
  modifiers: string[];
}

export function meta() {
  return [{ title: "Order · Mavera" }];
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const [menu, tables] = await Promise.all([api<MenuItem[]>("/menu"), api<FloorTable[]>("/tables")]);
  const table = tables.find((t) => t.id === params.tableId);
  if (!table) throw data("Table not found", { status: 404 });
  if (table.status === "FREE") throw redirect("/waiter/floor-plan");
  return { menu, table };
}

export default function Order({ loaderData }: Route.ComponentProps) {
  const { menu, table } = loaderData;
  const navigate = useNavigate();
  const categories = [...new Set(menu.map((m) => m.category))].sort(
    (a, b) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b),
  );
  const [category, setCategory] = useState(categories[0]);
  const [lines, setLines] = useState<Line[]>([]);
  const [flags, setFlags] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const total = lines.reduce((sum, l) => sum + l.quantity * l.item.price, 0);

  function add(item: MenuItem) {
    setLines((current) => {
      const same = current.find((l) => l.item.id === item.id && l.modifiers.length === 0);
      if (same) return current.map((l) => (l === same ? { ...l, quantity: l.quantity + 1 } : l));
      return [...current, { key: crypto.randomUUID(), item, quantity: 1, modifiers: [] }];
    });
  }
  const change = (key: string, delta: number) =>
    setLines((current) =>
      current.flatMap((l) => (l.key !== key ? [l] : l.quantity + delta <= 0 ? [] : [{ ...l, quantity: l.quantity + delta }])),
    );
  const toggleModifier = (key: string, modifier: string) =>
    setLines((current) =>
      current.map((l) =>
        l.key !== key
          ? l
          : { ...l, modifiers: l.modifiers.includes(modifier) ? l.modifiers.filter((m) => m !== modifier) : [...l.modifiers, modifier] },
      ),
    );
  const toggleFlag = (id: string) =>
    setFlags((current) => (current.includes(id) ? current.filter((f) => f !== id) : [...current, id]));

  async function send() {
    setSending(true);
    setError(null);
    try {
      const order = await api<OrderView>("/orders", {
        method: "POST",
        body: {
          tableId: table.id,
          flags,
          items: lines.map((l) => ({ menuItemId: l.item.id, quantity: l.quantity, modifiers: l.modifiers })),
        },
      });
      navigate(`/waiter/ticket/${order.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send the order.");
      setSending(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-[1600px] gap-6 p-6 lg:grid-cols-[1fr_380px]">
      <section aria-label="Menu">
        <div className="flex items-baseline justify-between">
          <h1 className={heading}>Table {table.code}</h1>
          <Link to="/waiter/floor-plan" className={`text-sm text-stone-400 underline ${focus}`}>
            Back to floor plan
          </Link>
        </div>
        {table.orderId && (
          <p className="mt-2 text-sm text-amber-300">
            This table already has an order. New items will be added to it.{" "}
            <Link to={`/waiter/ticket/${table.orderId}`} className={`underline ${focus}`}>
              View current ticket
            </Link>
          </p>
        )}

        <nav aria-label="Menu categories" className="mt-4 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={c === category}
              onClick={() => setCategory(c)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${focus} ${c === category ? "bg-amber-400 text-stone-950" : "bg-stone-800 text-stone-300 hover:bg-stone-700"}`}
            >
              {c}
            </button>
          ))}
        </nav>

        <ul className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-3">
          {menu
            .filter((m) => m.category === category)
            .map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => add(item)}
                  className={`flex h-full w-full flex-col items-start gap-1 rounded-xl border border-white/10 bg-stone-900 p-4 text-left hover:border-amber-400/60 hover:bg-stone-800 ${focus}`}
                >
                  <span className="font-medium text-white">{item.name}</span>
                  <span className="text-sm text-amber-300">{formatMoney(item.price)}</span>
                  <span className="text-xs text-stone-400">
                    {item.station.toLowerCase()}
                    {item.allergens.length > 0 && ` · contains ${item.allergens.join(", ")}`}
                  </span>
                </button>
              </li>
            ))}
        </ul>
      </section>

      {/* The receipt-style ticket. Everything here is amber because none of it is sent yet. */}
      <aside aria-label="Ticket" className={`${card} h-fit space-y-4 font-mono lg:sticky lg:top-6`}>
        <div className="border-b border-dashed border-white/20 pb-3">
          <h2 className="text-lg font-semibold text-white">Ticket · {table.code}</h2>
          <p className="text-xs text-stone-400">{table.covers} covers</p>
        </div>

        {lines.length === 0 ? (
          <p className="text-sm text-stone-400">Tap a dish to add it.</p>
        ) : (
          <ul className="space-y-3">
            {lines.map((line) => (
              <li key={line.key} className="rounded-lg border border-amber-400/40 bg-amber-950/40 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-amber-100">{line.item.name}</p>
                    <p className="text-xs text-amber-300">Not sent yet · {formatMoney(line.item.price * line.quantity)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button type="button" aria-label={`Remove one ${line.item.name}`} onClick={() => change(line.key, -1)} className={`h-8 w-8 rounded-md border border-white/20 text-lg ${focus}`}>
                      −
                    </button>
                    <span className="w-6 text-center text-sm" aria-label={`${line.quantity} of ${line.item.name}`}>
                      {line.quantity}
                    </span>
                    <button type="button" aria-label={`Add one ${line.item.name}`} onClick={() => change(line.key, 1)} className={`h-8 w-8 rounded-md border border-white/20 text-lg ${focus}`}>
                      +
                    </button>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {MODIFIERS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      aria-pressed={line.modifiers.includes(m)}
                      onClick={() => toggleModifier(line.key, m)}
                      className={`rounded-full border px-2 py-0.5 text-xs ${focus} ${line.modifiers.includes(m) ? "border-amber-300 bg-amber-300 text-stone-950" : "border-white/20 text-stone-300"}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}

        <fieldset className="border-t border-dashed border-white/20 pt-3">
          <legend className="text-xs text-stone-400">Flags for the kitchen</legend>
          <div className="mt-1 flex flex-wrap gap-1">
            {FLAGS.map((f) => (
              <button
                key={f.id}
                type="button"
                aria-pressed={flags.includes(f.id)}
                onClick={() => toggleFlag(f.id)}
                className={`rounded-full border px-3 py-1 text-xs ${focus} ${flags.includes(f.id) ? "border-red-300 bg-red-500 text-white" : "border-white/20 text-stone-300"}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="flex items-center justify-between border-t border-dashed border-white/20 pt-3 text-lg font-semibold text-white">
          <span>Total</span>
          <span>{formatMoney(total)}</span>
        </div>

        <p role="alert" className="min-h-5 text-sm text-red-400">
          {error}
        </p>
        <button type="button" onClick={send} disabled={lines.length === 0 || sending} className={`${button.primary} w-full py-3 text-base`}>
          {sending ? "Sending…" : "Send to kitchen"}
        </button>
      </aside>
    </div>
  );
}
