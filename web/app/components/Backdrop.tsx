import type { ReactNode } from "react";

// A full-screen picture behind the page, with a soft white wash on top so the
// text and cards that float above it stay easy to read.
export default function Backdrop({ children }: { children: ReactNode }) {
  return (
    <div className="relative isolate flex min-h-svh flex-1 flex-col overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 -z-20 bg-cover bg-center" style={{ backgroundImage: "url(/backdrop.svg)" }} />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-b from-white/70 via-white/10 to-white/35" />
      {children}
    </div>
  );
}
