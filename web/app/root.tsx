import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";

export function meta() {
  return [
    { title: "Mavera" },
    { name: "description", content: "Restaurant operations system for a five-location group in Istanbul." },
  ];
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="flex min-h-full flex-col bg-stone-950 text-stone-100">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

// Shown while the browser loads the app and runs the first route's data loading.
export function HydrateFallback() {
  return (
    <main className="flex flex-1 items-center justify-center">
      <p role="status" className="text-stone-400">
        Loading Mavera…
      </p>
    </main>
  );
}

export default function App() {
  return (
    <>
      <div className="hidden lg:flex lg:flex-1 lg:flex-col">
        <Outlet />
      </div>

      {/* Below 1024px: Mavera's dense operational screens don't fit a phone.
          The AI chat panel is the one exception once it exists (SPEC.md responsive strategy). */}
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center lg:hidden">
        <h1 className="text-2xl font-semibold">Mavera is built for tablet and desktop</h1>
        <p className="max-w-sm text-stone-400">
          Floor plans, kitchen rails, and five-location dashboards need more room than a phone
          screen gives them. Open Mavera on a tablet or a larger display.
        </p>
      </div>
    </>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const isNotFound = isRouteErrorResponse(error) && error.status === 404;

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
      <h1 className="text-2xl font-semibold">
        {isNotFound ? "That page doesn't exist" : "Something went wrong"}
      </h1>
      <p className="max-w-sm text-stone-400">
        {isNotFound
          ? "The address may be mistyped, or the page may have moved."
          : "An unexpected error stopped this screen from loading. Try again, or go back to the start."}
      </p>
      <Link
        to="/"
        className="mt-2 rounded-full bg-amber-400 px-5 py-2 text-sm font-medium text-stone-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
      >
        Back to Mavera
      </Link>
    </main>
  );
}
