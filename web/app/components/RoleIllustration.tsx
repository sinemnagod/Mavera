import type { Role } from "~/lib/types";

const FACE = "#2d2420";

// A friendly face: two eyes and a smile.
function Face({ cx = 60, cy = 41 }: { cx?: number; cy?: number }) {
  return (
    <g>
      <circle cx={cx - 6} cy={cy} r="1.7" fill={FACE} />
      <circle cx={cx + 6} cy={cy} r="1.7" fill={FACE} />
      <path d={`M${cx - 5} ${cy + 6} q5 5 10 0`} fill="none" stroke={FACE} strokeWidth="1.6" strokeLinecap="round" />
    </g>
  );
}

function Sparkle({ x, y, delay }: { x: number; y: number; delay: number }) {
  return (
    <path
      className="anim-twinkle"
      style={{ animationDelay: `${delay}s` }}
      transform={`translate(${x} ${y})`}
      d="M0 -6 L1.6 -1.6 L6 0 L1.6 1.6 L0 6 L-1.6 1.6 L-6 0 L-1.6 -1.6Z"
      fill="#fbbf24"
    />
  );
}

function Waiter() {
  return (
    <>
      <path d="M32 114 C32 84 45 70 60 70 C75 70 88 84 88 114Z" fill="#fff" stroke="#e7e5e4" />
      <path d="M44 74 L52 114 H34 C34 96 38 82 44 74Z M76 74 L68 114 H86 C86 96 82 82 76 74Z" fill="#292524" />
      <path d="M54 72 l6 5 l6 -5 l-2 7 h-8Z" fill="#b91c1c" />
      <rect x="55" y="58" width="10" height="14" rx="4" fill="#f1c7a0" />
      <circle cx="60" cy="42" r="16" fill="#f1c7a0" />
      <path d="M43 40 C42 22 78 22 77 40 C72 31 48 31 43 40Z" fill="#3b2a22" />
      <Face />
      <path d="M79 84 Q92 82 98 56" fill="none" stroke="#fff" strokeWidth="10" strokeLinecap="round" />
      <g className="anim-tray">
        <ellipse cx="98" cy="52" rx="17" ry="3.5" fill="#cbd5e1" />
        <path d="M86 50 a12 11 0 0 1 24 0Z" fill="#f1f5f9" stroke="#cbd5e1" />
        <circle cx="98" cy="37" r="2.2" fill="#94a3b8" />
        <circle cx="98" cy="57" r="6" fill="#f1c7a0" />
      </g>
      <g stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" fill="none">
        <path className="anim-steam" d="M92 32 q-3 -5 0 -9" />
        <path className="anim-steam" style={{ animationDelay: "0.8s" }} d="M99 30 q3 -5 0 -9" />
        <path className="anim-steam" style={{ animationDelay: "1.6s" }} d="M105 32 q-3 -5 0 -9" />
      </g>
    </>
  );
}

function Kitchen() {
  return (
    <>
      <path d="M30 114 C30 84 44 70 60 70 C76 70 90 84 90 114Z" fill="#fff" stroke="#e7e5e4" />
      <path d="M60 72 V114" stroke="#e7e5e4" strokeWidth="2" />
      <circle cx="53" cy="88" r="1.8" fill="#a8a29e" />
      <circle cx="53" cy="100" r="1.8" fill="#a8a29e" />
      <circle cx="67" cy="88" r="1.8" fill="#a8a29e" />
      <circle cx="67" cy="100" r="1.8" fill="#a8a29e" />
      <path d="M52 72 l8 6 l8 -6 l-3 -6 h-10Z" fill="#dc2626" />
      <rect x="55" y="58" width="10" height="12" rx="4" fill="#d9a273" />
      <circle cx="60" cy="43" r="15" fill="#d9a273" />
      <path d="M43 34 q-8 -14 6 -17 q7 -9 18 -2 q15 0 9 18 q-17 6 -33 1Z" fill="#fff" stroke="#e7e5e4" />
      <Face cy={44} />
      <path d="M40 86 Q30 88 26 90" fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round" />
      <ellipse cx="22" cy="92" rx="14" ry="4.5" fill="#475569" />
      <rect x="6" y="90" width="9" height="3" rx="1.5" fill="#334155" />
      <g stroke="#f97316" strokeWidth="2" strokeLinecap="round" fill="none">
        <path className="anim-steam" d="M16 84 q-3 -5 0 -9" />
        <path className="anim-steam" style={{ animationDelay: "0.7s" }} d="M23 82 q3 -5 0 -10" />
        <path className="anim-steam" style={{ animationDelay: "1.4s" }} d="M30 84 q-3 -5 0 -9" />
      </g>
    </>
  );
}

