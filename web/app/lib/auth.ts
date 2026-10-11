import { redirect } from "react-router";
import { readSession } from "./session";
import type { Role, SessionUser } from "./types";

// Where each role starts after signing in.
export function homeFor(role: Role): string {
  switch (role) {
    case "WAITER":
      return "/waiter/floor-plan";
    case "KITCHEN":
      return "/kitchen";
    case "CLEANER":
      return "/cleaner";
    case "STORE_MANAGER":
      return "/store/stock";
    case "GENERAL_MANAGER":
      return "/gm";
  }
}

// Used in a route's clientLoader. This only decides which screen to show: the real
// permission check happens on the API, which refuses anything the role may not do.
export function requireRole(...roles: Role[]): SessionUser {
  const session = readSession();
  if (!session) throw redirect("/");
  if (!roles.includes(session.user.role)) throw redirect(homeFor(session.user.role));
  return session.user;
}
