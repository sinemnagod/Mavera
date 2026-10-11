# Mavera

A restaurant operations system for a five-location restaurant group in Istanbul (Kadıköy, Nişantaşı, Bebek, Beşiktaş, Üsküdar). Five roles, each with a screen built for what they actually do, connected so that one role's work becomes another's information:

- A **waiter** seats a table and sends an order, and it appears on the **kitchen** screen. When the kitchen marks it ready, the waiter is told.
- A waiter, the kitchen or a store manager **reports a spill**, and it lands at the top of the **cleaner's** list.
- A **store manager** edits the daily cleaning checklist, the **general manager** approves it, and it becomes the cleaner's list.
- Stock counts, sales and cleaning records feed the **general manager's** dashboards, and an **AI briefing** that says what to decide today.

**Live demo:** _add your Vercel link here_ (the API sleeps when idle, so the first request after a pause can take about a minute)

## Stack

| Technology | Where it is used |
|---|---|
| TypeScript | The web app and the API |
| React + React Router (v7, single-page app mode) | The screens, in `web/` |
| HTML5 / CSS3 (with Tailwind CSS) | Markup and styling |
| NestJS | The backend, in `api/` |
| REST API / JSON | How the web app and the API talk |
| PostgreSQL (hosted on Supabase) | The database |
| Prisma | Schema, migrations and typed queries |
| JWT | Sign-in: the API signs a token and a guard checks it on every request |
| Git / GitHub | Version control |

Extras: Tailwind CSS, the Vercel AI SDK (with OpenRouter, so any model can be used), and Zod (validating input).

```
Browser (web/) ──JSON over HTTP + JWT──▶ NestJS API (api/) ──Prisma──▶ PostgreSQL
                                              └──▶ AI model (the key lives only here)
```

Permissions are checked **on the server**: every API route needs a valid token, each route lists the roles allowed to use it, and staff only ever see their own location's data.

## Demo accounts

Sign in at the home page with an email and password.

| Role | Email | Password |
|---|---|---|
| General manager (all locations) | `gm@mavera.test` | `Gm-demo-2026` |
| Waiter (Kadıköy) | `waiter@mavera.test` | `Waiter-demo-2026` |
| Kitchen / expo (Kadıköy) | `kitchen@mavera.test` | `Kitchen-demo-2026` |
| Cleaner (Kadıköy) | `cleaner@mavera.test` | `Cleaner-demo-2026` |
| Store manager (Kadıköy) | `store@mavera.test` | `Store-demo-2026` |
| Store manager (Nişantaşı) | `store.nisantasi@mavera.test` | `Store-nisantasi-2026` |
| Store manager (Bebek) | `store.bebek@mavera.test` | `Store-bebek-2026` |
| Store manager (Beşiktaş) | `store.besiktas@mavera.test` | `Store-besiktas-2026` |
| Store manager (Üsküdar) | `store.uskudar@mavera.test` | `Store-uskudar-2026` |

These are throwaway demo accounts. They are defined in `api/src/seed.ts`, and re-running the seed puts everything back to this clean state.

**To see the cross-role flows work,** open two browser windows (or one normal and one private window) and sign in as the waiter in one and the kitchen in the other. Screens refresh from the API every few seconds.

## Run it locally

