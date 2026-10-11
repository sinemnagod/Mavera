import { useState } from "react";
import { useRevalidator } from "react-router";
import { api } from "~/lib/api";
import { formatShortDate } from "~/lib/format";
import type { ChecklistVersion } from "~/lib/types";
import { button, card, heading, input } from "~/lib/ui";
import type { Route } from "./+types/approvals";

export function meta() {
  return [{ title: "Approvals · Mavera" }];
}

export function clientLoader() {
  return api<ChecklistVersion[]>("/checklists/pending");
}

export default function Approvals({ loaderData: pending }: Route.ComponentProps) {
  const { revalidate } = useRevalidator();
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function decide(id: string, approve: boolean) {
    setBusyId(id);
    setError(null);
    try {
      await api(`/checklists/${id}/decide`, { method: "POST", body: { approve, note: notes[id]?.trim() || undefined } });
      await revalidate();
    } catch (e) {
      setError(e instanceof Error ? e.message : "That did not work.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div>
        <h1 className={heading}>Approvals</h1>
        <p className="mt-1 text-sm text-stone-400">New cleaning checklists from the store managers. Approved versions become the cleaners' list straight away.</p>
      </div>

      <p role="alert" className="min-h-5 text-sm text-red-400">{error}</p>

      {pending.length === 0 ? (
        <p className={`${card} text-stone-400`}>Nothing is waiting for approval.</p>
      ) : (
        <ul className="space-y-5">
          {pending.map((v) => {
            const areas = [...new Set(v.tasks.map((t) => t.area))];
            return (
              <li key={v.id} className={card}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="text-lg font-semibold text-white">
                    {v.locationName} · version {v.version}
                  </h2>
                  <p className="text-sm text-stone-400">
                    {v.tasks.length} tasks · by {v.submittedBy} on {formatShortDate(v.submittedAt)}
                  </p>
                </div>

                <details className="mt-3">
                  <summary className="cursor-pointer text-sm text-amber-300">See the tasks</summary>
                  <div className="mt-3 space-y-3 text-sm">
                    {areas.map((area) => (
                      <div key={area}>
                        <h3 className="font-semibold text-stone-200">{area}</h3>
                        <ul className="mt-1 space-y-0.5 text-stone-300">
                          {v.tasks.filter((t) => t.area === area).map((t) => (
                            <li key={t.id}>{t.dueTime} · {t.description}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </details>

                <div className="mt-4">
                  <label htmlFor={`note-${v.id}`} className="mb-1 block text-sm text-stone-300">Note (required if you reject)</label>
                  <input id={`note-${v.id}`} value={notes[v.id] ?? ""} onChange={(e) => setNotes({ ...notes, [v.id]: e.target.value })} className={input} />
                </div>
                <div className="mt-3 flex gap-2">
                  <button type="button" disabled={busyId === v.id} onClick={() => decide(v.id, true)} className={button.primary}>Approve</button>
                  <button type="button" disabled={busyId === v.id || !notes[v.id]?.trim()} onClick={() => decide(v.id, false)} className={button.danger}>Reject</button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
