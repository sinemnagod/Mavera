const pad = (n: number) => String(n).padStart(2, "0");

export const formatMoney = (amount: number) => `${Math.round(amount).toLocaleString("tr-TR")} ₺`;

export function formatClock(iso: string): string {
  const date = new Date(iso);
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// "12:05" for 12 minutes and 5 seconds.
export function formatElapsed(fromIso: string, now: number): string {
  const seconds = Math.max(0, Math.floor((now - new Date(fromIso).getTime()) / 1000));
  return `${pad(Math.floor(seconds / 60))}:${pad(seconds % 60)}`;
}

export function minutesSince(fromIso: string, now: number): number {
  return Math.max(0, (now - new Date(fromIso).getTime()) / 60000);
}

export function timeAgo(fromIso: string, now: number): string {
  const minutes = Math.floor(minutesSince(fromIso, now));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  return hours < 24 ? `${hours} h ago` : `${Math.floor(hours / 24)} d ago`;
}

export const formatShortDate = (iso: string) =>
  new Date(`${iso.slice(0, 10)}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
