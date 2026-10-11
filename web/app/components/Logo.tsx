interface LogoProps {
  // "dark" for text on a light background.
  size?: "sm" | "lg";
}

// The Mavera mark: a warm rounded square with an "M" drawn as two arches, like domes.
export default function Logo({ size = "sm" }: LogoProps) {
  const box = size === "lg" ? "h-12 w-12" : "h-9 w-9";
  return (
    <span className="inline-flex items-center gap-3">
      <svg viewBox="0 0 40 40" className={`${box} drop-shadow-sm`} aria-hidden="true">
        <defs>
          <linearGradient id="logo-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f59e0b" />
            <stop offset="1" stopColor="#ea580c" />
          </linearGradient>
        </defs>
        <rect width="40" height="40" rx="11" fill="url(#logo-gradient)" />
        <path d="M9 28 V17 a5.5 5.5 0 0 1 11 0 V28 M20 28 V17 a5.5 5.5 0 0 1 11 0 V28" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="20" cy="9.5" r="1.7" fill="#fff" />
      </svg>
      <span className="leading-none">
        <span className={`block font-semibold tracking-tight text-stone-900 ${size === "lg" ? "text-2xl" : "text-xl"}`}>Mavera</span>
        <span className="mt-0.5 block text-[0.65rem] font-medium uppercase tracking-[0.18em] text-stone-600">Restaurant operations</span>
      </span>
    </span>
  );
}
