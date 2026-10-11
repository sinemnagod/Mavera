// Shared class names, so every button and card looks the same.
export const focus =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700";

const press = "transition duration-150 active:scale-[0.97]";

export const button = {
  primary: `rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-stone-950 shadow-sm shadow-amber-600/20 hover:-translate-y-px hover:bg-amber-300 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 ${press} ${focus}`,
  secondary: `rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-800 shadow-sm hover:-translate-y-px hover:bg-stone-50 hover:shadow disabled:cursor-not-allowed disabled:opacity-50 ${press} ${focus}`,
  danger: `rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:-translate-y-px hover:bg-red-500 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 ${press} ${focus}`,
  small: `rounded-md border border-stone-300 bg-white px-3 py-1 text-xs font-medium text-stone-800 hover:bg-stone-100 disabled:opacity-50 ${press} ${focus}`,
};

export const card = "rounded-2xl border border-stone-200 bg-white p-5 shadow-sm";
export const input = `w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-500 transition focus:border-amber-500 ${focus}`;
export const heading = "text-2xl font-semibold text-stone-900";
