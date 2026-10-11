import { useState } from "react";
import { redirect, useNavigate } from "react-router";
import { api } from "~/lib/api";
import { homeFor } from "~/lib/auth";
import { readSession, saveSession } from "~/lib/session";
import type { SessionUser } from "~/lib/types";
import { button, input } from "~/lib/ui";

export function meta() {
  return [{ title: "Sign in · Mavera" }];
}

// Already signed in? Go straight to your own screen.
export function clientLoader() {
  const session = readSession();
  if (session) throw redirect(homeFor(session.user.role));
  return null;
}

export default function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const result = await api<{ token: string; user: SessionUser }>("/auth/login", {
        method: "POST",
        body: { email, password },
      });
      saveSession(result);
      navigate(homeFor(result.user.role));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not sign in.");
      setBusy(false);
    }
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-16">
      <div className="text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-white">Mavera</h1>
        <p className="mt-2 text-stone-400">Restaurant operations, five locations, one system.</p>
      </div>

      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-2xl border border-white/10 bg-stone-900 p-6">
        <h2 className="text-lg font-medium text-white">Sign in</h2>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm text-stone-300">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={input}
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm text-stone-300">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={input}
          />
        </div>
        <p role="alert" className="min-h-5 text-sm text-red-400">
          {error}
        </p>
        <button type="submit" disabled={busy} className={`${button.primary} w-full`}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="max-w-sm text-center text-sm text-stone-400">
        Demo project. Demo accounts and their passwords are listed in the project README.
      </p>
    </main>
  );
}