You need **Node.js 22 or newer** and npm, plus a Postgres database (a free [Supabase](https://supabase.com) project works; use it only as a Postgres host).

**1. Get the code**

```bash
git clone <this repository's URL>
cd mavera
```

**2. Set up the API**

```bash
cd api
npm install
cp .env.example .env
```

Open `api/.env` and fill in the values (the file explains each one):

- `DATABASE_URL` and `DIRECT_URL`: from Supabase, under **Connect → ORMs → Prisma**. Put your database password in place of `[YOUR-PASSWORD]`.
- `JWT_SECRET`: any long random string, for example the output of `openssl rand -hex 32`.
- `OPENROUTER_API_KEY` _(optional)_: from [openrouter.ai](https://openrouter.ai) → Keys. Without it, the AI briefing shows a clear "not set up" message and everything else still works. For a development demo without any key, add `AI_MOCK=1`.

Create the tables and load the demo data, then start the API:

```bash
npx prisma migrate deploy
npm run db:seed
npm run start:dev
```

The API listens on <http://localhost:3000>.

**3. Set up the web app** (in a second terminal)

```bash
cd web
npm install
npm run dev
```

Open <http://localhost:5173> and sign in with a demo account.

## Commands

`api/`

| Command | What it does |
|---|---|
| `npm run start:dev` | API with auto-reload |
| `npm run build` | Generate the Prisma client and compile |
| `npm run db:migrate` | Create and apply a new migration after editing `prisma/schema.prisma` |
| `npm run db:seed` | Wipe and refill the database with the demo data |
| `npm run seed:data` | Regenerate the seed JSON (deterministic: it should not change) |
| `npm run lint` · `npm test` | Lint · tests |

`web/`

| Command | What it does |
|---|---|
| `npm run dev` | Dev server on port 5173 |
| `npm run build` | Production build into `build/client` |
| `npm run typecheck` | Generate route types, then run TypeScript |
| `npm run lint` | ESLint, including accessibility rules |

## Deploying

The web app is plain static files (Vercel), the API is a Node service (Render), and the database stays on Supabase. Deploy the API first, because the web app needs its address.

**1. API on Render**

1. In Render choose **New → Blueprint** and select this repository. It reads `render.yaml`.
2. Fill in the values it asks for: `DATABASE_URL` (the pooled Supabase string), `OPENROUTER_API_KEY`, and `WEB_ORIGIN` (put `http://localhost:5173` for now). `JWT_SECRET` is generated for you.
3. When it is live, note the address, for example `https://mavera-api.onrender.com`. Opening it should say "Hello World!".

**2. Web app on Vercel**

1. In Vercel choose **Add New → Project**, import this repository, and set the **Root Directory** to `web`. `vercel.json` sets the build command, output folder and the single-page-app rewrite.
2. Add the environment variable `VITE_API_URL` with the Render address.
3. Deploy, and note the Vercel address.

**3. Let the web app call the API**

In Render, change `WEB_ORIGIN` to the Vercel address (no trailing slash) and let the API redeploy. Without this the browser blocks the calls.

## Project layout

```
web/    the React app: routes (screens), components, API client
api/    the NestJS API: one module per feature, Prisma schema and seed
render.yaml   how Render runs the API
SPEC.md       what Mavera is and does
```

## What is built

Fourteen screens: sign-in, waiter (floor plan, order, ticket), kitchen (ticket rail), cleaner (task queue), store manager (stock, counts, movements, variance, checklist editor) and general manager (overview with the AI briefing, location detail, approvals). Everything reads and writes the real database through the API.

The history behind the dashboards (ten weeks of sales, stock and cleaning for each location) is generated with a fixed seed and loaded into the database. It has patterns built in so the dashboards and the AI have something real to find: weekend rushes, an underperforming Üsküdar, Bebek running short on lamb, and a slow-prep dish (Kuzu Tandır).

### The AI briefing

On the GM overview, **Generate briefing** asks a model to read the week's numbers and return decisions ("order lamb for Bebek before the next service"), not a summary. The model fills in a typed structure that the screen draws as cards. The card shows all four tool states: input streaming, input available, output available, and a designed error with a working retry. The model key stays on the API, and each GM account is limited to a few briefings per ten minutes.

## Screen sizes

Mavera is a workplace tool for tablets and desktops. It is designed from 1024px up, and below that it shows a designed message instead of a broken layout.

## Known limitations

- **Free hosting:** the API sleeps when idle, so the first request can take about a minute. The free AI model can be slow or rate-limited at busy times; the briefing then shows its error state, and "Try again" works.
- **Sign-in:** the token is kept in the browser's local storage (simple, but readable by scripts on the page). There is no password reset or email verification.
- **No automated tests** and no formal accessibility audit yet. The screens use real buttons and links, labelled fields, visible focus and text next to every colour, but they have not been audited.
- **History is summarised:** sales are stored as daily totals, not individual orders, and stock movements are weekly totals.
- **Live updates** are polling every few seconds, not instant push.
- Dense operational screens are not designed for phones.