function Cleaner() {
  return (
    <>
      <path d="M32 114 C32 84 45 70 60 70 C75 70 88 84 88 114Z" fill="#0ea5e9" />
      <path d="M52 72 l8 7 l8 -7" fill="none" stroke="#e0f2fe" strokeWidth="3" strokeLinecap="round" />
      <rect x="55" y="58" width="10" height="13" rx="4" fill="#8d5a3b" />
      <circle cx="60" cy="43" r="15" fill="#8d5a3b" />
      <path d="M44 38 a16 14 0 0 1 32 0Z" fill="#0369a1" />
      <path d="M72 38 h16 l-3 5 h-15Z" fill="#075985" />
      <Face cy={45} />
      <g className="anim-sweep">
        <line x1="80" y1="42" x2="92" y2="108" stroke="#a16207" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M84 104 l16 5 l-5 9 l-19 -6Z" fill="#d97706" />
        <circle cx="80" cy="44" r="5" fill="#fde047" />
      </g>
      <path d="M78 86 Q72 80 72 72" fill="none" stroke="#0ea5e9" strokeWidth="9" strokeLinecap="round" />
      <Sparkle x={22} y={50} delay={0} />
      <Sparkle x={26} y={88} delay={0.9} />
      <Sparkle x={104} y={70} delay={1.6} />
    </>
  );
}

function StoreManager() {
  return (
    <>
      <path d="M32 114 C32 84 45 70 60 70 C75 70 88 84 88 114Z" fill="#10b981" />
      <path d="M46 72 l14 14 l14 -14" fill="none" stroke="#065f46" strokeWidth="2.5" strokeLinejoin="round" />
      <rect x="55" y="58" width="10" height="13" rx="4" fill="#e0ac86" />
      <circle cx="60" cy="43" r="15" fill="#e0ac86" />
      <path d="M44 40 C44 24 76 24 76 40 C70 33 50 33 44 40Z" fill="#57534e" />
      <circle cx="54" cy="44" r="4.5" fill="none" stroke="#44403c" strokeWidth="1.4" />
      <circle cx="66" cy="44" r="4.5" fill="none" stroke="#44403c" strokeWidth="1.4" />
      <path d="M58.5 44 h3" stroke="#44403c" strokeWidth="1.4" />
      <path d="M55 51 q5 4 10 0" fill="none" stroke={FACE} strokeWidth="1.6" strokeLinecap="round" />
      <rect x="10" y="94" width="26" height="18" rx="2" fill="#d6a56b" />
      <path d="M10 102 h26" stroke="#b9854c" strokeWidth="2" />
      <rect x="16" y="82" width="22" height="13" rx="2" fill="#e4b97f" />
      <path d="M78 84 Q86 82 86 70" fill="none" stroke="#10b981" strokeWidth="9" strokeLinecap="round" />
      <g className="anim-breathe">
        <rect x="76" y="48" width="28" height="38" rx="3" fill="#fff" stroke="#94a3b8" />
        <rect x="84" y="44" width="12" height="8" rx="2" fill="#64748b" />
        <path className="anim-check" d="M82 64 l5 5 l11 -12" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M82 76 h18 M82 81 h12" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
      </g>
    </>
  );
}

function GeneralManager() {
  return (
    <>
      <path d="M30 114 C30 84 44 70 60 70 C76 70 90 84 90 114Z" fill="#1e293b" />
      <path d="M50 70 l10 20 l10 -20 l-4 -2 h-12Z" fill="#fff" />
      <path d="M57 72 h6 l2 20 l-5 6 l-5 -6Z" fill="#7c3aed" />
      <rect x="55" y="58" width="10" height="13" rx="4" fill="#f1c7a0" />
      <circle cx="60" cy="43" r="15" fill="#f1c7a0" />
      <path d="M44 38 C44 22 76 22 76 38 C72 30 62 28 54 31 C49 33 46 35 44 38Z" fill="#78716c" />
      <Face cy={44} />
      <path d="M82 86 Q92 84 94 70" fill="none" stroke="#1e293b" strokeWidth="9" strokeLinecap="round" />
      <rect x="72" y="46" width="40" height="36" rx="4" fill="#fff" stroke="#c4b5fd" />
      <g fill="#8b5cf6">
        <rect className="anim-grow" x="79" y="62" width="7" height="16" rx="1.5" />
        <rect className="anim-grow" style={{ animationDelay: "0.35s" }} x="90" y="54" width="7" height="24" rx="1.5" />
        <rect className="anim-grow" style={{ animationDelay: "0.7s" }} x="101" y="50" width="7" height="28" rx="1.5" />
      </g>
    </>
  );
}

const BLOB: Record<Role, string> = {
  WAITER: "#fde68a",
  KITCHEN: "#fecdd3",
  CLEANER: "#bae6fd",
  STORE_MANAGER: "#a7f3d0",
  GENERAL_MANAGER: "#ddd6fe",
};

export default function RoleIllustration({ role, className = "h-32 w-32" }: { role: Role; className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      <circle className="anim-breathe" cx="60" cy="64" r="50" fill={BLOB[role]} opacity="0.55" />
      {role === "WAITER" && <Waiter />}
      {role === "KITCHEN" && <Kitchen />}
      {role === "CLEANER" && <Cleaner />}
      {role === "STORE_MANAGER" && <StoreManager />}
      {role === "GENERAL_MANAGER" && <GeneralManager />}
    </svg>
  );
}
