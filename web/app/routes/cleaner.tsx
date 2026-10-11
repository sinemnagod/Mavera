import { useState } from "react";
import { useRevalidator } from "react-router";
import RoleTopBar from "~/components/RoleTopBar";
import { useNow } from "~/hooks/useNow";
import { usePolling } from "~/hooks/usePolling";
import { api } from "~/lib/api";
import { requireRole } from "~/lib/auth";
import { formatClock, timeAgo } from "~/lib/format";
import type { CleaningToday, Spill } from "~/lib/types";
import { button, card, heading } from "~/lib/ui";
import type { Route } from "./+types/cleaner";

export function meta() {
  return [{ title: "Task queue · Mavera" }];
}

export async function clientLoader() {
  const user = requireRole("CLEANER");
  const [spills, today] = await Promise.all([api<Spill[]>("/spills"), api<CleaningToday>("/cleaning/today")]);
  return { user, spills, today };
}

const ROLE_LABEL: Record<string, string> = {
  WAITER: "Waiter",
  KITCHEN: "Kitchen",
  STORE_MANAGER: "Store manager",
};

export default function Cleaner({ loaderData }: Route.ComponentProps) {
  const { user, spills, today } = loaderData;
  const now = useNow(30_000);
  const { revalidate } = useRevalidator();
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  usePolling(5000);

  async function act(id: string, path: string) {
    setBusyId(id);
    setError(null);
    try {
      await api(path, { method: "POST" });
      await revalidate();
    } catch (e) {
      setError(e instanceof Error ? e.message : "That did not work.");
    } finally {
      setBusyId(null);
    }
  }

  const areas = [...new Set(today.tasks.map((t) => t.area))];

  return (
    <div className="flex flex-1 flex-col">
      <RoleTopBar roleName="Cleaner" user={user} />

      <div className="mx-auto w-full max-w-4xl space-y-8 p-6">
        <h1 className={heading}>Task queue</h1>
        <p role="alert" className="min-h-5 text-sm text-red-400">
          {error}
        </p>

        {/* Flow 3: spills reported by the waiter, kitchen or store manager land here, newest first. */}
        <section aria-labelledby="urgent">
          <h2 id="urgent" className="mb-3 text-lg font-semibold text-red-300">
            Urgent spills ({spills.length})
          </h2>
          {spills.length === 0 ? (
            <p className={`${card} text-stone-400`}>No open spills. 🎉 New reports appear here by themselves.</p>
          ) : (
            <ul className="space-y-3">
              {spills.map((spill) => (
                <li key={spill.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-red-400 bg-red-950 p-4">
                  <div>
                    <p className="text-lg font-semibold text-white">
                      <span className="mr-2 rounded bg-red-500 px-2 py-0.5 text-xs font-bold uppercase">Spill</span>
                      {spill.area}: {spill.description}
                    </p>
                    <p className="text-sm text-red-200">
                      Reported by {spill.reportedBy} ({ROLE_LABEL[spill.reportedByRole] ?? spill.reportedByRole}) · {timeAgo(spill.reportedAt, now)}
                    </p>
                  </div>
                  <button type="button" disabled={busyId === spill.id} onClick={() => act(spill.id, `/spills/${spill.id}/resolve`)} className={button.primary}>
                    Mark cleaned
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="checklist">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="checklist" className="text-lg font-semibold text-white">
              Today's checklist {today.version && <span className="text-sm font-normal text-stone-400">(version {today.version})</span>}
            </h2>
            <p className="text-sm text-stone-300">
              {today.summary.done} of {today.summary.total} done
              {today.summary.overdue > 0 && <span className="ml-2 font-semibold text-red-300">· {today.summary.overdue} overdue</span>}
            </p>
          </div>

          {areas.map((area) => (
            <div key={area} className="mb-5">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-amber-300">{area}</h3>
              <ul className="space-y-2">
                {today.tasks
                  .filter((t) => t.area === area)
                  .map((task) => (
                    <li
                      key={task.id}
                      className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3 ${task.overdue ? "border-red-400 bg-red-950/60" : task.completed ? "border-white/10 bg-stone-900/50 opacity-70" : "border-white/10 bg-stone-900"}`}
                    >
                      <div>
                        <p className={`text-white ${task.completed ? "line-through" : ""}`}>{task.description}</p>
                        <p className="text-sm text-stone-400">
                          Due {task.dueTime}
                          {task.overdue && <strong className="ml-2 text-red-300">Overdue</strong>}
                          {task.completed && <span className="ml-2 text-emerald-300">✓ Done by {task.completed.by} at {formatClock(task.completed.at)}</span>}
                        </p>
                      </div>
                      {!task.completed && (
                        <button type="button" disabled={busyId === task.id} onClick={() => act(task.id, `/cleaning/tasks/${task.id}/complete`)} className={button.secondary}>
                          Mark done
                        </button>
                      )}
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
