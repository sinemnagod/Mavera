# CLAUDE.md

Context for AI assistants working in this repository.

---

## What this is

**Mavera** — a restaurant operations system for a five-location restaurant group in Istanbul. Five roles, each with a screen built for what they actually do; the roles are connected so one role's work becomes another's information.

Full product definition lives in `SPEC.md`. Read it before making structural decisions.

---

## Stack

- **TypeScript** — files are `.ts` / `.tsx`, `strict` mode on
- **React 19** with **React Router v7** in _framework mode_ (server-rendered, file `app/routes.ts` declares the routes), built with **Vite**
- **HTML5 / CSS3** — semantic markup first; styling with **Tailwind CSS v4**
- **REST-style JSON** — the AI chat is one server-only route module (`app/routes/api.chat.ts`) that returns a streamed `Response`
- **Redux Toolkit** + React Redux for cross-role state
- Deployed on **Vercel** via `@vercel/react-router`
- AI via the **Vercel AI SDK** talking to **Claude** (not installed yet — arrives with the AI chat milestone)

React Router **7.18**, not 8: `@vercel/react-router` declares it supports `@react-router/dev` 7 only. Don't upgrade to 8 until that adapter does. Don't reopen the stack choice without the owner asking.

React Router specifics worth knowing:

- Route files import generated types from `./+types/<file>` (`Route.LoaderArgs`, `Route.ComponentProps`, `Route.MetaArgs`). They are produced by `react-router typegen` into the git-ignored `.react-router/` folder — never edit them.
- A route's `loader` runs on the server only, so seed data read inside a loader never ships to the browser. Components receive it as `loaderData`.
- Tab state lives in the URL (`?section=`, `?station=`) and is read in the loader, so it is shareable. Missing records `throw data("…", { status: 404 })`.
- Every route exports `meta()` so each screen has its own page title (WCAG 2.4.2).
- `app/root.tsx` holds the document shell, the Redux provider and the sub-1024px gate.
- Installed docs are the source of truth: `node_modules/react-router/docs/`, and an agent skill in `.agents/skills/react-router/`.
- `npm run build` prints "Future Flag Warning" lines about React Router 8. They are informational.

## Commands

- `npm run dev` — dev server on http://localhost:5173
- `npm run build` — production build
- `npm run typecheck` — generate route types, then `tsc`
- `npm run lint` — ESLint (typescript-eslint, react-hooks, **jsx-a11y**)
- `npm run seed` — regenerate the seed data in `app/data/` (deterministic; output should not change)
- `npm test` — Vitest (not set up yet)
- `npm run test:e2e` — Playwright (not set up yet)

Run `typecheck`, `lint` and `build` before calling anything done — each catches things the others don't.

## Where things live

```
scripts/generate-seed.mjs   deterministic seed generator (plain Node, deliberately not TypeScript)
app/root.tsx                document shell, <StoreProvider>, sub-1024px gate, 404/error page
app/routes.ts               the route table (14 routes)
app/routes/                 route modules: home, waiter/, kitchen, cleaner, store/, gm/
app/components/             one component per file (RoleTopBar, TabNav, StoreProvider, ResetDemoButton)
app/data/                   generated, read-only seed JSON — edit the generator, never the output
app/store/                  Redux: root reducer, slices, typed hooks, localStorage persistence
app/lib/                    pure functions only (React-free)
```

The import alias `~/` means `app/`.

---

## Conventions

