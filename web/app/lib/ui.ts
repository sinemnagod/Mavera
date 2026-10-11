// Shared class names, so every button and card looks the same.
export const focus =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400";

export const button = {
  primary: `rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-stone-950 hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50 ${focus}`,
  secondary: `rounded-lg border border-white/15 px-4 py-2 text-sm text-stone-200 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50 ${focus}`,
  danger: `rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50 ${focus}`,
  small: `rounded-md border border-white/15 px-3 py-1 text-xs font-medium text-stone-200 hover:bg-white/10 disabled:opacity-50 ${focus}`,
};

export const card = "rounded-xl border border-white/10 bg-stone-900 p-5";
export const input = `w-full rounded-lg border border-white/15 bg-stone-950 px-3 py-2 text-sm text-stone-100 placeholder:text-stone-500 ${focus}`;
export const heading = "text-2xl font-semibold text-white";
