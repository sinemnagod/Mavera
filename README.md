# Mavera

A restaurant operations system for a five-location restaurant group in Istanbul (Kadıköy, Nişantaşı, Bebek, Beşiktaş, Üsküdar). Five roles — waiter, kitchen expo, cleaner, store manager, general manager — each get one screen built for what they actually do, and the screens are connected so one role's work becomes another's information.

> **Status: work in progress.** The web app has all 14 screens as placeholders, and the API has just been created. The database, sign-in, the real screens and the AI features are being built next.

## Stack

| Technology | Use |
|---|---|
| TypeScript | Web app and API |
| React + React Router (v7, single-page app mode) | The screens, in `web/` |
| HTML5 / CSS3 (with Tailwind CSS) | Markup and styling |
| NestJS | The backend, in `api/` |
| REST API / JSON | How the web app and the API talk |
| PostgreSQL (hosted on Supabase) | The database |
| Prisma | Database schema, migrations and queries |
| JWT | Sign-in tokens |
| Git / GitHub | Version control |

The AI features will use the Vercel AI SDK with Claude, called from the API.

```
Browser (web/)  ──JSON over HTTP, JWT──▶  NestJS API (api/)  ──Prisma──▶  PostgreSQL
```

## Run it locally

You need **Node.js 20.19 or newer** (developed on 22) and npm. The web app and the API are separate, so you use two terminals.

**Terminal 1 — the API**

```bash
cd api
npm install
npm run start:dev
```

It listens on <http://localhost:3000>.

**Terminal 2 — the web app**

```bash
cd web
npm install
npm run dev
```

Open <http://localhost:5173>.

> Database setup, environment variables and demo accounts will be added here as they are built.

## Project layout

```
web/    the React app (screens, components, routing)
api/    the NestJS API (controllers, services, Prisma)
SPEC.md what Mavera is and does
```

## Screens

Fourteen routes. Role and location come from the signed-in account, so only the general manager's location screen has an id in its address.

| Route | Screen |
|---|---|
| `/` | Landing / sign-in |
| `/waiter/floor-plan` | Floor plan (Main / Terrace / Family tabs: `?section=`) |
| `/waiter/order/:tableId` | Order |
| `/waiter/ticket/:ticketId` | Ticket detail |
| `/kitchen` | Ticket rail (station tabs: `?station=`) |
| `/cleaner` | Task queue |
| `/store/stock`, `/counts`, `/movements`, `/variance`, `/checklist` | Store manager |
| `/gm` | General manager overview |
| `/gm/locations/:locationId` | One location in depth |
| `/gm/approvals` | Cleaning checklist approvals |

## Screen sizes

Mavera is a workplace tool for tablets and desktops, like real point-of-sale systems. It is designed from 1024px up. Below 1024px it shows a designed message instead of a broken layout.

## Known limitations

- Dense operational screens are not designed for phones (see above).
- Sales history is stored as daily totals rather than individual orders.
