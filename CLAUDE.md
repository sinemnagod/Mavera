# CLAUDE.md

Context for AI assistants working in this repository.

---

## What this is

**Mavera** — a restaurant operations system for a five-location restaurant group in Istanbul. Five roles, each with a screen built for what they actually do; the roles are connected so one role's work becomes another's information.

It is an internship project with a **required stack** (below) and a **submission deadline of Sunday 2026-10-11 at 23:59**. What is checked: a GitHub repo with clean commits, a live demo link, a README that explains setup, and a live demo to people.

Full product definition lives in `SPEC.md`. Read it before making structural decisions.

---

## Stack

The required stack — every item must really be used:

**TypeScript · NestJS · PostgreSQL · Prisma · JWT · React · React Router · HTML5/CSS3 · REST API/JSON · Git/GitHub**

Added on top (owner-approved): **Tailwind CSS v4** for styling, the **Vercel AI SDK** with **Claude** for the AI tools, and **Zod** for validating input and AI output. Redux Toolkit is installed in `web/` but live data is moving to the API; remove it once nothing uses it.

```
Browser  ──REST/JSON + JWT──▶  NestJS API (api/)  ──Prisma──▶  PostgreSQL (hosted on Supabase)
 web/ (React + React Router, SPA)                  └──▶ Claude (API key lives only here)
```

- **`web/`** — React 19 + React Router v7 in framework mode with `ssr: false` (a single-page app), built with Vite. Data comes from the API.
- **`api/`** — NestJS (v12, ESM). Controllers receive REST requests and return JSON; services hold the logic; Prisma talks to Postgres; a JWT guard protects routes.
- **Database** — Supabase is used **only as a Postgres host**. Do not use Supabase Auth or the Supabase client library.
- **Login** — email + password. Passwords are hashed. The API returns a JWT; the web app keeps it in browser storage and sends it as `Authorization: Bearer <token>`. Roles and locations are enforced **on the server**.
- **Live updates** — screens poll the API every 3–5 seconds. No websockets.

React Router specifics worth knowing (SPA mode):

- Only the root route may have a server `loader`; every other route uses `clientLoader` / `clientAction`. The root has a `HydrateFallback` loading screen.
- Route files import generated types from `./+types/<file>` (`Route.ClientLoaderArgs`, `Route.ComponentProps`, `Route.MetaArgs`). They are produced by `react-router typegen` into the git-ignored `.react-router/` folder — never edit them.
- Tab state lives in the URL (`?section=`, `?station=`). Missing records `throw data("…", { status: 404 })`.
- Every route exports `meta()` so each screen has its own page title.
- `build/client` is plain static files; the host must send every URL to `index.html`.
- Installed docs are the source of truth: `web/node_modules/react-router/docs/`, plus an agent skill in `.agents/skills/react-router/`.
- React Router is pinned to **7.x**. `npm run build` prints "Future Flag Warning" lines about version 8; they are informational.

## Commands

Two apps, two terminals. Run web commands inside `web/` and API commands inside `api/`.

`web/`

- `npm run dev` — dev server on http://localhost:5173
- `npm run build` — production build into `build/client`
- `npm run typecheck` — generate route types, then `tsc`
- `npm run lint` — ESLint (typescript-eslint, react-hooks, jsx-a11y)

`api/`

- `npm run start:dev` — API with auto-reload (default port 3000)
- `npm run build` / `npm run lint` / `npm test`

Run typecheck/build, lint and tests before calling anything done.

## Where things live

```
web/app/root.tsx          document shell, loading screen, sub-1024px message, 404/error page
web/app/routes.ts         the route table (14 routes)
web/app/routes/           one file per screen: home, waiter/, kitchen, cleaner, store/, gm/
web/app/components/       one component per file
web/app/lib/              pure helper functions (React-free)
web/app/store/            Redux (being phased out for live data)
web/app/data/             old generated seed JSON, until the screens read from the API
web/scripts/              the seed generator (to move into api/prisma/)
api/src/                  NestJS code: modules, controllers, services, guards
api/prisma/               (planned) schema.prisma, migrations, seed
```

In `web/`, the import alias `~/` means `web/app/`.

---

## Conventions