- Commit messages follow **Conventional Commits**: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`. Git history is graded at the end — keep it clean.
- **Only the owner commits and pushes.** An AI assistant must not run `git commit` or `git push` unless explicitly told to in that message, and must never add `Co-Authored-By`, "Generated with", or any other AI attribution to commits or pull requests. The repository's contributor list must show only the owner.
- One component per file, PascalCase `.tsx` filenames, in `app/components/`.
- **Pure functions only in `app/lib/`** — no React imports there. Scoring, variance calculation, prioritisation helpers, formatters all live here so they're unit-testable without rendering.
- Seed data is read-only JSON in `app/data/`. Never mutate it; copy into Redux state instead.
- Load data in route `loader`s (server-side), not in `useEffect`. Browser-only APIs such as `localStorage` belong in `useEffect` or event handlers, because every page is rendered on the server first.
- Type everything that crosses a boundary: slice state, action payloads, props, loader data. No `any`.
- Name props so they can't be mistaken for ARIA attributes — `roleName`, not `role`.
- Prefer `const` and early returns over nested conditionals.
- Comment the _why_, never the _what_.

## Hard rules

These are testable, not preferences. A change that violates one should be rejected in review.

1. **The Anthropic API key never reaches the browser.** It is read only inside the server-only route module `app/routes/api.chat.ts` (its `action`), from `process.env`. No `VITE_` prefix on it, ever — Vite ships every `VITE_` variable to the browser.
2. **Every interactive element is a real `<button>` or `<a>`** with an accessible name and a visible focus state. No `<div onClick>`. This is graded.
3. **Every tool result renders as a component** — card, table, chart. Never a JSON dump, never raw text.
4. **Every AI tool state is designed**: input streaming, input available, output available, output error. Design the error state first.
5. **No new dependencies without asking.** The stack above is deliberately small.
6. **Never commit** `node_modules/`, `build/`, `.react-router/`, or `.env`.

---

## The product

### Five locations

Kadıköy, Nişantaşı, Bebek, Beşiktaş, Üsküdar. Four roles are scoped to one location; only the general manager sees all five.

### Landing

Five role buttons with icons, no authentication. Dark, warm, high-end feel. Marked as demo mode.

### Roles and screens

| Role                | Screens                                                                                       | AI                                                                                                   |
| ------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| **Waiter**          | Floor plan (Main / Terrace / Family tabs), Order (menu + receipt-styled panel), Ticket detail | **None, deliberately** — mid-service a waiter needs predictable speed, not a model interpreting them |
| **Kitchen (expo)**  | Ticket rail with age timers and station tabs (All / Grill / Cold / Dessert)                   | Prioritise queue                                                                                     |
| **Cleaner**         | Task queue — urgent spills on top, approved daily checklist below                             | None                                                                                                 |
| **Store manager**   | Stock, Counts, Movements, Variance, Checklist editor                                          | Run-out projection                                                                                   |
| **General manager** | Overview (AI briefing pinned at top), Location detail, Approvals                              | Shift briefing                                                                                       |

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

**Seeded, read-only** — committed JSON in `app/data/`, produced by `npm run seed` (`scripts/generate-seed.mjs`, fixed seed `20260821`, byte-identical on every run). To change the data, change the generator and re-run it; never hand-edit the output.

| File                    | Contents                                                                                                                                                                                                                                                               |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `locations.json`        | 5 locations: staff names, sections, table layouts (ids like `M1`, `T4`, `F2`)                                                                                                                                                                                          |
| `menu.json`             | 32 items, each tagged to a station                                                                                                                                                                                                                                     |
| `ingredients.json`      | 22 key ingredients: unit, `costPerUnit`, par level, reorder point                                                                                                                                                                                                      |
| `recipes.json`          | 76 recipe lines                                                                                                                                                                                                                                                        |
| `cleaning-tasks.json`   | The approved daily checklist (24 tasks, version 1)                                                                                                                                                                                                                     |
| `sales-history.json`    | 10 weeks (2026-07-27 → 2026-10-04) per location, **aggregated per day**: revenue, covers, orders, avg ticket minutes, hourly covers (12 values; index 0 is the hour in `serviceStartHour`, 11:00), items sold; plus per-dish prep times and a ticket-time distribution |
| `stock-history.json`    | Weekly counts and movements per location. Movement quantities are signed: `+` received / transferred in, `−` used / wasted / staff meal / transferred out. Used + wasted + staff meal is aggregated weekly; received is split into two deliveries                      |
| `cleaning-history.json` | Per location per day: tasks due, completed, completed on time                                                                                                                                                                                                          |

History is aggregated rather than stored as individual orders: roughly 25,000 orders would add megabytes without adding anything the GM screens can't read from daily totals.

Deliberate patterns are baked in so the AI has something real to find: weekend rushes (Fri/Sat peak), **Üsküdar** underperforming (smaller, shrinking, ~7.7% waste vs ~4%, slower tickets, ~68% cleaning compliance), **Bebek** running short on lamb (below reorder point, supply tapering over the last three weeks), Üsküdar short on sea bass, and **Kuzu Tandır** listed at 20 minutes but averaging ~30.

**Live, mutable** — Redux, persisted to localStorage (`mavera-demo`, versioned): today's tables, orders, tickets, spill reports, task completions, checklist versions. The live state only covers Kadıköy, since the four scoped roles are hardcoded to it. A "reset demo data" button on the landing page restores the clean state. Currently implemented: `spills`.

Inventory follows real practice: ~20 key ingredients counted **periodically**, not decremented live per order. Theoretical usage is calculated from sales; variance is the gap against actual counts.

---

## AI

One server-only route module, `app/routes/api.chat.ts`, streams from Claude and exposes three tools.

| Tool               | Returns                                                                          |
| ------------------ | -------------------------------------------------------------------------------- |
| Prioritise queue   | `{ ticketId, position, reason, estimatedReady, riskOfDelay }`                    |
| Run-out projection | `{ item, projectedRunOut, affectedMenuItems[], suggestedAction }`                |
| Shift briefing     | `{ headline, actions: [{ action, reason, urgency }], watchItems[], comparison }` |

**The GM briefing must output decisions, not summaries.** "Prep 40 more portions; Bebek is short on lamb by Thursday" — not a restatement of the charts. Dashboards that summarise get admired for a month and then ignored.

Keep Zod schemas small and honest: every optional field needs a plan for how it renders when missing.

---

## Responsive

Desktop and tablet only, by design. Kitchen displays and five-location dashboards are not phone experiences.

| Range       | Behaviour                                                                                                 |
| ----------- | --------------------------------------------------------------------------------------------------------- |
| < 1024px    | Designed message: built for tablet and desktop. Not a broken layout. The AI chat panel stays usable here. |
| 1024–1279px | Tablet landscape; single-column dashboards, sidebars collapse to icons                                    |
| 1280–1599px | Baseline — design at this size                                                                            |
| 1600–1919px | Wider gutters, more grid columns                                                                          |
| ≥ 1920px    | Max-width container, centred                                                                              |

Built with `repeat(auto-fit, minmax(...))` grids and `clamp()` type scales rather than breakpoint jumps. Tested at 1024, 1280, 1440, 1920, 2560.

The **AI chat is fully responsive to 375px** — that's the surface the program's phone-width criteria are verified against.

---

The work is scheduled as a six-day plan (~6–7h/day) that delivers the product first and lets the assignments fall out of it:

| Day | Focus                                                                                            | Status                                                                                   |
| --- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| 1   | Routes, seed data, Redux store + persistence, port to TypeScript + React Router 7, Vercel deploy | Done except the deploy (owner's step). Owner hand-writes `app/store/completionsSlice.ts` |
| 2   | Flows 1–2: floor plan, order, ticket detail, kitchen rail                                        | Not started                                                                              |
| 3   | Flows 3–4: spills → cleaner queue; checklist editor → GM approvals                               | Not started                                                                              |
| 4   | Store stock/counts/movements/variance (math in `app/lib/`), GM overview + location detail        | Not started                                                                              |
| 5   | AI: route handler, `useChat`, three Zod tools, four states, rate limiting                        | Not started                                                                              |
| 6   | Vitest/RTL/Playwright/CI, Lighthouse + a11y pass, README, final deploy                           | Not started                                                                              |

If time runs short, cut in this order: counts/movements become read-only tables → location detail charts become lists → checklist editor becomes add/remove only. Do **not** cut the AI tools, tests, or accessibility — they're graded directly.

---

## Working with me

- Follow `SPEC.md`. If a request conflicts with it, say so before writing code.
- **The owner is a student learning TypeScript, React and full-stack development by building this.** Explain thoroughly, even when it takes long: what each piece of code does, why it is written that way, and which concept it demonstrates. Let the owner hand-write one core piece per day; review it rather than replacing it.
- Run `npm run typecheck`, `npm run lint` and `npm run build` before calling anything done, and verify visual changes in the browser — including with the colour scheme forced to light, since the app must stay dark. Measure contrast; don't judge it by eye.
- When changing shared state or a cross-role flow, say which of the seven flows it touches.
- Suggest the accessible pattern by default rather than retrofitting later; retrofitting accessibility onto a finished app is miserable and the audit is graded.
- If I ask for something that belongs in the out-of-scope list, remind me before building it.
