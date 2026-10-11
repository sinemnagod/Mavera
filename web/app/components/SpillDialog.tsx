import { useRef, useState } from "react";
import { api } from "~/lib/api";
import { button, focus, input } from "~/lib/ui";

const AREAS = ["Main", "Terrace", "Family", "Kitchen", "Restrooms", "Storage", "Entrance"];

// The "Report spill" button and its pop-up form (flow 3). A native <dialog> traps the
// keyboard focus inside while it is open and closes with the Escape key.
export default function SpillDialog() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [area, setArea] = useState(AREAS[0]);
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  function open() {
    setError(null);
    setSent(false);
    dialog.current?.showModal();
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSending(true);
    setError(null);
    try {
      await api("/spills", { method: "POST", body: { area, description } });
      setSent(true);
      setDescription("");
      setTimeout(() => dialog.current?.close(), 1200);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send the report.");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        className={`rounded-full bg-red-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-red-500 ${focus}`}
      >
        Report spill
      </button>

      <dialog
        ref={dialog}
        aria-labelledby="spill-title"
        className="m-auto w-full max-w-md rounded-xl border border-stone-300 bg-white p-6 text-stone-900 backdrop:bg-stone-900/40"
      >
        <h2 id="spill-title" className="text-lg font-semibold text-stone-900">
          Report a spill
        </h2>
        <p className="mt-1 text-sm text-stone-600">It goes straight to the top of the cleaner's list.</p>

        <form onSubmit={submit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="spill-area" className="mb-1 block text-sm text-stone-700">
              Where?
            </label>
            <select id="spill-area" value={area} onChange={(e) => setArea(e.target.value)} className={input}>
              {AREAS.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="spill-description" className="mb-1 block text-sm text-stone-700">
              What happened?
            </label>
            <input
              id="spill-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tea spilled next to table M4"
              maxLength={200}
              required
              className={input}
            />
          </div>

          <p role="status" className="min-h-5 text-sm">
            {sent && <span className="text-emerald-700">Reported. The cleaner can see it now.</span>}
            {error && <span className="text-red-700">{error}</span>}
          </p>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => dialog.current?.close()} className={button.secondary}>
              Cancel
            </button>
            <button type="submit" disabled={sending || description.trim().length < 3} className={button.danger}>
              {sending ? "Sending…" : "Send report"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
