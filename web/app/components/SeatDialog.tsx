import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { api } from "~/lib/api";
import type { FloorTable } from "~/lib/types";
import { button, input } from "~/lib/ui";

interface SeatDialogProps {
  table: FloorTable | null;
  onClose: () => void;
}

// Asks "how many guests?" and seats the table (flow 1, step 1), then goes to the order screen.
export default function SeatDialog({ table, onClose }: SeatDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const navigate = useNavigate();
  // The parent gives this component a new `key` for every table, so these start fresh each time.
  const [covers, setCovers] = useState(Math.min(2, table?.seats ?? 2));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (table) dialog.current?.showModal();
    else dialog.current?.close();
  }, [table]);

  async function seat(event: React.FormEvent) {
    event.preventDefault();
    if (!table) return;
    setBusy(true);
    setError(null);
    try {
      await api(`/tables/${table.id}/seat`, { method: "POST", body: { covers } });
      navigate(`/waiter/order/${table.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not seat the table.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      aria-labelledby="seat-title"
      className="m-auto w-full max-w-sm rounded-xl border border-stone-300 bg-white p-6 text-stone-900 backdrop:bg-stone-900/40"
    >
      <h2 id="seat-title" className="text-lg font-semibold text-stone-900">
        Seat table {table?.code}
      </h2>
      <p className="mt-1 text-sm text-stone-600">This table has {table?.seats} seats.</p>
      <form onSubmit={seat} className="mt-4 space-y-4">
        <div>
          <label htmlFor="covers" className="mb-1 block text-sm text-stone-700">
            How many guests (covers)?
          </label>
          <input
            id="covers"
            type="number"
            min={1}
            max={20}
            value={covers}
            onChange={(e) => setCovers(Number(e.target.value))}
            className={input}
          />
        </div>
        <p role="alert" className="min-h-5 text-sm text-red-700">
          {error}
        </p>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className={button.secondary}>
            Cancel
          </button>
          <button type="submit" disabled={busy || covers < 1} className={button.primary}>
            {busy ? "Seating…" : "Seat and take order"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
