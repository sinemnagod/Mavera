# CLAUDE.md

Context for AI assistants working in this repository.

---

## What this is

**Mavera** — a restaurant operations system for a five-location restaurant group in Istanbul. Five roles, each with a screen built for what they actually do; the roles are connected so one role's work becomes another's information.

This is also the capstone project for the **FlyRank AI internship, Frontend AI Engineering track**. That means some things in this repo exist to satisfy assignment criteria, and those criteria are non-negotiable. They're listed below under *Constraints that come from the program*.

Full product definition lives in `SPEC.md`. Read it before making structural decisions.

---

## Stack

- **React** via **Next.js** (App Router)
- **JavaScript**, not TypeScript — files are `.js` / `.jsx`
- **Redux Toolkit** + React Redux
- **Tailwind CSS**
- Deployed on **Vercel**
- AI via the **Vercel AI SDK** talking to **Claude**

Redux `<Provider>` is wrapped in a `"use client"` component because the root layout is a Server Component.

## Commands

- `npm run dev` — dev server
- `npm run build` — production build
- `npm test` — Vitest
- `npm run test:e2e` — Playwright

---

## Conventions

- Commit messages follow **Conventional Commits**: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`. Git history is graded at the end — keep it clean.
- One component per file, PascalCase filenames, in `src/components/`.
- **Pure functions only in `src/lib/`** — no React imports there. Scoring, variance calculation, prioritisation helpers, formatters all live here so they're unit-testable without rendering.
- Seed data is read-only JSON in `src/data/`. Never mutate it; copy into Redux state instead.
- Server Components by default. `"use client"` only where interactivity requires it.
- Prefer `const` and early returns over nested conditionals.
- Comment the *why*, never the *what*.

## Hard rules

These are testable, not preferences. A change that violates one should be rejected in review.

1. **The Anthropic API key never reaches the browser.** It lives in `app/api/chat/route.js` only. No `NEXT_PUBLIC_` prefix on it, ever.
2. **Every interactive element is a real `<button>` or `<a>`** with an accessible name and a visible focus state. No `<div onClick>`. This is graded.
3. **Every tool result renders as a component** — card, table, chart. Never a JSON dump, never raw text.
4. **Every AI tool state is designed**: input streaming, input available, output available, output error. Design the error state first.
5. **No new dependencies without asking.** The stack above is deliberately small.
6. **Never commit** `node_modules/`, `.next/`, or `.env`.

---

## The product

### Five locations
Kadıköy, Nişantaşı, Bebek, Beşiktaş, Üsküdar. Four roles are scoped to one location; only the general manager sees all five.

### Landing
Five role buttons with icons, no authentication. Dark, warm, high-end feel. Marked as demo mode.

### Roles and screens

| Role | Screens | AI |
|---|---|---|
| **Waiter** | Floor plan (Main / Terrace / Family tabs), Order (menu + receipt-styled panel), Ticket detail | **None, deliberately** — mid-service a waiter needs predictable speed, not a model interpreting them |
| **Kitchen (expo)** | Ticket rail with age timers and station tabs (All / Grill / Cold / Dessert) | Prioritise queue |
| **Cleaner** | Task queue — urgent spills on top, approved daily checklist below | None |
| **Store manager** | Stock, Counts, Movements, Variance, Checklist editor | Run-out projection |
| **General manager** | Overview (AI briefing pinned at top), Location detail, Approvals | Shift briefing |

Fourteen routes in total: landing plus thirteen role screens (3 waiter, 1 kitchen, 1 cleaner, 5 store manager, 3 GM).

Waiter, kitchen, cleaner and store manager are hardcoded to Kadıköy (no `[locationId]` in their URLs) — the stand-in for what auth would do. Only the GM's location detail takes `[locationId]`.

### Cross-role flows

These are what make it a system rather than five separate screens. Breaking one is a serious regression.

1. Waiter sends an order → ticket appears on the kitchen rail
2. Expo marks ready → waiter is notified
3. Waiter, kitchen, or store manager reports a spill → top of the cleaner's queue
4. Store manager submits a checklist version → GM approves → becomes the cleaner's daily list
5. Sales generate theoretical ingredient usage → counts give actual → variance surfaces waste
6. Cleaning completions → GM compliance metric
7. Everything → GM analytics

### Domain vocabulary

Use the real terms in UI and code — it's what makes this read as restaurant software:
**par level** (ideal stock), **reorder point**, **variance** (theoretical vs actual usage), **covers** (guest count), **expo** (the person at the pass running the kitchen screen), **bump** (clear a finished ticket), **station** (grill / cold / dessert).

### Kitchen detail worth preserving
Every station sees the **whole** ticket, with its own items emphasised and the rest dimmed — so plates for one table go out together. Ticket timers run green → amber → red. Allergens and waiter urgency flags are highlighted.

### Not in scope
Real auth · payments · bill splitting · coursing and seat-level ordering · reservations · printer/hardware integration · payroll · supplier ordering · a real backend or database · multi-language · offline mode · **alcohol** (Mavera does not serve it).

---

## Data

**Seeded, read-only** — committed JSON in `src/data/`, generated once with a fixed seed:
5 locations · ~30 menu items each tagged to a station · ~20 key ingredients · ~70 recipe lines · 8–12 weeks of historical orders, stock counts, movements, and cleaning records.

Deliberate patterns are baked in — weekend rushes, one underperforming location, a slow-prep dish — so the AI has something real to find.

**Live, mutable** — Redux, persisted to localStorage: today's tables, orders, tickets, spill reports, task completions, checklist versions. A "reset demo data" control restores the clean state.

Inventory follows real practice: ~20 key ingredients counted **periodically**, not decremented live per order. Theoretical usage is calculated from sales; variance is the gap against actual counts.

---

## AI

One route handler, `app/api/chat/route.js`, streams from Claude and exposes three tools.

| Tool | Returns |
|---|---|
| Prioritise queue | `{ ticketId, position, reason, estimatedReady, riskOfDelay }` |
| Run-out projection | `{ item, projectedRunOut, affectedMenuItems[], suggestedAction }` |
| Shift briefing | `{ headline, actions: [{ action, reason, urgency }], watchItems[], comparison }` |

**The GM briefing must output decisions, not summaries.** "Prep 40 more portions; Bebek is short on lamb by Thursday" — not a restatement of the charts. Dashboards that summarise get admired for a month and then ignored.

Keep Zod schemas small and honest: every optional field needs a plan for how it renders when missing.

---

## Responsive

Desktop and tablet only, by design. Kitchen displays and five-location dashboards are not phone experiences.

| Range | Behaviour |
|---|---|
| < 1024px | Designed message: built for tablet and desktop. Not a broken layout. The AI chat panel stays usable here. |
| 1024–1279px | Tablet landscape; single-column dashboards, sidebars collapse to icons |
| 1280–1599px | Baseline — design at this size |
| 1600–1919px | Wider gutters, more grid columns |
| ≥ 1920px | Max-width container, centred |

Built with `repeat(auto-fit, minmax(...))` grids and `clamp()` type scales rather than breakpoint jumps. Tested at 1024, 1280, 1440, 1920, 2560.

The **AI chat is fully responsive to 375px** — that's the surface the program's phone-width criteria are verified against.

---

## Constraints that come from the program

The capstone is graded against these. They shape the code, so they belong here.

**Accessibility — WCAG 2.1 AA, zero violations**
- 4.5:1 text contrast minimum
- Every input has a real `<label>`; every image has alt text
- Full keyboard operability with visible focus rings; the primary flow must be completable by keyboard alone
- Correct heading order and landmark regions
- Nothing conveyed by colour alone — the table status colours and ticket timers **must** carry a text or icon cue too
- Streamed AI output announced politely via `aria-live`; stop button keyboard-reachable

**Performance — Lighthouse mobile ≥ 85** (90+ is the target)

**Testing — coverage ≥ 50%**
- Vitest + React Testing Library; query by role and label, never test ID
- Mock the AI route; never call the real API in tests
- One Playwright end-to-end test of the primary flow
- CI runs the suite on push and must be green

**Production hygiene**
- Rate limiting / input caps on the AI route so strangers can't drain API credits
- Sensible `maxDuration` on streaming handlers
- README a new developer can follow to a running local app in under five minutes

---

## Program context

FlyRank AI internship, Frontend AI Engineering track. Self-paced. Certificate requires **5+ submitted assignments plus an accepted capstone**.

**Submitted:** Environment and AI toolchain (from a retired repo — this is a fresh project).

**Planned order** — each one either counts toward the five or produces something the capstone requires:

1. **Capstone skeleton, deployed** (4h) — every screen in SPEC.md as a routed placeholder, Vercel preview building on push, responsive check
2. **Streaming AI chat interface** (6h) — route handler + `useChat`, working stop button, auto-scroll that releases on scroll-up
3. **Tool results and structured output in the UI** (5h) — one server-side tool with a Zod schema, all four states rendered distinctly
4. **Error states, empty states, edge cases** (4h) — sabotage testing, designed failures → *Checkpoint 1*
5. **Testing pass** (5h) — Vitest, RTL, Playwright, CI
6. **Accessibility and performance audit** (4h) — Lighthouse, WAVE, `AUDIT.md` with before/after
7. **Production deployment and README** (3h) — rate limiting, real README → *Checkpoint 2*
8. **Capstone submission** (4h) — assembled from the above

Roughly 35 hours, eight submissions, one repo.

The capstone's stated failure mode is *"the app exists but is incomplete."* When there's a choice between another feature and finishing what's there, finish what's there.

---

## Working with me

- Follow `SPEC.md`. If a request conflicts with it, say so before writing code.
- Explain changes briefly after making them — a sentence or two.
- When changing shared state or a cross-role flow, say which of the seven flows it touches.
- Suggest the accessible pattern by default rather than retrofitting later; retrofitting accessibility onto a finished app is miserable and the audit is graded.
- If I ask for something that belongs in the out-of-scope list, remind me before building it.
