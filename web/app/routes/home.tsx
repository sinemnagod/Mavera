import { Link, redirect } from "react-router";
import Backdrop from "~/components/Backdrop";
import Logo from "~/components/Logo";
import RoleIllustration from "~/components/RoleIllustration";
import { homeFor } from "~/lib/auth";
import { ROLES } from "~/lib/roles";
import { readSession } from "~/lib/session";
import { focus } from "~/lib/ui";

export function meta() {
  return [{ title: "Mavera · Restaurant operations" }];
}

// Already signed in? Go straight to your own screen.
export function clientLoader() {
  const session = readSession();
  if (session) throw redirect(homeFor(session.user.role));
  return null;
}

export default function Landing() {
  return (
    <Backdrop>
      <header className="sticky top-0 z-20 border-b border-white/50 bg-white/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-6 py-3">
          <Logo />
          <p className="hidden text-sm font-medium text-stone-700 sm:block">Five restaurants in Istanbul · one system</p>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1500px] flex-1 flex-col items-center justify-center gap-10 px-6 py-12">
        <div className="animate-fade-up text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-800">Welcome</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">Who's signing in today?</h1>
          <p className="mx-auto mt-3 max-w-xl text-lg text-stone-800">
            Pick your role. Each role gets one screen, built for what they are doing right now.
          </p>
        </div>

        {/* All five side by side on wide screens, then 3, 2 and 1 as the screen gets narrower. */}
        <ul className="flex w-full flex-wrap justify-center gap-5">
          {ROLES.map((role, index) => (
            <li
              key={role.slug}
              className="animate-fade-up w-full min-w-[160px] sm:w-[calc(50%-0.65rem)] md:w-[calc(33.333%-0.9rem)] lg:w-[calc(20%-1rem)]"
              style={{ animationDelay: `${120 + index * 90}ms` }}
            >
              <Link
                to={`/login/${role.slug}`}
                className={`group flex h-full flex-col items-center gap-2 rounded-3xl bg-white/80 p-4 text-center xl:p-6 shadow-xl shadow-stone-900/10 ring-1 ring-white/80 backdrop-blur-xl transition duration-300 hover:-translate-y-2 hover:bg-white hover:shadow-2xl ${focus}`}
              >
                <span className={`rounded-full bg-gradient-to-br ${role.tint} p-1 transition duration-300 group-hover:scale-105`}>
                  <RoleIllustration role={role.role} className="h-28 w-28 xl:h-32 xl:w-32" />
                </span>
                <span className="mt-1 text-lg font-semibold text-stone-900 xl:text-xl">{role.label}</span>
                <span className="text-sm text-stone-700">{role.tagline}</span>
                <span className="mt-auto inline-flex items-center gap-1 pt-3 text-sm font-semibold text-amber-800 transition-all duration-300 group-hover:gap-2.5">
                  Sign in <span aria-hidden="true">→</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </main>

      <footer className="px-6 pb-6 text-center text-sm font-medium text-stone-800">
        A demo project. Demo accounts and their passwords are in the project README.
      </footer>
    </Backdrop>
  );
}
