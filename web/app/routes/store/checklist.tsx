import { useState } from "react";
import { useRevalidator } from "react-router";
import { api } from "~/lib/api";
import { formatShortDate } from "~/lib/format";
import type { ChecklistTaskInput, ChecklistVersion } from "~/lib/types";
import { button, card, heading, input } from "~/lib/ui";
import type { Route } from "./+types/checklist";

const AREAS = ["Main", "Terrace", "Family", "Kitchen", "Restrooms", "Storage", "Entrance"];

export function meta() {
  return [{ title: "Checklist editor · Mavera" }];
}

export function clientLoader() {
  return api<ChecklistVersion[]>("/checklists/mine");
}

const STATUS_STYLE = {
  PENDING: "bg-amber-400 text-stone-950",
  APPROVED: "bg-emerald-500 text-emerald-950",
  REJECTED: "bg-red-600 text-white",
} as const;

export default function ChecklistEditor({ loaderData: versions }: Route.ComponentProps) {
  const { revalidate } = useRevalidator();
  const pending = versions.find((v) => v.status === "PENDING");
  // Start from the version the cleaners use today (the newest approved one).
  const base = versions.find((v) => v.status === "APPROVED") ?? versions[0];
  const [tasks, setTasks] = useState<ChecklistTaskInput[]>(
    () => (base?.tasks ?? []).map(({ area, description, dueTime }) => ({ area, description, dueTime })),
  );
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const update = (index: number, patch: Partial<ChecklistTaskInput>) =>
    setTasks((current) => current.map((t, i) => (i === index ? { ...t, ...patch } : t)));

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      await api("/checklists", { method: "POST", body: { tasks } });
      setSent(true);
      await revalidate();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not submit.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <h1 className={heading}>Checklist editor</h1>
        <p className="mt-1 max-w-prose text-sm text-stone-600">
          Edit the daily cleaning tasks, then submit a new version. The general manager approves it, and only then does it become the cleaner's list.
        </p>
      </div>

      {pending && (
        <p role="status" className="rounded-lg border border-amber-400 bg-amber-50 px-4 py-3 text-amber-900">
          Version {pending.version} is waiting for the general manager's approval. You can submit another once it is decided.
        </p>
      )}
      {sent && !pending && <p role="status" className="text-emerald-700">Submitted.</p>}

      <section className={card} aria-labelledby="tasks">
        <h2 id="tasks" className="mb-3 text-lg font-semibold text-stone-900">
          Tasks ({tasks.length}) <span className="text-sm font-normal text-stone-600">· starting from version {base?.version}</span>
        </h2>
        <ul className="space-y-2">
          {tasks.map((task, index) => (
            <li key={index} className="grid grid-cols-[130px_1fr_110px_auto] items-end gap-2">
              <div>
                <label htmlFor={`area-${index}`} className="mb-1 block text-xs text-stone-600">Area</label>
                <select id={`area-${index}`} value={task.area} onChange={(e) => update(index, { area: e.target.value })} className={input}>
                  {AREAS.map((a) => <option key={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor={`desc-${index}`} className="mb-1 block text-xs text-stone-600">Task</label>
                <input id={`desc-${index}`} value={task.description} onChange={(e) => update(index, { description: e.target.value })} className={input} />
              </div>
              <div>
                <label htmlFor={`due-${index}`} className="mb-1 block text-xs text-stone-600">Due</label>
                <input id={`due-${index}`} type="time" value={task.dueTime} onChange={(e) => update(index, { dueTime: e.target.value })} className={input} />
              </div>
              <button type="button" onClick={() => setTasks((c) => c.filter((_, i) => i !== index))} aria-label={`Remove task: ${task.description}`} className={button.small}>
                Remove
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => setTasks((c) => [...c, { area: "Main", description: "", dueTime: "12:00" }])} className={button.secondary}>
            Add task
          </button>
          <button type="button" onClick={submit} disabled={busy || !!pending || tasks.length === 0} className={button.primary}>
            {busy ? "Submitting…" : "Submit for approval"}
          </button>
          <p role="alert" className="text-sm text-red-700">{error}</p>
        </div>
      </section>

      <section aria-labelledby="history">
        <h2 id="history" className="mb-3 text-lg font-semibold text-stone-900">Version history</h2>
        <ul className="space-y-2">
          {versions.map((v) => (
            <li key={v.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-stone-200 bg-white px-4 py-3 text-sm">
              <span className="font-medium text-stone-900">Version {v.version}</span>
              <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${STATUS_STYLE[v.status]}`}>{v.status.toLowerCase()}</span>
              <span className="text-stone-600">{v.tasks.length} tasks · submitted {formatShortDate(v.submittedAt)}</span>
              {v.note && <span className="text-stone-700">GM note: “{v.note}”</span>}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
