import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useState } from "react";
import { apiUrl } from "~/lib/api";
import { readSession } from "~/lib/session";
import type { Briefing } from "~/lib/types";
import { button } from "~/lib/ui";

type BriefingMessage = UIMessage<never, never, { shiftBriefing: { input: Briefing; output: Briefing } }>;

// When the server refuses, the chat library reports the raw response body ({"message": "..."}).
// Pull out just the sentence meant for people.
function readableError(raw: string | undefined): string {
  if (!raw) return "The AI service did not answer.";
  try {
    const parsed = JSON.parse(raw) as { message?: unknown };
    if (typeof parsed.message === "string") return parsed.message;
  } catch {
    // Not JSON: use the text as it is.
  }
  return raw;
}

const URGENCY = {
  now: { label: "Now", style: "bg-red-500 text-white" },
  today: { label: "Today", style: "bg-amber-400 text-stone-950" },
  this_week: { label: "This week", style: "bg-sky-400 text-sky-950" },
} as const;

// The GM's shift briefing (AI tool). The model's answer streams in as a "tool call", and the card
// draws each of the four states differently: input streaming, input available, output
// available, and output error.
export default function BriefingCard() {
  const [transport] = useState(
    () =>
      new DefaultChatTransport({
        api: apiUrl("/ai/briefing"),
        headers: () => ({ Authorization: `Bearer ${readSession()?.token ?? ""}` }),
      }),
  );
  const { messages, sendMessage, status, stop, error } = useChat<BriefingMessage>({ transport });

  const assistant = [...messages].reverse().find((m) => m.role === "assistant");
  const part = assistant?.parts.find((p) => p.type === "tool-shiftBriefing");
  const busy = status === "submitted" || status === "streaming";
  const failed = status === "error" || part?.state === "output-error";
  const ask = () => void sendMessage({ text: "Give me today's shift briefing." });

  const live = failed
    ? "The briefing could not be produced."
    : part?.state === "output-available"
      ? "The briefing is ready."
      : busy
        ? "Writing the briefing…"
        : "";

  // While the input streams, only some fields exist yet, so every field is optional here.
  const draft: Partial<Briefing> | undefined =
    part && part.state !== "output-error" ? (part.state === "output-available" ? part.output : (part.input as Partial<Briefing> | undefined)) : undefined;

  return (
    <section aria-labelledby="briefing-title" aria-busy={busy} className="rounded-2xl border border-amber-400/40 bg-gradient-to-br from-stone-900 to-amber-950/30 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="briefing-title" className="text-xl font-semibold text-white">Today's briefing</h2>
          <p className="text-sm text-stone-400">What to decide today, and where — not a summary of the charts.</p>
        </div>
        <div className="flex gap-2">
          {busy && (
            <button type="button" onClick={() => stop()} className={button.secondary}>
              Stop
            </button>
          )}
          {!busy && !failed && (
            <button type="button" onClick={ask} className={button.primary}>
              {part?.state === "output-available" ? "Refresh briefing" : "Generate briefing"}
            </button>
          )}
        </div>
      </div>

      <p role="status" aria-live="polite" className="sr-only">{live}</p>

      {/* State: nothing asked yet. */}
      {!busy && !part && !failed && (
        <p className="mt-5 rounded-lg border border-dashed border-white/15 p-5 text-stone-400">
          Press <strong className="text-stone-200">Generate briefing</strong> and Mavera will read this week's numbers for all five locations and tell you what to do.
        </p>
      )}

      {/* State: request sent, nothing back yet. */}
      {status === "submitted" && (
        <div className="mt-5 space-y-3" aria-hidden="true">
          <div className="h-6 w-3/4 animate-pulse rounded bg-white/10" />
          <div className="h-16 animate-pulse rounded bg-white/10" />
          <div className="h-16 animate-pulse rounded bg-white/10" />
        </div>
      )}

      {/* State: error. A calm message and a working retry. */}
      {failed && (
        <div role="alert" className="mt-5 rounded-lg border border-red-400 bg-red-950/60 p-5">
          <p className="font-semibold text-red-100">The briefing could not be produced.</p>
          <p className="mt-1 text-sm text-red-200">
            {readableError((part?.state === "output-error" && part.errorText) || error?.message || undefined)} Your dashboard numbers below are not affected.
          </p>
          <button type="button" onClick={ask} className={`${button.danger} mt-3`}>
            Try again
          </button>
        </div>
      )}

      {/* States: input streaming, input available and output available all show what exists so far. */}
      {draft && !failed && (
        <div className="mt-5 space-y-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-300">
            {part?.state === "input-streaming" ? "Writing…" : part?.state === "input-available" ? "Checking…" : "Ready"}
          </p>
          {draft.headline && <p className="text-2xl font-semibold leading-snug text-white">{draft.headline}</p>}

          <ol className="space-y-3">
            {draft.actions?.map((a, i) => {
              const urgency = a?.urgency ? URGENCY[a.urgency] : undefined;
              return (
                <li key={i} className="rounded-xl border border-white/10 bg-stone-950/70 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {urgency && <span className={`rounded-full px-3 py-0.5 text-xs font-bold ${urgency.style}`}>{urgency.label}</span>}
                    <p className="font-semibold text-white">{a?.action}</p>
                  </div>
                  {a?.reason && <p className="mt-1 text-sm text-stone-300">{a.reason}</p>}
                </li>
              );
            })}
          </ol>

          {draft.watchItems && draft.watchItems.length > 0 && (
            <div>
              <h3 className="mb-1 text-sm font-semibold text-stone-200">Keep an eye on</h3>
              <ul className="list-disc space-y-1 pl-5 text-sm text-stone-300">
                {draft.watchItems.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            </div>
          )}
          {draft.comparison && (
            <p className="border-t border-white/10 pt-3 text-sm text-stone-300">
              <strong className="text-stone-100">Best vs weakest: </strong>{draft.comparison}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
