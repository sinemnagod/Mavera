import { useState } from "react";
import { Link, redirect, useNavigate } from "react-router";
import Backdrop from "~/components/Backdrop";
import Logo from "~/components/Logo";
import RoleIllustration from "~/components/RoleIllustration";
import { api } from "~/lib/api";
import { homeFor } from "~/lib/auth";
import { type RoleInfo, roleBySlug, roleInfo } from "~/lib/roles";
import { readSession, saveSession } from "~/lib/session";
import type { SessionUser } from "~/lib/types";
import { button, focus, input } from "~/lib/ui";
import type { Route } from "./+types/login";

export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: `${loaderData?.info.label ?? "Sign in"} sign-in · Mavera` }];
}

export function clientLoader({ params }: Route.ClientLoaderArgs) {
  const info = roleBySlug(params.role);
  if (!info) throw redirect("/");
  const session = readSession();
  if (session) throw redirect(homeFor(session.user.role));
  return { info };
}

export default function Login({ loaderData }: Route.ComponentProps) {
  const { info } = loaderData;
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [wrongRole, setWrongRole] = useState<RoleInfo | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setWrongRole(null);
    try {
      const result = await api<{ token: string; user: SessionUser }>("/auth/login", {
        method: "POST",
        body: { email, password },
      });
      // The password was right, but this is the wrong door: don't sign them in.
      if (result.user.role !== info.role) {
        setWrongRole(roleInfo(result.user.role));
        setBusy(false);
        return;
      }
      saveSession(result);
      navigate(homeFor(result.user.role));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not sign in.");
      setBusy(false);
    }
  }

  return (
    <Backdrop>
      <header className="sticky top-0 z-20 border-b border-white/50 bg-white/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-6 py-3">
          <Link to="/" className={`rounded-lg ${focus}`} aria-label="Mavera, back to the role list">
            <Logo />
          </Link>
          <Link to="/" className={`rounded-full px-4 py-1.5 text-sm font-semibold text-stone-800 hover:bg-white/70 ${focus}`}>
            ← All roles
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-10">
        <form
          onSubmit={submit}
          className="animate-pop w-full max-w-md space-y-5 rounded-3xl bg-white/85 p-8 shadow-2xl shadow-stone-900/15 ring-1 ring-white/80 backdrop-blur-xl"
        >
          <div className="flex flex-col items-center text-center">
            <span className={`animate-float rounded-full bg-gradient-to-br ${info.tint} p-1`}>
              <RoleIllustration role={info.role} className="h-24 w-24" />
            </span>
            <h1 className="mt-3 text-2xl font-semibold text-stone-900">Sign in as {info.label}</h1>
            <p className="mt-1 text-sm text-stone-700">{info.tagline}</p>
          </div>

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-stone-800">
              Email
            </label>
            <input id="email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required className={input} />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-stone-800">
              Password
            </label>
            <input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required className={input} />
          </div>

          <div role="alert" className="min-h-6 text-sm">
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 font-medium text-red-800">{error}</p>}
            {wrongRole && (
              <p className="animate-pop rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-amber-900">
                <strong>That account is a {wrongRole.label} account</strong>, not a {info.label} account, so you can't sign in here.{" "}
                <Link to={`/login/${wrongRole.slug}`} className={`font-semibold underline ${focus}`}>
                  Go to the {wrongRole.label} sign-in
                </Link>
                .
              </p>
            )}
          </div>

          <button type="submit" disabled={busy} className={`${button.primary} w-full py-3 text-base`}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
          <p className="text-center text-xs text-stone-700">Demo accounts and passwords are in the project README.</p>
        </form>
      </main>
    </Backdrop>
  );
}
