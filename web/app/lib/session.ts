import type { SessionUser } from "./types";

const KEY = "mavera-session";

export interface Session {
  token: string;
  user: SessionUser;
}

// The token lives in this browser only. Every function is wrapped in try/catch because
// storage can be blocked (private windows), and it must not exist while the server renders.
export function readSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function saveSession(session: Session): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(session));
  } catch {
    // Without storage the user simply has to sign in again after a refresh.
  }
}

export function clearSession(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // Nothing to clear.
  }
}