- Commit messages follow **Conventional Commits**: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`. Reviewers read the Git history — keep it clean.
- **Only the owner commits and pushes.** An AI assistant must not run `git commit` or `git push` unless explicitly told to in that message, and must never add `Co-Authored-By`, "Generated with", or any other AI attribution to commits or pull requests. The repository's contributor list must show only the owner.
- One React component per file, PascalCase `.tsx` filenames, in `web/app/components/`.
- **Pure functions only in `web/app/lib/`** — no React imports there.
- In `api/`, follow NestJS structure: one **module** per feature (`auth`, `orders`, `stock`, …), each with its controller, service and DTOs (Zod- or class-validated input).
- All data access goes through Prisma, inside services. Controllers never talk to the database.
- Type everything that crosses a boundary: API responses, props, loader data. No `any`.
- Name props so they can't be mistaken for ARIA attributes — `roleName`, not `role`.
- Prefer `const` and early returns over nested conditionals.
- Comment the _why_, never the _what_.

## Hard rules

1. **Secrets never reach the browser or the repo.** The Anthropic API key, the database URL, and the JWT secret live only in `api/.env`. Nothing secret goes in `web/`, and nothing secret gets a `VITE_` prefix (Vite ships every `VITE_` variable to the browser). Never paste a secret into chat or commit a `.env` file.
2. **Passwords are hashed** (never stored or logged in plain text) and never returned by the API.
3. **Every API route except sign-in requires a valid JWT**, and role and location permissions are checked on the server for every read and write.
4. **Every interactive element is a real `<button>` or `<a>`** with an accessible name and a visible focus state. No `<div onClick>`.
5. **Every AI tool result renders as a component** — card, table, chart. Never a JSON dump. Every tool state is designed: input streaming, input available, output available, output error.
6. **No new dependencies without asking.** The stack above is the approved set.
7. **Never commit** `node_modules/`, `build/`, `dist/`, `.react-router/`, or `.env`.

---

## The product

### Five locations

Kadıköy, Nişantaşı, Bebek, Beşiktaş, Üsküdar. Four roles are scoped to one location; only the general manager sees all five. A user's role and location come from their account.

### Sign-in

Email and password. A small set of demo accounts (one per role at Kadıköy, plus a general manager) is listed in the README so reviewers can try each role. Dark, warm, high-end feel.

### Roles and screens

| Role                | Screens                                                                                       | AI                                                                                                   |
| ------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| **Waiter**          | Floor plan (Main / Terrace / Family tabs), Order (menu + receipt-styled panel), Ticket detail | **None, deliberately** — mid-service a waiter needs predictable speed, not a model interpreting them |
| **Kitchen (expo)**  | Ticket rail with age timers and station tabs (All / Grill / Cold / Dessert)                   | Prioritise queue                                                                                     |
| **Cleaner**         | Task queue — urgent spills on top, approved daily checklist below                             | None                                                                                                 |
| **Store manager**   | Stock, Counts, Movements, Variance, Checklist editor                                          | Run-out projection                                                                                   |
| **General manager** | Overview (AI briefing pinned at top), Location detail, Approvals                              | Shift briefing                                                                                       |

Fourteen routes in total: landing/sign-in plus thirteen role screens (3 waiter, 1 kitchen, 1 cleaner, 5 store manager, 3 GM). Only the GM's location detail has `:locationId` in its URL.

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

Single sign-on, password reset, email verification · payments · bill splitting · coursing and seat-level ordering · reservations · printer/hardware integration · payroll · supplier ordering · live push updates (polling instead) · multi-language · offline mode · **alcohol** (Mavera does not serve it).

---

## Data

Everything lives in **PostgreSQL**, accessed only through the NestJS API with Prisma. A seed script loads it; re-running the seed restores the clean state.

**Seed source** — generated deterministically by `scripts/generate-seed.mjs` (fixed seed `20260821`, byte-identical on every run) into JSON, then loaded into the database. To change the data, change the generator and re-run it; never hand-edit the output.

| Seed file               | Contents                                                                                                                                                                                                                                                               |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `locations.json`        | 5 locations: staff names, sections, table layouts (ids like `M1`, `T4`, `F2`)                                                                                                                                                                                          |
| `menu.json`             | 32 items, each tagged to a station                                                                                                                                                                                                                                     |
| `ingredients.json`      | 22 key ingredients: unit, `costPerUnit`, par level, reorder point                                                                                                                                                                                                      |
| `recipes.json`          | 76 recipe lines                                                                                                                                                                                                                                                        |
| `cleaning-tasks.json`   | The approved daily checklist (24 tasks, version 1)                                                                                                                                                                                                                     |
| `sales-history.json`    | 10 weeks (2026-07-27 → 2026-10-04) per location, **aggregated per day**: revenue, covers, orders, avg ticket minutes, hourly covers (12 values; index 0 is the hour in `serviceStartHour`, 11:00), items sold; plus per-dish prep times and a ticket-time distribution |
| `stock-history.json`    | Weekly counts and movements per location. Movement quantities are signed: `+` received / transferred in, `−` used / wasted / staff meal / transferred out                                                                                                              |
| `cleaning-history.json` | Per location per day: tasks due, completed, completed on time                                                                                                                                                                                                          |

History is aggregated rather than stored as individual orders (roughly 25,000 orders would add no information the GM screens can't read from daily totals). Arrays and maps such as hourly covers and items-sold may be stored as JSON columns to keep the table count small.

Deliberate patterns are baked in so the AI has something real to find: weekend rushes (Fri/Sat peak), **Üsküdar** underperforming (smaller, shrinking, ~7.7% waste vs ~4%, slower tickets, ~68% cleaning compliance), **Bebek** running short on lamb (below reorder point, supply tapering over the last three weeks), Üsküdar short on sea bass, and **Kuzu Tandır** listed at 20 minutes but averaging ~30.

**Live data** (created while the app is used): user accounts, tables' state, orders, tickets, spill reports, task completions, checklist versions.

Inventory follows real practice: ~20 key ingredients counted **periodically**, not decremented live per order. Theoretical usage is calculated from sales; variance is the gap against actual counts.

---

## AI

One NestJS endpoint in `api/` (`POST /ai/chat`) streams from Claude and exposes three tools. The API key lives in `api/.env` only.

| Tool               | Returns                                                                          |
| ------------------ | -------------------------------------------------------------------------------- |
| Prioritise queue   | `{ ticketId, position, reason, estimatedReady, riskOfDelay }`                    |
| Run-out projection | `{ item, projectedRunOut, affectedMenuItems[], suggestedAction }`                |
| Shift briefing     | `{ headline, actions: [{ action, reason, urgency }], watchItems[], comparison }` |

**The GM briefing must output decisions, not summaries.** "Prep 40 more portions; Bebek is short on lamb by Thursday" — not a restatement of the charts.

Keep Zod schemas small and honest: every optional field needs a plan for how it renders when missing. **Priority:** at least one tool, fully built with all four states and a working retry, before the other two.

---

## Responsive

Desktop and tablet only, by design. Kitchen displays and five-location dashboards are not phone experiences. Below 1024px the app shows a designed message ("built for tablet and desktop"); the AI chat panel is meant to stay usable down to 375px. Built with `repeat(auto-fit, minmax(...))` grids rather than breakpoint jumps.

---

## Plan to the deadline (2026-10-11, 23:59)

| Day            | Goal                                                                                                       |
| -------------- | ---------------------------------------------------------------------------------------------------------- |
| Wed 7 Oct      | Split into `web/` + `api/` (done). Supabase Postgres, Prisma schema, seed everything into the database.   |
| Thu 8 Oct      | Sign-in with JWT, roles and locations enforced on the server. Waiter floor plan reading from the API.      |
| Fri 9 Oct      | Order → kitchen ticket → ready (flows 1–2), with polling.                                                  |
| Sat 10 Oct     | Spill → cleaner queue (flow 3). One AI tool. First deploy (web as static site, API on a Node host).        |
| Sun 11 Oct     | README with demo accounts, final deploy, fixes. Screens not reached stay as clear placeholders.            |

If time runs short, cut in this order: the three less-central store screens (counts, movements, checklist editor) → location detail → the second and third AI tools. **Protect:** working sign-in, the order → kitchen flow, one AI tool, the deployed link, the README.

**Tests, accessibility and Lighthouse are not required now.** Do them only if time remains after the project works. Still write semantic, labelled HTML as you go — it costs almost nothing.

**Open decision:** where the NestJS API is hosted (Vercel suits the static web app, not a long-running Node server).

---

## Working with me

- Follow `SPEC.md`. If a request conflicts with it, say so before writing code.
- **The owner is a student learning front-end and full-stack development from the ground up — HTML, CSS, JavaScript, TypeScript, React, NestJS, databases, Git and the tooling around them — by building this.** Nothing can be assumed to be known yet.
  - **Explain simply.** Plain words and short sentences. Define every technical term the first time it appears, with a small everyday comparison where one helps. Prefer one idea at a time over a full survey.
  - **Go slowly on structure.** Many files and folders are new; say what each one is _for_ before saying what it contains. Introduce a few new files per step, not dozens.
  - **Explain the why and the how**, not just the what — but in layers: first the one-sentence idea, then the detail if it's wanted.
  - **When the owner asks _how_ to do something, lead them through it; don't do it for them.** Read-only checks are fine. Do the work only when asked to ("do it", "please change").
  - Let the owner hand-write one core piece per step; review it rather than replacing it.
  - `STUDY_PLAN.md` is the owner's learning path (private, git-ignored). Point to its modules when a new concept comes up.
- Verify visual changes in the browser, including with the colour scheme forced to light, since the app must stay dark.
- When changing shared state or a cross-role flow, say which of the seven flows it touches.
- If asked for something in the out-of-scope list, remind the owner before building it.
